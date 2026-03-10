//  rig rating 

function calcRigRating(build) {
  const cpu     = build.CPU         ? getProduct(build.CPU)         : null;
  const gpu     = build.GPU         ? getProduct(build.GPU)         : null;
  const ram     = build.RAM         ? getProduct(build.RAM)         : null;
  const storage = build.Storage     ? getProduct(build.Storage)     : null;
  const psu     = build.PSU         ? getProduct(build.PSU)         : null;
  const cooler  = build.Cooling     ? getProduct(build.Cooling)     : null;
  const mb      = build.Motherboard ? getProduct(build.Motherboard) : null;

  let score = 0;
  if (cpu)     score += Math.min(25, (cpu.price / 700) * 25);
  if (gpu)     score += Math.min(40, (gpu.price / 2000) * 40);
  if (ram)     score += Math.min(8,  (ram.price / 400) * 8);
  if (storage) score += Math.min(7,  (storage.price / 300) * 7);
  if (psu)     score += Math.min(5,  (psu.wattage / 1600) * 5);
  if (mb)      score += Math.min(5,  (mb.price / 500) * 5);
  if (cooler)  score += cooler.specs.includes('360') ? 5 : cooler.specs.includes('280') ? 4 : 3;
  if (cpu && cpu.name.includes('X3D')) score += 5;
  if (ram && ram.memType === 'DDR5')   score += 3;
  if (storage && storage.specs?.includes('Gen5')) score += 2;

  return Math.min(100, Math.round(score));
}

function getRigLabel(score) {
  if (score >= 95) return { label: 'GODLIKE',   color: '#ff0044' };
  if (score >= 85) return { label: 'ULTRA',      color: '#ff6b35' };
  if (score >= 70) return { label: 'HIGH-END',   color: '#f59e0b' };
  if (score >= 55) return { label: 'SOLID',      color: '#3b82f6' };
  if (score >= 35) return { label: 'MID-RANGE',  color: '#22c55e' };
  if (score >= 15) return { label: 'BUDGET',     color: '#94a3b8' };
  return                 { label: 'EMPTY RIG',   color: '#334155' };
}

let _ratingTimer = null;

function animateRigRating(target) {
  const el    = document.getElementById('rigRatingValue');
  const arc   = document.getElementById('rigRatingArc');
  const badge = document.getElementById('rigRatingBadge');
  if (!el || !arc) return;

  const { label, color } = getRigLabel(target);
  let cur = parseInt(el.textContent) || 0;

  clearInterval(_ratingTimer);
  if (cur === target) { _setRating(target, label, color, el, arc, badge); return; }

  const step = target > cur ? 1 : -1;
  const circ = 2 * Math.PI * 42;

  _ratingTimer = setInterval(() => {
    cur += step;
    arc.style.strokeDasharray  = circ;
    arc.style.strokeDashoffset = circ * (1 - cur / 100);
    arc.style.stroke           = color;
    el.textContent = cur;
    el.style.color = color;
    if (cur === target) {
      clearInterval(_ratingTimer);
      _setRating(target, label, color, el, arc, badge);
    }
  }, 12);
}

function _setRating(score, label, color, el, arc, badge) {
  el.textContent        = score;
  el.style.color        = color;
  badge.textContent     = label;
  badge.style.color     = color;
  badge.style.borderColor = color + '44';
  badge.style.background  = color + '11';
}


//  power meter 

function updatePowerMeter(build) {
  const cpu = build.CPU ? getProduct(build.CPU) : null;
  const gpu = build.GPU ? getProduct(build.GPU) : null;
  const psu = build.PSU ? getProduct(build.PSU) : null;

  const draw   = (cpu?.tdp || 0) + (gpu?.power || 0) + 75;
  const cap    = psu?.wattage || 0;
  const pct    = cap > 0 ? Math.min(100, (draw / cap) * 100) : 0;
  const color  = pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#22c55e';

  const fill = document.getElementById('powerFill');
  fill.style.width      = pct + '%';
  fill.style.background = color;

  document.getElementById('powerDraw').textContent = draw + 'W draw';
  document.getElementById('powerPSU').textContent  = cap ? cap + 'W PSU' : 'No PSU';
  document.getElementById('powerPct').textContent  = cap ? Math.round(pct) + '% load' : '—';
  document.getElementById('powerPct').style.color  = color;
}


//  compare 

let compareList = [];

function toggleCompare(productId, btn) {
  const i = compareList.indexOf(productId);
  if (i === -1) {
    if (compareList.length >= 3) { showToast('Max 3 products', 'error'); return; }
    compareList.push(productId);
    btn.classList.add('comparing');
    btn.textContent = 'Comparing';
  } else {
    compareList.splice(i, 1);
    btn.classList.remove('comparing');
    btn.textContent = 'Compare';
  }
  _updateCompareBar();
}

function _updateCompareBar() {
  const bar = document.getElementById('compareBar');
  if (!bar) return;
  if (!compareList.length) { bar.classList.remove('show'); return; }
  bar.classList.add('show');
  document.getElementById('compareChips').innerHTML = compareList.map(id => {
    const p = getProduct(id);
    return p ? `<span class="compare-chip">${p.name}<button onclick="removeCompare('${id}')"></button></span>` : '';
  }).join('');
  document.getElementById('compareCount').textContent = compareList.length + ' selected';
}

