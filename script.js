'use strict';

// ==========================================
// 1. STATE & GLOBAL CONFIGURATION
// ==========================================

/* --- AI Chatbot config (disabled for now, chatbot to be re-added later) ---
// Paste your deployed serverless endpoint URL here to enable the REAL AI bot.
// Leave it as "" to use the offline keyword bot (always works, no key needed).
// Setup guide + ready-to-deploy function are in chatbot-worker.js.
const CHATBOT_API_URL = ""; // e.g. "https://malav-portfolio-bot.yourname.workers.dev"

// Keeps the running conversation so the AI has context (last N turns sent).
let chatHistory = [];
const CHAT_HISTORY_LIMIT = 8;
// ----------------------------------------------------------------------- */

const TYPING_STRINGS = [
  "AI & Machine Learning Engineer...",
  "Applied AI & Robotics Researcher...",
  "Graduate Student @ Rutgers University...",
  "Centimeter-grade GPS RTK Developer...",
  "Full-Stack Python Engineer..."
];

// Project README Data for Simulated Terminal
const PROJECT_READMES = {
  "WildFace Recognition": `# WildFace Recognition & Model Inversion Attacks
[INFO] Executed black-box attacks on CNN models using autoencoders.
[RESULTS] Achieved 98.1% target-class confidence with 100% success.
[DEFENSE] Designed query pattern filters, rounders, and Isolation Forest monitors.
[STATUS] Cost of model inversion attacks increased by 7x.
[TECH] PyTorch | Scikit-learn | Autoencoder | Python`,

  "SecureByBehavior": `# SecureByBehavior Anomaly Detection
[INFO] Auth-system verifying login behavior against credential abuse.
[DATA] Evaluated 2500+ keystroke, latency, and system telemetry records.
[MODEL] Deployed Isolation Forest with Scikit-learn.
[RESULTS] Raised suspicious query detection rate to ~90%.
[TECH] Python | Feature Engineering | Scikit-learn`,

  "U.S. Labor Market Projections": `# U.S. Labor Market Analytics
[INFO] Big data analytics comparing pre and post-pandemic employment.
[DATA] Processed massive statistics from Bureau of Labor Statistics (BLS).
[UI] Developed interactive 3D dashboards displaying analytics.
[TECH] Python | Plotly | Pandas | Big Data Dashboard`,

  "Time Series Forecasting": `# Time Series Forecasting via GluonTS
[INFO] Deployed deep learning neural forecasting architectures.
[RESULTS] Attained minimal Mean Absolute Percentage Error (MAPE) of 0.18.
[MODEL] Leveraged N-BEATS forecasting module.
[STATUS] Published research paper in Springer/Elsevier.
[TECH] Python | TensorFlow | Scikit-learn | GluonTS`,

  "Glassdoor Analysis": `# Glassdoor Salary Predictor
[INFO] Scraped job listings and salary estimates from Glassdoor.
[DATA] Cleared outliers, cleaned datasets, and normalized feature sets.
[MODEL] Built machine learning pipelines with 89.9% prediction accuracy.
[TECH] Web Scraping | Python | Scikit-learn | Predictive Pipelines`,

  "Django E-Commerce": `# Django E-Commerce Platform
[INFO] Scalable backend RESTful architecture for product catalogs.
[DB] Configured PostgreSQL relational design with indexing.
[DEVOPS] Packaged microservices in Docker with CI/CD testing.
[TECH] Django | PostgreSQL | Docker | REST API`,

  "RegIntel": `# RegIntel - AI for Regulatory Compliance
[INFO] Domain-specialized RAG over SEC filings and CFR rules.
[DATA] Sources: 10-K / 10-Q filings + CFR Title 17 (Reg S-K, S-X).
[PIPELINE] Section extraction -> chunking -> embeddings -> FAISS index.
[ROUTING] Query classifier splits filing vs. rule retrieval paths.
[SAFETY] Evidence ranking + citation guard blocks hallucinations.
[TECH] RAG | FAISS | Embeddings | FastAPI | Streamlit`,

  "Brain MRI Segmentation": `# Brain MRI Tumor Segmentation
[INFO] Metadata-infused, attention-gated U-Net for LGG gliomas.
[FUSION] Combines MRI imaging with clinical + genomic metadata.
[DATA] TCGA-LGG Brain MRI dataset (via Kaggle).
[RESULTS] Best model: 0.8960 Dice | 0.8135 IoU (A100, 15 epochs).
[DEPLOY] Interactive Streamlit clinical decision-support dashboard.
[TECH] PyTorch | U-Net | Attention Gates | DiceBCE Loss`,

  "Polymer Energy Prediction": `# Polymer Structural Energy Prediction (Funded)
[INFO] Rutgers-funded ML system for materials discovery.
[DATA] 2,916 CIF structures, 156 atomic coordinates (C-H-O bonds).
[FEATURES] DFT-based calculations + nearest-neighbor interactions.
[MODEL] Stacked ensemble (RF, XGBoost, LightGBM, MLP) + self-supervised GNN.
[RESULTS] Performance improved 73% -> 80% MCC (+7%).
[UI] React dashboard with real-time 3D structure viewer (3Dmol.js).
[TECH] PyTorch Geometric | XGBoost | UMAP | FastAPI | React`,

  "HARV Centerline Segmentation": `# HARV Centerline Segmentation (USDA)
[INFO] U-Net detecting drivable crop-row centerlines for a field robot.
[DATA] Farm-ng .bin logs -> MP4 -> RGB+Depth frame dataset.
[LABELS] Automated binary mask generation (make_masks.py).
[MODEL] Encoder-decoder U-Net trained with BCE + Dice loss.
[OUTPUT] Skeletonized centerline -> steering error for navigation.
[TECH] PyTorch | U-Net | OpenCV | RGB-D | Segmentation`
};

// ==========================================
// 2. AUTOLOADING & SPACEBAR ACCELERATION
// ==========================================

let loaderProgress = 0;
let loaderInterval = null;
const loaderScreen = document.getElementById("loader-screen");
const loaderBarFill = document.getElementById("loader-bar-fill");
const homeView = document.getElementById("home-view");

function startLoader() {
  loaderInterval = setInterval(() => {
    loaderProgress += 1.5;
    updateLoaderBar();
  }, 30);
}

function updateLoaderBar() {
  if (loaderProgress >= 100) {
    loaderProgress = 100;
    clearInterval(loaderInterval);
    setTimeout(completeLoading, 200);
  }
  if (loaderBarFill) {
    loaderBarFill.style.width = `${loaderProgress}%`;
  }
}

function completeLoading() {
  if (loaderScreen) {
    loaderScreen.style.opacity = "0";
    loaderScreen.style.transition = "opacity 0.5s ease";
    setTimeout(() => {
      loaderScreen.style.display = "none";
      // Trigger subtitle typing
      startTypingSubtitle();
    }, 500);
  }
}

