// Dynamic particle background effect
function createParticles() {
    const particleCount = 30;
    const particles = document.createElement('div');
    particles.className = 'particles-container';
    particles.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
    `;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${Math.random() * 10 + 10}s infinite ease-in-out;
            animation-delay: ${Math.random() * 5}s;
        `;
        particles.appendChild(particle);
    }
    
    document.body.insertBefore(particles, document.body.firstChild);
}

// Smooth scroll reveal for result cards
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.result-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(card);
    });
}

// Add ripple effect to buttons
function addRippleEffect(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    `;
    
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

// Add typing indicator animation
function addTypingEffect(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    const timer = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(timer);
        }
    }, speed);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 Animations.js loaded successfully!');
    
    // Add status indicator
    const statusEl = document.getElementById('animStatus');
    if (statusEl) {
        statusEl.textContent = '✨ Animations Active';
    }
    
    createParticles();
    console.log('✨ Particles created!');
    
    // Add ripple to all buttons
    document.querySelectorAll('.search-btn, .reload-btn, .filter-toggle-btn').forEach(btn => {
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.addEventListener('click', addRippleEffect);
    });
    console.log('🔘 Ripple effects added to buttons');
    
    // Add hover glow effect to cards (will be applied when cards appear)
    const observeCards = new MutationObserver(() => {
        document.querySelectorAll('.result-card').forEach(card => {
            if (!card.dataset.glowAdded) {
                card.dataset.glowAdded = 'true';
                card.addEventListener('mouseenter', function() {
                    this.style.boxShadow = '0 20px 60px rgba(102, 126, 234, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.6) inset';
                });
                card.addEventListener('mouseleave', function() {
                    this.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.5) inset';
                });
            }
        });
    });
    
    // Observe the results list for new cards
    const resultsList = document.getElementById('resultsList');
    if (resultsList) {
        observeCards.observe(resultsList, { childList: true, subtree: true });
    }
    
    console.log('💫 All animations initialized!');
});

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes float {
        0%, 100% {
            transform: translateY(0) translateX(0);
        }
        25% {
            transform: translateY(-20px) translateX(10px);
        }
        50% {
            transform: translateY(0) translateX(20px);
        }
        75% {
            transform: translateY(20px) translateX(10px);
        }
    }
`;
document.head.appendChild(style);
