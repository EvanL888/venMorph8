// Wallet connection functionality

function connectWallet() {
    const btn = document.querySelector('.connect-wallet');
    const originalText = btn.textContent;
    
    // Show connecting state
    btn.textContent = 'Connecting...';
    btn.disabled = true;
    
    // Simulate wallet connection process
    setTimeout(() => {
        btn.textContent = 'Wallet Connected';
        btn.style.background = '#c1e328';
        btn.style.color = '#21211f';
        btn.disabled = false;
        
        // Optional: Add success feedback
        console.log('Wallet connected successfully');
        
        // Could trigger additional UI updates here
        // For example: showing user balance, enabling features, etc.
        
    }, 1000);
}

// Additional wallet-related functions could be added here
function disconnectWallet() {
    const btn = document.querySelector('.connect-wallet');
    btn.textContent = 'Connect Wallet';
    btn.style.background = 'rgba(193, 227, 40, 0.1)';
    btn.style.color = '#c1e328';
    
    console.log('Wallet disconnected');
}

// Export functions
window.connectWallet = connectWallet;
window.disconnectWallet = disconnectWallet;