// Easter Egg: Press Space to speed up loading
window.addEventListener("keydown", (e) => {
  if (e.code === "Space" && loaderProgress < 100) {
    e.preventDefault();
    loaderProgress += 12; // Speed up by adding 12%
    updateLoaderBar();
  }
});

// Start the loader immediately on execution
startLoader();

// ==========================================
// 8. INTERACTIVE MINECRAFT BACKGROUND PARTICLES & PARALLAX
// ==========================================

function initAmbientParticles() {
  const canvas = document.getElementById("ambient-particles-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const ambientParticles = [];
  const burstParticles = [];
  const particleCount = 35; // Low density for eye comfort

  function getParticleColor(isDark) {
    if (isDark) {
      const colors = ["#60A5FA", "#A78BFA", "#38BDF8", "#E0E7FF"];
      return colors[Math.floor(Math.random() * colors.length)];
    } else {
      const colors = ["#4ADE80", "#FACC15", "#86EFAC", "#FEF08A"];
      return colors[Math.floor(Math.random() * colors.length)];
    }
  }

  for (let i = 0; i < particleCount; i++) {
    ambientParticles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.floor(Math.random() * 3) + 2,
      speedY: -(Math.random() * 0.4 + 0.1),
      speedX: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.15,
      pulse: Math.random() * 0.02,
      pulseDir: 1
    });
  }

  window.addEventListener("click", (e) => {
    const isDark = document.body.classList.contains("dark-theme");
    const clickX = e.clientX;
    const clickY = e.clientY;
    const count = 12;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      burstParticles.push({
        x: clickX,
        y: clickY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: Math.floor(Math.random() * 3) + 3,
        alpha: 1,
        life: 1,
        decay: Math.random() * 0.03 + 0.02,
        color: isDark ? "#A78BFA" : "#54C754"
      });
    }
  });

  function animate() {
    ctx.clearRect(0, 0, width, height);
    const isDark = document.body.classList.contains("dark-theme");

    for (let i = 0; i < ambientParticles.length; i++) {
      const p = ambientParticles[i];
      p.alpha += p.pulse * p.pulseDir;
      if (p.alpha > 0.55) p.pulseDir = -1;
      if (p.alpha < 0.15) p.pulseDir = 1;

      p.x += p.speedX;
      p.y += p.speedY;

      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      ctx.fillStyle = getParticleColor(isDark);
      ctx.globalAlpha = p.alpha;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
    }

    for (let i = burstParticles.length - 1; i >= 0; i--) {
      const bp = burstParticles[i];
      bp.x += bp.vx;
      bp.y += bp.vy;
      bp.vy += 0.12;
      bp.alpha -= bp.decay;

      if (bp.alpha <= 0) {
        burstParticles.splice(i, 1);
        continue;
      }

      ctx.fillStyle = bp.color;
      ctx.globalAlpha = Math.max(0, bp.alpha);
      ctx.fillRect(Math.floor(bp.x), Math.floor(bp.y), bp.size, bp.size);
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }

  animate();
}

function initMouseParallax() {
  const cloudsContainer = document.querySelector(".clouds-container");
  const terrainLayer = document.getElementById("terrain-layer");
  const skyLayer = document.getElementById("sky-layer");

  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;

  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function updateParallax() {
    currentX += (mouseX - currentX) * 0.05;
    currentY += (mouseY - currentY) * 0.05;

    if (cloudsContainer) {
      cloudsContainer.style.transform = `translate3d(${currentX * 15}px, ${currentY * 10}px, 0)`;
    }
    if (terrainLayer) {
      terrainLayer.style.transform = `translate3d(${currentX * -8}px, ${currentY * -4}px, 0)`;
    }
    if (skyLayer) {
      skyLayer.style.transform = `translate3d(${currentX * 4}px, ${currentY * 4}px, 0)`;
    }

    requestAnimationFrame(updateParallax);
  }

  updateParallax();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initAmbientParticles();
    initMouseParallax();
  });
} else {
  initAmbientParticles();
  initMouseParallax();
}

// ==========================================
// 3. SUBPAGE ROUTING & ACTIONS
// ==========================================

function openPage(pageId) {
  navigateWithTransition(pageId, () => applyPageChange(pageId));
}

function closePages() {
  navigateWithTransition("home", () => applyPageChange("home"));
}

// The raw view swap, performed while the screen is covered by blocks
function applyPageChange(pageId) {
  const homeView = document.getElementById("home-view");

  if (pageId === "home") {
    if (homeView) homeView.style.display = "flex";
    document.querySelectorAll(".page-view").forEach(p => {
      p.classList.remove("active");
      p.scrollTop = 0;
    });
    document.body.classList.remove("page-active");
  } else {
    const selectedPage = document.getElementById(`${pageId}-page`);
    if (!selectedPage) return;
    if (homeView) homeView.style.display = "none";
    document.querySelectorAll(".page-view").forEach(p => p.classList.remove("active"));
    selectedPage.classList.add("active");
    selectedPage.scrollTop = 0;
    document.body.classList.add("page-active");

    if (pageId === "experience") {
      setTimeout(() => {
        updateExperienceTimelineScroll();
      }, 80);
    }
  }

  window.scrollTo(0, 0);
}

// ==========================================
// 3a. PAGE TRANSITIONS (block wipe + guide character)
// ==========================================

// Every destination gets its own block colors, held item, and line of dialogue.
const TRANSITIONS = {
  home: {
    blocks: ["#7CB342", "#689F38", "#8D6E63"],
    item: "🏠",
    action: "wave",
    lines: ["Home sweet home!", "Back to base camp!", "Respawning at spawn..."]
  },
  about: {
    blocks: ["#A1887F", "#8D6E63", "#6D4C41"],
    item: "📖",
    action: "wave",
    lines: ["Meet the builder!", "Here's who made all this.", "Let me introduce him..."]
  },
  skills: {
    blocks: ["#90A4AE", "#78909C", "#B0BEC5"],
    item: "⚒️",
    action: "swing",
    lines: ["Straight to the toolbox!", "Check out this loadout!", "Every tool has a story."]
  },
  projects: {
    blocks: ["#78909C", "#607D8B", "#4DD0E1"],
    item: "⛏️",
    action: "mine",
    lines: ["Time to dig in!", "Into the mines we go!", "The good stuff is down here."]
  },
  experience: {
    blocks: ["#FFB300", "#FFA000", "#8D6E63"],
    item: "🧭",
    action: "point",
    lines: ["Follow the journey!", "Retracing the path...", "Where it all happened."]
  },
  publications: {
    blocks: ["#7E57C2", "#5E35B1", "#6D4C41"],
    item: "📚",
    action: "read",
    lines: ["To the library!", "Mind the enchantments.", "Four books, all real."]
  },
  achievements: {
    blocks: ["#FFD54F", "#43A047", "#FFB300"],
    item: "🏆",
    action: "raise",
    lines: ["Trophy time!", "Look what he unlocked!", "Achievement shelf ahead."]
  },
  contact: {
    blocks: ["#EF5350", "#E53935", "#8D6E63"],
    item: "📬",
    action: "toss",
    lines: ["Let's send a message!", "Say hello — he replies!", "Delivering your mail..."]
  }
};

