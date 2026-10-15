import './style.css'
import Chart from 'chart.js/auto';

// --- NEURAL TRAIL CURSOR ---
const canvas = document.getElementById('neural-trail');
const ctx = canvas.getContext('2d');
let width, height;
let particles = [];
let mouse = { x: null, y: null };
let isHoveringInteractive = false;
let targetElement = null;

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor(x, y, isSnap) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 2 + 1;
    this.speedX = (Math.random() - 0.5) * 1.5;
    this.speedY = (Math.random() - 0.5) * 1.5;
    this.life = 1;
    this.decay = Math.random() * 0.05 + 0.02;
    this.isSnap = isSnap;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= this.decay;
  }
  draw() {
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.isSnap ? '#CCFF00' : '#888';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;

  // Add particles on move
  particles.push(new Particle(mouse.x, mouse.y, isHoveringInteractive));
});

// Detect hover on interactive elements to 'snap' or glow
const interactives = document.querySelectorAll('.interactive');
interactives.forEach(el => {
  el.addEventListener('mouseenter', () => {
    isHoveringInteractive = true;
    targetElement = el.getBoundingClientRect();
  });
  el.addEventListener('mouseleave', () => {
    isHoveringInteractive = false;
    targetElement = null;
  });
});

function animateCursor() {
  ctx.clearRect(0, 0, width, height);

  // Draw custom cursor trail
  for(let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].life <= 0) {
      particles.splice(i, 1);
      i--;
    }
  }

  // Draw snap ring if hovering
  if (isHoveringInteractive && targetElement) {
    const cx = targetElement.left + targetElement.width / 2;
    const cy = targetElement.top + targetElement.height / 2;
    ctx.strokeStyle = 'rgba(204, 255, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Smooth transition towards center could be added here
    ctx.arc(mouse.x, mouse.y, 25, 0, Math.PI * 2);
    ctx.stroke();

    // Draw connection lines between mouse and bounding box center
    ctx.beginPath();
    ctx.moveTo(mouse.x, mouse.y);
    ctx.lineTo(cx, cy);
    ctx.strokeStyle = 'rgba(204, 255, 0, 0.2)';
    ctx.stroke();
  } else if (mouse.x) {
    // Normal cursor ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2);
    ctx.stroke();
  }

  requestAnimationFrame(animateCursor);
}
animateCursor();


// --- VALUELINE 3D INTERACTIVE ROTATE & REVOLVE ---
const valuelineCard = document.getElementById('card-valueline');
const cubeContainer = valuelineCard.querySelector('.cube-container');
const cube = valuelineCard.querySelector('.cube');

let cubeAngleX = 25;
let cubeAngleY = 35;
let revolveAngle = 0;
let lastX = null;
let lastY = null;

valuelineCard.addEventListener('mouseenter', (e) => {
  lastX = e.clientX;
  lastY = e.clientY;
  cubeContainer.style.transition = 'none';
});

