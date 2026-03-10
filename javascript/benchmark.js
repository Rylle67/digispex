/* ============================================================
   NEXUS — PC Builder & E-Commerce Platform
   benchmark.js — Game Benchmark Engine

   Calculates realistic FPS estimates based on selected
   components, runs an animated benchmark sequence, and
   produces a full performance report with per-game results,
   tier rating, bottleneck analysis, and comparison graphs.
   ============================================================ */

/* ============================================================
   COMPONENT SCORE TABLES
   Each component contributes a base score (0–100) used to
   compute weighted FPS for each game.
============================================================ */

const CPU_SCORES = {
  // Intel Core Ultra 200S (Arrow Lake, LGA1851)
  cpu_ultra9_285k: 97, cpu_ultra7_265k: 90, cpu_ultra5_245k: 80, cpu_ultra5_245kf: 79,
  // Intel 14th Gen (LGA1700)
  cpu1: 95, cpu_i9_14900kf: 94, cpu_i9_14900: 88,
  cpu3: 87, cpu_i7_14700kf: 86,
  cpu5: 77, cpu_i5_14600kf: 76, cpu_i5_14500: 70, cpu_i5_14400f: 63,
  cpu_i3_14100f: 48, cpu6: 58,
  // AMD Ryzen 9000 (AM5)
  cpu_r9_9950x: 99, cpu_r9_9900x: 91, cpu_r7_9700x: 82, cpu_r5_9600x: 73,
  // AMD Ryzen 7000 (AM5)
  cpu_r9_7950x3d: 96, cpu2: 93, cpu8: 84,
  cpu_r7_7800x3d: 87, cpu4: 75, cpu_r7_7700: 72, cpu7: 68, cpu_r5_7600: 64,
  // AMD Ryzen 5000 (AM4)
  cpu_r9_5950x: 78, cpu9: 73, cpu10: 83, cpu12: 64,
  cpu_r7_5700x3d: 79, cpu11: 59, cpu_r5_5600: 55, cpu_r5_5500: 50,
};

const GPU_SCORES = {
  // NVIDIA RTX 50 Series (Blackwell)
  gpu_5090: 110, gpu_5080: 98, gpu_5070ti: 88, gpu_5070: 77, gpu_5060ti: 63,
  // NVIDIA RTX 40 Series (Ada Lovelace)
  gpu1: 100, gpu_4080s: 88, gpu_4080: 84,
  gpu4: 75, gpu_4070ti: 70, gpu_4070s: 65, gpu_4070: 60,
  gpu_4060ti_16g: 53, gpu_4060ti: 52, gpu_4060: 43,
  // NVIDIA RTX 30 Series (Ampere)
  gpu6: 62, gpu_3080_12: 64, gpu_3070ti: 57, gpu_3070: 53, gpu_3060ti: 48,
  // AMD RX 9000 Series (RDNA 4)
  gpu_rx9070xt: 80, gpu_rx9070: 72,
  // AMD RX 7000 Series (RDNA 3)
  gpu3: 82, gpu_rx7900xt: 75, gpu_rx7900gre: 64,
  gpu5: 58, gpu_rx7700xt: 52, gpu_rx7600xt: 46, gpu_rx7600: 40,
};

const RAM_SCORES = {
  // DDR5
  ram_gz5_64_6400: 100, ram1: 97, ram_corsair_dom64: 96,
  ram6: 95, ram2: 90, ram_kingston_d5_32: 86,
  ram_crucial_d5_32: 85, ram_teamgroup_d5: 89,
  ram5: 80, ram_crucial_d5_16: 78,
  // DDR4
  ram8: 84, ram_gskill_d4_32: 80, ram3: 79,
  ram7: 72, ram_crucial_d4_16: 67, ram4: 65, ram_corsair_d4_16: 62,
};