// Overall pacing. This multiplies the whole ~1.6s timeline.
//   1.0 = 1.6s (snappy)   1.4 = 2.3s (cinematic, recommended)   2.5 = 4.0s (very slow)
// Anything above ~1.6 starts to feel like waiting rather than delight, because
// visitors sit through it on EVERY navigation, not just the first one.
const TRANSITION_SPEED = 1.4;

let isTransitioning = false;
let currentView = "home";

const prefersReducedMotion =
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Build the block grid once and reuse it
function buildTransitionGrid() {
  const grid = document.getElementById("transition-blocks");
  if (!grid) return;

  const cols = window.innerWidth < 640 ? 6 : 10;
  const rows = window.innerWidth < 640 ? 8 : 6;
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  // Remember the column count so the wipe can be reversed when going back
  const overlay = document.getElementById("transition-overlay");
  if (overlay) overlay.dataset.cols = String(cols);

  let html = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Stagger by column so the wipe sweeps left to right, following the guide
      html += `<div class="t-block" data-col="${c}"></div>`;
    }
  }
  grid.innerHTML = html;
}

// Main entry: cover the screen, swap the page, then reveal
function navigateWithTransition(target, swapFn) {
  // Already here, or mid-flight? Just do the swap.
  if (target === currentView || isTransitioning) {
    if (target !== currentView) swapFn();
    currentView = target;
    syncHotbar(target);
    return;
  }

  const theme = TRANSITIONS[target] || TRANSITIONS.home;

  // Which way is the guide travelling? Compare positions in the hotbar order.
  // Later page  = moving forward  -> guide runs left to right.
  // Earlier page = heading back   -> guide runs right to left, facing back.
  const fromIdx = HOTBAR_ORDER.indexOf(currentView);
  const toIdx = HOTBAR_ORDER.indexOf(target);
  const goingBack = toIdx < fromIdx;

  // Respect reduced-motion: skip straight to the destination
  if (prefersReducedMotion) {
    swapFn();
    currentView = target;
    syncHotbar(target);
    unlockAdvancement(target);
    return;
  }

  isTransitioning = true;
  currentView = target;
  syncHotbar(target); // highlight immediately so the click feels instant

  // Directional audio: brighter heading forward, lower heading back.
  play8BitSound("hotbar", goingBack ? 0.72 : 1.28);

  // Pop the destination's item out of its hotbar slot
  dropHotbarLoot(target, theme.item);

  const overlay = document.getElementById("transition-overlay");
  const stage = document.getElementById("guide-stage");
  const bubble = document.getElementById("guide-bubble");
  const itemEl = document.getElementById("guide-item");
  const blocks = document.querySelectorAll(".t-block");

  if (!overlay) { swapFn(); isTransitioning = false; return; }

  // Flip the whole stage when heading back
  stage.classList.toggle("dir-back", goingBack);

  // Tag the stage with this destination's action so CSS can animate it
  stage.classList.remove("act-wave", "act-swing", "act-mine", "act-point", "act-read", "act-raise", "act-toss");
  stage.classList.add(`act-${theme.action || "wave"}`);

  // Theme the blocks and the guide's gear.
  // The wipe sweeps in the direction of travel, so the blocks follow the guide.
  const colCount = parseInt(overlay.dataset.cols || "10", 10);
  blocks.forEach(b => {
    const palette = theme.blocks;
    const col = parseInt(b.dataset.col, 10);
    const step = goingBack ? (colCount - 1 - col) : col;
    b.style.background = palette[Math.floor(Math.random() * palette.length)];
    b.style.transitionDelay = `${step * 22 * TRANSITION_SPEED}ms`;
  });
  if (itemEl) itemEl.textContent = theme.item;
  if (bubble) bubble.textContent = theme.lines[Math.floor(Math.random() * theme.lines.length)];

  const t = ms => ms * TRANSITION_SPEED;

  // --- 1. Blocks build in, guide runs onto the screen ---
  overlay.classList.add("active");
  void overlay.offsetHeight; // force reflow so the transition always fires
  overlay.classList.add("covering");
  setTimeout(() => stage.classList.add("guide-enter"), t(120));

  // --- 2. Behind the cover: swap the page ---
  setTimeout(() => swapFn(), t(560));

  // --- 3. Guide presents the destination ---
  setTimeout(() => {
    stage.classList.add("guide-present");
    spawnGuideParticles(theme.blocks);
    play8BitSound("break", goingBack ? 0.85 : 1.1);
    // Mining gets an extra thud on the swing
    if (theme.action === "mine") {
      setTimeout(() => play8BitSound("mine"), t(220));
    }
  }, t(620));

  // --- 4. Guide leads onward, blocks break away ---
  setTimeout(() => {
    stage.classList.remove("guide-present");
    stage.classList.add("guide-exit");
    overlay.classList.remove("covering");
  }, t(1080));

  // --- 5. Clean up, then celebrate arrival ---
  setTimeout(() => {
    overlay.classList.remove("active");
    stage.classList.remove("guide-enter", "guide-exit", "dir-back",
      "act-wave", "act-swing", "act-mine", "act-point", "act-read", "act-raise", "act-toss");
    isTransitioning = false;
    unlockAdvancement(target);
  }, t(1620));
}

// Small square burst behind the guide at the presentation beat
function spawnGuideParticles(palette) {
  const box = document.getElementById("guide-particles");
  if (!box) return;
  box.innerHTML = "";

  for (let i = 0; i < 14; i++) {
    const p = document.createElement("span");
    p.className = "guide-particle";
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 70;
    p.style.background = palette[Math.floor(Math.random() * palette.length)];
    p.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
    p.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
    p.style.animationDelay = `${Math.random() * 120}ms`;
    box.appendChild(p);
  }
  setTimeout(() => { box.innerHTML = ""; }, 900);
}

// Build the grid now, and rebuild if the window is resized
buildTransitionGrid();
window.addEventListener("resize", buildTransitionGrid);

// ==========================================
// 3b. MINECRAFT HOTBAR NAVIGATION
// ==========================================

// Ordered list matching the hotbar slots (index 0 = key "1")
const HOTBAR_ORDER = [
  "home", "about", "skills", "projects",
  "experience", "publications", "achievements", "contact"
];

// Route a hotbar selection: "home" closes pages, anything else opens that page
function hotbarNav(target) {
  if (target === "home") {
    closePages();
  } else {
    openPage(target);
  }
}

// Highlight the active slot to match the current view
function syncHotbar(activeNav) {
  document.querySelectorAll(".hotbar-slot").forEach(slot => {
    slot.classList.toggle("active", slot.dataset.nav === activeNav);
  });
}

