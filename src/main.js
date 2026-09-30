import * as THREE from 'three';
import './style.css';

/* ===================================================================
   1. TACTILE 3D SILICON DIE SCENE (THREE.JS STUDIO RENDER)
   =================================================================== */
class StudioChipScene {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    if (!this.canvas) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;

    // Camera initial position
    this.camera.position.set(0, 4.5, 14);
    this.targetCameraPos = new THREE.Vector3(0, 4.5, 14);

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.scrollY = 0;
    this.activeView = 'isometric';

    this.initLighting();
    this.initProcessorModel();
    this.initSubtleGrid();
    this.bindEvents();
    this.animate();
  }

  initLighting() {
    // Ambient soft studio light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    // Primary Key Light (Soft White)
    this.keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    this.keyLight.position.set(5, 10, 7);
    this.scene.add(this.keyLight);

    // Cool Rim Light (Linear Cobalt/Sky)
    this.rimLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    this.rimLight.position.set(-6, -3, -4);
    this.scene.add(this.rimLight);

    // Warm Fill Light (Gentle Gold)
    this.fillLight = new THREE.PointLight(0xffeedd, 0.8, 20);
    this.fillLight.position.set(0, -4, 5);
    this.scene.add(this.fillLight);
  }

  initProcessorModel() {
    this.modelGroup = new THREE.Group();

    // 1. Ceramic PCB Substrate (Matte Charcoal)
    const substrateGeo = new THREE.BoxGeometry(6.0, 0.22, 4.0);
    const substrateMat = new THREE.MeshStandardMaterial({
      color: 0x0c0e14,
      roughness: 0.5,
      metalness: 0.3
    });
    this.substrate = new THREE.Mesh(substrateGeo, substrateMat);
    this.modelGroup.add(this.substrate);

    // Subtle edge highlight
    const subEdges = new THREE.EdgesGeometry(substrateGeo);
    const subLineMat = new THREE.LineBasicMaterial({ color: 0x222938, transparent: true, opacity: 0.6 });
    const subWire = new THREE.LineSegments(subEdges, subLineMat);
    this.modelGroup.add(subWire);

    // 2. Brushed Metal Heat Spreader (Titanium / Graphite)
    const heatSpreaderGeo = new THREE.BoxGeometry(3.6, 0.28, 2.6);
    const heatSpreaderMat = new THREE.MeshStandardMaterial({
      color: 0x181c26,
      roughness: 0.25,
      metalness: 0.85
    });
    this.heatSpreader = new THREE.Mesh(heatSpreaderGeo, heatSpreaderMat);
    this.heatSpreader.position.y = 0.22;
    this.modelGroup.add(this.heatSpreader);

    // Subtle wireframe on heat spreader
    const hsEdges = new THREE.EdgesGeometry(heatSpreaderGeo);
    const hsLine = new THREE.LineSegments(hsEdges, new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 }));
    hsLine.position.y = 0.22;
    this.modelGroup.add(hsLine);

    // 3. Dual Core Dies (Silicon Crystalline)
    const coreGeo = new THREE.BoxGeometry(0.85, 0.08, 0.85);
    const core0Mat = new THREE.MeshStandardMaterial({
      color: 0x1e2638,
      roughness: 0.15,
      metalness: 0.9
    });
    const core1Mat = core0Mat.clone();

    this.core0 = new THREE.Mesh(coreGeo, core0Mat);
    this.core0.position.set(-0.85, 0.38, 0);
    this.modelGroup.add(this.core0);

    this.core1 = new THREE.Mesh(coreGeo, core1Mat);
    this.core1.position.set(0.85, 0.38, 0);
    this.modelGroup.add(this.core1);

    // 4. Gold Pin Contact Headers along long edges
    const pinGeo = new THREE.BoxGeometry(0.12, 0.14, 0.32);
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.95
    });

    const pinCount = 16;
    for (let i = 0; i < pinCount; i++) {
      const x = -2.5 + (i * (5.0 / (pinCount - 1)));
      // Top side
      const pinA = new THREE.Mesh(pinGeo, pinMat);
      pinA.position.set(x, 0.04, 2.05);
      this.modelGroup.add(pinA);

      // Bottom side
      const pinB = new THREE.Mesh(pinGeo, pinMat);
      pinB.position.set(x, 0.04, -2.05);
      this.modelGroup.add(pinB);
    }

    // Initial position & tilt
    this.modelGroup.position.set(2.2, 0.2, 0);
    this.modelGroup.rotation.set(0.45, -0.45, 0.08);
    this.scene.add(this.modelGroup);
  }

  initSubtleGrid() {
    // Subtle background architectural coordinate grid
    const size = 30;
    const divisions = 30;
    this.grid = new THREE.GridHelper(size, divisions, 0x1a2130, 0x111622);
    this.grid.position.y = -3.5;
    this.scene.add(this.grid);
  }

  setView(viewName) {
    this.activeView = viewName;
    if (viewName === 'isometric') {
      this.targetCameraPos.set(0, 4.5, 14);
      this.modelGroup.rotation.set(0.45, -0.45, 0.08);
    } else if (viewName === 'top') {
      this.targetCameraPos.set(2.2, 12, 0.1);
      this.modelGroup.rotation.set(0, 0, 0);
    } else if (viewName === 'side') {
      this.targetCameraPos.set(-2, 2, 11);
      this.modelGroup.rotation.set(0.1, 0.9, -0.05);
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener('scroll', () => {
      this.scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(1, Math.max(0, this.scrollY / (docHeight || 1)));

      if (this.activeView === 'isometric') {
        const z = 14 - (progress * 4);
        const y = 4.5 - (progress * 3.5);
        this.targetCameraPos.set(0, Math.max(1, y), Math.max(8, z));
        this.modelGroup.rotation.y = -0.45 + (progress * 1.5);
      }
    });

    // Viewport switch buttons
    document.querySelectorAll('.dock-tag').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.dock-tag').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setView(btn.dataset.view);
      });
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Mouse parallax damping
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.04;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.04;

    this.camera.position.x += (this.targetCameraPos.x + this.mouse.x * 0.9 - this.camera.position.x) * 0.05;
    this.camera.position.y += (this.targetCameraPos.y - this.mouse.y * 0.9 - this.camera.position.y) * 0.05;
    this.camera.position.z += (this.targetCameraPos.z - this.camera.position.z) * 0.05;
    this.camera.lookAt(this.modelGroup.position.x * 0.5, 0, 0);

    // Subtle idle float
    const time = performance.now() * 0.001;
    this.modelGroup.position.y = 0.2 + Math.sin(time * 1.2) * 0.08;

    this.renderer.render(this.scene, this.camera);
  }
}

