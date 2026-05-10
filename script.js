const canvas = document.getElementById('nebula-canvas');
const ctx = canvas.getContext('2d');
const toggleBtn = document.getElementById('theme-portal');
const body = document.body;
const transitionOverlay = document.getElementById('transition-overlay');
const modeText = document.getElementById('mode-text');
const coordX = document.getElementById('coord-x');
const coordY = document.getElementById('coord-y');
const cursor = document.getElementById('custom-cursor');
const trail = document.getElementById('cursor-trail');
const debrisContainer = document.getElementById('debris-container');

let width, height, particles, debris = [];
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
let trailX = 0, trailY = 0;

// Particle System with Physics
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.5;
        this.baseX = this.x;
        this.baseY = this.y;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.alpha = Math.random() * 0.5 + 0.2;
    }

    update() {
        // Simple physics: attraction to mouse
        let dx = mouseX - this.x;
        let dy = mouseY - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = 200;
        let force = (maxDistance - distance) / maxDistance;

        if (distance < maxDistance) {
            this.x += forceDirectionX * force * 2;
            this.y += forceDirectionY * force * 2;
        } else {
            this.x += this.vx;
            this.y += this.vy;
        }

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

function initDebris() {
    debrisContainer.innerHTML = '';
    debris = [];
    for (let i = 0; i < 20; i++) {
        const d = document.createElement('div');
        d.className = 'debris';
        const size = Math.random() * 10 + 5;
        d.style.width = size + 'px';
        d.style.height = size + 'px';
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        d.style.left = x + 'px';
        d.style.top = y + 'px';
        debrisContainer.appendChild(d);
        debris.push({ el: d, x, y, vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*2 });
    }
}

function updateDebris() {
    debris.forEach(d => {
        d.x += d.vx;
        d.y += d.vy;

        let dx = mouseX - d.x;
        let dy = mouseY - d.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 150) {
            d.x -= dx * 0.05;
            d.y -= dy * 0.05;
        }

        if (d.x < -20) d.x = width + 20;
        if (d.x > width + 20) d.x = -20;
        if (d.y < -20) d.y = height + 20;
        if (d.y > height + 20) d.y = -20;

        d.el.style.transform = `translate(${d.x}px, ${d.y}px) rotate(${d.x}deg)`;
    });
}

function initCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = [];
    for (let i = 0; i < 200; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    // Smooth Cursor
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;
    cursor.style.transform = `translate(${cursorX - 10}px, ${cursorY - 10}px)`;

    trailX += (mouseX - trailX) * 0.1;
    trailY += (mouseY - trailY) * 0.1;
    trail.style.transform = `translate(${trailX - 20}px, ${trailY - 20}px)`;

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    updateDebris();
    requestAnimationFrame(animate);
}

// Ripple Transition
function triggerRipple(e) {
    const x = e.clientX || window.innerWidth / 2;
    const y = e.clientY || window.innerHeight / 2;
    const isCurrentlyDark = body.classList.contains('dark-mode');

    transitionOverlay.style.backgroundColor = isCurrentlyDark ? '#F0F2F5' : '#020617';
    transitionOverlay.style.clipPath = `circle(0% at ${x}px ${y}px)`;

    void transitionOverlay.offsetWidth;

    transitionOverlay.style.transition = 'clip-path 1.2s cubic-bezier(0.65, 0, 0.35, 1)';
    transitionOverlay.style.clipPath = `circle(150% at ${x}px ${y}px)`;

    setTimeout(() => {
        body.classList.toggle('dark-mode');
        body.classList.toggle('light-mode');
        const isDark = body.classList.contains('dark-mode');
        modeText.textContent = isDark ? 'LUNAR MODE' : 'SOLAR MODE';

        setTimeout(() => {
            transitionOverlay.style.transition = 'clip-path 0.8s cubic-bezier(0.65, 0, 0.35, 1)';
            transitionOverlay.style.clipPath = `circle(0% at ${x}px ${y}px)`;
        }, 100);
    }, 600);
}

toggleBtn.addEventListener('click', (e) => {
    triggerRipple(e);
});

toggleBtn.addEventListener('mouseenter', () => {
    trail.style.width = '80px';
    trail.style.height = '80px';
    trail.style.borderColor = 'var(--celestial-primary)';
});

toggleBtn.addEventListener('mouseleave', () => {
    trail.style.width = '40px';
    trail.style.height = '40px';
    trail.style.borderColor = 'var(--accent)';
});

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    const x = mouseX.toString().padStart(4, '0');
    const y = mouseY.toString().padStart(4, '0');
    coordX.textContent = x;
    coordY.textContent = y;

    const moveX = (mouseX - width / 2) / 50;
    const moveY = (mouseY - height / 2) / 50;
    document.querySelector('.portal-card').style.transform = `translate(${moveX}px, ${moveY}px) rotateX(${-moveY}deg) rotateY(${moveX}deg)`;
});

window.addEventListener('resize', () => {
    initCanvas();
    initDebris();
});

// Initialize
initCanvas();
initDebris();
animate();
console.log('Hyper-Celestial Portal Initialized');
