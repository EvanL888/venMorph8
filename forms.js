// Form handling and request creation functionality

// Form update functions
function updateAsset() {
    const assetSelect = document.getElementById('assetSelect');
    const amountInput = document.getElementById('amountInput');
    const formTitle = document.getElementById('formTitle');
    const recipientInput = document.getElementById('recipientInput');
    
    const selectedAsset = assetSelect.value;
    const amount = amountInput.value || '20';
    const recipient = recipientInput.value || 'Ben';
    
    // Update the form title
    formTitle.innerHTML = `Request ${amount} ${selectedAsset}<br>from ${recipient}`;
    
    // Update conversion display
    updateConversion(selectedAsset, amount);
}

function updateAmount() {
    updateAsset(); // Reuse the same logic
}

function updateRecipient() {
    updateAsset(); // Reuse the same logic
}

function updateConversion(asset, amount) {
    const conversionAmount = document.querySelector('.conversion-amount');
    const conversionXrp = document.querySelector('.conversion-xrp');
    
    // Fetch real-time conversion rates from backend API
    fetchConversionRate(asset, amount)
        .then(data => {
            if (data.ok) {
                const xrpAmount = data.equivalent.toLocaleString(undefined, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 6 
                });
                conversionAmount.textContent = `${amount} ${asset} ≈`;
                conversionXrp.textContent = `≈ ${xrpAmount} XRP`;
            } else {
                // Fallback to mock rates if API fails
                useMockConversion(asset, amount, conversionAmount, conversionXrp);
            }
        })
        .catch(error => {
            console.warn('Failed to fetch live rates, using fallback:', error);
            useMockConversion(asset, amount, conversionAmount, conversionXrp);
        });
}

// Helper function to fetch conversion rates from backend
async function fetchConversionRate(from, amount) {
    try {
        const response = await fetch(`/api/price/quote?from=${from}&to=XRP&amount=${amount}`);
        return await response.json();
    } catch (error) {
        throw new Error('API request failed: ' + error.message);
    }
}

// Fallback mock conversion function
function useMockConversion(asset, amount, conversionAmount, conversionXrp) {
    const conversionRates = {
        'ETH': 500,     // 1 ETH = 500 XRP
        'BTC': 1500,    // 1 BTC = 1500 XRP
        'XRP': 1,       // 1 XRP = 1 XRP
        'USDC': 0.5,    // 1 USDC = 0.5 XRP
        'USDT': 0.5,    // 1 USDT = 0.5 XRP
        'ADA': 1.2,     // 1 ADA = 1.2 XRP
        'SOL': 45,      // 1 SOL = 45 XRP
        'DOT': 12       // 1 DOT = 12 XRP
    };
    
    const rate = conversionRates[asset] || 1;
    const xrpAmount = (parseFloat(amount) * rate).toLocaleString();
    
    conversionAmount.textContent = `${amount} ${asset} ≈`;
    conversionXrp.textContent = `≈ ${xrpAmount} XRP (estimated)`;
}

// Create request functionality
async function createRequest() {
    const btn = document.querySelector('.create-request-btn');
    const originalText = btn.textContent;
    
    // Get form data
    const assetSelect = document.getElementById('assetSelect');
    const amountInput = document.getElementById('amountInput');
    const recipientInput = document.getElementById('recipientInput');
    const noteInput = document.querySelector('textarea[placeholder="Add a note..."]');
    
    const requestData = {
        requesterSeed: "sEdTJdLuEgQq6SzixR1cpdVuzEy3Wzx", // This should come from wallet connection
        recipientAddress: "rwJDVy2wDUc3cP5GaPrQTyLZGqNdgTcMbk", // This should be resolved from recipient name
        asset: assetSelect.value,
        amount: parseFloat(amountInput.value),
        note: noteInput ? noteInput.value : `Request for ${amountInput.value} ${assetSelect.value}`
    };
    
    // Show creating state
    btn.textContent = 'Creating Request...';
    btn.style.opacity = '0.7';
    btn.disabled = true;
    
    try {
        const response = await fetch('/api/request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        const result = await response.json();
        
        if (result.ok) {
            // Success
            btn.textContent = 'Request Created!';
            btn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
            
            // Store the request data for later use
            sessionStorage.setItem('lastRequestId', result.request.requestId);
            sessionStorage.setItem('lastAnchorTx', result.request.anchorTx);
            
            // Log the transaction hash prominently
            console.log('🚀 Payment request created successfully!');
            console.log('📋 Request ID:', result.request.requestId);
            console.log('🔗 Anchor Transaction Hash:', result.request.anchorTx);
            console.log('🌐 Explorer URL:', result.explorerUrl);
            console.log('📊 Full Request Data:', result.request);
            
            // Show success state briefly, then reset
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = 'linear-gradient(45deg, #c1e328, #a8c920)';
                btn.style.opacity = '1';
                btn.disabled = false;
                
                // Optionally clear the form
                amountInput.value = '';
                if (noteInput) noteInput.value = '';
                
                // Show request details or redirect to payment page
                showRequestCreatedNotification(result.request, result.explorerUrl);
                
            }, 2000);
        } else {
            throw new Error(result.error || 'Failed to create request');
        }
    } catch (error) {
        console.error('Error creating request:', error);
        
        // Show error state
        btn.textContent = 'Request Failed';
        btn.style.background = 'linear-gradient(45deg, #f44336, #da190b)';
        
        // Reset after showing error
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = 'linear-gradient(45deg, #c1e328, #a8c920)';
            btn.style.opacity = '1';
            btn.disabled = false;
        }, 3000);
        
        alert('Failed to create request: ' + error.message);
    }
}