// ==========================================
// 3c. ADVANCEMENT TOASTS ("Advancement Made!")
// ==========================================

// Each page has its own Minecraft-style advancement, shown once per visit.
const ADVANCEMENTS = {
  home: { icon: "🏠", title: "Welcome, Traveler", type: "Advancement Made!" },
  about: { icon: "🧑‍💻", title: "Know Thy Builder", type: "Advancement Made!" },
  skills: { icon: "⚒️", title: "Tools of the Trade", type: "Advancement Made!" },
  projects: { icon: "⛏️", title: "Into the Mines", type: "Advancement Made!" },
  experience: { icon: "💼", title: "Seasoned Adventurer", type: "Advancement Made!" },
  publications: { icon: "📚", title: "Opened the Library", type: "Challenge Complete!" },
  achievements: { icon: "🏆", title: "Trophy Hunter", type: "Challenge Complete!" },
  contact: { icon: "📬", title: "Made Contact", type: "Advancement Made!" }
};

// Track which advancements have already fired this session
const unlockedAdvancements = new Set();

function unlockAdvancement(pageId) {
  const data = ADVANCEMENTS[pageId];
  if (!data || unlockedAdvancements.has(pageId)) return;
  unlockedAdvancements.add(pageId);

  const container = document.getElementById("advancement-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "advancement-toast";
  toast.innerHTML = `
    <div class="advancement-icon">${data.icon}</div>
    <div class="advancement-text">
      <div class="advancement-type pixel-text">${data.type}</div>
      <div class="advancement-title pixel-text">${data.title}</div>
    </div>
  `;
  container.appendChild(toast);

  // Trigger slide-in on next frame
  requestAnimationFrame(() => toast.classList.add("show"));

  // Slide out and remove after a few seconds
  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 500);
  }, 3500);
}

// NOTE: number-key navigation lives in initKeyboardHotbarShortcuts() (section 12).
// A second listener here would fire every shortcut twice.

// Keydown listener for ESC: close the top-most thing first, don't jump home blindly
window.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;

  const readmeOpen = document.getElementById("readme-modal");
  const caseOpen = document.getElementById("case-studies-modal");

  // A modal is open -> close only that, and leave the page where it is
  if (readmeOpen && readmeOpen.classList.contains("active")) {
    closeReadmeModal();
    return;
  }
  if (caseOpen && caseOpen.classList.contains("active")) {
    closeCaseStudiesModal();
    return;
  }

  // Otherwise ESC goes home (no-op if already there)
  closePages();
});

// ==========================================
// 4. SUBTITLE TYPING ANIMATION ENGINE
// ==========================================

const typingSubEl = document.getElementById("typing-sub");
let typingStringIndex = 0;
let typingCharIndex = 0;
let isTypingDeleting = false;

function startTypingSubtitle() {
  if (!typingSubEl) return;

  const currentStr = TYPING_STRINGS[typingStringIndex];

  if (!isTypingDeleting) {
    // Typing character
    typingSubEl.innerText = currentStr.substring(0, typingCharIndex + 1);
    typingCharIndex++;

    if (typingCharIndex === currentStr.length) {
      isTypingDeleting = true;
      setTimeout(startTypingSubtitle, 2000); // Pause on full string
    } else {
      setTimeout(startTypingSubtitle, 60);
    }
  } else {
    // Deleting character
    typingSubEl.innerText = currentStr.substring(0, typingCharIndex - 1);
    typingCharIndex--;

    if (typingCharIndex === 0) {
      isTypingDeleting = false;
      typingStringIndex = (typingStringIndex + 1) % TYPING_STRINGS.length;
      setTimeout(startTypingSubtitle, 500); // Pause on empty
    } else {
      setTimeout(startTypingSubtitle, 30);
    }
  }
}

// ==========================================
// 5. EXPERIENCE PANEL SCROLL ANIMATION & TRACKER
// ==========================================

function updateExperienceTimelineScroll() {
  const experiencePage = document.getElementById("experience-page");
  if (!experiencePage || !experiencePage.classList.contains("active")) return;

  const timeline = experiencePage.querySelector(".experience-timeline");
  const progressLine = document.getElementById("experience-progress-line");
  const tracker = document.getElementById("experience-timeline-tracker");
  if (!timeline || !progressLine || !tracker) return;

  const items = timeline.querySelectorAll(".timeline-item");
  const timelineRect = timeline.getBoundingClientRect();
  const pageRect = experiencePage.getBoundingClientRect();

  if (timelineRect.height === 0) return;

  // Target viewport focus position (40% from top of page view)
  const focusY = pageRect.top + pageRect.height * 0.4;
  const timelineTop = timelineRect.top;
  const timelineHeight = timelineRect.height;

  // Calculate scroll progress 0..1
  let progress = (focusY - timelineTop) / timelineHeight;

  // Edge cases for top/bottom scrolling
  const maxScroll = experiencePage.scrollHeight - experiencePage.clientHeight;
  if (experiencePage.scrollTop <= 10) {
    progress = 0;
  } else if (maxScroll > 0 && experiencePage.scrollTop >= maxScroll - 20) {
    progress = 1.0;
  } else {
    progress = Math.max(0, Math.min(1, progress));
  }

  const percentage = (progress * 100).toFixed(2) + "%";
  progressLine.style.height = percentage;
  tracker.style.top = percentage;

  // Activate timeline dots and experience cards as tracker reaches them
  items.forEach((item) => {
    const dot = item.querySelector(".timeline-dot");
    const card = item.querySelector(".experience-card");
    if (!dot) return;

    const dotRect = dot.getBoundingClientRect();
    if (dotRect.top <= focusY + 20) {
      dot.classList.add("active");
      if (card) card.classList.add("timeline-card-active");
    } else {
      dot.classList.remove("active");
      if (card) card.classList.remove("timeline-card-active");
    }
  });
}

