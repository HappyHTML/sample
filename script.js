const canvas = document.getElementById('nebula-canvas');
const ctx = canvas.getContext('2d');
const toggleBtn = document.getElementById('theme-portal');
const body = document.body;
const transitionOverlay = document.getElementById('transition-overlay');
const modeText = document.getElementById('mode-text');
const coordX = document.getElementById('coord-x');
const coordY = document.getElementById('coord-y');

let width, height, particles;

// Particle System
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.alpha = Math.random() * 0.5 + 0.2;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
            this.reset();
        }
    }

    draw() {
        ctx.fillStyle = body.classList.contains('dark-mode')
            ? `rgba(226, 232, 240, ${this.alpha})`
            : `rgba(15, 23, 42, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = [];
    for (let i = 0; i < 150; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animate);
}

// Ripple Transition
function triggerRipple(e) {
    const x = e.clientX || window.innerWidth / 2;
    const y = e.clientY || window.innerHeight / 2;
    const isCurrentlyDark = body.classList.contains('dark-mode');

    // Set overlay color to the target dimension's background color to prevent snapping
    transitionOverlay.style.backgroundColor = isCurrentlyDark ? '#F0F2F5' : '#020617';
    transitionOverlay.style.clipPath = `circle(0% at ${x}px ${y}px)`;

    // Force reflow
    void transitionOverlay.offsetWidth;

    transitionOverlay.style.transition = 'clip-path 1.2s cubic-bezier(0.65, 0, 0.35, 1)';
    transitionOverlay.style.clipPath = `circle(150% at ${x}px ${y}px)`;

    setTimeout(() => {
        body.classList.toggle('dark-mode');
        body.classList.toggle('light-mode');
        const isDark = body.classList.contains('dark-mode');
        modeText.textContent = isDark ? 'LUNAR MODE' : 'SOLAR MODE';

        // Secondary ripple to clear
        setTimeout(() => {
            transitionOverlay.style.transition = 'clip-path 0.8s cubic-bezier(0.65, 0, 0.35, 1)';
            transitionOverlay.style.clipPath = `circle(0% at ${x}px ${y}px)`;
        }, 100);
    }, 600);
}

// Interaction
toggleBtn.addEventListener('click', (e) => {
    triggerRipple(e);
});

window.addEventListener('mousemove', (e) => {
    const x = e.clientX.toString().padStart(4, '0');
    const y = e.clientY.toString().padStart(4, '0');
    coordX.textContent = x;
    coordY.textContent = y;

    // Parallax effect on portal card
    const moveX = (e.clientX - width / 2) / 50;
    const moveY = (e.clientY - height / 2) / 50;
    document.querySelector('.portal-card').style.transform = `translate(${moveX}px, ${moveY}px)`;
});

window.addEventListener('resize', initCanvas);

// Initialize
initCanvas();
animate();
console.log('Celestial Portal Initialized');