function removeCompare(id) {
  compareList = compareList.filter(x => x !== id);
  document.querySelectorAll('.compare-btn').forEach(btn => {
    if (btn.dataset.pid === id) { btn.classList.remove('comparing'); btn.textContent = 'Compare'; }
  });
  _updateCompareBar();
}

function openCompareModal() {
  if (compareList.length < 2) { showToast('Pick at least 2 to compare', 'error'); return; }
  const products = compareList.map(id => getProduct(id)).filter(Boolean);

  let html = '<div class="compare-table">';
  html += '<div class="compare-row compare-header"><div class="compare-cell compare-label">—</div>';
  products.forEach(p => {
    html += `<div class="compare-cell compare-product-head">
      <div class="compare-pname">${p.name}</div>
      <button class="btn-sm-add" onclick="addToCart('${p.id}');document.getElementById('compareModal').classList.remove('open')">Add to Cart</button>
    </div>`;
  });
  html += '</div>';

  [['Price', p => '₱' + (p.price * 57).toLocaleString()], ['Category', p => p.cat], ['Specs', p => p.specs]].forEach(([label, fn]) => {
    html += `<div class="compare-row"><div class="compare-cell compare-label">${label}</div>`;
    products.forEach(p => { html += `<div class="compare-cell">${fn(p) || '—'}</div>`; });
    html += '</div>';
  });
  html += '</div>';

  document.getElementById('compareModalBody').innerHTML = html;
  document.getElementById('compareModal').classList.add('open');
}




//  wishlist 

let _wishlist = (function () {
  try { return JSON.parse(localStorage.getItem('nexus_wishlist') || '[]'); }
  catch { return []; }
})();

function toggleWishlist(productId, btn) {
  /*  Require login  */
  if (typeof getCurrentUser === 'function' && !getCurrentUser()) {
    if (typeof openLoginModal === 'function') openLoginModal();
    showToast('Sign in to save items to your wishlist', 'error');
    return;
  }
  const i = _wishlist.indexOf(productId);
  if (i === -1) {
    _wishlist.push(productId);
    btn.classList.add('wishlisted');
    btn.title = 'Remove from wishlist';
    /* Switch SVG to filled heart */
    const svg = btn.querySelector('svg');
    if (svg) svg.setAttribute('fill', 'currentColor');
    showToast('Saved to wishlist', 'success');
  } else {
    _wishlist.splice(i, 1);
    btn.classList.remove('wishlisted');
    btn.title = 'Save to wishlist';
    /* Switch SVG to outline heart */
    const svg = btn.querySelector('svg');
    if (svg) svg.setAttribute('fill', 'none');
    showToast('Removed from wishlist', 'info');
  }
  try { localStorage.setItem('nexus_wishlist', JSON.stringify(_wishlist)); } catch {}
  /* Update nav badge if wishlist.js is loaded */
  if (typeof _updateWishlistBadge === 'function') _updateWishlistBadge();
}

function isWishlisted(id) {
  return _wishlist.includes(id);
}


//  flash deals 

function getDailyDeals() {
  const seed = Math.floor(Date.now() / (6 * 60 * 60 * 1000));
  const rng  = x => { x = ((seed * x) ^ (x << 13)) >>> 0; return (x % 1000) / 1000; };
  const pool = PRODUCTS.filter(p => p.price > 100);
  const picks = [], used = new Set();
  for (let i = 0; picks.length < 3 && i < 200; i++) {
    const idx = Math.floor(rng(i + 1) * pool.length);
    if (!used.has(idx)) { used.add(idx); picks.push(pool[idx]); }
  }
  return picks.map((p, i) => {
    const pct = [0.12, 0.18, 0.22][i];
    return { product: p, pct, salePrice: Math.round(p.price * (1 - pct)) };
  });
}

function renderDeals() {
  const el = document.getElementById('dealCards');
  if (!el) return;
  el.innerHTML = getDailyDeals().map(d => `
    <div class="deal-card">
      <div class="deal-badge">${Math.round(d.pct * 100)}% OFF</div>
      <div class="deal-cat-label">${d.product.cat}</div>
      <div class="deal-name">${d.product.name}</div>
      <div class="deal-prices">
        <span class="deal-was">₱${(d.product.price * 57).toLocaleString()}</span>
        <span class="deal-now">₱${(d.salePrice * 57).toLocaleString()}</span>
      </div>
      <button class="btn-deal" onclick="addToCart('${d.product.id}')">Grab Deal →</button>
    </div>`).join('');
  _dealTimer();
}

function _dealTimer() {
  const tick = () => {
    const now  = Date.now();
    const next = (Math.floor(now / (6 * 60 * 60 * 1000)) + 1) * 6 * 60 * 60 * 1000;
    const diff = Math.max(0, next - now);
    const h    = Math.floor(diff / 3600000);
    const m    = Math.floor((diff % 3600000) / 60000);
    const s    = Math.floor((diff % 60000) / 1000);
    const el   = document.getElementById('dealTimer');
    if (el) el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };
  tick();
  setInterval(tick, 1000);
}



//  sort 

let currentSort = 'default';

function setSort(val) {
  currentSort = val;
  renderStore();
}

function applySortFilter(items) {
  if (currentSort === 'price-asc')  return [...items].sort((a, b) => a.price - b.price);
  if (currentSort === 'price-desc') return [...items].sort((a, b) => b.price - a.price);
  if (currentSort === 'name')       return [...items].sort((a, b) => a.name.localeCompare(b.name));
  if (currentSort === 'wishlist')   return items.filter(p => _wishlist.includes(p.id));
  return items;
}
