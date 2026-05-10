const canvas = document.getElementById('nebula-canvas');
const ctx = canvas.getContext('2d');
const toggleBtn = document.getElementById('theme-portal');
const body = document.body;
const transitionOverlay = document.getElementById('transition-overlay');
const modeText = document.getElementById('mode-text');
const coordX = document.getElementById('coord-x');
const coordY = document.getElementById('coord-y');
const cursor = document.getElementById('custom-cursor');
const debrisContainer = document.getElementById('debris-container');

let width, height, particles, debris = [];
let mouseX = 0, mouseY = 0, lastX = 0, lastY = 0;
let velocity = 0;

// Multi-node liquid cursor
const nodes = [];
const nodeCount = 8;
for (let i = 0; i < nodeCount; i++) {
    const node = document.createElement('div');
    node.className = 'cursor-node';
    node.style.width = `${20 - i * 2}px`;
    node.style.height = `${20 - i * 2}px`;
    document.body.appendChild(node);
    nodes.push({ el: node, x: 0, y: 0 });
}

// Particle System with Elasticity
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.alpha = Math.random() * 0.4 + 0.1;
    }

    update() {
        let dx = mouseX - this.x;
        let dy = mouseY - this.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
            let force = (150 - dist) / 150;
            this.x -= dx * force * 0.05;
            this.y -= dy * force * 0.05;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) this.reset();
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        // Stretch based on velocity
        let stretch = 1 + velocity * 0.05;
        ctx.scale(stretch, 1);
        ctx.rotate(Math.atan2(this.vy, this.vx));

        ctx.fillStyle = body.classList.contains('dark-mode')
            ? `rgba(226, 232, 240, ${this.alpha})`
            : `rgba(15, 23, 42, ${this.alpha})`;

        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function wrapText() {
    const text = modeText.textContent;
    modeText.innerHTML = '';
    text.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.className = 'char';
        span.style.setProperty('--char-index', i);
        modeText.appendChild(span);
    });
}

function initDebris() {
    debrisContainer.innerHTML = '';
    debris = [];
    for (let i = 0; i < 30; i++) {
        const d = document.createElement('div');
        d.className = 'debris';
        const size = Math.random() * 8 + 2;
        d.style.width = size + 'px';
        d.style.height = size + 'px';
        const x = Math.random() * width;
        const y = Math.random() * height;
        debrisContainer.appendChild(d);
        debris.push({ el: d, x, y, vx: (Math.random()-0.5), vy: (Math.random()-0.5) });
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    // Velocity calculation
    velocity = Math.sqrt((mouseX - lastX)**2 + (mouseY - lastY)**2);
    lastX = mouseX;
    lastY = mouseY;

    // Direct Cursor
    cursor.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;

    // Liquid Nodes
    let targetX = mouseX;
    let targetY = mouseY;
    nodes.forEach((node, i) => {
        node.x += (targetX - node.x) * (0.35 - i * 0.03);
        node.y += (targetY - node.y) * (0.35 - i * 0.03);
        node.el.style.transform = `translate(${node.x - 10 + i}px, ${node.y - 10 + i}px)`;
        targetX = node.x;
        targetY = node.y;
    });

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    debris.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < -20) d.x = width + 20;
        if (d.x > width + 20) d.x = -20;
        if (d.y < -20) d.y = height + 20;
        if (d.y > height + 20) d.y = -20;
        d.el.style.transform = `translate(${d.x}px, ${d.y}px)`;
    });

    requestAnimationFrame(animate);
}

function triggerRipple(e) {
    const x = e.clientX || width / 2;
    const y = e.clientY || height / 2;
    const isCurrentlyDark = body.classList.contains('dark-mode');

    transitionOverlay.style.backgroundColor = isCurrentlyDark ? '#F0F2F5' : '#020617';
    transitionOverlay.classList.add('glitch');
    transitionOverlay.style.clipPath = `circle(0% at ${x}px ${y}px)`;

    void transitionOverlay.offsetWidth;

    transitionOverlay.style.transition = 'clip-path 1.2s cubic-bezier(0.65, 0, 0.35, 1)';
    transitionOverlay.style.clipPath = `circle(150% at ${x}px ${y}px)`;

    setTimeout(() => {
        body.classList.toggle('dark-mode');
        body.classList.toggle('light-mode');
        modeText.textContent = body.classList.contains('dark-mode') ? 'LUNAR MODE' : 'SOLAR MODE';
        wrapText();

        setTimeout(() => {
            transitionOverlay.style.transition = 'clip-path 0.8s cubic-bezier(0.65, 0, 0.35, 1)';
            transitionOverlay.style.clipPath = `circle(0% at ${x}px ${y}px)`;
            setTimeout(() => transitionOverlay.classList.remove('glitch'), 800);
        }, 100);
    }, 600);
}

function createShockwave(x, y) {
    const sw = document.createElement('div');
    sw.className = 'shockwave';
    sw.style.left = x + 'px';
    sw.style.top = y + 'px';
    document.body.appendChild(sw);
    setTimeout(() => sw.remove(), 800);
}

window.addEventListener('mousedown', (e) => createShockwave(e.clientX, e.clientY));

toggleBtn.addEventListener('click', (e) => triggerRipple(e));

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    coordX.textContent = mouseX.toString().padStart(4, '0');
    coordY.textContent = mouseY.toString().padStart(4, '0');

    const moveX = (mouseX - width / 2) / 60;
    const moveY = (mouseY - height / 2) / 60;
    document.querySelector('.portal-card').style.transform = `perspective(1000px) rotateX(${-moveY}deg) rotateY(${moveX}deg)`;
});

window.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    nodes.forEach(n => n.el.style.opacity = '0.5');
});

window.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    nodes.forEach(n => n.el.style.opacity = '0');
});

function init() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = [];
    for (let i = 0; i < 200; i++) particles.push(new Particle());
    initDebris();
    wrapText();
}

window.addEventListener('resize', init);
init();
animate();
console.log('Ultra Celestial Initialized');
