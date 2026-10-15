import './style.css';
import Chart from 'chart.js/auto';

// --- STICKY NAV SCROLL EFFECT ---
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

const sectionLinks = [...document.querySelectorAll('.nav-link')];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    sectionLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
    });
  });
}, { rootMargin: '-35% 0px -55% 0px' });

sectionLinks.forEach((link) => {
  const section = document.querySelector(link.getAttribute('href'));
  if (section) sectionObserver.observe(section);
});

// --- CUSTOM CURSOR ---
const cursor = document.querySelector('.custom-cursor');
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
const finePointer = window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let cursorClickTimer;

if (finePointer) {
  document.body.classList.add('cursor-active');

  window.addEventListener('pointermove', (event) => {
    cursor.classList.add('is-visible');
    cursorDot.style.left = `${event.clientX}px`;
    cursorDot.style.top = `${event.clientY}px`;
    cursorRing.style.left = `${event.clientX}px`;
    cursorRing.style.top = `${event.clientY}px`;
  }, { passive: true });

  document.addEventListener('pointerover', (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest('a, button, .project, .shape')) {
      cursor.classList.add('is-hovering');
    }
  });

  document.addEventListener('pointerout', (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest('a, button, .project, .shape')) {
      cursor.classList.remove('is-hovering');
    }
  });

  document.addEventListener('pointerdown', () => {
    window.clearTimeout(cursorClickTimer);
    cursor.classList.add('is-clicking');
    cursorClickTimer = window.setTimeout(() => {
      cursor.classList.remove('is-clicking');
    }, 360);
  });

  document.addEventListener('pointerleave', () => {
    cursor.classList.remove('is-visible');
  });

  document.addEventListener('pointerenter', () => {
    cursor.classList.add('is-visible');
  });
}

// --- MOBILE MENU ---
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
menuBtn.addEventListener('click', () => {
  const isOpen = menuBtn.classList.toggle('open');
  mobileMenu.classList.toggle('open', isOpen);
  menuBtn.setAttribute('aria-expanded', String(isOpen));
});
document.querySelectorAll('.mobile-menu-link').forEach(link => {
  link.addEventListener('click', () => {
    menuBtn.classList.remove('open');
    mobileMenu.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
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

// --- SCROLL-DRIVEN PROJECT IMAGE COMPRESSION ---
const projectImages = document.querySelectorAll('.project-image:not(.trip-project-image)');
let imageResizeFrame = 0;

function updateProjectImageHeights() {
  projectImages.forEach(image => {
    const rect = image.getBoundingClientRect();
    const travel = window.innerHeight + rect.height;
    const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / travel));
    const compression = 1 - (progress * 0.25);
    const baseHeight = image.clientWidth * (10 / 16);
    image.style.height = `${baseHeight * compression}px`;
  });
  imageResizeFrame = 0;
}

function requestImageResize() {
  if (imageResizeFrame) return;
  imageResizeFrame = window.requestAnimationFrame(updateProjectImageHeights);
}

window.addEventListener('scroll', requestImageResize, { passive: true });
window.addEventListener('resize', requestImageResize, { passive: true });
requestImageResize();

// --- HERO OBJECT DEPTH ON SCROLL ---
const hero = document.querySelector('.hero');
const heroScene = document.querySelector('.hero-scene');
let heroDepthFrame = 0;

function updateHeroDepth() {
  const heroProgress = Math.min(1, Math.max(0, window.scrollY / Math.max(1, hero.offsetHeight)));
  heroScene.style.transform = `translateY(${heroProgress * -36}px) scale(${1 - heroProgress * 0.18})`;
  heroScene.style.opacity = `${0.92 - heroProgress * 0.2}`;
  heroDepthFrame = 0;
}

function requestHeroDepth() {
  if (heroDepthFrame) return;
  heroDepthFrame = window.requestAnimationFrame(updateHeroDepth);
}

window.addEventListener('scroll', requestHeroDepth, { passive: true });
window.addEventListener('resize', requestHeroDepth, { passive: true });
requestHeroDepth();

// --- HERO OBJECT PHYSICS ---
const physicsShapes = [...document.querySelectorAll('.hero-scene .shape')].map((element) => {
  const sceneRect = heroScene.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  const state = {
    element,
    x: rect.left - sceneRect.left,
    y: rect.top - sceneRect.top,
    width: rect.width,
    height: rect.height,
    vx: 0,
    vy: 0,
    dragging: false,
    offsetX: 0,
    offsetY: 0,
    lastX: 0,
    lastY: 0
  };

  element.style.left = `${state.x}px`;
  element.style.top = `${state.y}px`;
  element.style.right = 'auto';
  element.style.bottom = 'auto';
  return state;
});

function keepShapeInBounds(state) {
  const maxX = Math.max(0, heroScene.clientWidth - state.width);
  const maxY = Math.max(0, heroScene.clientHeight - state.height);

  if (state.x < 0) {
    state.x = 0;
    state.vx = Math.abs(state.vx) * 0.68;
  } else if (state.x > maxX) {
    state.x = maxX;
    state.vx = -Math.abs(state.vx) * 0.68;
  }

  if (state.y < 0) {
    state.y = 0;
    state.vy = Math.abs(state.vy) * 0.68;
  } else if (state.y > maxY) {
    state.y = maxY;
    state.vy = -Math.abs(state.vy) * 0.62;
    state.vx *= 0.92;
    if (Math.abs(state.vy) < 0.45) state.vy = 0;
  }
}

function resolveShapeCollisions() {
  for (let index = 0; index < physicsShapes.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < physicsShapes.length; otherIndex += 1) {
      const first = physicsShapes[index];
      const second = physicsShapes[otherIndex];
      const firstCenterX = first.x + first.width / 2;
      const firstCenterY = first.y + first.height / 2;
      const secondCenterX = second.x + second.width / 2;
      const secondCenterY = second.y + second.height / 2;
      const deltaX = secondCenterX - firstCenterX;
      const deltaY = secondCenterY - firstCenterY;
      const distance = Math.hypot(deltaX, deltaY) || 0.001;
      const minimumDistance = Math.min(first.width, first.height, second.width, second.height) * 0.58;

      if (distance >= minimumDistance) continue;

      const overlap = (minimumDistance - distance) / 2;
      const normalX = deltaX / distance;
      const normalY = deltaY / distance;

      if (!first.dragging) {
        first.x -= normalX * overlap;
        first.y -= normalY * overlap;
      }
      if (!second.dragging) {
        second.x += normalX * overlap;
        second.y += normalY * overlap;
      }

      const relativeVelocity = (second.vx - first.vx) * normalX + (second.vy - first.vy) * normalY;
      if (relativeVelocity >= 0) continue;

      const impulse = -relativeVelocity * 0.55;
      if (!first.dragging) {
        first.vx -= normalX * impulse;
        first.vy -= normalY * impulse;
      }
      if (!second.dragging) {
        second.vx += normalX * impulse;
        second.vy += normalY * impulse;
      }
    }
  }
}

function updatePhysics() {
  physicsShapes.forEach((state) => {
    if (!state.dragging) {
      state.vy += 0.16;
      state.vx *= 0.995;
      state.vy *= 0.995;
      state.x += state.vx;
      state.y += state.vy;
    }
  });

  resolveShapeCollisions();

  physicsShapes.forEach((state) => {
    keepShapeInBounds(state);
    state.element.style.left = `${state.x}px`;
    state.element.style.top = `${state.y}px`;
  });

  window.requestAnimationFrame(updatePhysics);
}

physicsShapes.forEach((state) => {
  state.element.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    state.dragging = true;
    state.vx = 0;
    state.vy = 0;
    const sceneRect = heroScene.getBoundingClientRect();
    state.offsetX = event.clientX - sceneRect.left - state.x;
    state.offsetY = event.clientY - sceneRect.top - state.y;
    state.lastX = state.x;
    state.lastY = state.y;
    state.element.classList.add('is-dragging');
  });
});