/* ===================================================================
   2. TOAST NOTIFICATION UTILITY
   =================================================================== */
function showToast(message = 'Copied to clipboard') {
  const toast = document.getElementById('toastNotification');
  const msgEl = document.getElementById('toastMessage');
  if (!toast || !msgEl) return;

  msgEl.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

/* ===================================================================
   3. INTERACTIVE FREERTOS TASK SCHEDULER SIMULATOR
   =================================================================== */
class RtosSimulator {
  constructor() {
    this.tickVal = document.getElementById('simTickCount');
    this.cpuLoad = document.getElementById('simCpuLoad');
    this.pauseBtn = document.getElementById('btnSimPause');
    this.isrBtn = document.getElementById('btnSimISR');
    this.logEntries = document.getElementById('simLogEntries');

    this.fill1 = document.getElementById('simFill1');
    this.fill2 = document.getElementById('simFill2');
    this.fill3 = document.getElementById('simFill3');
    this.fill4 = document.getElementById('simFill4');

    this.state1 = document.getElementById('simState1');
    this.state2 = document.getElementById('simState2');
    this.state3 = document.getElementById('simState3');
    this.state4 = document.getElementById('simState4');

    this.ticks = 0;
    this.isRunning = true;
    this.cycle = 0;

    this.bindEvents();
    this.startLoop();
  }

  bindEvents() {
    if (this.pauseBtn) {
      this.pauseBtn.addEventListener('click', () => {
        this.isRunning = !this.isRunning;
        this.pauseBtn.textContent = this.isRunning ? 'Pause' : 'Resume';
        this.log(this.isRunning ? 'Kernel scheduler resumed.' : 'Kernel scheduler paused by user.');
      });
    }

    if (this.isrBtn) {
      this.isrBtn.addEventListener('click', () => {
        this.triggerISR();
      });
    }
  }

  triggerISR() {
    this.log('[ISR] Hardware GPIO interrupt fired on Core 1! Preempting tasks...', 'text-rose');
    if (this.state1 && this.fill1) {
      this.state1.textContent = 'RUNNING (ISR)';
      this.state1.style.color = 'var(--accent-rose)';
      this.fill1.style.width = '100%';
      this.fill1.style.background = 'var(--accent-rose)';

      setTimeout(() => {
        this.state1.textContent = 'BLOCKED (WAIT_SEM)';
        this.state1.style.color = '';
        this.fill1.style.width = '20%';
        this.fill1.style.background = 'var(--accent-blue)';
        this.log('[ISR] portYIELD_FROM_ISR completed. Context restored.', 'text-green');
      }, 850);
    }
  }

  log(msg, colorClass = '') {
    if (!this.logEntries) return;
    const time = new Date().toTimeString().split(' ')[0];
    const el = document.createElement('div');
    el.className = `entry ${colorClass}`;
    el.textContent = `[${time}] ${msg}`;
    this.logEntries.appendChild(el);
    this.logEntries.scrollTop = this.logEntries.scrollHeight;

    while (this.logEntries.children.length > 20) {
      this.logEntries.removeChild(this.logEntries.firstChild);
    }
  }

  startLoop() {
    setInterval(() => {
      if (!this.isRunning) return;
      this.ticks += 10;
      this.cycle = (this.cycle + 1) % 4;

      if (this.tickVal) this.tickVal.textContent = this.ticks.toLocaleString();
      if (this.cpuLoad) {
        const load = 38 + (this.cycle * 6) + Math.floor(Math.sin(this.ticks * 0.05) * 8);
        this.cpuLoad.textContent = `${load}%`;
      }

      this.updateLanes();
    }, 450);
  }

  updateLanes() {
    if (this.cycle === 0) {
      if (this.state2) this.state2.textContent = 'RUNNING (Core 0)';
      if (this.fill2) { this.fill2.style.width = '80%'; this.fill2.className = 'lane-fill active'; }
      if (this.state3) this.state3.textContent = 'READY';
      if (this.fill3) { this.fill3.style.width = '30%'; this.fill3.className = 'lane-fill'; }
    } else if (this.cycle === 1) {
      if (this.state3) this.state3.textContent = 'RUNNING (Core 0)';
      if (this.fill3) { this.fill3.style.width = '65%'; this.fill3.className = 'lane-fill active'; }
      if (this.state2) this.state2.textContent = 'BLOCKED (I/O)';
      if (this.fill2) { this.fill2.style.width = '15%'; this.fill2.className = 'lane-fill'; }
    } else if (this.cycle === 2) {
      if (this.state4) this.state4.textContent = 'RUNNING (Hook)';
      if (this.fill4) { this.fill4.style.width = '45%'; this.fill4.className = 'lane-fill active'; }
    } else {
      if (this.state4) this.state4.textContent = 'SLEEP (Tickless)';
      if (this.fill4) { this.fill4.style.width = '10%'; this.fill4.className = 'lane-fill'; }
      if (this.state2) this.state2.textContent = 'PREEMPTING';
      if (this.fill2) { this.fill2.style.width = '90%'; }
    }
  }
}

/* ===================================================================
   4. MONAD LIVE DRAWING CANVAS & MEMPOOL BROADCASTER
   =================================================================== */
class MonadCanvasEngine {
  constructor() {
    this.canvas = document.getElementById('interactiveCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.prompt = document.getElementById('canvasPrompt');
    this.strokeCountEl = document.getElementById('canvasStrokeCount');
    this.mempoolRows = document.getElementById('mempoolRows');
    this.clearBtn = document.getElementById('btnCanvasClear');
    this.exportBtn = document.getElementById('btnCanvasExport');
    this.brushSlider = document.getElementById('brushSlider');
    this.brushNum = document.getElementById('brushSizeNum');

    this.currentColor = '#38bdf8';
    this.currentWidth = 5;
    this.isDrawing = false;
    this.strokeCount = 0;
    this.blockNumber = 14892100;
    this.lastX = 0;
    this.lastY = 0;
    this.strokePoints = [];

    this.initCanvas();
    this.bindEvents();
  }

  initCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.ctx.fillStyle = '#040508';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      const temp = document.createElement('canvas');
      temp.width = this.canvas.width;
      temp.height = this.canvas.height;
      temp.getContext('2d').drawImage(this.canvas, 0, 0);

      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
      this.ctx.fillStyle = '#040508';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(temp, 0, 0);
    });

    this.canvas.addEventListener('pointerdown', (e) => this.start(e));
    this.canvas.addEventListener('pointermove', (e) => this.move(e));
    window.addEventListener('pointerup', () => this.end());
    this.canvas.addEventListener('pointercancel', () => this.end());

    document.querySelectorAll('.palette-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        document.querySelectorAll('.palette-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        this.currentColor = swatch.dataset.color;
      });
    });

    if (this.brushSlider) {
      this.brushSlider.addEventListener('input', (e) => {
        this.currentWidth = e.target.value;
        if (this.brushNum) this.brushNum.textContent = `${this.currentWidth}px`;
      });
    }

    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => {
        this.ctx.fillStyle = '#040508';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.prompt) this.prompt.style.opacity = '1';
        showToast('Canvas reset');
      });
    }

    if (this.exportBtn) {
      this.exportBtn.addEventListener('click', () => {
        showToast(`Art verified on Monad Devnet: ${this.strokeCount} on-chain strokes.`);
      });
    }
  }

  getCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  start(e) {
    this.isDrawing = true;
    const { x, y } = this.getCoords(e);
    this.lastX = x;
    this.lastY = y;
    this.strokePoints = [{ x, y }];
    if (this.prompt) this.prompt.style.opacity = '0';
  }

  move(e) {
    if (!this.isDrawing) return;
    const { x, y } = this.getCoords(e);

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.currentWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.stroke();

    this.strokePoints.push({ x, y });
    this.lastX = x;
    this.lastY = y;
  }

  end() {
    if (!this.isDrawing) return;
    this.isDrawing = false;

    if (this.strokePoints.length > 1) {
      this.strokeCount++;
      this.blockNumber++;
      if (this.strokeCountEl) this.strokeCountEl.textContent = this.strokeCount;
      this.broadcastTx();
    }
    this.strokePoints = [];
  }

  broadcastTx() {
    if (!this.mempoolRows) return;
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 40; i++) hash += chars[Math.floor(Math.random() * chars.length)];
    const shortHash = `${hash.slice(0, 8)}...${hash.slice(-6)}`;
    const latency = Math.floor(12 + Math.random() * 22);

    const row = document.createElement('div');
    row.className = 'mempool-row';
    row.innerHTML = `
      <span>[BLK #${this.blockNumber}]</span>
      <span class="mono">${shortHash}</span>
      <span>${latency}ms</span>
      <span class="status-tag">CONFIRMED</span>
    `;

    const placeholder = this.mempoolRows.querySelector('.placeholder');
    if (placeholder) placeholder.remove();

    this.mempoolRows.insertBefore(row, this.mempoolRows.firstChild);
    while (this.mempoolRows.children.length > 10) {
      this.mempoolRows.removeChild(this.mempoolRows.lastChild);
    }
  }
}

