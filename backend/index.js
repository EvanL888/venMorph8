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

  app.listen(4000, () => console.log("🚀 Backend running on http://localhost:4000"));
})();