window.addEventListener('pointermove', (event) => {
  const state = physicsShapes.find((shape) => shape.dragging);
  if (!state) return;

  const sceneRect = heroScene.getBoundingClientRect();
  const nextX = event.clientX - sceneRect.left - state.offsetX;
  const nextY = event.clientY - sceneRect.top - state.offsetY;
  state.vx = nextX - state.lastX;
  state.vy = nextY - state.lastY;
  state.x = nextX;
  state.y = nextY;
  state.lastX = nextX;
  state.lastY = nextY;
}, { passive: false });

window.addEventListener('pointerup', () => {
  physicsShapes.forEach((state) => {
    if (!state.dragging) return;
    state.dragging = false;
    state.element.classList.remove('is-dragging');
  });
});

window.addEventListener('resize', () => {
  physicsShapes.forEach((state) => {
    state.width = state.element.getBoundingClientRect().width;
    state.height = state.element.getBoundingClientRect().height;
    keepShapeInBounds(state);
  });
});

window.requestAnimationFrame(updatePhysics);

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
  aura: 61,
  tripPlanner: 11
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

function initTripGallery() {
  const modal = document.getElementById('galleryModal');
  const modalImage = document.getElementById('galleryModalImage');
  const modalTitle = document.getElementById('galleryModalTitle');
  const modalCount = document.getElementById('galleryModalCount');
  const galleryItems = [...document.querySelectorAll('.trip-gallery-item[data-gallery-index]')];
  const closeButtons = document.querySelectorAll('[data-gallery-close]');
  if (!modal || !modalImage || !modalTitle || !modalCount || galleryItems.length === 0) return;

  const openGalleryItem = (item) => {
    const image = item.querySelector('img');
    const index = Number(item.dataset.galleryIndex);
    if (!image || Number.isNaN(index)) return;

    modalImage.src = image.currentSrc || image.src;
    modalImage.alt = image.alt;
    modalTitle.textContent = image.alt.replace(/^Trip planner /i, '').replace(/ screen$/i, '') + ' screen';
    modalCount.textContent = `${String(index + 1).padStart(2, '0')} / ${String(galleryItems.length).padStart(2, '0')}`;
    modal.hidden = false;
    document.body.classList.add('gallery-open');
    modal.querySelector('.gallery-modal-close')?.focus();
  };

  const closeGallery = () => {
    modal.hidden = true;
    modalImage.src = '';
    document.body.classList.remove('gallery-open');
  };

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => openGalleryItem(item));
  });
  closeButtons.forEach((button) => button.addEventListener('click', closeGallery));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) closeGallery();
  });
}

initTripGallery();
initProjectLikes();
