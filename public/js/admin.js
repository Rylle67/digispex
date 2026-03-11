/* ============================================================
   DigiSpex — admin.js  (API-backed version)
   Inventory · Add Product · Orders · Audit Trail · Packages
   All data is now stored in PostgreSQL via DS_API.admin.*
============================================================ */
'use strict';

/* ── in-memory state ── */
let _stock   = {};    // { productId: { status, qty } }
let _customs = [];    // custom products array
let _images  = {};    // { productId: base64/url }
let _hidden  = [];    // hidden built-in product ids
let selected = new Set();
let filtered = [];

const SLOT_KEYS   = ['CPU','GPU','Motherboard','RAM','Storage','PSU','Cooling','Case'];
const SLOT_LABELS = { CPU:'Processor', GPU:'Graphics Card', Motherboard:'Motherboard',
                      RAM:'Memory', Storage:'Storage', PSU:'Power Supply',
                      Cooling:'CPU Cooler', Case:'Case' };

/* ── helpers ── */
function getStatus(id)   { return (_stock[id]?.status) || 'normal'; }
function getCustomProducts() { return _customs; }
function getCustomImages()   { return _images; }

function allProducts() {
  const base = _hidden.length ? PRODUCTS.filter(p => !_hidden.includes(p.id)) : PRODUCTS;
  return [...base, ..._customs];
}

/* ── TABS ── */
function switchTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  ['panelInventory','panelAddProduct','panelOrders','panelAudit','panelPackages'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const panelEl = document.getElementById('panel' + tab.charAt(0).toUpperCase() + tab.slice(1));
  if (panelEl) panelEl.style.display = '';
  if (tab === 'orders')   renderOrders();
  if (tab === 'audit')    renderAudit();
  if (tab === 'packages') adminRenderPackages();
}

/* ================================================================
   PANEL 1 — INVENTORY
================================================================ */
function renderTable() {
  const q      = document.getElementById('searchInput').value.toLowerCase();
  const cat    = document.getElementById('catFilter').value;
  const status = document.getElementById('statusFilter').value;

  filtered = allProducts().filter(p => {
    const mQ = !q || p.name.toLowerCase().includes(q) || p.specs.toLowerCase().includes(q);
    const mC = cat === 'All' || p.cat === cat;
    const mS = status === 'All' || getStatus(p.id) === status;
    return mQ && mC && mS;
  });

  const tbody = document.getElementById('tableBody');
  if (!filtered.length) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No products match your filters.</td></tr>';
    renderStats(); return;
  }

  tbody.innerHTML = filtered.map(p => {
    const st       = getStatus(p.id);
    const php      = Math.round(p.price * 57);
    const salePHP  = Math.round(php * 0.85);
    const isChecked = selected.has(p.id);
    const isCustom  = _customs.some(c => c.id === p.id);
    const imgSrc    = _images[p.id];

    const priceHtml = st === 'sale'
      ? `<span class="price-orig">&#8369;${php.toLocaleString()}</span><span class="price-sale">&#8369;${salePHP.toLocaleString()}</span>`
      : `&#8369;${php.toLocaleString()}`;

    const statusLabels = { normal:'In Stock', sale:'On Sale', lowstock:'Low Stock', outofstock:'Out of Stock' };
    const dotLabel = '&#9679; ' + (statusLabels[st] || 'In Stock');

    const thumb = imgSrc
      ? `<img src="${imgSrc}" style="width:36px;height:36px;object-fit:cover;border-radius:6px;display:block;">`
      : `<div style="width:36px;height:36px;border-radius:6px;background:var(--s2);display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:0.48rem;font-weight:700;text-transform:uppercase;color:var(--accent);letter-spacing:0.5px;text-align:center;line-height:1.2">${p.cat.slice(0,3)}</div>`;

    return `<tr id="row-${p.id}" class="${isChecked?'selected':''}">
      <td><input type="checkbox" data-id="${p.id}" ${isChecked?'checked':''} onchange="toggleRow('${p.id}',this)"></td>
      <td>
        <div style="display:flex;align-items:center;gap:0.65rem">
          ${thumb}
          <div>
            <div class="prod-name">${p.name}${isCustom?` <span style="font-size:0.56rem;padding:1px 5px;border-radius:3px;background:rgba(0,212,255,0.1);color:var(--accent);font-family:'JetBrains Mono',monospace;letter-spacing:0.5px;vertical-align:middle">CUSTOM</span>`:''}</div>
            <div class="prod-specs">${p.specs.length>65?p.specs.slice(0,65)+'…':p.specs}</div>
          </div>
        </div>
      </td>
      <td><span class="cat-tag">${p.cat}</span></td>
      <td class="price-col">${priceHtml}</td>
      <td>
        <div class="inv-qty-cell" id="qty-cell-${p.id}">${_renderQtyCell(p.id)}</div>
      </td>
      <td><span class="status-badge ${st}"><span class="status-dot"></span>${dotLabel}</span></td>
      <td>
        <div class="row-actions" data-id="${p.id}" data-name="${p.name.replace(/"/g,'&quot;')}">
          <button class="btn-action btn-normal" onclick="rowAct(this,'normal')"   ${st==='normal'    ?'disabled':''}>In Stock</button>
          <button class="btn-action btn-low"    onclick="rowAct(this,'lowstock')" ${st==='lowstock'  ?'disabled':''}>Low Stock</button>
          <button class="btn-action btn-oos"    onclick="rowAct(this,'outofstock')" ${st==='outofstock'?'disabled':''}>OOS</button>
          <button class="btn-action btn-sale"   onclick="rowAct(this,'sale')"     ${st==='sale'      ?'disabled':''}>Sale</button>
          <button class="btn-action btn-img"    onclick="rowActImg(this)">Image</button>
          <button class="btn-action btn-del"    onclick="rowActDel(this)" title="Delete product">Del</button>
        </div>
      </td>
    </tr>`;
  }).join('');

  renderStats();
  updateSelCount();
}

