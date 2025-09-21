// Navigation functionality - Page switching and routing

// Page navigation functions
function showHome() {
    document.getElementById('homePage').classList.remove('hidden');
    document.getElementById('requestPage').classList.remove('active');
    document.getElementById('homePage').classList.add('fade-in');
    
    // Reset animations
    setTimeout(() => {
        initScrollAnimations();
    }, 100);
}

function showRequestPage() {
    document.getElementById('homePage').classList.add('hidden');
    document.getElementById('requestPage').classList.add('active');
    document.getElementById('requestPage').classList.add('fade-in');
}

// Export functions for use in other modules if needed
window.showHome = showHome;
window.showRequestPage = showRequestPage;