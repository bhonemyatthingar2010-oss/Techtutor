// ==========================================
// TechHelp — Shared JavaScript
// Particle Network Background + Custom Cursor + Menu + Reveal
// ==========================================

// ---------- PARTICLE NETWORK BACKGROUND ----------
const canvas = document.getElementById('ink-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const mouse = { x: null, y: null, active: false };
    let mouseTimeout;

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
        clearTimeout(mouseTimeout);
        mouseTimeout = setTimeout(() => { mouse.active = false; }, 3000);
    });

    window.addEventListener('mouseleave', () => {
        mouse.active = false;
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        initParticles();
    });

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Very slow drift
            this.vx = (Math.random() - 0.5) * 0.1;
            this.vy = (Math.random() - 0.5) * 0.1;
            this.size = 1.5 + Math.random() * 2;
            this.opacity = 0.35 + Math.random() * 0.45;
            this.phase = Math.random() * Math.PI * 2;
        }

        update() {
            this.phase += 0.002;
            // Gentle autonomous drift
            this.vx += Math.sin(this.phase * 0.4 + this.y * 0.0002) * 0.0008;
            this.vy += Math.cos(this.phase * 0.3 + this.x * 0.0002) * 0.0008;

            // NO repulsion from cursor — particles stay in place
            // (Cursor only draws connections, no physical effect)

            // Damping
            this.vx *= 0.99;
            this.vy *= 0.99;

            // Limit speed (very slow)
            const sp = Math.hypot(this.vx, this.vy);
            if (sp > 0.25) {
                this.vx = (this.vx / sp) * 0.25;
                this.vy = (this.vy / sp) * 0.25;
            }

            this.x += this.vx;
            this.y += this.vy;

            // Wrap around edges
            const margin = 20;
            if (this.x < -margin) this.x = width + margin;
            if (this.x > width + margin) this.x = -margin;
            if (this.y < -margin) this.y = height + margin;
            if (this.y > height + margin) this.y = -margin;
        }

        draw(ctx) {
            ctx.fillStyle = `rgba(168, 182, 194, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    let particles = [];
    function initParticles() {
        // More dots: density ~1 per 12,000 px²
        const particleCount = Math.min(200, Math.floor((width * height) / 12000));
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }
    initParticles();

    const connectDist = 150;     // particles connect within this distance
    const cursorLinkDist = 220;  // cursor connects to particles within this range

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.hypot(dx, dy);
                if (dist < connectDist) {
                    const alpha = (1 - dist / connectDist) * 0.35;
                    ctx.strokeStyle = `rgba(90, 107, 122, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function drawCursorConnections() {
        if (!mouse.active || mouse.x === null) return;

        for (const p of particles) {
            const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
            if (dist < cursorLinkDist) {
                const alpha = (1 - dist / cursorLinkDist) * 0.5;
                ctx.strokeStyle = `rgba(168, 182, 194, ${alpha})`;
                ctx.lineWidth = 0.7;
                ctx.beginPath();
                ctx.moveTo(mouse.x, mouse.y);
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#1A1C1F';
        ctx.fillRect(0, 0, width, height);

        // Update particles
        for (const p of particles) {
            p.update();
        }

        // Draw particles
        for (const p of particles) {
            p.draw(ctx);
        }

        drawConnections();
        drawCursorConnections();

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}


// ---------- CUTE CUSTOM CURSOR ----------
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

if (cursorDot && cursorRing) {
    let ringX = 0, ringY = 0;
    let dotX = 0, dotY = 0;
    let isVisible = false;

    document.addEventListener('mousemove', (e) => {
        dotX = e.clientX;
        dotY = e.clientY;
        if (!isVisible) {
            cursorDot.style.opacity = '1';
            cursorRing.style.opacity = '1';
            isVisible = true;
        }
        cursorDot.style.left = dotX + 'px';
        cursorDot.style.top = dotY + 'px';
    });

    function animateCursor() {
        ringX += (dotX - ringX) * 0.18;
        ringY += (dotY - ringY) * 0.18;
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const hoverTargets = document.querySelectorAll('a, button, input, textarea, select, .card, .feature-card');
    hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorRing.classList.add('hovering');
            cursorDot.classList.add('hovering');
        });
        el.addEventListener('mouseleave', () => {
            cursorRing.classList.remove('hovering');
            cursorDot.classList.remove('hovering');
        });
    });

    document.addEventListener('mouseleave', () => {
        cursorDot.style.opacity = '0';
        cursorRing.style.opacity = '0';
        isVisible = false;
    });
}


// ---------- MOBILE MENU ----------
const menuBtn = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuBtn.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuBtn.classList.remove('active');
        });
    });
}


// ---------- SCROLL REVEAL ----------
const revealElements = document.querySelectorAll('.reveal');

if (revealElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
}


// ---------- COPY BUTTONS ----------
document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        const targetId = btn.getAttribute('data-copy');
        const target = document.getElementById(targetId);
        if (!target) return;

        const text = target.textContent;
        try {
            await navigator.clipboard.writeText(text);
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
        } catch (err) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
        }

        setTimeout(() => {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
        }, 2000);
    });
});


// ---------- SEARCH FILTER ----------
const fixSearch = document.getElementById('fix-search');
if (fixSearch) {
    fixSearch.addEventListener('input', () => {
        const query = fixSearch.value.toLowerCase();
        const cards = document.querySelectorAll('.fix-card');
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(query) ? 'block' : 'none';
        });
    });
}