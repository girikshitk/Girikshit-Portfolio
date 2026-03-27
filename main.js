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


// --- VALUELINE 3D TILT EFFECT ---
const valuelineCard = document.getElementById('card-valueline');
const cubeContainer = valuelineCard.querySelector('.cube-container');

valuelineCard.addEventListener('mousemove', (e) => {
  const rect = valuelineCard.getBoundingClientRect();
  const x = e.clientX - rect.left; // x position within the element
  const y = e.clientY - rect.top;  // y position within the element
  
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  
  // Calculate tilt angle based on distance from center
  const rotateX = ((y - centerY) / centerY) * -15; // inverted y axis tilt
  const rotateY = ((x - centerX) / centerX) * 15;

  cubeContainer.style.transform = `translate(-50%, -50%) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});
valuelineCard.addEventListener('mouseleave', () => {
  cubeContainer.style.transform = `translate(-50%, -50%) rotateX(0deg) rotateY(0deg)`;
  cubeContainer.style.transition = 'transform 0.5s ease';
});
valuelineCard.addEventListener('mouseenter', () => {
  cubeContainer.style.transition = 'none'; // snappy follow
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