function initExperienceTimelineScroll() {
  const experiencePage = document.getElementById("experience-page");
  if (!experiencePage) return;

  experiencePage.addEventListener("scroll", () => {
    requestAnimationFrame(updateExperienceTimelineScroll);
  });

  window.addEventListener("resize", () => {
    requestAnimationFrame(updateExperienceTimelineScroll);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initExperienceTimelineScroll);
} else {
  initExperienceTimelineScroll();
}

// ==========================================
// 6. TERMINAL README SIMULATOR
// ==========================================

const readmeModal = document.getElementById("readme-modal");
const readmeContent = document.getElementById("readme-content");
const readmeTitle = document.getElementById("readme-modal-title");
let typingInterval = null;

function simulateReadme(projectTitle) {
  if (!readmeModal || !readmeContent) return;

  // Close any running typing interval
  clearInterval(typingInterval);

  readmeTitle.innerText = `README.md - Terminal: ${projectTitle}`;
  readmeModal.classList.add("active");
  readmeContent.innerText = "";

  const text = PROJECT_READMES[projectTitle] || `# ${projectTitle}\nREADME not available for this project.`;
  let i = 0;

  // Type character by character to simulate command line stream
  typingInterval = setInterval(() => {
    readmeContent.innerText += text[i];
    i++;
    // Scroll to bottom of terminal
    readmeContent.scrollTop = readmeContent.scrollHeight;

    if (i === text.length) {
      clearInterval(typingInterval);
    }
  }, 12);
}

function closeReadmeModal() {
  if (readmeModal) {
    readmeModal.classList.remove("active");
    clearInterval(typingInterval);
  }
}

// Case Studies Modal triggers
const caseStudiesModal = document.getElementById("case-studies-modal");
function openCaseStudiesModal() {
  if (caseStudiesModal) caseStudiesModal.classList.add("active");
}
function closeCaseStudiesModal() {
  if (caseStudiesModal) caseStudiesModal.classList.remove("active");
}

// ==========================================
// 7. THEME NOTE
// ==========================================

// The day/night sun & moon toggle was removed in favour of the Biome Switcher,
// which suits the Minecraft theme better. The existing `dark-theme` styles are
// now reused by the dark biomes (see initBiomeSwitcher).

// ==========================================
// 8. AI CHATBOT DIALOGUE CONTROLLER (disabled for now, chatbot to be re-added later)
// ==========================================
/*
const chatToggle = document.getElementById("chat-toggle");
const chatPanel = document.getElementById("chat-panel");
const chatClose = document.getElementById("chat-close");
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");

if (chatToggle && chatPanel) {
  chatToggle.addEventListener("click", () => {
    chatPanel.classList.toggle("active");
  });
}

if (chatClose) {
  chatClose.addEventListener("click", () => {
    chatPanel.classList.remove("active");
  });
}

if (chatInput && chatSend) {
  chatInput.addEventListener("input", () => {
    chatSend.disabled = !chatInput.value.trim();
  });

  // FIX #7: Enter key now respects the send button's disabled state,
  // so keyboard and click behavior are always consistent.
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !chatSend.disabled && chatInput.value.trim()) {
      handleChatSend();
    }
  });

  chatSend.addEventListener("click", () => {
    handleChatSend();
  });
}

function handleChatSend() {
  const userText = chatInput.value.trim();
  if (!userText) return;
  chatInput.value = "";
  chatSend.disabled = true;
  processUserMessage(userText);
}

function sendSuggestion(suggestionText) {
  processUserMessage(suggestionText);
}

// Shared pipeline: show the user's message, then get a reply (AI or fallback)
async function processUserMessage(userText) {
  appendChatMessage(userText, "user");
  showBotTypingIndicator();

  let botReply;
  if (CHATBOT_API_URL) {
    // Real AI path: call the serverless endpoint
    try {
      botReply = await fetchAIReply(userText);
    } catch (err) {
      // Network/endpoint failure -> gracefully fall back to keyword bot
      botReply = generateBotReply(userText) +
        "<br/><br/><em style='opacity:0.7'>(Live AI is unreachable right now, so that was my offline answer.)</em>";
    }
  } else {
    // No endpoint configured: use the offline keyword bot with a natural delay
    await new Promise(r => setTimeout(r, 700));
    botReply = generateBotReply(userText);
  }

  removeBotTypingIndicator();
  appendChatMessage(botReply, "bot");
}

// Call the serverless function, sending recent history for context
async function fetchAIReply(userText) {
  chatHistory.push({ role: "user", content: userText });

  const response = await fetch(CHATBOT_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: chatHistory.slice(-CHAT_HISTORY_LIMIT) })
  });

  if (!response.ok) throw new Error(`Endpoint returned ${response.status}`);

  const data = await response.json();
  const reply = (data && data.reply) ? data.reply : "Hmm, I didn't catch that — try asking another way!";

  chatHistory.push({ role: "assistant", content: reply });
  // Basic newline -> <br> so responses render nicely in the bubble
  return reply.replace(/\n/g, "<br/>");
}

function appendChatMessage(text, sender) {
  if (!chatMessages) return;

  const msgDiv = document.createElement("div");
  msgDiv.className = `chat-msg chat-msg-${sender}`;

  if (sender === "bot") {
    const avatar = document.createElement("img");
    avatar.src = "images/bot-avatar.svg";
    avatar.className = "chat-avatar-icon";
    avatar.alt = "bot";
    msgDiv.appendChild(avatar);
  }

  const textSpan = document.createElement("span");
  textSpan.innerHTML = text;
  msgDiv.appendChild(textSpan);

  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showBotTypingIndicator() {
  if (!chatMessages) return;

  const typingDiv = document.createElement("div");
  typingDiv.className = "chat-msg chat-msg-bot";
  typingDiv.id = "bot-typing-indicator";

  const avatar = document.createElement("img");
  avatar.src = "images/bot-avatar.svg";
  avatar.className = "chat-avatar-icon";
  avatar.alt = "bot";
  typingDiv.appendChild(avatar);

  const loaderDiv = document.createElement("div");
  loaderDiv.className = "chat-msg-typing";
  loaderDiv.innerHTML = `
    <div class="chat-typing-dot"></div>
    <div class="chat-typing-dot"></div>
    <div class="chat-typing-dot"></div>
  `;
  typingDiv.appendChild(loaderDiv);

  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeBotTypingIndicator() {
  const indicator = document.getElementById("bot-typing-indicator");
  if (indicator) indicator.remove();
}

function generateBotReply(query) {
  const q = query.toLowerCase();

  if (q.includes("explore")) {
    return "🗺️ <strong>Exploring Malav's Portfolio:</strong><br/>Click the menu links to explore:<br/>• <strong>About Me</strong>: Academic details & statistics.<br/>• <strong>My Skills</strong>: Tech arsenal categorized by expert bars.<br/>• <strong>Projects</strong>: Blocky cards with README terminals.<br/>• <strong>Experience</strong>: Detailed work timeline.<br/>• <strong>Publications</strong>: 4 peer-reviewed papers on a bookshelf.<br/>• <strong>Achievements</strong>: Cisco & AWS certifications.";
  }

  if (q.includes("standout") || q.includes("robot") || q.includes("nav")) {
    return "🧠 <strong>What makes Malav stand out?</strong><br/>He bridges the gap between deep machine learning models and physical robotics! For example, his work at the USDA automated GPS-RTK vehicle paths over 10 acres, cutting manual tracking by 75%!";
  }

  if (q.includes("achievement") || q.includes("cert") || q.includes("publication")) {
    return "🏆 <strong>Achievements:</strong><br/>• Cisco Certified Routing Specialist.<br/>• AWS Academy Graduate.<br/>• SQL Database Specialist.<br/>• 4 published papers in CRC Press, Springer & Elsevier — see the Publications page! 📚";
  }

  if (q.includes("about") || q.includes("edu") || q.includes("rutgers")) {
    return "🎓 <strong>Education:</strong><br/>• Master's in Computer Science at Rutgers University (GPA: 3.89/4.00, Graduation: 2026).<br/>• B.Tech in Information Technology at Charusat University (GPA: 9.02/10.00, 2024).";
  }

  if (q.includes("experience") || q.includes("usda") || q.includes("inflibnet")) {
    return "💼 <strong>Experience Timeline:</strong><br/>• <strong>USDA Cranberry Robotics (May 2025-Present)</strong>: Centimeter RTK navigation & heatmaps.<br/>• <strong>Govt of India INFLIBNET AI Dev (2023-2024)</strong>: Multilingual search optimization using BERT (60% time cut).<br/>• <strong>Innovatics AI Intern (2023-2024)</strong>: Mediapipe CV pipelines processing 150+ image feeds/min.";
  }

  if (q.includes("project") || q.includes("wildface") || q.includes("behavior") || q.includes("regintel") || q.includes("rag") || q.includes("mri") || q.includes("polymer")) {
    return "💻 <strong>Flagship Projects:</strong><br/>• <strong>RegIntel</strong>: RAG system over SEC filings & CFR rules with hallucination guardrails.<br/>• <strong>Brain MRI Segmentation</strong>: Metadata-infused attention U-Net (0.896 Dice).<br/>• <strong>Polymer Energy Prediction</strong>: Rutgers-funded GNN + ensemble (73%→80% MCC).<br/>• <strong>HARV Segmentation</strong>: U-Net crop-row detection for the USDA robot.<br/>• <strong>WildFace Defenses</strong>: CNN inversion attack-and-defense pipeline.<br/>Open the <strong>Projects</strong> page to explore all 10!";
  }

  if (q.includes("publication") || q.includes("paper") || q.includes("research") || q.includes("scholar") || q.includes("journal")) {
    return "📚 <strong>Published Research (4 papers):</strong><br/>• <strong>Unlocking the Power of ML in Education</strong> — CRC Press (2025).<br/>• <strong>From Threads to Algorithms</strong> — Springer Nature (2024).<br/>• <strong>Sentiment Analysis for Stock Prediction</strong> — Springer India (2024).<br/>• <strong>Deep Learning for Time Series</strong> — Elsevier (2023).<br/>Open the <strong>Publications</strong> page to read them all! 📖";
  }

  if (q.includes("contact") || q.includes("email") || q.includes("reach") || q.includes("phone") || q.includes("resume") || q.includes("cv")) {
    return "📬 <strong>Connect with Malav:</strong><br/>• Email: <a href='mailto:mchamp2509@gmail.com'>mchamp2509@gmail.com</a><br/>• Tel: +1 856-831-9928<br/>• Location: New Jersey, USA<br/>• LinkedIn: <a href='https://www.linkedin.com/in/malav-champaneria' target='_blank'>malav-champaneria</a><br/>• Or open the <strong>Contact</strong> page from the home menu to download his resume! 📜";
  }

  return "I'm not sure about that specific question, but I can guide you through Malav's education (Rutgers), experience (USDA & Govt. AI), technical skills, or certifications. What would you like to explore?";
}
*/

// ==========================================
// 9. RETRO 8-BIT SOUND ENGINE & INTERACTIVE FEATURES
// ==========================================

let audioCtx = null;
let audioMuted = true; // Default OFF for clean browsing, toggleable via speaker icon

function initAudioEngine() {
  const toggleBtn = document.getElementById("audio-toggle");
  const iconSpan = document.getElementById("audio-icon");
  const tooltipSpan = toggleBtn ? toggleBtn.querySelector(".control-tooltip") : null;

  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    audioMuted = !audioMuted;

    if (!audioCtx && !audioMuted) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }

    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    if (iconSpan) iconSpan.textContent = audioMuted ? "🔇" : "🔊";
    if (tooltipSpan) tooltipSpan.textContent = audioMuted ? "Sound: OFF" : "Sound: ON";

    if (!audioMuted) play8BitSound("click");
  });
}

