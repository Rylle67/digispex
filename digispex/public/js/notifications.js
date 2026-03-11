/* ============================================================
   DigiSpex — notifications.js  (API-backed version)
   
   All notifications stored in PostgreSQL via DS_API.
   Public API matches the previous NOTIFY.* interface.
============================================================ */

const NOTIFY = (() => {

  /* Push a notification for a specific user (calls server) */
  async function _push(userId, opts) {
    if (!userId) return;
    try {
      await DS_API.notifications.push({
        targetUid: userId,
        notifId:   opts.id || ('n_' + Date.now() + '_' + Math.random().toString(36).slice(2)),
        type:      opts.type,
        title:     opts.title,
        body:      opts.body,
        orderId:   opts.orderId,
      });
    } catch (e) { console.warn('[NOTIFY] push failed:', e.message); }
  }

  return {

    /* Called by admin when changing order status */
    async pushOrderStatus(orderId, statusKey, userId) {
      const labels = {
        processing: 'Order Received',
        confirmed:  'Order Confirmed',
        preparing:  'Preparing Your Order',
        shipped:    'Order Shipped',
        delivered:  'Order Delivered',
        cancelled:  'Order Cancelled',
      };
      await _push(userId, {
        type:    'order_status',
        title:   labels[statusKey] || statusKey,
        body:    `Your order ${orderId} is now: ${statusKey}`,
        orderId,
      });
    },

    /* Called by admin when replying to a customer message */
    async pushSellerReply(orderId, preview, userId) {
      await _push(userId, {
        type:    'seller_reply',
        title:   'New message from DigiSpex',
        body:    preview || 'You have a new reply on your order.',
        orderId,
      });
    },

    /* Called when customer sends a message (admin notification) */
    async pushCustomerMsg(orderId, preview) {
      // Find admin users and push to them — server-side admin uid
      await _push('builtin_admin', {
        type:    'customer_msg',
        title:   'New customer message',
        body:    preview || 'A customer sent a message about an order.',
        orderId,
      });
    },

    /* Legacy compat */
    async onOrderPlaced(order, userId) {
      await _push(userId, {
        type:    'order_placed',
        title:   'Order Placed',
        body:    `Your order ${order.id} has been received.`,
        orderId: order.id,
      });
    },

    /* Read methods — used by bell / dropdown */
    async getAll(userId)    { return await DS_API.notifications.getAll(); },
    async unreadCount()     { return await DS_API.notifications.unreadCount(); },
    async markRead(id)      { return await DS_API.notifications.markRead(id); },
    async markAllRead()     { return await DS_API.notifications.markAllRead(); },
    async clearAll()        { return await DS_API.notifications.clearAll(); },
  };

})();

/* ============================================================
   Bell UI — notification dropdown rendering
   (unchanged from original, just async-aware)
============================================================ */

let _bellOpen = false;

async function _refreshBell() {
  const wrap = document.getElementById('notifBellWrap');
  if (!wrap || !DS_API.auth.isLoggedIn()) return;
  const badge = document.getElementById('notifBadge');
  try {
    const count = await NOTIFY.unreadCount();
    if (badge) {
      badge.textContent = count > 9 ? '9+' : count;
      badge.style.display = count > 0 ? '' : 'none';
    }
  } catch(e) {}
}

async function _openBellDropdown() {
  const dropdown = document.getElementById('notifDropdown');
  if (!dropdown) return;
  _bellOpen = !_bellOpen;
  dropdown.classList.toggle('open', _bellOpen);
  if (!_bellOpen) return;

  dropdown.innerHTML = '<div class="notif-loading">Loading…</div>';
  try {
    const notifs = await NOTIFY.getAll();
    if (!notifs.length) {
      dropdown.innerHTML = '<div class="notif-empty">No notifications yet.</div>';
      return;
    }
    dropdown.innerHTML = notifs.map(n => `
      <div class="notif-item ${n.read ? '' : 'unread'}" data-id="${n.id}" onclick="_markNotifRead('${n.id}', this)">
        <div class="notif-title">${n.title || ''}</div>
        <div class="notif-body">${n.body || ''}</div>
        <div class="notif-ts">${_relTime(n.ts)}</div>
      </div>
    `).join('') + '<div class="notif-footer"><button onclick="NOTIFY.markAllRead().then(_refreshBell)">Mark all read</button><button onclick="NOTIFY.clearAll().then(_refreshBell).then(_openBellDropdown)">Clear all</button></div>';
  } catch(e) {
    dropdown.innerHTML = '<div class="notif-empty">Failed to load notifications.</div>';
  }
}

async function _markNotifRead(id, el) {
  el?.classList.remove('unread');
  await NOTIFY.markRead(id);
  _refreshBell();
}

function _relTime(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000)   return 'Just now';
  if (diff < 3600000) return Math.floor(diff/60000) + 'm ago';
  if (diff < 86400000)return Math.floor(diff/3600000) + 'h ago';
  return new Date(ts).toLocaleDateString();
}

document.addEventListener('DOMContentLoaded', () => {
  const bell = document.getElementById('notifBellBtn');
  if (bell) bell.addEventListener('click', _openBellDropdown);
  document.addEventListener('click', e => {
    const wrap = document.getElementById('notifBellWrap');
    if (wrap && !wrap.contains(e.target) && _bellOpen) {
      _bellOpen = false;
      document.getElementById('notifDropdown')?.classList.remove('open');
    }
  });
  if (DS_API.auth.isLoggedIn()) _refreshBell();
});
