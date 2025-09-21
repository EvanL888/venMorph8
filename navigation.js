// Navigation functionality - Page switching and routing

// Update navigation active state
function updateNavState(activePage) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current page
    const activeNav = document.getElementById(activePage + 'Nav');
    if (activeNav) {
        activeNav.classList.add('active');
    }
}

// Page navigation functions
function showHome() {
    document.getElementById('homePage').classList.remove('hidden');
    document.getElementById('requestPage').classList.remove('active');
    document.getElementById('payPage').classList.remove('active');
    document.getElementById('payPage').style.display = 'none';
    document.getElementById('homePage').classList.add('fade-in');
    
    // Update navigation state
    updateNavState('home');
    
    // Reset animations
    setTimeout(() => {
        initScrollAnimations();
    }, 100);
}

function showRequestPage() {
    document.getElementById('homePage').classList.add('hidden');
    document.getElementById('requestPage').classList.add('active');
    document.getElementById('payPage').classList.remove('active');
    document.getElementById('payPage').style.display = 'none';
    document.getElementById('requestPage').classList.add('fade-in');
    
    // Update navigation state
    updateNavState('request');
}

function showPayPage() {
    // Hide other pages
    document.getElementById('homePage').classList.add('hidden');
    document.getElementById('requestPage').classList.remove('active');
    
    // Show pay page
    const payPage = document.getElementById('payPage');
    payPage.style.display = 'block';
    payPage.classList.add('active');
    payPage.classList.add('fade-in');
    
    // Update navigation state
    updateNavState('pay');
    
    // Load pending requests
    loadPendingRequests();
    
    // Initialize pay form
    updatePayAsset();
}

// Show notification for Pay page
function showPayPageNotification() {
    const notification = document.createElement('div');
    notification.className = 'pay-page-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(45deg, #2196F3, #1976D2);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(33, 150, 243, 0.3);
        z-index: 1000;
        font-family: 'Arial', sans-serif;
        text-align: center;
    `;
    
    notification.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px;">💰 Pay Feature</div>
        <div style="font-size: 0.9em; opacity: 0.9;">
            Use the "Test XRPL Payment" button to pay existing requests
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 4000);
}

// Export functions for use in other modules if needed
window.showHome = showHome;
window.showRequestPage = showRequestPage;
window.showPayPage = showPayPage;
window.updateNavState = updateNavState;