// `pitch` scales every frequency: >1 sounds brighter/forward, <1 darker/backward.
function play8BitSound(type, pitch) {
  if (audioMuted) return;
  const p = typeof pitch === "number" ? pitch : 1;

  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === "suspended") audioCtx.resume();

    const now = audioCtx.currentTime;

    if (type === "click" || type === "hotbar") {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime((type === "hotbar" ? 340 : 460) * p, now);
      osc.frequency.exponentialRampToValueAtTime((type === "hotbar" ? 190 : 240) * p, now + 0.08);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === "mine") {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(150 * p, now);
      osc.frequency.exponentialRampToValueAtTime(65 * p, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === "break") {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq * p, now + idx * 0.07);

        gain.gain.setValueAtTime(0.12, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.07 + 0.15);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.15);
      });
    }
  } catch (e) {
    // Silent fallback if web audio is unavailable
  }
}

// ==========================================
// 10. INTERACTIVE BIOME SWITCHER
// ==========================================

const BIOMES = [
  { id: "plains", name: "Plains", icon: "🌲", class: "", dark: false },
  { id: "nether", name: "Nether", icon: "🔥", class: "biome-nether", dark: true },
  { id: "end", name: "The End", icon: "🌌", class: "biome-end", dark: true },
  { id: "snow", name: "Snowy Taiga", icon: "❄️", class: "biome-snow", dark: false }
];

let currentBiomeIdx = 0;

function initBiomeSwitcher() {
  const switchBtn = document.getElementById("biome-switch");
  const iconSpan = document.getElementById("biome-icon");
  const tooltipSpan = switchBtn ? switchBtn.querySelector(".control-tooltip") : null;

  if (!switchBtn) return;

  switchBtn.addEventListener("click", () => {
    BIOMES.forEach(b => { if (b.class) document.body.classList.remove(b.class); });

    currentBiomeIdx = (currentBiomeIdx + 1) % BIOMES.length;
    const biome = BIOMES[currentBiomeIdx];

    if (biome.class) document.body.classList.add(biome.class);

    // Dark biomes reuse the existing dark-theme card/text styling
    document.body.classList.toggle("dark-theme", biome.dark);

    // Remember the visitor's choice between visits
    try { localStorage.setItem("biome", biome.id); } catch (e) { /* storage blocked */ }

    if (iconSpan) iconSpan.textContent = biome.icon;
    if (tooltipSpan) tooltipSpan.textContent = `Biome: ${biome.name}`;

    play8BitSound("click");
  });

  // Restore the saved biome on load
  try {
    const savedId = localStorage.getItem("biome");
    const savedIdx = BIOMES.findIndex(b => b.id === savedId);
    if (savedIdx > 0) {
      currentBiomeIdx = savedIdx;
      const biome = BIOMES[savedIdx];
      if (biome.class) document.body.classList.add(biome.class);
      document.body.classList.toggle("dark-theme", biome.dark);
      if (iconSpan) iconSpan.textContent = biome.icon;
      if (tooltipSpan) tooltipSpan.textContent = `Biome: ${biome.name}`;
    }
  } catch (e) { /* storage blocked */ }
}