// Show notification when request is created
function showRequestCreatedNotification(request, explorerUrl) {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.className = 'request-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #4CAF50, #45a049);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 1000;
        max-width: 350px;
        font-family: 'Arial', sans-serif;
    `;
    
    notification.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px;">✅ Request Created!</div>
        <div style="font-size: 0.9em; opacity: 0.9;">
            Request ID: ${request.requestId}<br>
            Amount: ${request.amount} ${request.asset}<br>
            Status: ${request.status}<br>
            <strong>Transaction Hash:</strong><br>
            <span style="font-family: monospace; font-size: 0.8em; word-break: break-all;">
                ${request.anchorTx}
            </span>
        </div>
        ${explorerUrl ? `
        <div style="margin-top: 10px;">
            <a href="${explorerUrl}" target="_blank" 
               style="color: #c1e328; text-decoration: underline; font-size: 0.8em;">
                🔍 View on XRPL Explorer
            </a>
        </div>
        ` : ''}
        <div style="margin-top: 8px; font-size: 0.7em; opacity: 0.8;">
            Hash copied to console & sessionStorage
        </div>
    `;
    
    // Also copy hash to clipboard if possible
    if (navigator.clipboard && request.anchorTx) {
        navigator.clipboard.writeText(request.anchorTx).catch(err => {
            console.log('Could not copy to clipboard:', err);
        });
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 8 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 8000);
}

// Form input enhancements
function initFormEnhancements() {
    const inputs = document.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Initialize form functionality when page loads
document.addEventListener('DOMContentLoaded', function() {
    initFormEnhancements();
    
    // Set up initial conversion display
    updateConversion('ETH', '20');
});

// Test payment function for demo purposes
async function testPayment() {
    const btn = document.getElementById('demoPayBtn');
    const originalText = btn.textContent;
    
    // Check if wallet is connected
    if (!window.walletState || !window.walletState.isConnected) {
        alert('Please connect your XRPL wallet first!');
        return;
    }
    
    // Get the last created request ID
    const lastRequestId = sessionStorage.getItem('lastRequestId');
    if (!lastRequestId) {
        alert('Please create a request first!');
        return;
    }
    
    btn.textContent = 'Processing Payment...';
    btn.disabled = true;
    btn.style.opacity = '0.7';
    
    try {
        // Use the XRPL payment function from wallet.js
        const result = await window.processXRPLPayment(lastRequestId, 5); // Pay 5 XRP for demo
        
        if (result.ok) {
            btn.textContent = '✅ Payment Sent!';
            btn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
            
            // Show success notification
            showPaymentSuccessNotification(result);
            
            console.log('Payment successful:', result);
        } else {
            throw new Error(result.error || 'Payment failed');
        }
    } catch (error) {
        console.error('Payment error:', error);
        btn.textContent = '❌ Payment Failed';
        btn.style.background = 'linear-gradient(45deg, #f44336, #da190b)';
        
        alert('Payment failed: ' + error.message);
    } finally {
        // Reset button after delay
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = 'linear-gradient(45deg, #c1e328, #a8c920)';
            btn.style.opacity = '1';
            btn.disabled = false;
        }, 3000);
    }
}

// Show payment success notification
function showPaymentSuccessNotification(result) {
    const notification = document.createElement('div');
    notification.className = 'payment-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        background: linear-gradient(45deg, #4CAF50, #45a049);
        color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 1001;
        max-width: 350px;
        font-family: 'Arial', sans-serif;
    `;
    
    notification.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 10px;">💰 Payment Successful!</div>
        <div style="font-size: 0.9em; opacity: 0.9;">
            <div><strong>Transaction:</strong> ${result.txHash.substring(0, 20)}...</div>
            <div><strong>Amount:</strong> ${result.delivered || 'N/A'} drops</div>
            <div><strong>Status:</strong> ${result.status}</div>
        </div>
        <div style="margin-top: 10px; font-size: 0.8em;">
            <a href="https://testnet.xrpl.org/transactions/${result.txHash}" target="_blank" 
               style="color: #c1e328; text-decoration: underline;">
                View on XRPL Explorer
            </a>
        </div>
        <div id="attestation-status-${result.txHash}" style="margin-top: 8px; font-size: 0.8em; opacity: 0.8;">
            🔒 Starting attestation...
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-attest the successful payment
    autoAttestPayment(result);
    
    // Remove notification after delay
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 10000); // Extended time to show attestation status
}

// Function to get stored transaction hashes
function getStoredHashes() {
    const requestId = sessionStorage.getItem('lastRequestId');
    const anchorTx = sessionStorage.getItem('lastAnchorTx');
    
    console.log('📋 Stored Transaction Information:');
    console.log('Request ID:', requestId);
    console.log('Anchor Transaction Hash:', anchorTx);
    
    if (anchorTx) {
        console.log('🌐 XRPL Explorer URL:', `https://testnet.xrpl.org/transactions/${anchorTx}`);
    }
    
    return { requestId, anchorTx };
}

