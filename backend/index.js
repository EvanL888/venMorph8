// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const xrpl = require('xrpl');
const { ethers } = require('ethers');
const { interfaceToAbi } = require('@flarenetwork/flare-periphery-contract-artifacts');

// ============ Flare 配置 ==============
const FLARE_RPC = process.env.FLARE_RPC || 'https://coston2-api.flare.network/ext/C/rpc';
const FLARE_NETWORK = process.env.FLARE_NETWORK || 'coston2';
const FTSOV2_ADDRESS = process.env.FTSOV2_ADDRESS || '0x3d893C53D9e8056135C26C8c638B76C8b60Df726'; // coston2 示例
const provider = new ethers.JsonRpcProvider(FLARE_RPC);
const ftsoAbi = interfaceToAbi('FtsoV2Interface', FLARE_NETWORK);
const ftso = new ethers.Contract(FTSOV2_ADDRESS, ftsoAbi, provider);

// 支持的 FTSO feed ID 映射（按需扩展）
const FEED_IDS = {
  ETH: '0x014554482f55534400000000000000000000000000', // ETH/USD
  XRP: '0x015852502f55534400000000000000000000000000', // XRP/USD
  BTC: '0x014254432f55534400000000000000000000000000', // BTC/USD
  USDT: '0x015553445420202020202020202020202020202020' // USDT/USD (example feed ID)
};

// helper：读取某个资产的 USD 价格
async function getPriceUSD(symbol) {
  // Handle USDT with stable rate (since it's pegged to USD)
  if (symbol === 'USDT') {
    return { price: 1.0, timestamp: Date.now() / 1000 };
  }
  
  const feedId = FEED_IDS[symbol];
  if (!feedId) throw new Error('Unsupported asset: ' + symbol);
  
  try {
    const res = await ftso.getFeedByIdInWei.staticCall(feedId);
    const valueWei = BigInt(res[0].toString());
    const price = Number(valueWei) / 1e18;
    return { price, timestamp: Number(res[1]) };
  } catch (error) {
    // If FTSO fails for USDT, return stable rate
    if (symbol === 'USDT') {
      return { price: 1.0, timestamp: Date.now() / 1000 };
    }
    throw error;
  }
}

// ============ XRPL 配置 ==============
const XRPL_WS = process.env.XRPL_WS || 'wss://s.altnet.rippletest.net:51233';
const xrplClient = new xrpl.Client(XRPL_WS);

// ============ Express 初始化 ============
const app = express();
const path = require('path');

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the root directory (frontend files)
app.use(express.static(path.join(__dirname, '..')));

// 内存数据库（测试用）
let requests = {};

