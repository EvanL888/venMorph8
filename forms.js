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
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 8 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 8000);
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
        // Create a mock request ID for direct payment
        const directPaymentId = 'direct_' + Date.now();
        
        // Use the XRPL payment function from wallet.js
        const result = await window.processXRPLPayment(directPaymentId, parseFloat(amountInput.value));
        
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

// Export new functions to global scope
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