// Function to display hash information in UI
function showHashInfo() {
    const { requestId, anchorTx } = getStoredHashes();
    
    if (!requestId || !anchorTx) {
        alert('No transaction hash found. Please create a request first.');
        return;
    }
    
    const info = `
Request ID: ${requestId}
Transaction Hash: ${anchorTx}
Explorer URL: https://testnet.xrpl.org/transactions/${anchorTx}
    `;
    
    alert(info);
    
    // Also open the explorer in a new tab
    window.open(`https://testnet.xrpl.org/transactions/${anchorTx}`, '_blank');
}

// Export functions to global scope
window.updateAsset = updateAsset;
window.updateAmount = updateAmount;
window.updateRecipient = updateRecipient;
window.createRequest = createRequest;
window.testPayment = testPayment;
window.getStoredHashes = getStoredHashes;
window.showHashInfo = showHashInfo;

// PAY PAGE FUNCTIONALITY
function updatePayAsset() {
    const assetSelect = document.getElementById('payAssetSelect');
    const amountInput = document.getElementById('payAmountInput');
    const formTitle = document.getElementById('payFormTitle');
    const recipientInput = document.getElementById('payRecipientInput');
    
    const selectedAsset = assetSelect.value;
    const amount = amountInput.value || '20';
    const recipient = recipientInput.value || 'Alice';
    
    // Update the form title
    formTitle.innerHTML = `Send ${amount} ${selectedAsset}<br>to ${recipient}`;
    
    // Update conversion display
    updatePayConversion(selectedAsset, amount);
}

function updatePayAmount() {
    updatePayAsset(); // Reuse the same logic
}

function updatePayRecipient() {
    updatePayAsset(); // Reuse the same logic
}

function updatePayConversion(asset, amount) {
    const conversionAmount = document.getElementById('payConversionAmount');
    const conversionXrp = document.getElementById('payConversionXrp');
    
    // If the selected asset is already XRP, show USDT conversion instead
    if (asset === 'XRP') {
        // Fetch XRP to USDT conversion
        fetchCryptoToXrpConversion('XRP', amount, 'USDT')
            .then(data => {
                if (data.ok) {
                    const usdtAmount = data.equivalent.toFixed(2);
                    conversionAmount.textContent = `${amount} XRP ≈`;
                    conversionXrp.textContent = `≈ ${usdtAmount} USDT`;
                } else {
                    useMockXrpToUsdtConversion(amount, conversionAmount, conversionXrp);
                }
            })
            .catch(error => {
                console.warn('Failed to fetch live rates, using fallback:', error);
                useMockXrpToUsdtConversion(amount, conversionAmount, conversionXrp);
            });
    } else {
        // Convert other cryptocurrencies to XRP
        fetchCryptoToXrpConversion(asset, amount)
            .then(data => {
                if (data.ok) {
                    const xrpAmount = data.equivalent.toFixed(6);
                    conversionAmount.textContent = `${amount} ${asset} ≈`;
                    conversionXrp.textContent = `≈ ${xrpAmount} XRP`;
                } else {
                    useMockCryptoToXrpConversion(asset, amount, conversionAmount, conversionXrp);
                }
            })
            .catch(error => {
                console.warn('Failed to fetch live rates, using fallback:', error);
                useMockCryptoToXrpConversion(asset, amount, conversionAmount, conversionXrp);
            });
    }
}

// Helper function to fetch crypto to XRP conversion rates
async function fetchCryptoToXrpConversion(from, amount, to = 'XRP') {
    try {
        const response = await fetch(`/api/price/quote?from=${from}&to=${to}&amount=${amount}`);
        return await response.json();
    } catch (error) {
        throw new Error('API request failed: ' + error.message);
    }
}