const STORAGE_SCORES = {
  // Gen 5 NVMe
  ssd_t705_2tb: 100, ssd_mp700pro_2tb: 98, ssd_t705_1tb: 97,
  // Gen 4 NVMe
  ssd_990pro_4tb: 95, ssd1: 95, ssd_990pro_1tb: 94,
  ssd_sn850x_2tb: 93, ssd2: 93, ssd_firecuda_2tb: 92,
  ssd4: 87, ssd_p41_1tb: 88, ssd_t500_1tb: 89,
  // SATA SSD
  ssd_870evo_2tb: 55, ssd_mx500_2tb: 52,
  // HDD (load time penalty)
  ssd3: 35, ssd_wd_6tb: 35,
};

/* ============================================================
   GAMES DATABASE
   Each game has:
     name       — display title
     genre      — shown in results
     icon       — emoji
     year       — release year
     resolution — target resolution string
     gpuWeight  — how GPU-bound this game is (0–1)
     cpuWeight  — how CPU-bound this game is (0–1)
     ramWeight  — RAM speed impact
     baseFPS    — base FPS at mid-tier hardware (GPU score ~65)
     ultra4k    — 4K Ultra FPS multiplier
     ray        — raytracing FPS penalty multiplier (0–1)
     tags       — array of setting tags shown in results
============================================================ */

const GAMES = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk 2077',
    genre: 'Open World RPG',
    icon: '',
    logo: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg',
    year: 2023,
    resolution: '1440p Ultra',
    gpuWeight: 0.82,
    cpuWeight: 0.12,
    ramWeight: 0.06,
    baseFPS: 58,
    maxFPS: 165,
    rtMultiplier: 0.62,
    tags: ['Ray Tracing: ON', 'DLSS 3', 'Ultra Settings'],
    accent: '#ff6b35',
  },
  {
    id: 'rdr2',
    name: 'Red Dead Redemption 2',
    genre: 'Open World',
    icon: '',
    logo: 'https://static.wikia.nocookie.net/reddeadredemption/images/0/0a/Reddeadcover.jpg/revision/latest?cb=20180503145113',
    year: 2019,
    resolution: '1440p Ultra',
    gpuWeight: 0.70,
    cpuWeight: 0.22,
    ramWeight: 0.08,
    baseFPS: 68,
    maxFPS: 145,
    rtMultiplier: 1.0,
    tags: ['Ultra Settings', 'TAA', 'Advanced Graphics'],
    accent: '#cc8833',
  },
  {
    id: 'baldursgate',
    name: "Baldur's Gate 3",
    genre: 'RPG',
    icon: '',
    logo: 'https://image.api.playstation.com/vulcan/ap/rnd/202302/2321/ba706e54d68d10a0eb6ab7c36cdad9178c58b7fb7bb03d28.png?w=440',
    year: 2023,
    resolution: '1440p Ultra',
    gpuWeight: 0.58,
    cpuWeight: 0.32,
    ramWeight: 0.10,
    baseFPS: 78,
    maxFPS: 160,
    rtMultiplier: 1.0,
    tags: ['Ultra Settings', 'Vulkan API'],
    accent: '#9966ff',
  },
  {
    id: 'elden_ring',
    name: 'Elden Ring',
    genre: 'Action RPG',
    icon: '',
    logo: 'https://static0.polygonimages.com/wordpress/wp-content/uploads/sharedimages/2024/12/mixcollage-08-dec-2024-02-50-pm-6945-1.jpg',
    year: 2022,
    resolution: '1440p Max',
    gpuWeight: 0.65,
    cpuWeight: 0.28,
    ramWeight: 0.07,
    baseFPS: 85,
    maxFPS: 155,
    rtMultiplier: 1.0,
    tags: ['Max Settings', 'FSR 2'],
    accent: '#ffd700',
  },
  {
    id: 'cs2',
    name: 'Counter-Strike 2',
    genre: 'FPS / Competitive',
    icon: '',
    logo: 'https://media.printables.com/media/prints/993971/images/7567942_39fd2e55-5ff1-43ef-a3a2-532a95d43dd4_93a75339-5509-492d-bac0-9c0ca1ede73d/thumbs/cover/800x800/jpg/f75dd04fa12445a8ec43be65fa16ff1b8d2bf82e.jpg',
    year: 2023,
    resolution: '1080p Competitive',
    gpuWeight: 0.40,
    cpuWeight: 0.52,
    ramWeight: 0.08,
    baseFPS: 210,
    maxFPS: 550,
    rtMultiplier: 1.0,
    tags: ['Low Settings', 'High FPS Mode', 'Source 2'],
    accent: '#00d4ff',
  },
  {
    id: 'starfield',
    name: 'Starfield',
    genre: 'Sci-Fi RPG',
    icon: '',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnqaTvMn-NTktBhWB8qcQ3Lv71C8lQjas_d9DoORP_xN5w0Hv-U3La1eSFuREmgzKeCA7t_g&s=10',
    year: 2023,
    resolution: '1440p Ultra',
    gpuWeight: 0.60,
    cpuWeight: 0.32,
    ramWeight: 0.08,
    baseFPS: 62,
    maxFPS: 130,
    rtMultiplier: 1.0,
    tags: ['Ultra Settings', 'DirectX 12'],
    accent: '#4488ff',
  },
  {
    id: 'alan_wake2',
    name: 'Alan Wake 2',
    genre: 'Horror / Action',
    icon: '',
    logo: 'https://upload.wikimedia.org/wikipedia/en/e/ed/Alan_Wake_2_box_art.jpg',
    year: 2023,
    resolution: '1440p Ultra',
    gpuWeight: 0.88,
    cpuWeight: 0.08,
    ramWeight: 0.04,
    baseFPS: 45,
    maxFPS: 120,
    rtMultiplier: 0.55,
    tags: ['Path Tracing', 'DLSS 3.5', 'Ultra+'],
    accent: '#88aaff',
  },
  {
    id: 'fortnite',
    name: 'Fortnite',
    genre: 'Battle Royale',
    icon: '',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Fortnite_F_lettermark_logo.png',
    year: 2024,
    resolution: '1080p Epic',
    gpuWeight: 0.55,
    cpuWeight: 0.35,
    ramWeight: 0.10,
    baseFPS: 145,
    maxFPS: 360,
    rtMultiplier: 0.70,
    tags: ['Epic Settings', 'Nanite', 'DirectX 12'],
    accent: '#00ff88',
  },
];

