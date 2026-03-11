/* ============================================================
   DigiSpex — database.js  (API-backed version)
   
   All data is now stored in PostgreSQL via DS_API.*.
   This module provides the same DB.* interface as before
   but every operation calls the REST API.
   
   Because API calls are async, all methods return Promises.
   Callers that previously used synchronous DB.* methods now
   use await DB.*() — pages call DB.init() first on load.
============================================================ */

const DB = (() => {

  return {

    async init() {
      // Preload cart and build caches so sync-like access works
      if (DS_API.auth.isLoggedIn()) {
        await DS_API.cart.get();
        await DS_API.build.get();
      }
    },

    /* ============================
       CART
    ============================ */
    async getCart()               { return await DS_API.cart.get(); },
    async getCartCount()          { return await DS_API.cart.count(); },
    async cartAdd(productId)      { return await DS_API.cart.add(productId); },
    async cartUpdateQty(productId, delta) { return await DS_API.cart.update(productId, delta); },
    async cartRemove(productId)   { return await DS_API.cart.remove(productId); },
    async cartClear()             { return await DS_API.cart.clear(); },

    /* ============================
       ORDERS
    ============================ */
    async getOrders()                    { return await DS_API.orders.get(); },
    async addOrder(order)                { return await DS_API.orders.place(order); },
    async updateOrderStatus(id, status)  { return await DS_API.orders.updateStatus(id, status); },

    /* ============================
       PC BUILD
    ============================ */
    async getBuild()                     { return await DS_API.build.get(); },
    async buildSetSlot(slotKey, pid)     { return await DS_API.build.setSlot(slotKey, pid); },
    async buildClearSlot(slotKey)        { return await DS_API.build.clearSlot(slotKey); },
    async buildClear()                   { return await DS_API.build.clear(); },
    async buildSave(buildObj)            { return await DS_API.build.save(buildObj); },

    /* ============================
       GENERIC (for any other usage)
    ============================ */
    get(key)        { console.warn('[DB] Generic get("' + key + '") — use DS_API directly'); return null; },
    set(key, value) { console.warn('[DB] Generic set("' + key + '") — use DS_API directly'); },
    remove(key)     { console.warn('[DB] Generic remove("' + key + '") — use DS_API directly'); },
  };

})();
