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
    
    // Simple mock conversion rates (in a real app, this would fetch from an API)
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
    conversionXrp.textContent = `≈ ${xrpAmount} XRP`;
}

// Create request functionality
function createRequest() {
    const btn = document.querySelector('.create-request-btn');
    const originalText = btn.textContent;
    
    // Show creating state
    btn.textContent = 'Creating...';
    btn.style.opacity = '0.7';
    btn.disabled = true;
    
    // Simulate request creation process
    setTimeout(() => {
        btn.textContent = 'Request Created!';
        btn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
        
        // Show success state briefly, then reset
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = 'linear-gradient(45deg, #c1e328, #a8c920)';
            btn.style.opacity = '1';
            btn.disabled = false;
            
            // Optional: Show success message or redirect
            console.log('Payment request created successfully');
            
        }, 2000);
    }, 1500);
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

// Export functions
window.updateAsset = updateAsset;
window.updateAmount = updateAmount;
window.updateRecipient = updateRecipient;
window.createRequest = createRequest;