function _rowData(btn) {
  const div = btn.closest('.row-actions');
  return { id: div.dataset.id, name: div.dataset.name };
}
function rowAct(btn, status)    { const { id, name } = _rowData(btn); setStatus(id, status, name); }
function rowActImg(btn)         { const { id, name } = _rowData(btn); openChangeImage(id, name); }
function rowActDel(btn)         { const { id } = _rowData(btn); deleteCustomProduct(id); }

function renderStats() {
  const saleCount = Object.values(_stock).filter(v => v?.status === 'sale').length;
  const lowCount  = Object.values(_stock).filter(v => v?.status === 'lowstock').length;
  const oosCount  = Object.values(_stock).filter(v => v?.status === 'outofstock').length;
  const total     = allProducts().length;
  document.getElementById('statTotal').textContent  = total;
  document.getElementById('statNormal').textContent = total - saleCount - lowCount - oosCount;
  document.getElementById('statSale').textContent   = saleCount;
  document.getElementById('statLow').textContent    = lowCount;
  document.getElementById('statOOS').textContent    = oosCount;
  _updateRestockBanner();
  const restoreBtn = document.getElementById('restoreHiddenBtn');
  if (restoreBtn) {
    restoreBtn.style.display = _hidden.length > 0 ? '' : 'none';
    if (_hidden.length > 0) restoreBtn.textContent = 'Restore Hidden (' + _hidden.length + ')';
  }
}

function _renderQtyCell(productId) {
  if (typeof INVENTORY === 'undefined') return '<span style="color:var(--text3);font-size:0.7rem">N/A</span>';
  const qty = INVENTORY.getQty(productId);
  if (qty === null) return '<span style="color:var(--text3);font-size:0.7rem">N/A</span>';
  const cls = qty === 0 ? 'qty-oos' : qty <= INVENTORY.getLowStockThreshold() ? 'qty-low' : 'qty-ok';
  return `<span class="inv-qty-badge ${cls}" id="qbadge-${productId}">${qty}</span>
    <button class="inv-qty-edit-btn" onclick="openQtyEditor('${productId}')" title="Edit quantity">Edit</button>`;
}

function openQtyEditor(productId) {
  const cell = document.getElementById('qty-cell-' + productId);
  if (!cell) return;
  const current = typeof INVENTORY !== 'undefined' ? (INVENTORY.getQty(productId) ?? 0) : 0;
  cell.innerHTML = `
    <div class="inv-qty-editor">
      <input type="number" class="inv-qty-input" id="qinput-${productId}"
             value="${current}" min="0" max="9999"
             onkeydown="if(event.key==='Enter')saveQty('${productId}');if(event.key==='Escape')cancelQtyEdit('${productId}')">
      <button class="inv-qty-save-btn"   onclick="saveQty('${productId}')">Save</button>
      <button class="inv-qty-cancel-btn" onclick="cancelQtyEdit('${productId}')">Cancel</button>
    </div>`;
  const input = document.getElementById('qinput-' + productId);
  if (input) { input.focus(); input.select(); }
}

function saveQty(productId) {
  const input = document.getElementById('qinput-' + productId);
  if (!input) return;
  const newQty = Math.max(0, parseInt(input.value, 10) || 0);
  if (typeof INVENTORY !== 'undefined') INVENTORY.setQty(productId, newQty);
  const cell = document.getElementById('qty-cell-' + productId);
  if (cell) cell.innerHTML = _renderQtyCell(productId);
  renderTable();
  showToast('Stock updated: ' + newQty + ' units');
}

function cancelQtyEdit(productId) {
  const cell = document.getElementById('qty-cell-' + productId);
  if (cell) cell.innerHTML = _renderQtyCell(productId);
}

