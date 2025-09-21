// Animation and scroll functionality

// Apple-style scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe feature items
    document.querySelectorAll('.feature-item').forEach(item => {
        // Reset visibility for re-animation
        item.classList.remove('visible');
        observer.observe(item);
    });

    // Observe CTA section
    const ctaSection = document.querySelector('.cta-section');
    if (ctaSection) {
        ctaSection.classList.remove('visible');
        observer.observe(ctaSection);
    }
}

// Smooth scroll to element function
function smoothScrollTo(element) {
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Add some additional animation helpers
function fadeInElement(element, delay = 0) {
    setTimeout(() => {
        element.classList.add('fade-in');
    }, delay);
}

function pulseElement(element) {
    element.classList.add('pulse');
    
    // Remove pulse class after animation completes
    setTimeout(() => {
        element.classList.remove('pulse');
    }, 2000);
}

// Performance optimization for animations
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized scroll handler
const optimizedScrollHandler = debounce(() => {
    // Add any scroll-based animations or effects here
    console.log('Scroll event handled');
}, 16); // ~60fps

// Initialize animations when page loads
document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
    
    // Add scroll listener for additional effects if needed
    window.addEventListener('scroll', optimizedScrollHandler);
});

// Export functions
window.initScrollAnimations = initScrollAnimations;
window.smoothScrollTo = smoothScrollTo;
window.fadeInElement = fadeInElement;
window.pulseElement = pulseElement;