// Fallback mock conversion for pay page
function useMockPayConversion(asset, amount, conversionAmount, conversionXrp) {
    const usdRates = {
        'XRP': 0.62,
        'ETH': 2500,
        'BTC': 45000,
        'USDC': 1.0,
        'USDT': 1.0,
        'ADA': 0.35,
        'SOL': 140,
        'DOT': 6.5
    };
    
    const rate = usdRates[asset] || 1;
    const usdAmount = (parseFloat(amount) * rate).toFixed(2);
    
    conversionAmount.textContent = `${amount} ${asset} ≈`;
    conversionXrp.textContent = `≈ $${usdAmount} USD (estimated)`;
}

// Mock conversion rates from crypto to XRP for fallback
function useMockCryptoToXrpConversion(asset, amount, conversionAmountEl, conversionXrpEl) {
    const xrpRates = {
        'ETH': 4807.69, // 1 ETH ≈ 4807.69 XRP (example rate)
        'BTC': 86538.46, // 1 BTC ≈ 86538.46 XRP (example rate)  
        'USD': 1.92, // 1 USD ≈ 1.92 XRP (example rate)
        'USDC': 1.92, // 1 USDC ≈ 1.92 XRP
        'USDT': 1.92, // 1 USDT ≈ 1.92 XRP
        'ADA': 0.67, // 1 ADA ≈ 0.67 XRP
        'SOL': 269.23, // 1 SOL ≈ 269.23 XRP
        'DOT': 12.5 // 1 DOT ≈ 12.5 XRP
    };
    
    const rate = xrpRates[asset] || 1;
    const xrpAmount = (parseFloat(amount) * rate).toFixed(6);
    conversionAmountEl.textContent = `${amount} ${asset} ≈`;
    conversionXrpEl.textContent = `≈ ${xrpAmount} XRP (estimated)`;
}

// Mock conversion rates from XRP to USDT for fallback
function useMockXrpToUsdtConversion(amount, conversionAmountEl, conversionXrpEl) {
    const xrpToUsdtRate = 0.62; // 1 XRP ≈ 0.62 USDT (example rate)
    const usdtAmount = (parseFloat(amount) * xrpToUsdtRate).toFixed(2);
    conversionAmountEl.textContent = `${amount} XRP ≈`;
    conversionXrpEl.textContent = `≈ ${usdtAmount} USDT (estimated)`;
}

// Send payment functionality
async function sendPayment() {
    // Show payment method selection modal
    showPaymentMethodModal();
}