function _updateRestockBanner() {
  const banner = document.getElementById('invRestockBanner');
  if (!banner || typeof INVENTORY === 'undefined') return;
  const products = allProducts();
  const oosCount = products.filter(p => INVENTORY.getQty(p.id) === 0).length;
  if (oosCount > 0) {
    banner.classList.add('visible');
    const countEl = banner.querySelector('.inv-restock-count');
    if (countEl) countEl.textContent = oosCount;
  } else {
    banner.classList.remove('visible');
  }
}

async function setStatus(productId, status, productName) {
  try {
    await DS_API.admin.setStock(productId, status, 0, productName);
    // Update local cache
    if (status === 'normal') delete _stock[productId];
    else _stock[productId] = { status, qty: 0 };
    if (typeof INVENTORY !== 'undefined') {
      if (status === 'outofstock') {
        INVENTORY.setQty(productId, 0);
      } else if (status === 'normal') {
        const current = INVENTORY.getQty(productId);
        if (current === 0) INVENTORY.setQty(productId, INVENTORY.getLowStockThreshold() * 2 + 1);
      }
    }
    renderTable();
    const labels = { normal:'marked In Stock', sale:'marked On Sale', lowstock:'marked Low Stock', outofstock:'marked Out of Stock' };
    showToast(' ' + (productName || productId) + ' ' + (labels[status]||status));
  } catch(e) { showToast('Error updating status: ' + e.message, 'error'); }
}

async function bulkSet(status) {
  if (!selected.size) { showToast('Select products first'); return; }
  try {
    await DS_API.admin.bulkSetStock([...selected], status, allProducts());
    selected.forEach(id => {
      if (status === 'normal') delete _stock[id];
      else _stock[id] = { status, qty: 0 };
    });
    const labels = { normal:'reset to In Stock', sale:'on sale', lowstock:'low stock', outofstock:'out of stock' };
    showToast(' ' + selected.size + ' product(s) marked ' + (labels[status]||status));
    selected.clear();
    renderTable();
  } catch(e) { showToast('Error: ' + e.message); }
}

function toggleRow(id, cb) {
  cb.checked ? selected.add(id) : selected.delete(id);
  const row = document.getElementById('row-' + id);
  if (row) row.classList.toggle('selected', cb.checked);
  updateSelCount();
}

function toggleAll(masterCb) {
  filtered.forEach(p => {
    masterCb.checked ? selected.add(p.id) : selected.delete(p.id);
    const row = document.getElementById('row-' + p.id);
    const cb  = row && row.querySelector('input[type=checkbox]');
    if (cb)  cb.checked = masterCb.checked;
    if (row) row.classList.toggle('selected', masterCb.checked);
  });
  updateSelCount();
}

function updateSelCount() {
  document.getElementById('selCount').textContent =
    selected.size ? selected.size + ' selected' : '0 selected';
}

async function deleteCustomProduct(id) {
  const isCustom = _customs.some(p => p.id === id);
  const allP = allProducts();
  const name = (allP.find(p => p.id === id) || {}).name || id;

  if (isCustom) {
    if (!confirm('Permanently delete "' + name + '"? This cannot be undone.')) return;
    try {
      await DS_API.admin.deleteProduct(id);
      _customs = _customs.filter(p => p.id !== id);
      delete _images[id];
      renderTable();
      renderRecentList();
      showToast('Product deleted');
    } catch(e) { showToast('Error: ' + e.message); }
  } else {
    if (!confirm('Hide "' + name + '" from the store? You can restore it by clearing the hidden list.')) return;
    try {
      await DS_API.admin.hideProduct(id);
      if (!_hidden.includes(id)) _hidden.push(id);
      renderTable();
      renderStats();
      showToast('Product hidden from store');
    } catch(e) { showToast('Error: ' + e.message); }
  }
}

/* ================================================================
   PANEL 2 — ADD PRODUCT
================================================================ */
let newImgBase64 = null;

function setupAddProduct() {
  const zone  = document.getElementById('imgUploadZone');
  const input = document.getElementById('imgFileInput');
  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor='var(--accent)'; });
  zone.addEventListener('dragleave', () => { zone.style.borderColor=''; });
  zone.addEventListener('drop', e => { e.preventDefault(); zone.style.borderColor=''; if (e.dataTransfer.files[0]) processImageFile(e.dataTransfer.files[0]); });
  input.addEventListener('change', () => { if (input.files[0]) processImageFile(input.files[0]); });
  ['apName','apPricePHP','apSpecs'].forEach(id => document.getElementById(id).addEventListener('input', updatePreview));

  document.getElementById('apCat').addEventListener('change', function() {
    const isLaptop = this.value === 'Laptop';
    const urlGroup = document.getElementById('apImageUrlGroup');
    if (urlGroup) urlGroup.style.display = isLaptop ? '' : 'none';
    updatePreview();
  });

  document.getElementById('apImageUrl').addEventListener('input', function() {
    const preview = document.getElementById('apImageUrlPreview');
    const img     = document.getElementById('apImageUrlImg');
    const url     = this.value.trim();
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      img.src = url;
      img.onerror = function() { preview.style.display = 'none'; };
      img.onload  = function() { preview.style.display = ''; };
    } else {
      preview.style.display = 'none';
    }
    updatePreview();
  });

  renderRecentList();
  updatePreview();
}