/* ===================================================================
   5. EMAIL COPY & VCARD ACTIONS
   =================================================================== */
function initContactActions() {
  const email = 'jishnukunhiraman66@gmail.com';

  const copyButtons = [
    document.getElementById('btnCopyEmailNav'),
    document.getElementById('btnHeroCopyEmail'),
    document.getElementById('btnCopyEmailContact')
  ];

  copyButtons.forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(email).then(() => {
        showToast('Email copied: jishnukunhiraman66@gmail.com');
      }).catch(() => {
        showToast('Address: jishnukunhiraman66@gmail.com');
      });
    });
  });

  // vCard download
  const vcardButtons = [
    document.getElementById('btnProfileVCard'),
    document.getElementById('btnDownloadVCardContact')
  ];

  vcardButtons.forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      const vcard = `BEGIN:VCARD
VERSION:3.0
N:V N;Jishnu;;;
FN:Jishnu V N
ORG:SRM Institute of Science and Technology
TITLE:Systems & Embedded Engineer (3rd Year CSE Core)
EMAIL;type=INTERNET;type=pref:jishnukunhiraman66@gmail.com
ADR;type=HOME:;;Vadakke Nelloli, Neelandummal, Chuzhali P.O., Valayam;Vadakara;Kerala;673517;India
NOTE:B.Tech CSE Core (CGPA 8.41). ESP32 FreeRTOS firmware, Monad Blockchain, C/C++, Python & Prompt Engineering.
END:VCARD`;

      const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Jishnu_VN_Systems_Engineer.vcf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Contact card (.vcf) downloaded');
    });
  });

  // Contact form mailto fallback
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.name.value;
      const userEmail = form.email.value;
      const subject = form.subject.value;
      const msg = form.message.value;

      const mailto = `mailto:jishnukunhiraman66@gmail.com?subject=${encodeURIComponent(`[Portfolio Inquiry] ${subject} - ${name}`)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${userEmail}\n\nMessage:\n${msg}`)}`;
      window.location.href = mailto;
      showToast('Mail client opened');
      form.reset();
    });
  }
}

/* ===================================================================
   SYSTEM BOOTSTRAPPER
   =================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  new StudioChipScene();
  new RtosSimulator();
  new MonadCanvasEngine();
  initContactActions();
});
