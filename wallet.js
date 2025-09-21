// Enhanced Wallet Connection with MetaMask Integration

// Global wallet state
let walletState = {
    isConnected: false,
    account: null,
    balance: null,
    provider: null,
    walletType: null
};

// Initialize wallet functionality
function initializeWallet() {
    // Check if user was previously connected
    checkExistingConnection();
    
    // Listen for account changes
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        window.ethereum.on('disconnect', handleDisconnect);
    }
}

// Toggle wallet dropdown visibility
function toggleWalletDropdown() {
    if (walletState.isConnected) {
        // If already connected, show wallet info instead of dropdown
        return;
    }
    
    const dropdown = document.getElementById('walletDropdown');
    const isVisible = dropdown.style.display === 'block';
    dropdown.style.display = isVisible ? 'none' : 'block';
    
    // Close dropdown when clicking outside
    if (!isVisible) {
        document.addEventListener('click', closeDropdownOnOutsideClick);
    }
}

// Close dropdown when clicking outside
function closeDropdownOnOutsideClick(event) {
    const dropdown = document.getElementById('walletDropdown');
    const walletContainer = document.querySelector('.wallet-container');
    
    if (!walletContainer.contains(event.target)) {
        dropdown.style.display = 'none';
        document.removeEventListener('click', closeDropdownOnOutsideClick);
    }
}

// Connect to MetaMask
async function connectMetaMask() {
    try {
        // Hide dropdown
        document.getElementById('walletDropdown').style.display = 'none';
        
        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            alert('MetaMask is not installed! Please install it from https://metamask.io/');
            return;
        }
        
        // Show connecting state
        updateWalletButton('Connecting to MetaMask...', true);
        
        // Request account access
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
        
        if (accounts.length === 0) {
            throw new Error('No accounts found');
        }
        
        // Get account balance
        const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest']
        });
        
        // Convert balance from wei to ETH
        const balanceInEth = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
        
        // Update wallet state
        walletState = {
            isConnected: true,
            account: accounts[0],
            balance: balanceInEth,
            provider: window.ethereum,
            walletType: 'MetaMask'
        };
        
        // Update UI
        updateConnectedWalletUI();
        
        // Store connection in localStorage
        localStorage.setItem('walletConnected', 'metamask');
        localStorage.setItem('walletAccount', accounts[0]);
        
        console.log('MetaMask connected successfully:', accounts[0]);
        
    } catch (error) {
        console.error('Failed to connect to MetaMask:', error);
        
        let errorMessage = 'Failed to connect to MetaMask';
        if (error.code === 4001) {
            errorMessage = 'Connection rejected by user';
        } else if (error.code === -32002) {
            errorMessage = 'Connection request already pending';
        }
        
        alert(errorMessage);
        resetWalletButton();
    }
}

// Connect to WalletConnect (placeholder)
async function connectWalletConnect() {
    document.getElementById('walletDropdown').style.display = 'none';
    alert('WalletConnect integration coming soon!');
}

// Connect to Coinbase Wallet (placeholder)
async function connectCoinbase() {
    document.getElementById('walletDropdown').style.display = 'none';
    alert('Coinbase Wallet integration coming soon!');
}

// Update wallet button state
function updateWalletButton(text, disabled = false) {
    const btn = document.getElementById('connectWalletBtn');
    const btnText = document.getElementById('walletBtnText');
    
    btnText.textContent = text;
    btn.disabled = disabled;
    
    if (disabled) {
        btn.style.opacity = '0.6';
        btn.style.cursor = 'not-allowed';
    } else {
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    }
}

// Reset wallet button to default state
function resetWalletButton() {
    updateWalletButton('Connect Wallet', false);
    const btn = document.getElementById('connectWalletBtn');
    btn.style.background = 'rgba(193, 227, 40, 0.1)';
    btn.style.color = '#c1e328';
}

// Update UI for connected wallet
function updateConnectedWalletUI() {
    const connectBtn = document.getElementById('connectWalletBtn');
    const walletInfo = document.getElementById('walletInfo');
    const accountAddress = document.getElementById('accountAddress');
    const accountBalance = document.getElementById('accountBalance');
    const accountAvatar = document.getElementById('accountAvatar');
    
    // Hide connect button and show wallet info
    connectBtn.style.display = 'none';
    walletInfo.style.display = 'flex';
    
    // Update account info
    accountAddress.textContent = formatAddress(walletState.account);
    accountBalance.textContent = `${walletState.balance} ETH`;
    
    // Generate avatar based on address
    accountAvatar.textContent = getAvatarEmoji(walletState.account);
    
    console.log('Wallet UI updated for connected state');
}

// Format address for display (show first 6 and last 4 characters)
function formatAddress(address) {
    if (!address) return '0x...';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Generate avatar emoji based on address
function getAvatarEmoji(address) {
    if (!address) return '👤';
    const emojis = ['🐸', '🦊', '🐱', '🐶', '🐻', '🦁', '🐯', '🦄', '🐵', '🐨'];
    const index = parseInt(address.slice(-1), 16) % emojis.length;
    return emojis[index];
}

// Disconnect wallet
function disconnectWallet() {
    // Reset wallet state
    walletState = {
        isConnected: false,
        account: null,
        balance: null,
        provider: null,
        walletType: null
    };
    
    // Clear localStorage
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAccount');
    
    // Reset UI
    const connectBtn = document.getElementById('connectWalletBtn');
    const walletInfo = document.getElementById('walletInfo');
    
    connectBtn.style.display = 'flex';
    walletInfo.style.display = 'none';
    
    resetWalletButton();
    
    console.log('Wallet disconnected');
}

// Check for existing connection on page load
async function checkExistingConnection() {
    const savedWallet = localStorage.getItem('walletConnected');
    const savedAccount = localStorage.getItem('walletAccount');
    
    if (savedWallet === 'metamask' && savedAccount && window.ethereum) {
        try {
            const accounts = await window.ethereum.request({
                method: 'eth_accounts'
            });
            
            if (accounts.includes(savedAccount)) {
                // Auto-connect if user is still connected
                await connectMetaMask();
            } else {
                // Clear stale data
                localStorage.removeItem('walletConnected');
                localStorage.removeItem('walletAccount');
            }
        } catch (error) {
            console.error('Failed to check existing connection:', error);
        }
    }
}

// Handle account changes
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        disconnectWallet();
    } else if (accounts[0] !== walletState.account) {
        // Account changed, reconnect
        connectMetaMask();
    }
}

// Handle chain changes
function handleChainChanged(chainId) {
    console.log('Chain changed to:', chainId);
    // Optionally update UI or refresh balance
    if (walletState.isConnected) {
        connectMetaMask(); // Refresh connection
    }
}

// Handle disconnect
function handleDisconnect(error) {
    console.log('Wallet disconnected:', error);
    disconnectWallet();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeWallet);

// Export functions to global scope
window.toggleWalletDropdown = toggleWalletDropdown;
window.connectMetaMask = connectMetaMask;
window.connectWalletConnect = connectWalletConnect;
window.connectCoinbase = connectCoinbase;
window.disconnectWallet = disconnectWallet;