// ==========================================
// 11. INTERACTIVE MINING DIAMOND ORE WIDGET
// ==========================================

let mineHits = 0;
const MAX_MINE_HITS = 5;

function initMiningWidget() {
  const widget = document.getElementById("mining-block-widget");
  const oreBlock = document.getElementById("ore-block");
  const crack = document.getElementById("ore-crack");
  const label = document.getElementById("ore-label");

  if (!widget || !oreBlock) return;

  widget.addEventListener("click", (e) => {
    if (mineHits >= MAX_MINE_HITS) return;

    mineHits++;
    play8BitSound("mine");

    if (crack) {
      crack.className = "ore-crack";
      if (mineHits > 0 && mineHits < MAX_MINE_HITS) {
        crack.classList.add(`stage-${mineHits}`);
      }
    }

    if (label) label.textContent = `Mining... (${mineHits}/${MAX_MINE_HITS})`;

    const rect = oreBlock.getBoundingClientRect();
    const clickX = rect.left + rect.width / 2;
    const clickY = rect.top + rect.height / 2;
    // Note: the real click already bubbles to the window particle handler,
    // so no synthetic event is dispatched here (that doubled the particles).

    if (mineHits >= MAX_MINE_HITS) {
      play8BitSound("break");
      oreBlock.style.opacity = "0.2";
      oreBlock.style.transform = "scale(0.8)";
      if (label) label.textContent = "✨ MINED!";

      spawnFloatingLoot(clickX, clickY, "💎");
      setTimeout(() => spawnFloatingLoot(clickX + 18, clickY - 10, "⭐"), 140);

      if (typeof unlockAdvancement === "function") {
        ADVANCEMENTS["diamond_miner"] = {
          icon: "💎",
          title: "Diamond Miner",
          type: "Secret Challenge Complete!"
        };
        unlockAdvancement("diamond_miner");
      }

      setTimeout(() => {
        mineHits = 0;
        if (crack) crack.className = "ore-crack";
        oreBlock.style.opacity = "1";
        oreBlock.style.transform = "scale(1)";
        if (label) label.textContent = "Mine Me! (0/5)";
      }, 8000);
    }
  });
}

function spawnFloatingLoot(x, y, emoji) {
  const loot = document.createElement("div");
  loot.className = "floating-loot";
  loot.textContent = emoji;
  loot.style.left = `${x - 12}px`;
  loot.style.top = `${y - 12}px`;
  document.body.appendChild(loot);

  setTimeout(() => loot.remove(), 1000);
}

// ==========================================
// 13. LOOT DROPS, SPLASH TEXT & IDLE WANDERER
// ==========================================

// --- Loot drop: pop the destination's item out of its hotbar slot ---
function dropHotbarLoot(target, emoji) {
  const slot = document.querySelector(`.hotbar-slot[data-nav="${target}"]`);
  if (!slot || !emoji) return;
  const r = slot.getBoundingClientRect();
  spawnFloatingLoot(r.left + r.width / 2, r.top + r.height / 2, emoji);
}

// --- Splash text: the yellow rotating line from the title screen ---
const SPLASH_LINES = [
  "Also builds robots!",
  "90% autonomous!",
  "Now with RTK!",
  "1.6 cm accuracy!",
  "Ships on Fridays!",
  "4 peer-reviewed papers!",
  "Fluent in Python and coffee!",
  "10+ acres surveyed!",
  "Zero hardcoded secrets!",
  "FastAPI go brrr",
  "Docker: it works on my machine AND yours!",
  "Try pressing 1-8!",
  "Try mining the ore!",
  "Switch the biome! ->",
  "Turn the sound on!",
  "Rutgers-funded research!",
  "0.896 Dice score!",
  "73% -> 80% MCC",
  "Hire me? :)",
  "Made with too much CSS",
  "No frameworks were harmed",
  "Press ESC to go home!"
];

function initSplashText() {
  const el = document.getElementById("splash-text");
  if (!el) return;

  const pick = () => {
    el.textContent = SPLASH_LINES[Math.floor(Math.random() * SPLASH_LINES.length)];
  };
  pick();

  // Click it for a new one (a small hidden delight)
  el.addEventListener("click", () => {
    pick();
    play8BitSound("click", 1.4);
  });

  // Rotate to a fresh line every so often
  setInterval(pick, 9000);
}

// --- Idle wanderer: he strolls past if you linger on the home screen ---
const IDLE_DELAY = 30000;   // 30s of no interaction
let idleTimer = null;
let idleWalking = false;

function initIdleWanderer() {
  const lane = document.getElementById("idle-guide");
  const sourceSvg = document.querySelector("#guide-character .guide-svg");
  if (!lane || !sourceSvg) return;

  // Clone the guide so he always matches the current biome outfit
  const clone = sourceSvg.cloneNode(true);
  clone.classList.add("idle-guide-svg");
  const bubble = document.createElement("div");
  bubble.className = "idle-bubble pixel-text";
  bubble.textContent = "Still here? Take a look around!";
  lane.appendChild(bubble);
  lane.appendChild(clone);

  let lastReset = 0;
  const resetIdle = () => {
    // mousemove fires constantly; only bother re-arming a few times a second
    const now = Date.now();
    if (now - lastReset < 400) return;
    lastReset = now;

    clearTimeout(idleTimer);
    if (idleWalking) return;
    idleTimer = setTimeout(startIdleWalk, IDLE_DELAY);
  };

  function startIdleWalk() {
    // Only on the home screen, and never over a transition
    if (currentView !== "home" || isTransitioning || prefersReducedMotion) {
      resetIdle();
      return;
    }

    idleWalking = true;
    lane.classList.add("walking");

    // Pause mid-stroll to wave, then carry on
    setTimeout(() => lane.classList.add("waving"), 2600);
    setTimeout(() => lane.classList.remove("waving"), 4200);

    setTimeout(() => {
      lane.classList.remove("walking");
      idleWalking = false;
      resetIdle();
    }, 7000);
  }

  ["mousemove", "keydown", "click", "touchstart", "scroll"].forEach(evt => {
    window.addEventListener(evt, resetIdle, { passive: true });
  });

  resetIdle();
}

function initKeyboardHotbarShortcuts() {
  window.addEventListener("keydown", (e) => {
    // Ignore while the loader is still on screen
    if (loaderScreen && loaderScreen.style.display !== "none" && loaderProgress < 100) return;

    // Ignore while typing, and don't fight browser/OS shortcuts
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")) {
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const keyNum = parseInt(e.key, 10);
    if (keyNum >= 1 && keyNum <= 8) {
      const targetNav = HOTBAR_ORDER[keyNum - 1];
      if (targetNav) {
        e.preventDefault();
        // Sound is played by the transition itself, so no extra click here
        hotbarNav(targetNav);
      }
    }
  });
}