/* ============================================================
   FPS CALCULATION ENGINE
============================================================ */

/**
 * Calculate FPS for a specific game given the current build.
 * Returns { fps, rt_fps, frametimeMs, grade, bottleneck }
 */
function calcGameFPS(game, build) {
  const cpuScore  = CPU_SCORES[build.CPU]         || 50;
  const gpuScore  = GPU_SCORES[build.GPU]         || 50;
  const ramScore  = RAM_SCORES[build.RAM]         || 60;
  const storScore = STORAGE_SCORES[build.Storage] || 70;

  // Weighted composite score for this game
  const composite = (
    gpuScore  * game.gpuWeight +
    cpuScore  * game.cpuWeight +
    ramScore  * game.ramWeight +
    storScore * 0.02
  );

  // Map composite (0–100) to FPS range
  const t   = Math.min(composite / 100, 1);
  const fps = Math.round(game.baseFPS + (game.maxFPS - game.baseFPS) * (t ** 0.85));

  // Apply a small random variance ±3% for realism
  const variance = 1 + (Math.random() - 0.5) * 0.06;
  const finalFPS = Math.round(fps * variance);

  // Raytracing FPS
  const rtFPS = Math.round(finalFPS * game.rtMultiplier);

  // Frame time
  const frametimeMs = (1000 / finalFPS).toFixed(1);

  // Grade
  const grade = finalFPS >= 144 ? 'S'
              : finalFPS >= 100 ? 'A'
              : finalFPS >= 60  ? 'B'
              : finalFPS >= 45  ? 'C'
              : 'D';

  // Bottleneck detection
  const cpuContrib = cpuScore  * game.cpuWeight;
  const gpuContrib = gpuScore  * game.gpuWeight;
  const bottleneck = cpuContrib > gpuContrib * 1.4 ? 'CPU'
                   : gpuContrib > cpuContrib * 1.4 ? 'GPU'
                   : 'Balanced';

  return { fps: finalFPS, rtFPS, frametimeMs, grade, bottleneck, composite };
}

