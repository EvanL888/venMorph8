// Main application initialization and global functionality

// Application state
const AppState = {
    currentPage: 'home',
    walletConnected: false,
    currentRequest: null
};

// Main application initialization
function initApp() {
    console.log('Venmorph application initialized');
    
    // Initialize all modules
    initScrollAnimations();
    
    // Set up global event listeners
    setupGlobalEventListeners();
    
    // Initialize any third-party libraries or APIs here
    // For example: Web3 initialization, analytics, etc.
    
    // Show welcome message in console
    console.log(`
    🚀 Venmorph - Cross-Chain Crypto Payments
    ==========================================
    Welcome to the future of decentralized payments!
    
    Features loaded:
    ✅ Navigation system
    ✅ Wallet integration
    ✅ Form handling
    ✅ Scroll animations
    ✅ Responsive design
    `);
}

// Global event listeners
function setupGlobalEventListeners() {
    // Handle escape key to go back to home
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            showHome();
        }
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function(event) {
        // Handle browser navigation
        if (event.state && event.state.page) {
            if (event.state.page === 'home') {
                showHome();
            } else if (event.state.page === 'request') {
                showRequestPage();
            }
        }
    });
    
    // Add click tracking for analytics (optional)
    document.addEventListener('click', function(event) {
        // Track button clicks for analytics
        if (event.target.matches('button')) {
            console.log('Button clicked:', event.target.textContent);
        }
    });
}

// Utility functions
function updateAppState(newState) {
    Object.assign(AppState, newState);
    console.log('App state updated:', AppState);
}

function getAppState() {
    return { ...AppState };
}

// Error handling
function handleError(error, context = 'Unknown') {
    console.error(`Error in ${context}:`, error);
    
    // In a production app, you might want to:
    // - Send error to logging service
    // - Show user-friendly error message
    // - Offer recovery options
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Handle page visibility changes (for performance optimization)
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('Page hidden - pausing animations');
        // Pause any resource-intensive animations
    } else {
        console.log('Page visible - resuming animations');
        // Resume animations
    }
});

// Export global functions and state
window.AppState = AppState;
window.updateAppState = updateAppState;
window.getAppState = getAppState;
window.handleError = handleError;