function processImageFile(file) {
  if (!file.type.startsWith('image/')) { showToast('Please select an image file'); return; }
  if (file.size > 4 * 1024 * 1024)    { showToast('Image must be under 4 MB');     return; }
  const reader = new FileReader();
  reader.onload = e => {
    newImgBase64 = e.target.result;
    const zone = document.getElementById('imgUploadZone');
    zone.classList.add('has-img');
    zone.innerHTML = `<div class="upload-img-wrap"><img src="${newImgBase64}" alt="preview" style="max-width:100%;max-height:140px;object-fit:contain;border-radius:6px;display:block;margin:0 auto"></div><button class="btn-remove-img" onclick="removeNewImage(event)">Remove image</button>`;
    updatePreview();
  };
  reader.readAsDataURL(file);
}

function removeNewImage(e) {
  e.stopPropagation();
  newImgBase64 = null;
  const zone = document.getElementById('imgUploadZone');
  zone.classList.remove('has-img');
  zone.innerHTML = `<div class="upload-icon">&#128444;</div><div class="upload-label">Click or drag image here</div><div class="upload-hint">JPG, PNG, WebP — max 4 MB</div>`;
  updatePreview();
}

function updatePreview() {
  const name    = (document.getElementById('apName').value   || '').trim();
  const cat     = document.getElementById('apCat').value     || '';
  const php     = parseFloat(document.getElementById('apPricePHP').value) || 0;
  const specs   = (document.getElementById('apSpecs').value  || '').trim();
  const imgEl   = document.getElementById('previewImg');
  const _prevUrl = (document.getElementById('apImageUrl')?.value || '').trim();
  if (newImgBase64) {
    imgEl.innerHTML = `<img src="${newImgBase64}" alt="preview" style="width:100%;height:100%;object-fit:cover;border-radius:6px">`;
  } else if (_prevUrl) {
    imgEl.innerHTML = `<img src="${_prevUrl}" alt="preview" style="width:100%;height:100%;object-fit:cover;border-radius:6px" onerror="this.parentElement.innerHTML=cat||'PRODUCT'">`;
  } else {
    imgEl.innerHTML = cat || 'PRODUCT';
  }
  document.getElementById('previewName').textContent  = name  || 'Product Name';
  document.getElementById('previewCat').textContent   = cat   || 'Category';
  document.getElementById('previewSpecs').textContent = specs || 'Specifications will appear here';
  document.getElementById('previewPrice').textContent = php > 0 ? '₱' + Math.round(php).toLocaleString() : '₱0';
}

async function submitAddProduct(e) {
  e.preventDefault();
  const name  = document.getElementById('apName').value.trim();
  const cat   = document.getElementById('apCat').value;
  const php   = parseFloat(document.getElementById('apPricePHP').value);
  const specs = document.getElementById('apSpecs').value.trim();
  const desc  = document.getElementById('apDesc').value.trim();
  if (!name)          { showToast('Enter a product name');  return; }
  if (!cat)           { showToast('Select a category');     return; }
  if (!php || php<=0) { showToast('Enter a valid price');   return; }
  if (!specs)         { showToast('Enter specifications');  return; }

  const id   = 'custom_' + Date.now();
  const prod = { id, name, cat, price: +(php/57).toFixed(4), specs };
  const _imgUrlInput = (document.getElementById('apImageUrl')?.value || '').trim();
  const imgToSave = newImgBase64 || (_imgUrlInput && cat === 'Laptop' ? _imgUrlInput : null);

  try {
    await DS_API.admin.saveProduct(prod, imgToSave, desc || null);
    _customs.push(prod);
    if (imgToSave) _images[id] = imgToSave;
    showToast(name + ' added to store!');
    resetAddForm();
    renderRecentList();
    renderStats();
  } catch(e) { showToast('Error adding product: ' + e.message); }
}

function resetAddForm() {
  document.getElementById('addProductForm').reset();
  newImgBase64 = null;
  const zone = document.getElementById('imgUploadZone');
  zone.classList.remove('has-img');
  zone.innerHTML = `<div class="upload-icon">&#128444;</div><div class="upload-label">Click or drag image here</div><div class="upload-hint">JPG, PNG, WebP — max 4 MB</div>`;
  const urlGroup = document.getElementById('apImageUrlGroup');
  const urlPrev  = document.getElementById('apImageUrlPreview');
  if (urlGroup) urlGroup.style.display = 'none';
  if (urlPrev)  urlPrev.style.display  = 'none';
  updatePreview();
}