/**
 * Compute an overall build score (0–100) and tier label.
 */
function calcBuildScore(build) {
  if (!build.CPU || !build.GPU) return null;

  const cpuScore = CPU_SCORES[build.CPU] || 50;
  const gpuScore = GPU_SCORES[build.GPU] || 50;
  const ramScore = RAM_SCORES[build.RAM] || 60;

  const score = Math.round(cpuScore * 0.30 + gpuScore * 0.55 + ramScore * 0.15);

  const tier = score >= 92 ? { label: 'GODTIER',    color: '#ff6b35', glow: '#ff6b3566' }
             : score >= 80 ? { label: 'ULTRA',       color: '#00d4ff', glow: '#00d4ff44' }
             : score >= 68 ? { label: 'HIGH-END',    color: '#00ff88', glow: '#00ff8844' }
             : score >= 54 ? { label: 'MID-RANGE',   color: '#ffd700', glow: '#ffd70044' }
             :               { label: 'ENTRY-LEVEL', color: '#8899aa', glow: '#8899aa44' };

  // Detect overall bottleneck
  const diff = Math.abs(cpuScore - gpuScore);
  let bottleneck = 'Balanced — great component synergy';
  if (cpuScore < gpuScore - 20) bottleneck = `CPU bottleneck — your GPU is being held back by the ${build.CPU ? getProduct(build.CPU)?.name : 'CPU'}`;
  if (gpuScore < cpuScore - 20) bottleneck = `GPU bottleneck — consider upgrading your GPU`;

  return { score, tier, bottleneck, cpuScore, gpuScore, ramScore };
}

/* ============================================================
   BENCHMARK UI — ANIMATED RUNNER
============================================================ */

let benchmarkRunning = false;

/**
 * Entry point called from the builder page.
 * Validates build, then opens the benchmark modal.
 */
function openBenchmark() {
  const build = DB.getBuild();
  if (!build.CPU || !build.GPU) {
    showToast(' Need at least a CPU and GPU to benchmark', 'error');
    return;
  }

  // Reset modal state
  document.getElementById('benchmarkModal').classList.add('open');
  document.getElementById('bmPreRun').style.display  = 'block';
  document.getElementById('bmRunning').style.display = 'none';
  document.getElementById('bmResults').style.display = 'none';

  // Populate pre-run summary
  renderBenchmarkPreview(build);
}

function closeBenchmarkModal() {
  document.getElementById('benchmarkModal').classList.remove('open');
  benchmarkRunning = false;
}

/** Show a mini component preview before running. */
function renderBenchmarkPreview(build) {
  const parts = [
    { label: 'CPU', id: build.CPU },
    { label: 'GPU', id: build.GPU },
    { label: 'RAM', id: build.RAM },
  ].filter(p => p.id);

  document.getElementById('bmBuildPreview').innerHTML = parts.map(p => {
    const prod = getProduct(p.id);
    return prod ? `
      <div class="bm-part-chip">
        <span>${prod.emoji}</span>
        <span>${prod.name}</span>
      </div>` : '';
  }).join('');
}

