// Animated Background Paths - Vanilla JavaScript Version

class BackgroundPaths {
    constructor(containerId = 'backgroundPaths') {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container #${containerId} not found`);
            return;
        }
        this.init();
    }

    createPath(index, position) {
        const d = `M-${380 - index * 5 * position} -${189 + index * 6}C-${
            380 - index * 5 * position
        } -${189 + index * 6} -${312 - index * 5 * position} ${216 - index * 6} ${
            152 - index * 5 * position
        } ${343 - index * 6}C${616 - index * 5 * position} ${470 - index * 6} ${
            684 - index * 5 * position
        } ${875 - index * 6} ${684 - index * 5 * position} ${875 - index * 6}`;

        return {
            d,
            strokeWidth: 0.5 + index * 0.03,
            strokeOpacity: 0.1 + index * 0.03,
        };
    }

    createSVG(position, svgId) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'paths-svg');
        svg.setAttribute('id', svgId);
        svg.setAttribute('viewBox', '0 0 696 316');
        svg.setAttribute('fill', 'none');

        // Create 36 animated paths
        for (let i = 0; i < 36; i++) {
            const pathData = this.createPath(i, position);
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            
            path.setAttribute('d', pathData.d);
            path.setAttribute('stroke', 'currentColor');
            path.setAttribute('stroke-width', pathData.strokeWidth);
            path.setAttribute('stroke-opacity', pathData.strokeOpacity);
            path.setAttribute('class', 'animated-path');
            path.style.animationDelay = `${Math.random() * 5}s`;
            path.style.animationDuration = `${20 + Math.random() * 10}s`;

            svg.appendChild(path);
        }

        return svg;
    }

    init() {
        // Clear existing content
        this.container.innerHTML = '';

        // Create two overlapping SVG layers for depth
        const svg1 = this.createSVG(1, 'paths-layer-1');
        const svg2 = this.createSVG(-1, 'paths-layer-2');

        this.container.appendChild(svg1);
        this.container.appendChild(svg2);

        console.log('✨ Background paths initialized!');
    }
}

// Letter animation for hero title
class HeroTitleAnimation {
    constructor(elementId = 'heroTitle') {
        this.element = document.getElementById(elementId);
        if (!this.element) return;
        
        this.animateLetters();
    }

    animateLetters() {
        const text = this.element.textContent;
        this.element.innerHTML = '';

        text.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.className = 'letter';
            span.textContent = char === ' ' ? '\u00A0' : char; // Preserve spaces
            span.style.animationDelay = `${index * 0.05}s`;
            this.element.appendChild(span);
        });

        console.log('🎬 Hero title animation started!');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize background paths
    new BackgroundPaths('backgroundPaths');
    
    // Initialize hero title animation (optional)
    if (document.getElementById('heroTitle')) {
        new HeroTitleAnimation('heroTitle');
    }
});
