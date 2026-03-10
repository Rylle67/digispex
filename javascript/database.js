/* ============================================================
   DigiSpecs Online Shop & Package Customization
   database.js — localStorage database layer

   All persistent data lives here. Every read/write goes
   through the DB object so the storage backend can be
   swapped (e.g. IndexedDB, a REST API) without touching
   any other file.

   Keys stored in localStorage:
     ds_cart    — Array of { productId, qty }
     ds_orders  — Array of order objects
     ds_build   — Object mapping slotKey → productId
   ============================================================ */

const DB = (() => {

  const PREFIX = 'ds_';

  // Keys that are scoped per-user (cart, orders).
  // build is also per-user so saved builds don't bleed across accounts.
  const USER_SCOPED = ['cart', 'orders', 'build'];

  /* ---------- low-level helpers ---------- */

  function _userPrefix() {
    // Pull the logged-in user id from AUTH session (auth.js must load first).
    try {
      const s = typeof AUTH !== 'undefined' ? AUTH.session() : null;
      return s ? `u_${s.id}_` : 'guest_';
    } catch { return 'guest_'; }
  }

  function _key(key) {
    // Per-user keys for cart/orders/build, global for everything else.
    return PREFIX + (USER_SCOPED.includes(key) ? _userPrefix() : '') + key;
  }

  function _read(key) {
    try {
      const raw = localStorage.getItem(_key(key));
      return raw !== null ? JSON.parse(raw) : null;
    } catch (e) {
      console.error(`[DB] Failed to read "${key}":`, e);
      return null;
    }
  }

  function _write(key, value) {
    try {
      localStorage.setItem(_key(key), JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`[DB] Failed to write "${key}":`, e);
      return false;
    }
  }

  function _delete(key) {
    try {
      localStorage.removeItem(_key(key));
      return true;
    } catch (e) {
      console.error(`[DB] Failed to delete "${key}":`, e);
      return false;
    }
  }

  /* ---------- public API ---------- */

  return {

    /**
     * Initialise the database with default values on first load.
     * Safe to call on every page load — won't overwrite existing data.
     */
    init() {
      if (!_read('cart'))   _write('cart',   []);
      if (!_read('orders')) _write('orders', []);
      if (!_read('build'))  _write('build',  {});
    },

    /* ---- generic get / set ---- */
    get(key)        { return _read(key); },
    set(key, value) { return _write(key, value); },
    remove(key)     { return _delete(key); },

    /* ============================
       CART
    ============================ */

    /** Return the full cart array. */
    getCart() {
      return _read('cart') || [];
    },

    /** Return total number of items (sum of qty). */
    getCartCount() {
      return this.getCart().reduce((sum, item) => sum + item.qty, 0);
    },

    /**
     * Add one unit of productId to the cart.
     * If it already exists, increment qty.
     */
    cartAdd(productId) {
      const cart = this.getCart();
      const existing = cart.find(i => i.productId === productId);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ productId, qty: 1 });
      }
      _write('cart', cart);
    },

    /**
     * Change qty of a cart item by delta (+1 or -1).
     * Removes the item if qty drops to 0 or below.
     */
    cartUpdateQty(productId, delta) {
      let cart = this.getCart();
      const item = cart.find(i => i.productId === productId);
      if (!item) return;
      item.qty += delta;
      if (item.qty <= 0) cart = cart.filter(i => i.productId !== productId);
      _write('cart', cart);
    },

    /** Remove a product from the cart entirely. */
    cartRemove(productId) {
      const cart = this.getCart().filter(i => i.productId !== productId);
      _write('cart', cart);
    },

    /** Empty the entire cart. */
    cartClear() {
      _write('cart', []);
    },

    /* ============================
       ORDERS
    ============================ */

    /** Return all orders, newest first. */
    getOrders() {
      return _read('orders') || [];
    },

    /**
     * Save a new order.
     * @param {Object} order — full order object (id, items, total, status, date, customer)
     */
    addOrder(order) {
      const orders = this.getOrders();
      orders.unshift(order);   // prepend so newest is first
      _write('orders', orders);
    },

    /**
     * Update the status field of an existing order.
     * @param {string} orderId
     * @param {string} status  — 'processing' | 'shipped' | 'delivered'
     */
    updateOrderStatus(orderId, status) {
      const orders = this.getOrders();
      const order = orders.find(o => o.id === orderId);
      if (order) {
        order.status = status;
        _write('orders', orders);
      }
    },

    /* ============================
       PC BUILD
    ============================ */

    /** Return the current build map { slotKey: productId }. */
    getBuild() {
      return _read('build') || {};
    },

    /**
     * Assign a product to a build slot.
     * @param {string} slotKey  — e.g. 'CPU', 'GPU', 'RAM'
     * @param {string} productId
     */
    buildSetSlot(slotKey, productId) {
      const build = this.getBuild();
      build[slotKey] = productId;
      _write('build', build);
    },

    /**
     * Remove a product from a build slot.
     * @param {string} slotKey
     */
    buildClearSlot(slotKey) {
      const build = this.getBuild();
      delete build[slotKey];
      _write('build', build);
    },

    /** Wipe the entire build. */
    buildClear() {
      _write('build', {});
    },

    /** Save a full build map (used when swapping CPU clears dependants). */
    buildSave(buildObj) {
      _write('build', buildObj);
    },

    /* ============================
       DEBUG / DEV HELPERS
    ============================ */

    /** Print the full database state to the console. */
    dump() {
      console.group('[DB] Current state');
      console.log('cart:',   this.getCart());
      console.log('orders:', this.getOrders());
      console.log('build:',  this.getBuild());
      console.groupEnd();
    },

    /** Completely wipe all NEXUS data from localStorage. */
    reset() {
      ['cart', 'orders', 'build'].forEach(k => _delete(k));
      this.init();
      console.log('[DB] Database reset to defaults.');
    }
  };

})();