function renderRecentList() {
  const el = document.getElementById('recentList');
  if (!_customs.length) {
    el.innerHTML = '<div style="font-size:0.78rem;color:var(--text3);padding:0.5rem 0">No custom products added yet.</div>';
    return;
  }
  el.innerHTML = [..._customs].reverse().slice(0, 8).map(p => {
    const imgSrc = _images[p.id];
    const thumb  = imgSrc
      ? `<div class="recent-thumb"><img src="${imgSrc}" alt="${p.name}"></div>`
      : `<div class="recent-thumb">${p.cat.slice(0,3)}</div>`;
    return `<div class="recent-item">${thumb}<div class="recent-info"><div class="recent-name">${p.name}</div><div class="recent-price">&#8369;${Math.round(p.price*57).toLocaleString()}</div></div><button class="btn-recent-del" onclick="deleteCustomProduct('${p.id}')">&#x2715;</button></div>`;
  }).join('');
}

/* ================================================================
   PANEL 3 — ORDERS
================================================================ */
async function renderOrders() {
  const tbody = document.getElementById('ordersTableBody');
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text3);padding:2rem">Loading orders…</td></tr>';
  try {
    const allOrders = await DS_API.orders.getAll();
    const proc      = allOrders.filter(o => o.status === 'processing').length;
    const shipped   = allOrders.filter(o => o.status === 'shipped').length;
    const delivered = allOrders.filter(o => o.status === 'delivered').length;

    document.getElementById('orderStatTotal').textContent     = allOrders.length;
    document.getElementById('orderStatProc').textContent      = proc;
    document.getElementById('orderStatShipped').textContent   = shipped;
    document.getElementById('orderStatDelivered').textContent = delivered;

    if (!allOrders.length) {
      tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No orders placed yet.</td></tr>';
      return;
    }

    const STATUS_LIST = ['processing', 'shipped', 'delivered', 'cancelled'];
    tbody.innerHTML = allOrders.map(o => {
      const st = o.status || 'processing';
      const customer = typeof o.customer === 'object' ? (o.customer?.name || '—') : (o.customer || '—');
      const items = Array.isArray(o.items) ? o.items : [];
      const itemPreview = items.slice(0, 2)
        .map(i => (i.name||i.productId) + (i.qty > 1 ? ' ×' + i.qty : '')).join(', ')
        + (items.length > 2 ? ' +' + (items.length - 2) + ' more' : '');

      const statusBtns = STATUS_LIST.map(s => {
        const cls = { processing:'btn-ord-proc', shipped:'btn-ord-ship',
                      delivered:'btn-ord-delv', cancelled:'btn-ord-canc' }[s];
        return `<button class="btn-action ${cls}" onclick="setOrderStatus('${o.id}','${s}')" ${st === s ? 'disabled' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</button>`;
      }).join('');

      return `<tr id="orow-${o.id}">
        <td>
          <div class="order-id-cell">${o.id || '—'}</div>
          <div class="order-date-cell">${o.date ? new Date(o.date).toLocaleDateString('en-PH') : ''}</div>
        </td>
        <td><div class="order-cust-cell">${customer}</div></td>
        <td>
          <div class="order-items-cell">${itemPreview || '—'}</div>
          <div class="order-count-cell">${items.length} item(s)</div>
        </td>
        <td><span class="order-total-cell">&#8369;${o.total || '0'}</span></td>
        <td><span class="ot-status ${st}">${st}</span></td>
        <td>
          <div class="order-row-actions">
            ${statusBtns}
            <button class="btn-admin-chat" onclick="openAdminChat('${o.id}','${o.userUid || ''}')"> Chat</button>
            <button class="btn-action btn-ord-del" onclick="deleteOrder('${o.id}')">Delete</button>
          </div>
        </td>
      </tr>`;
    }).join('');
  } catch(e) {
    tbody.innerHTML = '<tr><td colspan="6" style="color:var(--red);padding:1rem">Failed to load orders: ' + e.message + '</td></tr>';
  }
}

async function setOrderStatus(orderId, newStatus) {
  try {
    await DS_API.orders.updateStatus(orderId, newStatus);
    if (typeof NOTIFY !== 'undefined') {
      NOTIFY.pushOrderStatus(orderId, newStatus, null);
    }
    renderOrders();
    showToast('Order ' + orderId + ' marked ' + newStatus);
  } catch(e) { showToast('Error: ' + e.message); }
}

async function deleteOrder(orderId) {
  if (!confirm('Permanently delete order ' + orderId + '? This cannot be undone.')) return;
  try {
    await DS_API.orders.delete(orderId);
    renderOrders();
    showToast('Order ' + orderId + ' deleted');
  } catch(e) { showToast('Error: ' + e.message); }
}

