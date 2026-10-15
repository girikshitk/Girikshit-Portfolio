import './style.css';
import Chart from 'chart.js/auto';

// --- STICKY NAV SCROLL EFFECT ---
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// --- MOBILE MENU ---
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
menuBtn.addEventListener('click', () => {
  menuBtn.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});
document.querySelectorAll('.mobile-menu-link').forEach(link => {
  link.addEventListener('click', () => {
    menuBtn.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

// --- SCROLL REVEAL ---
const revealTargets = document.querySelectorAll('.project, .expertise, .contact');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

revealTargets.forEach(el => revealObserver.observe(el));

// --- VALUELINE 3D CUBE INTERACTION ---
const valuelineCard = document.getElementById('card-valueline');
const cubeContainer = valuelineCard.querySelector('.cube-container');
const cube = valuelineCard.querySelector('.cube');

let cubeAngleX = 25;
let cubeAngleY = 35;
let lastX = null;
let lastY = null;

valuelineCard.addEventListener('mouseenter', (e) => {
  lastX = e.clientX;
  lastY = e.clientY;
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

  if (deltaX === 0 && deltaY === 0) return;

  cubeAngleY += deltaX * 0.6;
  cubeAngleX -= deltaY * 0.6;
  cube.style.transform = `rotateX(${cubeAngleX}deg) rotateY(${cubeAngleY}deg)`;
});

valuelineCard.addEventListener('mouseleave', () => {
  lastX = null;
  lastY = null;
  cube.style.transform = 'rotateX(25deg) rotateY(35deg)';
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
    if (logIndex < logs.length) {
      const p = document.createElement('div');
      p.textContent = '> ' + logs[logIndex];
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
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = '#999999';

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
      backgroundColor: 'rgba(17, 17, 17, 0.08)',
      borderColor: '#111111',
      pointBackgroundColor: '#111111',
      pointBorderColor: '#FAFAF7',
      pointHoverBackgroundColor: '#CCFF00',
      pointHoverBorderColor: '#111111',
      borderWidth: 2
    }]
  },
  options: {
    scales: {
      r: {
        angleLines: { color: 'rgba(0, 0, 0, 0.06)' },
        grid: { color: 'rgba(0, 0, 0, 0.06)' },
        pointLabels: {
          color: '#555555',
          font: { size: 11, family: "'Inter', sans-serif", weight: '500' }
        },
        ticks: {
          display: false,
          min: 0,
          max: 100,
          stepSize: 20
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111111',
        titleFont: { family: "'Inter', sans-serif", size: 12 },
        bodyFont: { family: "'Inter', sans-serif", size: 12 },
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
      }
    }
  }
});

// --- PROJECT SOCIAL LIKES & GOOGLE SHEET BACKEND ---
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

    let count = parseInt(localStorage.getItem(countKey), 10);
    if (isNaN(count)) {
      count = defaultLikeCounts[projectId] || 50;
      localStorage.setItem(countKey, count);
    }

    const isLiked = localStorage.getItem(likedKey) === 'true';
    if (isLiked) btn.classList.add('liked');

    const countEl = btn.querySelector('.like-count');
    if (countEl) countEl.textContent = count;

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
      if (countEl) countEl.textContent = currentCount;

      syncWithGoogleSheet(projectId, delta);
    });
  });

  fetchLiveLikesFromSheet();

  // Card click opens URL (excluding buttons)
  const cards = document.querySelectorAll('.project');
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.like-btn')) return;
      if (e.target.closest('.view-link')) return;
      const url = card.dataset.url;
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    });
  });
}

initProjectLikes();