// Initialize audio, biomes, mining widget, and keyboard shortcuts
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initAudioEngine();
    initBiomeSwitcher();
    initMiningWidget();
    initKeyboardHotbarShortcuts();
    initSplashText();
    initIdleWanderer();
    initCommandBarConsole();
    initSkinCustomizer();
    initCard3DTilt();
    initSkillBarXPEffects();
  });
} else {
  initAudioEngine();
  initBiomeSwitcher();
  initMiningWidget();
  initKeyboardHotbarShortcuts();
  initSplashText();
  initIdleWanderer();
  initCommandBarConsole();
  initSkinCustomizer();
  initCard3DTilt();
  initSkillBarXPEffects();
}

// ==========================================
// ==========================================
// 15. IN-GAME COMMAND BAR CONSOLE (Press /)
// ==========================================

function initCommandBarConsole() {
  const overlay = document.getElementById("command-bar-overlay");
  const input = document.getElementById("command-input");
  const history = document.getElementById("command-history");

  if (!overlay || !input) return;

  window.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== input) {
      const active = document.activeElement;
      if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) return;
      e.preventDefault();
      overlay.classList.add("active");
      input.focus();
      input.value = "";
      play8BitSound("click");
    }

    if (e.key === "Escape" && overlay.classList.contains("active")) {
      overlay.classList.remove("active");
      input.blur();
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const raw = input.value.trim();
      if (!raw) return;

      appendCmdHistory(`> ${raw}`, "command-line-sys");
      parseCommand(raw);
      input.value = "";
    }
  });

  function appendCmdHistory(text, typeClass) {
    if (!history) return;
    const line = document.createElement("div");
    line.className = typeClass || "";
    line.textContent = text;
    history.appendChild(line);
    history.scrollTop = history.scrollHeight;
  }

  function parseCommand(cmd) {
    const clean = cmd.toLowerCase().replace(/^\//, "").trim();
    const parts = clean.split(" ");
    const main = parts[0];
    const arg = parts[1];

    if (main === "help") {
      appendCmdHistory("📜 Available Commands:", "command-line-sys");
      appendCmdHistory("• /tp [about|skills|projects|experience|publications|achievements|contact] - Teleport to page", "command-line-sys");
      appendCmdHistory("• /skin [steve|alex|knight|hacker] - Change Guide outfit", "command-line-sys");
      appendCmdHistory("• /biome [plains|nether|end|snow] - Change environment biome", "command-line-sys");
      appendCmdHistory("• /give diamond - Secret loot drop", "command-line-sys");
      appendCmdHistory("• /clear - Clear console history", "command-line-sys");
    } else if (main === "tp" || main === "teleport") {
      if (arg && HOTBAR_ORDER.includes(arg)) {
        hotbarNav(arg);
        appendCmdHistory(`⚡ Teleported to ${arg.toUpperCase()}!`, "command-line-success");
      } else {
        appendCmdHistory("❌ Usage: /tp [home|about|skills|projects|experience|publications|achievements|contact]", "command-line-err");
      }
    } else if (main === "skin") {
      if (["steve", "alex", "knight", "hacker"].includes(arg)) {
        setGuideSkin(arg);
        appendCmdHistory(`👕 Skin changed to ${arg.toUpperCase()}!`, "command-line-success");
      } else {
        appendCmdHistory("❌ Usage: /skin [steve|alex|knight|hacker]", "command-line-err");
      }
    } else if (main === "biome") {
      const idx = BIOMES.findIndex(b => b.id === arg);
      if (idx !== -1) {
        document.getElementById("biome-switch")?.click();
        appendCmdHistory(`🌲 Biome set to ${arg.toUpperCase()}!`, "command-line-success");
      } else {
        appendCmdHistory("❌ Usage: /biome [plains|nether|end|snow]", "command-line-err");
      }
    } else if (main === "give" && arg === "diamond") {
      spawnFloatingLoot(window.innerWidth / 2, window.innerHeight / 2, "💎");
      play8BitSound("break");
      appendCmdHistory("💎 Granted 1x Secret Diamond!", "command-line-success");
    } else if (main === "clear") {
      if (history) history.innerHTML = "";
    } else {
      appendCmdHistory(`❌ Unknown command: '/${cmd}'. Type /help for commands.`, "command-line-err");
    }
  }
}

// ==========================================
// 16. SKINS, 3D TILT & SKILL XP EFFECTS
// ==========================================

const SKINS = [
  { id: "steve", name: "Steve", icon: "👕", class: "" },
  { id: "alex", name: "Alex", icon: "👗", class: "skin-alex" },
  { id: "knight", name: "Knight", icon: "🛡️", class: "skin-knight" },
  { id: "hacker", name: "Hacker", icon: "💻", class: "skin-hacker" }
];

let currentSkinIdx = 0;

function initSkinCustomizer() {
  const switchBtn = document.getElementById("skin-switch");
  const iconSpan = document.getElementById("skin-icon");
  const tooltipSpan = switchBtn ? switchBtn.querySelector(".control-tooltip") : null;

  if (!switchBtn) return;

  switchBtn.addEventListener("click", () => {
    currentSkinIdx = (currentSkinIdx + 1) % SKINS.length;
    setGuideSkin(SKINS[currentSkinIdx].id);
    play8BitSound("click");
  });
}

function setGuideSkin(skinId) {
  const iconSpan = document.getElementById("skin-icon");
  const switchBtn = document.getElementById("skin-switch");
  const tooltipSpan = switchBtn ? switchBtn.querySelector(".control-tooltip") : null;

  SKINS.forEach(s => { if (s.class) document.body.classList.remove(s.class); });

  const skin = SKINS.find(s => s.id === skinId) || SKINS[0];
  currentSkinIdx = SKINS.indexOf(skin);

  if (skin.class) document.body.classList.add(skin.class);
  if (iconSpan) iconSpan.textContent = skin.icon;
  if (tooltipSpan) tooltipSpan.textContent = `Skin: ${skin.name}`;
}

function initCard3DTilt() {
  document.addEventListener("mousemove", (e) => {
    const cards = document.querySelectorAll(".card, .project-card, .case-card");
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const rotX = (-y / rect.height) * 10;
        const rotY = (x / rect.width) * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
      } else {
        card.style.transform = "none";
      }
    });
  });
}

function initSkillBarXPEffects() {
  const skillTags = document.querySelectorAll(".skill-tag, .skills-level-item");
  skillTags.forEach(tag => {
    tag.addEventListener("mouseenter", () => {
      play8BitSound("hotbar", 1.3);
      const rect = tag.getBoundingClientRect();
      spawnFloatingLoot(rect.left + rect.width / 2, rect.top, "⭐");
    });
  });
}