/* ================================================================
   PANEL 4 — AUDIT TRAIL
================================================================ */
async function renderAudit() {
  const el = document.getElementById('auditList');
  el.innerHTML = '<div class="audit-empty">Loading…</div>';
  try {
    const log = await DS_API.admin.getAudit();
    const typeFilter = document.getElementById('auditTypeFilter')?.value || 'all';
    const filteredLog = typeFilter === 'all' ? log : log.filter(e => e.type === typeFilter);

    if (!filteredLog.length) {
      el.innerHTML = '<div class="audit-empty">No audit entries yet.</div>';
      return;
    }

    el.innerHTML = filteredLog.map(entry => {
      const ts = entry.ts ? new Date(entry.ts) : null;
      const timeStr = ts ? ts.toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'}) + ' ' + ts.toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'}) : '—';
      let iconClass = entry.type || 'status_change';
      const _isOrderEvt = entry.type === 'order_placed' || entry.type === 'order_status_change' || entry.type === 'order_deleted';
      let iconChar = _isOrderEvt ? '' : entry.type === 'product_added' ? '&#43;' : '&#8644;';
      let actionHtml = '', detailHtml = '';
      if (entry.type === 'status_change') {
        const oldColor = { normal:'var(--green)', lowstock:'var(--orange)', outofstock:'var(--red)', sale:'var(--yellow)' }[entry.oldStatus] || 'var(--text3)';
        const newColor = { normal:'var(--green)', lowstock:'var(--orange)', outofstock:'var(--red)', sale:'var(--yellow)' }[entry.newStatus] || 'var(--text3)';
        actionHtml = `Status changed <span class="audit-type-badge badge-status">INVENTORY</span>`;
        detailHtml = `${entry.productName||entry.productId} &nbsp;&#8212;&nbsp; <span style="color:${oldColor}">${entry.oldStatus||'normal'}</span> <span class="status-arrow">&#8594;</span> <span style="color:${newColor}">${entry.newStatus||'?'}</span>`;
      } else if (entry.type === 'order_placed') {
        actionHtml = `Order placed <span class="audit-type-badge badge-order">ORDER</span>`;
        detailHtml = `${entry.orderId||'—'} &nbsp;&#8212;&nbsp; ${entry.customer||'Guest'} &nbsp;&#8212;&nbsp; &#8369;${entry.total||'0'}`;
      } else if (entry.type === 'order_status_change') {
        const sColor = { processing:'var(--orange)', shipped:'var(--accent)', delivered:'var(--green)', cancelled:'var(--red)' }[entry.newStatus] || 'var(--text3)';
        actionHtml = `Order status updated <span class="audit-type-badge badge-order">ORDER</span>`;
        detailHtml = `${entry.orderId||'—'} &nbsp;&#8212;&nbsp; <span style="color:${sColor}">${entry.newStatus||'?'}</span>`;
      } else if (entry.type === 'order_deleted') {
        actionHtml = `Order deleted <span class="audit-type-badge badge-del">ORDER</span>`;
        detailHtml = `${entry.orderId||'—'}`;
      } else if (entry.type === 'product_added') {
        const verb = entry.extra?.action === 'deleted' ? 'deleted' : 'added';
        actionHtml = `Product ${verb} <span class="audit-type-badge badge-product">PRODUCT</span>`;
        detailHtml = `${entry.productName||entry.productId}`;
      } else {
        actionHtml = entry.type || 'Unknown action';
        detailHtml = JSON.stringify(entry).slice(0,80);
      }

      return `<div class="audit-entry">
        <div class="audit-icon ${iconClass}">${iconChar}</div>
        <div class="audit-meta">
          <div class="audit-action">${actionHtml}</div>
          <div class="audit-detail">${detailHtml}</div>
        </div>
        <div class="audit-ts">${timeStr}</div>
      </div>`;
    }).join('');
  } catch(e) {
    el.innerHTML = '<div class="audit-empty">Failed to load audit log: ' + e.message + '</div>';
  }
}

async function clearAuditLog() {
  if (!confirm('Clear the entire audit log? This cannot be undone.')) return;
  try {
    await DS_API.admin.clearAudit();
    renderAudit();
    showToast('Audit log cleared');
  } catch(e) { showToast('Error: ' + e.message); }
}

/* ================================================================
   CHANGE PRODUCT IMAGE
================================================================ */
function openChangeImage(productId, productName) {
  const modal = document.getElementById('changeImageModal');
  document.getElementById('changeImgProductName').textContent = productName;
  document.getElementById('changeImgProductId').value = productId;
  document.getElementById('changeImgPreview').src = '';
  document.getElementById('changeImgPreview').style.display = 'none';
  document.getElementById('changeImgPlaceholder').style.display = 'flex';
  document.getElementById('changeImgFileInput').value = '';
  document.getElementById('changeImgNewBase64').value = '';
  modal.classList.add('open');
}

function closeChangeImage() { document.getElementById('changeImageModal').classList.remove('open'); }

