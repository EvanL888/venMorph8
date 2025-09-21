// Enhanced Wallet Connection with XRPL Integration

// Global wallet state
let walletState = {
    isConnected: false,
    account: null,
    balance: null,
    provider: null,
    walletType: null,
    xrplSeed: null // Store XRPL seed for transactions
};

// Initialize wallet functionality
function initializeWallet() {
    // Check if user was previously connected
    checkExistingConnection();
    
    // Listen for account changes (MetaMask)
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
        showWalletInfo();
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

// Show wallet info modal
function showWalletInfo() {
    const modal = document.createElement('div');
    modal.className = 'wallet-info-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; max-width: 400px; width: 90%;">
            <h3 style="margin-top: 0; color: #333;">Wallet Information</h3>
            <p><strong>Type:</strong> ${walletState.walletType}</p>
            <p><strong>Address:</strong> ${walletState.account ? walletState.account.substring(0, 10) + '...' + walletState.account.substring(walletState.account.length - 6) : 'N/A'}</p>
            <p><strong>Balance:</strong> ${walletState.balance || 'N/A'} ${walletState.walletType === 'XRPL' ? 'XRP' : 'ETH'}</p>
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="disconnectWallet(); this.parentElement.parentElement.parentElement.remove();" 
                        style="background: #f44336; color: white; border: none; padding: 10px 20px; border-radius: 5px; margin-right: 10px; cursor: pointer;">
                    Disconnect
                </button>
                <button onclick="this.parentElement.parentElement.parentElement.remove();" 
                        style="background: #c1e328; color: #333; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
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
    
    // Update account info based on wallet type
    accountAddress.textContent = formatAddress(walletState.account);
    
    if (walletState.walletType === 'XRPL') {
        accountBalance.textContent = `${walletState.balance} XRP`;
    } else {
        accountBalance.textContent = `${walletState.balance} ETH`;
    }
    
    // Generate avatar based on address
    accountAvatar.textContent = getAvatarEmoji(walletState.account);
    
    console.log(`${walletState.walletType} Wallet UI updated for connected state`);
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
        walletType: null,
        xrplSeed: null
    };
    
    // Clear localStorage
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAccount');
    localStorage.removeItem('walletSeed');
    
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

// Connect to XRPL Wallet (using seed for demo purposes)
async function connectXRPL() {
    try {
        // Hide dropdown
        document.getElementById('walletDropdown').style.display = 'none';
        
        // Show connecting state
        updateWalletButton('Connecting to XRPL...', true);
        
        // For demo purposes, use a predefined seed (in production, this would be entered by user or generated)
        const seed = "sEdTJdLuEgQq6SzixR1cpdVuzEy3Wzx"; // Demo seed
        
        // Note: We'll use the backend API to handle XRPL operations
        // In a real app, you'd either use xrpl.js in browser or handle all operations server-side
        
        // Simulate wallet connection by creating address from seed
        // For demo, we'll just use the known address that corresponds to this seed
        const address = "rwJDVy2wDUc3cP5GaPrQTyLZGqNdgTcMbk"; // Address for the demo seed
        
        // Update wallet state
        walletState = {
            isConnected: true,
            account: address,
            balance: '100.000000', // Demo balance
            provider: null,
            walletType: 'XRPL',
            xrplSeed: seed
        };
        
        // Update UI
        updateConnectedWalletUI();
        
        // Store connection in localStorage
        localStorage.setItem('walletConnected', 'xrpl');
        localStorage.setItem('walletAccount', address);
        localStorage.setItem('walletSeed', seed); // Note: In production, never store seeds in localStorage!
        
        console.log('✅ XRPL Wallet connected:', address);
        
    } catch (error) {
        console.error('XRPL connection failed:', error);
        
        // Show error state
        updateWalletButton('XRPL Connection Failed', true);
        
        setTimeout(() => {
            resetWalletButton();
        }, 3000);
        
        alert('Failed to connect to XRPL: ' + error.message);
    }
}

// Process payment using XRPL
async function processXRPLPayment(requestId, amount) {
    if (!walletState.isConnected || walletState.walletType !== 'XRPL') {
        throw new Error('XRPL wallet not connected');
    }
    
    try {
        const response = await fetch('/api/payment/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                payerSeed: walletState.xrplSeed,
                requestId: requestId,
                amount: amount,
                asset: 'XRP'
            })
        });
        
        const result = await response.json();
        
        if (!result.ok) {
            throw new Error(result.error);
        }
        
        return result;
    } catch (error) {
        console.error('XRPL payment failed:', error);
        throw error;
    }
}

// Export functions to global scope
window.toggleWalletDropdown = toggleWalletDropdown;
window.connectMetaMask = connectMetaMask;
window.connectWalletConnect = connectWalletConnect;
window.connectCoinbase = connectCoinbase;
window.connectXRPL = connectXRPL;
window.processXRPLPayment = processXRPLPayment;
window.disconnectWallet = disconnectWallet;