valuelineCard.addEventListener('mousemove', (e) => {
  if (lastX === null || lastY === null) {
    lastX = e.clientX;
    lastY = e.clientY;
    return;
  }

  const deltaX = e.clientX - lastX;
  const deltaY = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;

  // Only rotate and revolve when the cursor is physically moving
  if (deltaX === 0 && deltaY === 0) return;

  const moveDist = Math.hypot(deltaX, deltaY);

  // 1. Rotate the cube on its axes as cursor moves
  cubeAngleY += deltaX * 0.6;
  cubeAngleX -= deltaY * 0.6;
  cube.style.transform = `rotateX(${cubeAngleX}deg) rotateY(${cubeAngleY}deg)`;

  // 2. Revolve the cube around the card's center
  const rect = valuelineCard.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  // Orbital revolution around center advances with cursor movement
  revolveAngle += moveDist * 0.02;
  const orbitRadius = 24;
  const orbitX = Math.cos(revolveAngle) * orbitRadius + ((x - centerX) / centerX) * 15;
  const orbitY = Math.sin(revolveAngle) * (orbitRadius * 0.6) + ((y - centerY) / centerY) * 15;

  // 3D perspective tilt
  const tiltX = ((y - centerY) / centerY) * -15;
  const tiltY = ((x - centerX) / centerX) * 15;

  cubeContainer.style.transform = `translate(calc(-50% + ${orbitX}px), calc(-50% + ${orbitY}px)) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
});

valuelineCard.addEventListener('mouseleave', () => {
  lastX = null;
  lastY = null;
  cubeContainer.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
  cubeContainer.style.transform = 'translate(-50%, -50%) rotateX(0deg) rotateY(0deg)';
});


// --- GAURDIAN TERMINAL SIMULATION ---
const terminalBody = document.getElementById('gaurdian-terminal');
const logs = [
  "Initializing vision models...",
  "[OK] Model loaded: YOLOv8_custom_sos",
  "[WARN] Low confidence threshold set (0.45)",
  "Connecting to geospatial DB...",
  "[OK] Connection established (latency: 12ms)",
  "Starting video stream processing...",
  "Frame 001: No anomalies detected",
  "Frame 054: SOS gesture detected, confidence: 0.92!",
  "Dispatching coordinate triage: [28.6139, 77.2090]",
  "Notification sent to nearest responder."
];
let logIndex = 0;
let terminalInterval;

const gaurdianCard = document.getElementById('card-gaurdian');

gaurdianCard.addEventListener('mouseenter', () => {
  terminalBody.innerHTML = '';
  logIndex = 0;
  terminalInterval = setInterval(() => {
    if(logIndex < logs.length) {
      const p = document.createElement('div');
      p.innerText = '> ' + logs[logIndex];
      terminalBody.appendChild(p);
      logIndex++;
    } else {
      clearInterval(terminalInterval);
    }
  }, 200);
});

gaurdianCard.addEventListener('mouseleave', () => {
  clearInterval(terminalInterval);
});


// --- TECHNICAL COMPETENCIES RADAR CHART ---
const ctxChart = document.getElementById('competencyChart').getContext('2d');
// Global defaults for Chart.js
Chart.defaults.font.family = "'JetBrains Mono', monospace";
Chart.defaults.color = '#888';

new Chart(ctxChart, {
  type: 'radar',
  data: {
    labels: [
      'UI/UX Design', 
      'Service Design', 
      'Python/AI Triage', 
      'Front-end (Vibe Coding)', 
      '3D/Blender', 
      'Behavioral Psych',
      'Systems Thinking'
    ],
    datasets: [{
      label: 'Skill Proficiency',
      data: [90, 85, 75, 85, 90, 85, 90],
      backgroundColor: 'rgba(204, 255, 0, 0.2)', // Cyber Lime transparent
      borderColor: '#CCFF00',
      pointBackgroundColor: '#CCFF00',
      pointBorderColor: '#000',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#CCFF00',
      borderWidth: 2
    }]
  },
  options: {
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: {
          color: '#ccc',
          font: { size: 12 }
        },
        ticks: {
          display: false, // Hide numeric scales for cleaner aesthetic
          min: 0,
          max: 100,
          stepSize: 20
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111',
        titleFont: { family: "'JetBrains Mono', monospace" },
        bodyFont: { family: "'JetBrains Mono', monospace" },
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1
      }
    }
  }
});


// --- PROJECT SOCIAL LIKES & GOOGLE SHEET BACKEND ---
// Connected to user's Google Sheet Web App:
const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbwYvLGB-mOJtvm5Ed2Zxi8PjR2EWzoCe_6lLYJOJYTBxAEO9SPWrg_Y54n55_ejdvunxg/exec';

const defaultLikeCounts = {
  gaurdian: 64,
  valueline: 56,
  pixelgame: 45,
  redthumb: 31,
  aura: 61
};

async function syncWithGoogleSheet(projectId, delta) {
  if (!GOOGLE_SHEET_API_URL) return;
  try {
    const url = `${GOOGLE_SHEET_API_URL}?action=like&project=${encodeURIComponent(projectId)}&delta=${encodeURIComponent(delta)}&info=${encodeURIComponent(navigator.userAgent.slice(0, 50))}`;
    await fetch(url, { mode: 'no-cors' });
  } catch (err) {
    console.warn('Could not sync like to Google Sheet:', err);
  }
}

async function fetchLiveLikesFromSheet() {
  if (!GOOGLE_SHEET_API_URL) return;
  try {
    const res = await fetch(GOOGLE_SHEET_API_URL);
    const data = await res.json();
    if (data && data.likes) {
      Object.entries(data.likes).forEach(([projectId, count]) => {
        const countKey = `portfolio_v2_likes_${projectId}`;
        localStorage.setItem(countKey, count);
        const btn = document.querySelector(`.like-btn[data-project="${projectId}"]`);
        if (btn) {
          const countEl = btn.querySelector('.like-count');
          if (countEl) countEl.textContent = count;
        }
      });
    }
  } catch (err) {
    console.warn('Could not fetch likes from Google Sheet:', err);
  }
}

function initProjectLikes() {
  const likeButtons = document.querySelectorAll('.like-btn');
  likeButtons.forEach(btn => {
    const projectId = btn.dataset.project;
    if (!projectId) return;

    const countKey = `portfolio_v2_likes_${projectId}`;
    const likedKey = `portfolio_v2_liked_${projectId}`;

    // Read stored count or fallback to baseline
    let count = parseInt(localStorage.getItem(countKey), 10);
    if (isNaN(count)) {
      count = defaultLikeCounts[projectId] || 50;
      localStorage.setItem(countKey, count);
    }

    const isLiked = localStorage.getItem(likedKey) === 'true';
    if (isLiked) {
      btn.classList.add('liked');
    }

    const countEl = btn.querySelector('.like-count');
    if (countEl) {
      countEl.textContent = count;
    }

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const currentlyLiked = btn.classList.contains('liked');
      let currentCount = parseInt(localStorage.getItem(countKey), 10);
      if (isNaN(currentCount)) currentCount = count;

      let delta = 1;
      if (currentlyLiked) {
        btn.classList.remove('liked');
        currentCount = Math.max(0, currentCount - 1);
        delta = -1;
        localStorage.setItem(likedKey, 'false');
      } else {
        btn.classList.add('liked');
        currentCount += 1;
        delta = 1;
        localStorage.setItem(likedKey, 'true');
      }

      localStorage.setItem(countKey, currentCount);
      if (countEl) {
        countEl.textContent = currentCount;
      }

      // Sync live to Google Sheet backend
      syncWithGoogleSheet(projectId, delta);
    });
  });

  // Fetch live global likes from Google Sheet if URL is configured
  fetchLiveLikesFromSheet();

  // Card background click to open URL (excluding like button)
  const cards = document.querySelectorAll('.project-card');
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.like-btn')) return;
      if (e.target.closest('.view-btn')) return; // Handled by <a> tag natively
      const url = card.dataset.url;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    });
  });
}

initProjectLikes();

if (typeof window.lucide !== 'undefined') {
  window.lucide.createIcons();
}
