/* ============================================================
   DigiSpex — api.js
   Client-side API bridge.
   Replaces all localStorage/sessionStorage reads and writes
   with fetch() calls to the Express REST API.
   
   All other JS files call DS_API.* instead of localStorage.
   ============================================================ */

const DS_API = (() => {
  'use strict';

  /* ---- shared session state (populated on page load) ---- */
  let _session = null;  // { uid, name, email, role } or null

  /* ---- low-level fetch wrapper ---- */
  async function _req(method, path, body) {
    try {
      const opts = {
        method,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        credentials: 'same-origin',
      };
      if (body !== undefined) opts.body = JSON.stringify(body);
      const res = await fetch('/api' + path, opts);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || res.statusText);
      }
      return await res.json();
    } catch (err) {
      console.error(`[API] ${method} ${path} failed:`, err.message);
      throw err;
    }
  }

  const _get    = (path)        => _req('GET',    path);
  const _post   = (path, body)  => _req('POST',   path, body);
  const _patch  = (path, body)  => _req('PATCH',  path, body);
  const _delete = (path, body)  => _req('DELETE', path, body);

  /* ================================================================
     AUTH
  ================================================================ */
  const auth = {
    async loadSession() {
      const data = await _get('/auth/session').catch(() => ({ user: null }));
      _session = data.user || null;
      return _session;
    },
    getSession()  { return _session; },
    isLoggedIn()  { return !!_session; },
    getUser()     { return _session; },

    async register(name, email, password) {
      const data = await _post('/auth/register', { name, email, password });
      _session = data.user;
      return _session;
    },

    async login(email, password) {
      const data = await _post('/auth/login', { email, password });
      _session = data.user;
      return _session;
    },

    async logout() {
      await _post('/auth/logout');
      _session = null;
    },
  };

  /* ================================================================
     CART
  ================================================================ */
  let _cartCache = null;

  const cart = {
    async get() {
      if (!_session) return [];
      _cartCache = await _get('/cart');
      return _cartCache;
    },
    async count() {
      const c = _cartCache || await this.get();
      return c.reduce((s, i) => s + i.qty, 0);
    },
    async add(productId) {
      if (!_session) return;
      await _post('/cart/add', { productId });
      _cartCache = null;
    },
    async update(productId, delta) {
      if (!_session) return;
      await _post('/cart/update', { productId, delta });
      _cartCache = null;
    },
    async remove(productId) {
      if (!_session) return;
      await _post('/cart/remove', { productId });
      _cartCache = null;
    },
    async clear() {
      if (!_session) return;
      await _post('/cart/clear');
      _cartCache = null;
    },
    invalidate() { _cartCache = null; },
  };

  /* ================================================================
     ORDERS
  ================================================================ */
  const orders = {
    async get()       { return _session ? await _get('/orders') : []; },
    async getAll()    { return await _get('/orders/all'); },   // admin only
    async place(order) {
      return await _post('/orders', order);
    },
    async updateStatus(orderId, status) {
      return await _patch('/orders/' + orderId, { status });
    },
    async delete(orderId) {
      return await _delete('/orders/' + orderId);
    },
  };

  /* ================================================================
     PC BUILD
  ================================================================ */
  let _buildCache = null;

  const build = {
    async get() {
      if (!_session) return {};
      if (_buildCache) return _buildCache;
      _buildCache = await _get('/build');
      return _buildCache;
    },
    async setSlot(slotKey, productId) {
      const b = await this.get();
      b[slotKey] = productId;
      _buildCache = b;
      await _post('/build/save', { slots: b });
    },
    async clearSlot(slotKey) {
      const b = await this.get();
      delete b[slotKey];
      _buildCache = b;
      await _post('/build/save', { slots: b });
    },
    async save(buildObj) {
      _buildCache = buildObj;
      await _post('/build/save', { slots: buildObj });
    },
    async clear() {
      _buildCache = {};
      await _post('/build/clear');
    },
    invalidate() { _buildCache = null; },
  };

  /* ================================================================
     WISHLIST
  ================================================================ */
  let _wishlistCache = null;

  const wishlist = {
    async get() {
      if (!_session) return [];
      if (_wishlistCache) return _wishlistCache;
      _wishlistCache = await _get('/wishlist');
      return _wishlistCache;
    },
    async toggle(productId) {
      if (!_session) throw new Error('Not logged in');
      const data = await _post('/wishlist/toggle', { productId });
      _wishlistCache = data.ids;
      return data;
    },
    includes(productId) {
      return (_wishlistCache || []).includes(productId);
    },
    invalidate() { _wishlistCache = null; },
  };

  /* ================================================================
     NOTIFICATIONS
  ================================================================ */
  const notifications = {
    async getAll()                { return _session ? await _get('/notifications') : []; },
    async unreadCount()           { const n = await this.getAll(); return n.filter(x => !x.read).length; },
    async push(opts)              { return await _post('/notifications/push', opts); },
    async markRead(notifId)       { return await _post('/notifications/read/' + notifId); },
    async markAllRead()           { return await _post('/notifications/read-all'); },
    async clearAll()              { return await _delete('/notifications/clear'); },
  };

  /* ================================================================
     MESSAGES
  ================================================================ */
  const messages = {
    async getThread(threadId) { return await _get('/messages?threadId=' + encodeURIComponent(threadId)); },
    async getThreads()        { return await _get('/messages/threads'); },     // admin
    async getMyThreads()      { return await _get('/messages/my-threads'); },  // customer
    async send(threadId, body, orderId) {
      return await _post('/messages', { threadId, body, orderId });
    },
  };

  /* ================================================================
     ADMIN — Stock, Products, Packages, Audit, Images
  ================================================================ */
  const admin = {
    /* Stock */
    async getStock()                       { return await _get('/admin/stock'); },
    async setStock(productId, status, qty, productName) {
      return await _post('/admin/stock', { productId, status, qty, productName });
    },
    async bulkSetStock(ids, status, allProds) {
      return await _post('/admin/stock/bulk', { ids, status, allProds });
    },

    /* Custom products */
    async getProducts()                    { return await _get('/admin/products'); },
    async saveProduct(product, imageData, description) {
      return await _post('/admin/products', { product, imageData, description });
    },
    async deleteProduct(productId)         { return await _delete('/admin/products/' + productId); },

    /* Hidden (built-in product visibility) */
    async getHidden()                      { return await _get('/admin/hidden'); },
    async hideProduct(productId)           { return await _post('/admin/hidden', { productId }); },
    async unhideProduct(productId)         { return await _delete('/admin/hidden/' + productId); },
    async clearHidden()                    { return await _post('/admin/hidden/clear'); },

    /* Packages */
    async getPackages()                    { return await _get('/admin/packages'); },
    async savePackages(packages)           { return await _post('/admin/packages', { packages }); },

    /* Audit */
    async getAudit()                       { return await _get('/admin/audit'); },
    async clearAudit()                     { return await _delete('/admin/audit'); },

    /* Images */
    async getImages()                      { return await _get('/admin/images'); },
    async saveImage(productId, imageData)  { return await _post('/admin/images/' + productId, { imageData }); },
    async deleteImage(productId)           { return await _delete('/admin/images/' + productId); },

    /* Users */
    async getUsers()                       { return await _get('/admin/users'); },
  };

  /* ================================================================
     PUBLIC API
  ================================================================ */
  return { auth, cart, orders, build, wishlist, notifications, messages, admin };

})();