/** Start the animated benchmark sequence. */
async function startBenchmark() {
  if (benchmarkRunning) return;
  benchmarkRunning = true;

  const build = DB.getBuild();

  document.getElementById('bmPreRun').style.display  = 'none';
  document.getElementById('bmRunning').style.display = 'block';
  document.getElementById('bmResults').style.display = 'none';

  const progressBar  = document.getElementById('bmProgressBar');
  const progressPct  = document.getElementById('bmProgressPct');
  const bmCurrentGame = document.getElementById('bmCurrentGame');
  const bmCurrentFPS  = document.getElementById('bmCurrentFPS');
  const bmLiveLog     = document.getElementById('bmLiveLog');

  bmLiveLog.innerHTML = '';
  progressBar.style.width = '0%';

  const results = [];
  const total   = GAMES.length;

  for (let i = 0; i < total; i++) {
    if (!benchmarkRunning) break;

    const game = GAMES[i];
    const pct  = Math.round(((i) / total) * 100);

    // Update header
    bmCurrentGame.textContent = `Testing: ${game.name}`;
    progressBar.style.width   = pct + '%';
    progressPct.textContent   = pct + '%';
    bmCurrentFPS.textContent  = '...';

    // Simulate benchmark loading phase
    bmLiveLog.innerHTML += `<div class="bm-log-line loading"> Loading ${game.name}...</div>`;
    bmLiveLog.scrollTop = bmLiveLog.scrollHeight;
    await sleep(400 + Math.random() * 300);

    // Animate FPS counting up
    const result = calcGameFPS(game, build);
    let displayFPS = Math.round(result.fps * 0.3);
    const step = Math.ceil(result.fps / 20);

    while (displayFPS < result.fps) {
      displayFPS = Math.min(displayFPS + step, result.fps);
      bmCurrentFPS.textContent = displayFPS + ' FPS';
      await sleep(35);
    }

    // Log result
    const gradeClass = { S:'grade-s', A:'grade-a', B:'grade-b', C:'grade-c', D:'grade-d' }[result.grade];
    bmLiveLog.innerHTML += `
      <div class="bm-log-line done">
        <img class="bm-log-logo" src="${game.logo}" alt="${game.name}"
             onerror="this.style.display='none'">
        ${game.name}
        <span class="bm-log-fps">${result.fps} avg FPS</span>
        <span class="bm-grade ${gradeClass}">${result.grade}</span>
      </div>`;
    bmLiveLog.scrollTop = bmLiveLog.scrollHeight;

    results.push({ game, result });
    await sleep(250);
  }

  // Final progress
  progressBar.style.width  = '100%';
  progressPct.textContent  = '100%';
  bmCurrentGame.textContent = 'Benchmark Complete!';
  bmCurrentFPS.textContent  = '';

  await sleep(600);

  // Show full results
  benchmarkRunning = false;
  renderBenchmarkResults(build, results);
}