// ============ API: 创建请求 ============
app.post('/api/request', async (req, res) => {
  const { requesterSeed, recipientAddress, asset, amount, note } = req.body;
  const requestId = 'req_' + Date.now();
  const wallet = xrpl.Wallet.fromSeed(requesterSeed);

  const requestObj = {
    requestId,
    requesterAddress: wallet.classicAddress,
    recipientAddress,
    asset,
    amount,
    note,
    status: "OPEN",
    createdAt: Date.now()
  };

  // 把请求 JSON 放到 XRPL Memo
  const memoHex = Buffer.from(JSON.stringify({
    requestId, asset, amount, note
  }), 'utf8').toString('hex');

  const tx = {
    TransactionType: "Payment",
    Account: wallet.classicAddress,
    Destination: recipientAddress,
    Amount: "5000000", // 只是一个最小支付，主要是为了写入 Memo
    Memos: [
      {
        Memo: {
          MemoData: memoHex,
          MemoFormat: Buffer.from("application/json").toString('hex'),
          MemoType: Buffer.from("venmo_request").toString('hex')
        }
      }
    ]
  };

  try {
    const prepared = await xrplClient.autofill(tx);
    const signed = wallet.sign(prepared);
    const result = await xrplClient.submitAndWait(signed.tx_blob);

    // Debug: Log the full result structure for request creation
    console.log('🔍 Request Creation Result:', JSON.stringify(result, null, 2));
    console.log('🔍 Request Anchor Hash:', result.result.hash);

    const anchorTxHash = result.result.hash;
    requestObj.anchorTx = anchorTxHash;
    requests[requestId] = requestObj;

    console.log('✅ Request created, anchor hash:', anchorTxHash);

    return res.json({ 
      ok: true, 
      request: requestObj,
      explorerUrl: `https://testnet.xrpl.org/transactions/${anchorTxHash}`
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// ============ API: 获取请求列表 ============
app.get('/api/requests/:address', (req, res) => {
  const { address } = req.params;
  const list = Object.values(requests).filter(
    r => r.recipientAddress === address || r.requesterAddress === address
  );
  res.json({ ok: true, requests: list });
});

// ============ API: Get specific request details ============
app.get('/api/request/:requestId', (req, res) => {
  const { requestId } = req.params;
  const request = requests[requestId];
  
  if (!request) {
    return res.status(404).json({ ok: false, error: 'Request not found' });
  }
  
  res.json({ 
    ok: true, 
    request: request,
    anchorTxUrl: request.anchorTx ? `https://testnet.xrpl.org/transactions/${request.anchorTx}` : null,
    paidTxUrl: request.paidTx ? `https://testnet.xrpl.org/transactions/${request.paidTx}` : null
  });
});

// ============ API: Get transaction info ============
app.get('/api/transaction/:txHash', async (req, res) => {
  const { txHash } = req.params;
  
  // Validate hash format (XRPL hashes are 64 character hex strings)
  if (!txHash || !/^[A-Fa-f0-9]{64}$/.test(txHash)) {
    return res.status(400).json({ 
      ok: false, 
      error: 'Invalid transaction hash format. XRPL transaction hashes must be 64-character hexadecimal strings.',
      providedHash: txHash,
      hashLength: txHash ? txHash.length : 0
    });
  }
  
  try {
    console.log('🔍 Looking up transaction:', txHash);
    
    const txInfo = await xrplClient.request({
      command: "tx",
      transaction: txHash
    });
    
    console.log('✅ Transaction found:', txInfo.result);
    
    res.json({
      ok: true,
      transaction: txInfo.result,
      explorerUrl: `https://testnet.xrpl.org/transactions/${txHash}`
    });
  } catch (error) {
    console.error('❌ Transaction lookup error:', error);
    res.status(404).json({ 
      ok: false, 
      error: 'Transaction not found or XRPL client error',
      details: error.message,
      providedHash: txHash,
      explorerUrl: `https://testnet.xrpl.org/transactions/${txHash}`
    });
  }
});

// ============ API: Debug - Get all requests ============
app.get('/api/debug/requests', (req, res) => {
  res.json({
    ok: true,
    totalRequests: Object.keys(requests).length,
    requests: requests
  });
});

// ============ API: 获取报价（通过 FTSO） ============
app.get('/api/price/quote', async (req, res) => {
  const { from = "ETH", to = "XRP", amount = "1" } = req.query;
  try {
    const fromRes = await getPriceUSD(from);
    const toRes = await getPriceUSD(to);
    const usd = Number(amount) * fromRes.price;
    const equivalent = usd / toRes.price;
    res.json({
      ok: true,
      from, to, amount,
      fromUsd: fromRes.price,
      toUsd: toRes.price,
      usd,
      equivalent
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ============ API: Process Payment ============
app.post('/api/payment/process', async (req, res) => {
  const { payerSeed, requestId, amount, asset } = req.body;
  
  try {
    const wallet = xrpl.Wallet.fromSeed(payerSeed);
    const request = requests[requestId];
    
    if (!request) {
      return res.status(404).json({ ok: false, error: 'Request not found' });
    }
    
    if (request.status !== 'OPEN') {
      return res.status(400).json({ ok: false, error: 'Request already processed' });
    }

    // Check if sender account exists and has balance
    try {
      const senderInfo = await xrplClient.request({
        command: 'account_info',
        account: wallet.classicAddress,
        ledger_index: 'validated'
      });
      
      console.log('💰 Sender account info:', {
        address: wallet.classicAddress,
        balance: senderInfo.result.account_data.Balance,
        sequence: senderInfo.result.account_data.Sequence
      });
      
      const senderBalance = parseInt(senderInfo.result.account_data.Balance);
      const requiredAmount = parseInt(xrpl.xrpToDrops(amount.toString())) + 12; // amount + fee
      
      if (senderBalance < requiredAmount) {
        return res.status(400).json({ 
          ok: false, 
          error: `Insufficient balance. Has ${xrpl.dropsToXrp(senderBalance)} XRP, needs ${amount} XRP + fees` 
        });
      }
      
    } catch (senderError) {
      console.error('❌ Sender account error:', senderError);
      return res.status(400).json({ 
        ok: false, 
        error: `Sender account not found or inactive: ${wallet.classicAddress}` 
      });
    }

    // Check if destination account exists
    try {
      const destInfo = await xrplClient.request({
        command: 'account_info',
        account: request.requesterAddress,
        ledger_index: 'validated'
      });
      
      console.log('🎯 Destination account info:', {
        address: request.requesterAddress,
        balance: destInfo.result.account_data.Balance
      });
      
    } catch (destError) {
      console.warn('⚠️ Destination account not found, payment will create it:', request.requesterAddress);
      
      // For account creation, we need at least 10 XRP
      if (parseFloat(amount) < 10) {
        return res.status(400).json({ 
          ok: false, 
          error: `Destination account doesn't exist. First payment must be at least 10 XRP to activate the account.` 
        });
      }
    }

    // Convert amount to drops (XRP smallest unit)
    const amountInDrops = xrpl.xrpToDrops(amount.toString());

    const tx = {
      TransactionType: "Payment",
      Account: wallet.classicAddress,
      Destination: request.requesterAddress,
      Amount: amountInDrops,
      Memos: [
        {
          Memo: {
            MemoData: Buffer.from(JSON.stringify({ requestId, asset, amount }), "utf8").toString("hex"),
            MemoFormat: Buffer.from("application/json").toString("hex"),
            MemoType: Buffer.from("venmo_payment").toString("hex")
          }
        }
      ]
    };

    const prepared = await xrplClient.autofill(tx);
    const signed = wallet.sign(prepared);
    const result = await xrplClient.submitAndWait(signed.tx_blob);

    // Debug: Log the full result structure
    console.log('🔍 XRPL Transaction Result:', JSON.stringify(result, null, 2));
    console.log('🔍 Transaction Hash:', result.result.hash);
    console.log('🔍 Transaction Result:', result.result.meta.TransactionResult);

    if (result.result.meta.TransactionResult === "tesSUCCESS") {
      // Update request status
      const txHash = result.result.hash;
      request.status = "PAID";
      request.paidTx = txHash;
      request.paidAt = Date.now();
      
      console.log('✅ Payment successful, hash:', txHash);
      
      res.json({
        ok: true,
        txHash: txHash,
        delivered: result.result.meta.delivered_amount,
        status: result.result.meta.TransactionResult,
        request: request,
        explorerUrl: `https://testnet.xrpl.org/transactions/${txHash}`
      });
    } else {
      res.status(400).json({ ok: false, error: "Payment failed", result });
    }
  } catch (err) {
    console.error('Payment processing error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ============ API: Serve the main page ============
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ============ 启动服务 & 连接 XRPL ============
(async () => {
  await xrplClient.connect();
  console.log("✅ Connected to XRPL Testnet");

  await xrplClient.request({ command: "subscribe", streams: ["transactions"] });
  console.log("📡 Subscribed to XRPL transactions");

  xrplClient.on("transaction", async (event) => {
    try {
      if (!event || !event.transaction) return;
      const tx = event.transaction;
      if (tx.TransactionType === "Payment" && tx.Memos) {
        const memos = tx.Memos.map(m =>
          Buffer.from(m.Memo.MemoData, "hex").toString("utf8")
        );
        memos.forEach(async (m) => {
          if (m.includes("req_")) {
            const match = m.match(/req_\d+/);
            if (match) {
              const reqId = match[0];
              if (requests[reqId] && requests[reqId].status === "OPEN") {
                requests[reqId].status = "PAID";
                requests[reqId].paidTx = tx.hash;
                console.log("💰 Request paid:", reqId);

                // 调用 FDC 提交 attestation
                try {
                  const { submitXrpPaymentAttestation } = require('./fdc');
                  const att = await submitXrpPaymentAttestation(tx.hash);
                  requests[reqId].attestation = att;
                  console.log("📝 Attestation submitted:", att);
                } catch (fdcErr) {
                  console.error("FDC attestation failed:", fdcErr.message);
                }
              }
            }
          }
        });
      }
    } catch (err) {
      console.error("tx parse error", err);
    }
  });

  // ============ API: GemWallet Transaction Tracking ============
  app.post('/api/gemwallet/track', (req, res) => {
    const { hash, from, to, amount, memo, timestamp } = req.body;
    
    console.log('🔮 GemWallet Transaction Tracked:', {
      hash,
      from,
      to,
      amount: `${amount} XRP`,
      memo,
      explorerUrl: `https://testnet.xrpl.org/transactions/${hash}`
    });
    
    // Store in memory (in production, use a proper database)
    const gemTransaction = {
      id: `gem_${Date.now()}`,
      hash,
      from,
      to,
      amount,
      memo,
      timestamp,
      source: 'gemwallet',
      explorerUrl: `https://testnet.xrpl.org/transactions/${hash}`
    };
    
    // You can extend this to store in your existing requests object or a separate collection
    // For now, just log and acknowledge
    
    res.json({ 
      ok: true, 
      message: 'Transaction tracked successfully',
      transaction: gemTransaction
    });
  });

  // ============ API: Get GemWallet Transactions ============
  app.get('/api/gemwallet/transactions/:address', (req, res) => {
    const { address } = req.params;
    
    // In a real application, you would query your database for transactions
    // involving this address. For now, return a placeholder response.
    
    res.json({
      ok: true,
      address,
      transactions: [],
      message: 'GemWallet transaction history endpoint ready'
    });
  });

  // ============ API: Attestation Endpoint ============
  app.post('/api/attest', (req, res) => {
    console.log('🔒 Received attestation request:', req.body);
    
    const { xrplTxHash, requestId, amount, asset, from, to } = req.body;
    
    if (!xrplTxHash) {
      return res.status(400).json({ 
        ok: false, 
        error: 'XRPL transaction hash is required' 
      });
    }
    
    // Log attestation details
    console.log('🔍 Attestation Details:', {
      txHash: xrplTxHash,
      requestId,
      amount,
      asset,
      from,
      to,
      timestamp: new Date().toISOString()
    });
    
    // Store attestation request (in production, use proper database)
    const attestationId = `attest_${Date.now()}`;
    const attestationRecord = {
      id: attestationId,
      xrplTxHash,
      requestId,
      amount,
      asset,
      from,
      to,
      status: 'started',
      timestamp: Date.now(),
      explorerUrl: `https://testnet.xrpl.org/transactions/${xrplTxHash}`
    };
    
    // You can extend this to store in your existing requests object or a separate collection
    console.log('✅ Attestation record created:', attestationRecord);
    
    // Return confirmation
    res.json({
      ok: true,
      message: `Attestation started for tx ${xrplTxHash}`,
      attestationId,
      record: attestationRecord
    });
  });

  // ============ API: Get Attestation Status ============
  app.get('/api/attest/:txHash', (req, res) => {
    const { txHash } = req.params;
    
    console.log('🔍 Attestation status requested for:', txHash);
    
    // In a real application, you would query your database for the attestation record
    // For now, return a mock response
    res.json({
      ok: true,
      txHash,
      status: 'completed',
      timestamp: Date.now(),
      explorerUrl: `https://testnet.xrpl.org/transactions/${txHash}`,
      message: 'Attestation verification completed'
    });
  });

  // ============ API: Fund Test Account (Faucet) ============
  app.post('/api/fund-account', async (req, res) => {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ ok: false, error: 'Address is required' });
    }
    
    try {
      console.log('💰 Funding test account:', address);
      
      // Use XRPL testnet faucet
      const faucetResponse = await fetch('https://faucet.altnet.rippletest.net/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          destination: address,
          amount: '1000' // 1000 XRP for testing
        })
      });
      
      if (faucetResponse.ok) {
        const result = await faucetResponse.json();
        console.log('✅ Faucet response:', result);
        
        res.json({
          ok: true,
          message: `Successfully funded ${address} with test XRP`,
          txHash: result.txHash || 'N/A'
        });
      } else {
        throw new Error(`Faucet request failed: ${faucetResponse.statusText}`);
      }
      
    } catch (error) {
      console.error('❌ Faucet error:', error);
      res.status(500).json({ 
        ok: false, 
        error: `Failed to fund account: ${error.message}` 
      });
    }
  });

  // ============ API: Check Account Status ============
  app.get('/api/account/:address', async (req, res) => {
    const { address } = req.params;
    
    try {
      const accountInfo = await xrplClient.request({
        command: 'account_info',
        account: address,
        ledger_index: 'validated'
      });
      
      const balance = accountInfo.result.account_data.Balance;
      const sequence = accountInfo.result.account_data.Sequence;
      
      res.json({
        ok: true,
        address,
        exists: true,
        balance: xrpl.dropsToXrp(balance),
        balanceDrops: balance,
        sequence,
        funded: parseInt(balance) >= 1000000 // 1 XRP minimum for testnet
      });
      
    } catch (error) {
      if (error.data?.error === 'actNotFound') {
        res.json({
          ok: true,
          address,
          exists: false,
          balance: '0',
          balanceDrops: '0',
          funded: false,
          message: 'Account not found - needs funding to activate'
        });
      } else {
        res.status(500).json({
          ok: false,
          error: error.message
        });
      }
    }
  });

  app.listen(4000, () => console.log("🚀 Backend running on http://localhost:4000"));
})();