// Show modal for payment method selection
function showPaymentMethodModal() {
    const modal = document.createElement('div');
    modal.className = 'payment-method-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closePaymentMethodModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Choose Payment Method</h3>
                <button class="modal-close" onclick="closePaymentMethodModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="payment-methods">
                    <button class="payment-method-btn xrpl-method" onclick="useXRPLPayment()">
                        <div class="method-icon">🔐</div>
                        <div class="method-info">
                            <div class="method-title">Built-in XRPL</div>
                            <div class="method-desc">Use your connected XRPL wallet</div>
                        </div>
                    </button>
                    <button class="payment-method-btn gemwallet-method" onclick="useGemWalletPayment()">
                        <div class="method-icon">💎</div>
                        <div class="method-info">
                            <div class="method-title">GemWallet (Testnet)</div>
                            <div class="method-desc">Use GemWallet browser extension on XRPL testnet</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .payment-method-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
        }
        
        .modal-content {
            position: relative;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            padding: 24px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .modal-header h3 {
            color: #fff;
            margin: 0;
            font-size: 20px;
        }
        
        .modal-close {
            background: none;
            border: none;
            color: #fff;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.3s ease;
        }
        
        .modal-close:hover {
            background: rgba(255, 255, 255, 0.1);
        }
        
        .payment-methods {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .payment-method-btn {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
            width: 100%;
        }
        
        .payment-method-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }
        
        .method-icon {
            font-size: 32px;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(193, 227, 40, 0.2);
            border-radius: 12px;
        }
        
        .method-info {
            flex: 1;
        }
        
        .method-title {
            color: #fff;
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 4px;
        }
        
        .method-desc {
            color: rgba(255, 255, 255, 0.7);
            font-size: 14px;
        }
    `;
    
    document.head.appendChild(style);
}

// Close payment method modal
function closePaymentMethodModal() {
    const modal = document.querySelector('.payment-method-modal');
    if (modal) {
        modal.remove();
    }
}

// Use built-in XRPL payment
async function useXRPLPayment() {
    closePaymentMethodModal();
    await originalSendPayment();
}

// Use GemWallet payment
async function useGemWalletPayment() {
    closePaymentMethodModal();
    
    // Get form data
    const assetSelect = document.getElementById('payAssetSelect');
    const amountInput = document.getElementById('payAmountInput');
    const recipientInput = document.getElementById('payRecipientInput');
    const messageInput = document.getElementById('payMessageInput');
    
    const recipient = recipientInput.value.trim();
    const amount = amountInput.value.trim();
    const memo = messageInput.value.trim();
    const asset = assetSelect.value;
    
    // Validate form data
    if (!recipient) {
        alert('Please enter a recipient address');
        return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    // For GemWallet, we only support XRP payments directly
    if (asset !== 'XRP') {
        if (confirm(`GemWallet only supports XRP payments directly. Would you like to convert ${amount} ${asset} to XRP and proceed?`)) {
            // Calculate XRP equivalent (you can enhance this with real conversion)
            const xrpAmount = prompt(`Please enter the equivalent XRP amount for ${amount} ${asset}:`);
            if (xrpAmount && parseFloat(xrpAmount) > 0) {
                await processGemWalletPayment(recipient, xrpAmount, memo);
            }
        }
        return;
    }
    
    // Process XRP payment directly
    await processGemWalletPayment(recipient, amount, memo);
}

// Process GemWallet payment within the same page
async function processGemWalletPayment(recipient, amount, memo) {
    try {
        // Validate inputs
        const amountNum = parseFloat(amount);
        if (!amountNum || amountNum <= 0) {
            throw new Error('Please enter a valid amount');
        }
        
        if (!recipient || !recipient.trim()) {
            throw new Error('Please enter a recipient address');
        }
        
        // Show processing state
        showNotification('Connecting to GemWallet...', 'info');
        
        // Wait for GemWallet API
        const GemWalletApi = await waitForGemApi(5000);
        
        // Check installation
        const installedResp = await GemWalletApi.isInstalled();
        if (!installedResp?.result?.isInstalled) {
            throw new Error('GemWallet is not installed or enabled');
        }
        
        // Ensure we're on testnet
        try {
            await GemWalletApi.setNetwork({
                networkID: 1,
                name: "testnet", 
                server: "wss://s.altnet.rippletest.net:51233"
            });
            showNotification('Switched to XRPL Testnet', 'info');
        } catch (networkError) {
            console.log('Network switch not supported or already on testnet:', networkError);
        }
        
        // Get user address
        const addrResp = await GemWalletApi.getAddress();
        if (addrResp?.type !== 'response' || !addrResp.result?.address) {
            throw new Error('Failed to get wallet address');
        }
        
        const userAddress = addrResp.result.address;
        showNotification(`Connected to TESTNET: ${userAddress.substring(0, 10)}... (No real value)`, 'success');
        
        // Validate accounts before sending payment
        showNotification('Validating accounts...', 'info');
        const validation = await validateAndPreparePayment(
            userAddress,
            recipient.trim(),
            amount
        );
        
        // Use suggested amount if provided (for account activation)
        const finalAmount = validation.suggestedAmount ? validation.suggestedAmount : amount;
        
        if (validation.suggestedAmount) {
            showNotification(`Amount increased to ${validation.suggestedAmount} XRP for account activation`, 'info');
        }
        
        // Convert XRP to drops
        const amountInDrops = Math.floor(parseFloat(finalAmount) * 1000000).toString();
        
        const paymentRequest = {
            amount: amountInDrops,
            destination: recipient,
            network: {
                networkID: 1, // Testnet network ID
                name: "testnet",
                server: "wss://s.altnet.rippletest.net:51233"
            }
        };
        
        // Add memo if provided
        if (memo) {
            paymentRequest.memos = [{
                memo: {
                    memoData: stringToHex(memo),
                    memoFormat: stringToHex('text/plain')
                }
            }];
        }
        
        showNotification('Requesting payment authorization...', 'info');
        
        // Request payment
        const resp = await GemWalletApi.sendPayment(paymentRequest);
        
        if (resp?.type === "response" && resp.result?.hash) {
            const txHash = resp.result.hash;
            
            // Show success notification
            const successResult = {
                txHash: txHash,
                delivered: amountInDrops,
                status: 'Success',
                amount: amount,
                asset: 'XRP',
                from: userAddress,
                to: recipient,
                requestId: null
            };
            
            showPaymentSuccessNotification(successResult);
            
            // Send to backend for tracking
            try {
                await fetch('/api/gemwallet/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        hash: txHash,
                        from: userAddress,
                        to: recipient,
                        amount: amount,
                        memo: memo,
                        timestamp: Date.now()
                    })
                });
                
                // Submit attestation
                await fetch('/api/attest', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        xrplTxHash: txHash,
                        from: userAddress,
                        to: recipient,
                        amount: amount,
                        asset: 'XRP',
                        memo: memo,
                        source: 'gemwallet',
                        timestamp: Date.now()
                    })
                });
                
            } catch (trackError) {
                console.warn('Failed to track transaction or submit attestation:', trackError);
            }
            
            // Clear form
            document.getElementById('payAmountInput').value = '';
            document.getElementById('payMessageInput').value = '';
            
        } else if (resp?.type === "reject") {
            showNotification('Payment was rejected by user', 'warning');
        } else {
            throw new Error('Unknown response from GemWallet');
        }
        
    } catch (error) {
        console.error('GemWallet payment error:', error);
        showNotification(`GemWallet error: ${error.message}`, 'error');
    }
}

// Wait for GemWallet API injection
function waitForGemApi(timeout = 5000) {
    if (window.GemWalletApi) return Promise.resolve(window.GemWalletApi);
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const timer = setInterval(() => {
            if (window.GemWalletApi) {
                clearInterval(timer);
                resolve(window.GemWalletApi);
            } else if (Date.now() - start > timeout) {
                clearInterval(timer);
                reject(new Error('Timeout - GemWallet extension not found'));
            }
        }, 100);
    });
}

// Helper function to convert string to hex (browser-compatible)
function stringToHex(str) {
    return Array.from(new TextEncoder().encode(str))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
}

// Enhanced notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196F3'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1001;
        font-family: 'Arial', sans-serif;
        font-size: 14px;
        max-width: 300px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Attestation functionality
async function submitAttestation(xrplTxHash, requestId = null, amount = null, asset = null, from = null, to = null) {
    try {
        console.log('🔒 Submitting attestation for tx:', xrplTxHash);
        
        const attestationData = {
            xrplTxHash,
            requestId,
            amount,
            asset,
            from,
            to,
            timestamp: Date.now()
        };
        
        const response = await fetch('/api/attest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(attestationData)
        });
        
        const result = await response.json();
        
        if (result.ok) {
            console.log('✅ Attestation submitted successfully:', result);
            showNotification(`Attestation started for transaction`, 'success');
            return result;
        } else {
            console.error('❌ Attestation failed:', result.error);
            showNotification(`Attestation failed: ${result.error}`, 'error');
            return null;
        }
    } catch (error) {
        console.error('❌ Attestation error:', error);
        showNotification(`Attestation error: ${error.message}`, 'error');
        return null;
    }
}

// Get attestation status
async function getAttestationStatus(txHash) {
    try {
        const response = await fetch(`/api/attest/${txHash}`);
        const result = await response.json();
        
        if (result.ok) {
            console.log('🔍 Attestation status:', result);
            return result;
        } else {
            console.error('❌ Failed to get attestation status');
            return null;
        }
    } catch (error) {
        console.error('❌ Error getting attestation status:', error);
        return null;
    }
}

// Auto-attest successful payments
async function autoAttestPayment(paymentResult) {
    if (paymentResult && paymentResult.txHash) {
        // Extract payment details
        const txHash = paymentResult.txHash;
        const amount = paymentResult.delivered || paymentResult.amount || null;
        const asset = paymentResult.asset || 'XRP';
        const from = paymentResult.from || null;
        const to = paymentResult.to || null;
        const requestId = paymentResult.requestId || null;
        
        // Submit attestation automatically
        setTimeout(async () => {
            try {
                const attestationResult = await submitAttestation(txHash, requestId, amount, asset, from, to);
                
                // Update the notification status
                const statusElement = document.getElementById(`attestation-status-${txHash}`);
                if (statusElement) {
                    if (attestationResult && attestationResult.ok) {
                        statusElement.innerHTML = '✅ Attestation completed';
                        statusElement.style.color = '#c1e328';
                    } else {
                        statusElement.innerHTML = '❌ Attestation failed';
                        statusElement.style.color = '#ff6b6b';
                    }
                }
            } catch (error) {
                console.error('Auto-attestation error:', error);
                const statusElement = document.getElementById(`attestation-status-${txHash}`);
                if (statusElement) {
                    statusElement.innerHTML = '❌ Attestation error';
                    statusElement.style.color = '#ff6b6b';
                }
            }
        }, 2000); // Small delay to ensure transaction is processed
    }
}

// Original XRPL payment function (renamed)
async function originalSendPayment() {
    const btn = document.querySelector('.send-payment-btn');
    const originalText = btn.textContent;
    
    // Get form data
    const assetSelect = document.getElementById('payAssetSelect');
    const amountInput = document.getElementById('payAmountInput');
    const recipientInput = document.getElementById('payRecipientInput');
    const messageInput = document.getElementById('payMessageInput');
    
    // Check if wallet is connected
    if (!window.walletState || !window.walletState.isConnected) {
        alert('Please connect your XRPL wallet first!');
        return;
    }
    
    // Show sending state
    btn.textContent = 'Sending Payment...';
    btn.disabled = true;
    btn.style.opacity = '0.7';
    
    try {
        // Validate form data
        const amount = parseFloat(amountInput.value);
        const recipient = recipientInput.value.trim();
        
        if (!amount || amount <= 0) {
            throw new Error('Please enter a valid amount');
        }
        
        if (!recipient) {
            throw new Error('Please enter a recipient address');
        }
        
        // Validate accounts before sending payment
        showNotification('Validating accounts...', 'info');
        const validation = await validateAndPreparePayment(
            window.walletState.address,
            recipient,
            amount.toString()
        );
        
        // Use suggested amount if provided (for account activation)
        const finalAmount = validation.suggestedAmount ? parseFloat(validation.suggestedAmount) : amount;
        
        if (validation.suggestedAmount) {
            amountInput.value = validation.suggestedAmount;
            showNotification(`Amount increased to ${validation.suggestedAmount} XRP for account activation`, 'info');
        }
        
        // Create a mock request ID for direct payment
        const directPaymentId = 'direct_' + Date.now();
        
        // Use the XRPL payment function from wallet.js
        const result = await window.processXRPLPayment(directPaymentId, finalAmount);
        
        if (result.ok) {
            btn.textContent = '✅ Payment Sent!';
            btn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
            
            // Show success notification
            showPaymentSuccessNotification(result);
            
            // Clear form
            amountInput.value = '';
            messageInput.value = '';
            
            console.log('Direct payment successful:', result);
        } else {
            throw new Error(result.error || 'Payment failed');
        }
    } catch (error) {
        console.error('Payment error:', error);
        btn.textContent = '❌ Payment Failed';
        btn.style.background = 'linear-gradient(45deg, #f44336, #da190b)';
        
        alert('Payment failed: ' + error.message);
    } finally {
        // Reset button after delay
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = 'linear-gradient(135deg, #c1e328 0%, #a8c920 100%)';
            btn.style.opacity = '1';
            btn.disabled = false;
        }, 3000);
    }
}

// Load pending requests from backend
async function loadPendingRequests() {
    const container = document.getElementById('requestsContainer');
    const noRequestsMessage = document.getElementById('noRequestsMessage');
    
    try {
        // Get wallet address for requests
        const walletAddress = window.walletState?.account || 'rwJDVy2wDUc3cP5GaPrQTyLZGqNdgTcMbk';
        
        const response = await fetch(`/api/requests/${walletAddress}`);
        const data = await response.json();
        
        if (data.ok && data.requests.length > 0) {
            noRequestsMessage.style.display = 'none';
            container.innerHTML = ''; // Clear existing requests
            
            data.requests.forEach(request => {
                if (request.status === 'OPEN') {
                    const requestElement = createRequestElement(request);
                    container.appendChild(requestElement);
                }
            });
        } else {
            noRequestsMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Failed to load requests:', error);
        // Show some mock requests for demo
        showMockRequests();
    }
}

// Create request element
function createRequestElement(request) {
    const requestDiv = document.createElement('div');
    requestDiv.className = 'request-item';
    requestDiv.innerHTML = `
        <div class="request-info">
            <div class="request-header">
                <div class="request-avatar">${getInitials(request.requesterAddress)}</div>
                <div class="request-details">
                    <div class="request-from">Request from ${request.requesterAddress.substring(0, 10)}...</div>
                    <div class="request-amount">${request.amount} ${request.asset}</div>
                    <div class="request-message">${request.note || 'No message'}</div>
                </div>
            </div>
        </div>
        <div class="request-actions">
            <button class="action-btn accept-btn" onclick="acceptRequest('${request.requestId}')">Accept</button>
            <button class="action-btn decline-btn" onclick="declineRequest('${request.requestId}')">Decline</button>
        </div>
    `;
    return requestDiv;
}

// Show mock requests for demo
function showMockRequests() {
    const container = document.getElementById('requestsContainer');
    const noRequestsMessage = document.getElementById('noRequestsMessage');
    
    noRequestsMessage.style.display = 'none';
    container.innerHTML = '';
    
    const mockRequests = [
        { requestId: 'mock_1', requesterAddress: 'rBobExample123...', amount: 5, asset: 'XRP', note: 'Coffee payment' },
        { requestId: 'mock_2', requesterAddress: 'rAliceExample456...', amount: 0.01, asset: 'ETH', note: 'Split the dinner bill' },
        { requestId: 'mock_3', requesterAddress: 'rCharlieExample789...', amount: 25, asset: 'USDC', note: 'Concert tickets' }
    ];
    
    mockRequests.forEach(request => {
        const requestElement = createRequestElement(request);
        container.appendChild(requestElement);
    });
}

// Get initials from address
function getInitials(address) {
    return address.substring(1, 3).toUpperCase();
}

// Accept request
async function acceptRequest(requestId) {
    if (!window.walletState || !window.walletState.isConnected) {
        alert('Please connect your XRPL wallet first!');
        return;
    }
    
    try {
        const result = await window.processXRPLPayment(requestId, 5); // Use amount from request
        
        if (result.ok) {
            showPaymentSuccessNotification(result);
            // Remove the request from the list
            document.querySelector(`[onclick="acceptRequest('${requestId}')"]`).closest('.request-item').remove();
            
            // Check if any requests remain
            const remainingRequests = document.querySelectorAll('.request-item');
            if (remainingRequests.length === 0) {
                document.getElementById('noRequestsMessage').style.display = 'block';
            }
        }
    } catch (error) {
        alert('Failed to accept request: ' + error.message);
    }
}

// Decline request
function declineRequest(requestId) {
    if (confirm('Are you sure you want to decline this request?')) {
        // Remove the request from the list
        document.querySelector(`[onclick="declineRequest('${requestId}')"]`).closest('.request-item').remove();
        
        // Check if any requests remain
        const remainingRequests = document.querySelectorAll('.request-item');
        if (remainingRequests.length === 0) {
            document.getElementById('noRequestsMessage').style.display = 'block';
        }
        
        console.log('Request declined:', requestId);
    }
}

// Check if account exists and is funded
async function checkAccountStatus(address) {
    try {
        const response = await fetch(`/api/account/${address}`);
        const result = await response.json();
        
        if (result.ok) {
            console.log('🔍 Account status:', result);
            return result;
        } else {
            throw new Error(result.error || 'Failed to check account');
        }
    } catch (error) {
        console.error('❌ Account check error:', error);
        return { ok: false, exists: false, funded: false, error: error.message };
    }
}

// Fund account using testnet faucet
async function fundAccount(address) {
    try {
        showNotification(`Funding test account ${address.substring(0, 10)}...`, 'info');
        
        const response = await fetch('/api/fund-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ address })
        });
        
        const result = await response.json();
        
        if (result.ok) {
            showNotification(`Successfully funded ${address.substring(0, 10)}... with test XRP`, 'success');
            return result;
        } else {
            throw new Error(result.error || 'Failed to fund account');
        }
    } catch (error) {
        console.error('❌ Funding error:', error);
        showNotification(`Failed to fund account: ${error.message}`, 'error');
        return { ok: false, error: error.message };
    }
}

// Enhanced payment function with account validation
async function validateAndPreparePayment(fromAddress, toAddress, amount) {
    try {
        // Check sender account
        const senderStatus = await checkAccountStatus(fromAddress);
        console.log('🔍 Sender account status:', senderStatus);
        
        if (!senderStatus.exists) {
            const shouldFund = confirm(`Your wallet account ${fromAddress.substring(0, 10)}... doesn't exist on testnet. Would you like to fund it with test XRP to activate it?`);
            if (shouldFund) {
                const fundResult = await fundAccount(fromAddress);
                if (!fundResult.ok) {
                    throw new Error('Failed to fund sender account');
                }
                // Wait a bit for the funding to process
                await new Promise(resolve => setTimeout(resolve, 3000));
            } else {
                throw new Error('Sender account needs to be activated to send payments');
            }
        } else if (!senderStatus.funded) {
            const shouldFund = confirm(`Your wallet account ${fromAddress.substring(0, 10)}... has ${senderStatus.balance} XRP but needs at least 1 XRP to be considered funded. Would you like to add more test XRP?`);
            if (shouldFund) {
                const fundResult = await fundAccount(fromAddress);
                if (!fundResult.ok) {
                    throw new Error('Failed to fund sender account');
                }
                // Wait a bit for the funding to process
                await new Promise(resolve => setTimeout(resolve, 3000));
            } else {
                throw new Error('Sender account needs more funding to send payments');
            }
        }
        
        // Check if sender has enough balance (reduced threshold for testnet)
        if (parseFloat(senderStatus.balance) < (parseFloat(amount) + 0.01)) { // amount + minimal fees for testnet
            throw new Error(`Insufficient balance. Has ${senderStatus.balance} XRP, needs ${amount} XRP + fees (0.01 XRP)`);
        }
        
        // Check destination account (Testnet mode - lower minimum)
        const destStatus = await checkAccountStatus(toAddress);
        if (!destStatus.exists && parseFloat(amount) < 1) {
            const shouldIncrease = confirm(`Destination account doesn't exist. On testnet, first payment must be at least 1 XRP to activate it. Would you like to increase the amount to 1 XRP?`);
            if (shouldIncrease) {
                return { validated: true, suggestedAmount: '1' };
            } else {
                throw new Error('Payment amount too low for account activation (minimum 1 XRP on testnet)');
            }
        }
        
        return { validated: true };
        
    } catch (error) {
        console.error('❌ Payment validation error:', error);
        throw error;
    }
}

// Export new functions to global scope
window.checkAccountStatus = checkAccountStatus;
window.fundAccount = fundAccount;
window.validateAndPreparePayment = validateAndPreparePayment;
window.updatePayAsset = updatePayAsset;
window.updatePayAmount = updatePayAmount;
window.updatePayRecipient = updatePayRecipient;
window.sendPayment = sendPayment;
window.loadPendingRequests = loadPendingRequests;
window.acceptRequest = acceptRequest;
window.declineRequest = declineRequest;

// Export functions
window.updateAsset = updateAsset;
window.updateAmount = updateAmount;
window.updateRecipient = updateRecipient;
window.createRequest = createRequest;