/** Render the full results report. */
function renderBenchmarkResults(build, results) {
  document.getElementById('bmRunning').style.display = 'none';
  document.getElementById('bmResults').style.display = 'block';

  const buildScore = calcBuildScore(build);
  const cpu  = getProduct(build.CPU);
  const gpu  = getProduct(build.GPU);
  const ram  = build.RAM ? getProduct(build.RAM) : null;

  //  Overall score banner 
  document.getElementById('bmScoreBanner').innerHTML = `
    <div class="bm-tier-badge" style="color:${buildScore.tier.color};box-shadow:0 0 30px ${buildScore.tier.glow}">
      ${buildScore.tier.label}
    </div>
    <div class="bm-overall-score" style="color:${buildScore.tier.color}">
      ${buildScore.score}<span>/100</span>
    </div>
    <div class="bm-bottleneck-note">
      ${buildScore.bottleneck === 'Balanced — great component synergy'
        ? `<span style="color:var(--green)"> ${buildScore.bottleneck}</span>`
        : `<span style="color:var(--yellow)"> ${buildScore.bottleneck}</span>`}
    </div>
    <div class="bm-component-scores">
      ${_scoreBar('CPU', buildScore.cpuScore, cpu?.name || '—', '#00d4ff')}
      ${_scoreBar('GPU', buildScore.gpuScore, gpu?.name || '—', '#7c3aed')}
      ${_scoreBar('RAM', buildScore.ramScore, ram?.name || '—', '#ff6b35')}
    </div>`;

  //  Per-game results 
  document.getElementById('bmGameResults').innerHTML = results.map(({ game, result }) => {
    const fpsBarWidth = Math.min((result.fps / game.maxFPS) * 100, 100);
    const gradeClass  = { S:'grade-s', A:'grade-a', B:'grade-b', C:'grade-c', D:'grade-d' }[result.grade];

    // FPS target lines
    const targets = [
      { fps: 60,  label: '60',  pct: (60 / game.maxFPS) * 100 },
      { fps: 120, label: '120', pct: (120 / game.maxFPS) * 100 },
      { fps: 165, label: '165', pct: (165 / game.maxFPS) * 100 },
    ].filter(t => t.pct <= 105);

    return `
      <div class="bm-game-card">
        <div class="bm-game-header">
          <div class="bm-game-icon">
            <img class="bm-game-logo-img" src="${game.logo}" alt="${game.name}"
                 onerror="this.style.display='none';this.parentElement.innerHTML='<span class=bm-game-icon-fallback>${game.icon}</span>'">
          </div>
          <div class="bm-game-meta">
            <div class="bm-game-name">${game.name}</div>
            <div class="bm-game-genre">${game.genre} · ${game.resolution}</div>
            <div class="bm-game-tags">
              ${game.tags.map(t => `<span class="bm-tag">${t}</span>`).join('')}
            </div>
          </div>
          <div class="bm-game-fps-block">
            <div class="bm-fps-num" style="color:${game.accent}">${result.fps}</div>
            <div class="bm-fps-label">avg FPS</div>
            <div class="bm-fps-frametime">${result.frametimeMs}ms</div>
          </div>
          <div class="bm-grade ${gradeClass}">${result.grade}</div>
        </div>
        <div class="bm-fps-bar-wrap">
          ${targets.map(t => `
            <div class="bm-fps-target-line" style="left:${t.pct}%">
              <span>${t.label}</span>
            </div>`).join('')}
          <div class="bm-fps-bar-bg">
            <div class="bm-fps-bar-fill" style="width:${fpsBarWidth}%;background:${game.accent}"
                 data-target="${fpsBarWidth}"></div>
          </div>
        </div>
        ${game.rtMultiplier < 1 ? `
          <div class="bm-rt-row">
            <span> With Ray Tracing / Path Tracing</span>
            <span style="color:var(--yellow)">${result.rtFPS} FPS</span>
          </div>` : ''}
        <div class="bm-bottleneck-chip ${result.bottleneck === 'Balanced' ? 'bal' : result.bottleneck.toLowerCase()}">
          ${result.bottleneck === 'Balanced' ? ' Balanced' : `${result.bottleneck === 'CPU' ? '' : ''} ${result.bottleneck} Bound`}
        </div>
      </div>`;
  }).join('');

  // Animate bars
  requestAnimationFrame(() => {
    document.querySelectorAll('.bm-fps-bar-fill').forEach((bar, i) => {
      setTimeout(() => {
        bar.style.transition = 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        bar.style.width      = bar.dataset.target + '%';
      }, i * 80);
    });
  });

  //  Avg FPS summary 
  const avgFPS = Math.round(results.reduce((s, r) => s + r.result.fps, 0) / results.length);
  document.getElementById('bmAvgFPS').innerHTML = `
    <span style="font-size:2rem;font-weight:700;color:var(--accent)">${avgFPS}</span>
    <span style="color:var(--text2);font-size:0.85rem">avg FPS across all games</span>`;
}

/*  helpers  */
function _scoreBar(label, score, name, color) {
  return `
    <div class="bm-comp-score-row">
      <span class="bm-comp-label">${label}</span>
      <div class="bm-comp-bar-bg">
        <div class="bm-comp-bar-fill" style="width:${score}%;background:${color}"></div>
      </div>
      <span class="bm-comp-val">${score}</span>
      <span class="bm-comp-name">${name}</span>
    </div>`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}