function changeImgFileSelected(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 4 * 1024 * 1024) { showToast('Image too large — max 4 MB', 'error'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    const b64 = e.target.result;
    document.getElementById('changeImgNewBase64').value = b64;
    document.getElementById('changeImgPreview').src = b64;
    document.getElementById('changeImgPreview').style.display = 'block';
    document.getElementById('changeImgPlaceholder').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

async function confirmChangeImage() {
  const id  = document.getElementById('changeImgProductId').value;
  const b64 = document.getElementById('changeImgNewBase64').value;
  if (!b64) { showToast('Please select an image first', 'error'); return; }
  try {
    await DS_API.admin.saveImage(id, b64);
    _images[id] = b64;
    closeChangeImage();
    renderTable();
    showToast('Image updated successfully', 'success');
  } catch(e) { showToast('Error: ' + e.message); }
}

async function removeProductImage(productId) {
  if (!confirm('Remove the custom image for this product?')) return;
  try {
    await DS_API.admin.deleteImage(productId);
    delete _images[productId];
    closeChangeImage();
    renderTable();
    showToast('Image removed', 'success');
  } catch(e) { showToast('Error: ' + e.message); }
}

async function restoreHiddenProducts() {
  if (!confirm('Restore all hidden built-in products? They will reappear in the store.')) return;
  try {
    await DS_API.admin.clearHidden();
    _hidden = [];
    renderTable();
    renderStats();
    showToast('All hidden products restored');
  } catch(e) { showToast('Error: ' + e.message); }
}

/* ================================================================
   PANEL 5 — PACKAGES MANAGER
================================================================ */
let _adminPackages = [];
let _editPkgIdx = null;

async function adminGetPackages() {
  try {
    const saved = await DS_API.admin.getPackages();
    if (saved && saved.length) return saved;
  } catch(e) {}
  return typeof PACKAGES !== 'undefined' ? JSON.parse(JSON.stringify(PACKAGES)) : [];
}

async function adminSavePackages(pkgs) {
  await DS_API.admin.savePackages(pkgs);
  _adminPackages = pkgs;
}

async function adminResetPackages() {
  if (!confirm('Reset all packages to defaults? Your custom changes will be lost.')) return;
  try {
    const defaults = typeof PACKAGES !== 'undefined' ? JSON.parse(JSON.stringify(PACKAGES)) : [];
    await adminSavePackages(defaults);
    adminRenderPackages();
    showToast('Packages reset to defaults');
  } catch(e) { showToast('Error: ' + e.message); }
}

async function adminRenderPackages() {
  const el = document.getElementById('pkgAdminGrid');
  if (!el) return;
  _adminPackages = await adminGetPackages();
  const pkgs = _adminPackages;

  if (!pkgs.length) {
    el.innerHTML = '<div style="color:var(--text3);padding:2rem;text-align:center">No packages yet. Click + New Package to create one.</div>';
    return;
  }

  el.innerHTML = pkgs.map((pkg, idx) => {
    const slots = pkg.slots || {};
    const compRows = SLOT_KEYS.map(k => {
      if (!slots[k]) return '';
      const p = (typeof getProduct === 'function') ? getProduct(slots[k]) : null;
      const name = p ? p.name : slots[k];
      return `<div style="display:flex;justify-content:space-between;gap:.5rem;font-size:.72rem;padding:.18rem 0;border-bottom:1px solid var(--border)">
        <span style="color:var(--text3);min-width:80px;flex-shrink:0">${SLOT_LABELS[k]||k}</span>
        <span style="color:var(--text);text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${name}</span>
      </div>`;
    }).join('');

    const phpTotal = SLOT_KEYS.reduce((sum, k) => {
      if (!slots[k]) return sum;
      const p = (typeof getProduct === 'function') ? getProduct(slots[k]) : null;
      return sum + (p ? p.price * 57 : 0);
    }, 0);

    return `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:1.1rem;margin-bottom:1rem;border-left:3px solid ${pkg.color||'var(--accent)'}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.6rem;gap:.5rem;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:.5rem;flex-wrap:wrap">
          <span style="font-family:'Bebas Neue',sans-serif;font-size:1.15rem;letter-spacing:1px;color:var(--text)">${pkg.name}</span>
          <span style="font-size:.68rem;padding:2px 7px;border-radius:4px;background:var(--s2);color:var(--accent);font-family:'JetBrains Mono',monospace">${pkg.category}</span>
          ${pkg.featured ? '<span style="font-size:.65rem;padding:2px 7px;border-radius:4px;background:rgba(245,158,11,0.15);color:var(--yellow)">FEATURED</span>' : ''}
        </div>
        <div style="display:flex;gap:.4rem">
          <button class="btn-action btn-normal" onclick="adminOpenEditPkg(${idx})" style="font-size:.72rem;padding:.25rem .65rem">Edit</button>
          <button class="btn-action btn-del"    onclick="adminDeletePkg(${idx})"   style="font-size:.72rem;padding:.25rem .65rem">Delete</button>
        </div>
      </div>
      <div style="font-size:.76rem;color:var(--text3);margin-bottom:.6rem;font-style:italic">${pkg.tagline||''}</div>
      <div>${compRows}</div>
      <div style="font-size:.82rem;font-family:'JetBrains Mono',monospace;color:var(--accent);margin-top:.6rem">&#8369;${Math.round(phpTotal).toLocaleString()}</div>
    </div>`;
  }).join('');
}

function adminOpenNewPkg() {
  _editPkgIdx = null;
  document.getElementById('pkgEditModalTitle').textContent = 'New Package';
  document.getElementById('peditName').value    = '';
  document.getElementById('peditTagline').value = '';
  document.getElementById('peditCat').value     = 'Gaming';
  document.getElementById('peditFeatured').checked = false;
  _renderPeditSlots({});
  document.getElementById('pkgEditModal').classList.add('open');
}

function adminOpenEditPkg(idx) {
  const pkg = _adminPackages[idx];
  if (!pkg) return;
  _editPkgIdx = idx;
  document.getElementById('pkgEditModalTitle').textContent = 'Edit Package';
  document.getElementById('peditName').value    = pkg.name;
  document.getElementById('peditTagline').value = pkg.tagline || '';
  document.getElementById('peditCat').value     = pkg.category || 'Gaming';
  document.getElementById('peditFeatured').checked = !!pkg.featured;
  _renderPeditSlots(pkg.slots || {});
  document.getElementById('pkgEditModal').classList.add('open');
}

function closePkgEditModal() { document.getElementById('pkgEditModal').classList.remove('open'); }

function _renderPeditSlots(currentSlots) {
  const el = document.getElementById('peditSlots');
  if (!el) return;
  function opts(cat, selectedId) {
    const prods = (typeof getProductsByCategory === 'function') ? getProductsByCategory(cat) : [];
    return prods.map(p => `<option value="${p.id}" ${p.id === selectedId ? 'selected' : ''}>${p.name}</option>`).join('');
  }
  el.innerHTML = SLOT_KEYS.map(k => `
    <div style="display:grid;grid-template-columns:110px 1fr;gap:.5rem;align-items:center">
      <label style="font-size:.75rem;color:var(--text3);font-family:'JetBrains Mono',monospace">${SLOT_LABELS[k]||k}</label>
      <select class="form-select" id="pedit_slot_${k}" style="font-size:.75rem;padding:.3rem .5rem">
        <option value="">— None —</option>
        ${opts(k, currentSlots[k] || '')}
      </select>
    </div>`).join('');
}

async function savePkgEdit() {
  const name    = document.getElementById('peditName').value.trim();
  const tagline = document.getElementById('peditTagline').value.trim();
  const cat     = document.getElementById('peditCat').value;
  const featured= document.getElementById('peditFeatured').checked;
  if (!name)    { showToast('Enter a package name'); return; }
  if (!tagline) { showToast('Enter a tagline');      return; }
  const slots = {};
  SLOT_KEYS.forEach(k => {
    const val = document.getElementById('pedit_slot_' + k)?.value;
    if (val) slots[k] = val;
  });
  if (!Object.keys(slots).length) { showToast('Select at least one component'); return; }

  const pkgs = [..._adminPackages];
  if (_editPkgIdx === null) {
    const id     = 'pkg_admin_' + Date.now();
    const colors = ['#22c55e','#ef4444','#f59e0b','#a855f7','#3b82f6','#06b6d4','#8b5cf6','#ec4899'];
    const color  = colors[pkgs.length % colors.length];
    pkgs.push({ id, name, category: cat, icon:'', tagline, color, featured, slots });
    showToast(name + ' created!');
  } else {
    const existing = pkgs[_editPkgIdx];
    pkgs[_editPkgIdx] = { ...existing, name, category: cat, tagline, featured, slots };
    showToast(name + ' saved!');
  }
  try {
    await adminSavePackages(pkgs);
    closePkgEditModal();
    adminRenderPackages();
  } catch(e) { showToast('Error: ' + e.message); }
}

async function adminDeletePkg(idx) {
  const pkg = _adminPackages[idx];
  if (!pkg) return;
  if (!confirm('Delete "' + pkg.name + '"? This cannot be undone.')) return;
  const pkgs = _adminPackages.filter((_, i) => i !== idx);
  try {
    await adminSavePackages(pkgs);
    adminRenderPackages();
    showToast('Package deleted');
  } catch(e) { showToast('Error: ' + e.message); }
}

/* ================================================================
   TOAST
================================================================ */
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2800);
}

/* ================================================================
   INIT — load all data from API then render
================================================================ */
async function adminInit() {
  try {
    const [stockData, customProds, imagesData, hiddenIds] = await Promise.all([
      DS_API.admin.getStock(),
      DS_API.admin.getProducts(),
      DS_API.admin.getImages(),
      DS_API.admin.getHidden(),
    ]);
    _stock   = stockData;
    _customs = customProds.map(p => ({ ...p }));
    _images  = imagesData;
    _hidden  = hiddenIds;
    renderTable();
    setupAddProduct();
  } catch(e) {
    console.error('[Admin] Init error:', e);
    showToast('Error loading admin data: ' + e.message);
  }
}

document.addEventListener('DOMContentLoaded', adminInit);
