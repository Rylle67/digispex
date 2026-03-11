// api/index.js — DigiSpex serverless entry point for Vercel
// The entire Express app lives here. Vercel calls this as a function.
'use strict';

const express         = require('express');
const session         = require('express-session');
const ConnectPgSimple = require('connect-pg-simple')(session);
const path            = require('path');
const { Pool }        = require('pg');
const bcrypt          = require('bcryptjs');

/* ── DB pool (reused across warm invocations) ── */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },  // required for Neon / Supabase / Railway
  max: 5,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 5000,
});

async function query(text, params) {
  const client = await pool.connect();
  try { return await client.query(text, params); }
  finally { client.release(); }
}

/* ── Auth middleware ── */
function requireLogin(req, res, next) {
  if (req.session?.user) return next();
  if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'Not authenticated' });
  return res.redirect('/login');
}
function requireAdmin(req, res, next) {
  if (req.session?.user?.role === 'admin') return next();
  if (req.path.startsWith('/api/')) return res.status(403).json({ error: 'Admin access required' });
  return res.redirect('/login');
}
function requireOwner(req, res, next) {
  if (req.session?.user?.role === 'owner') return next();
  if (req.path.startsWith('/api/')) return res.status(403).json({ error: 'Owner access required' });
  return res.redirect('/login');
}

const app = express();

/* ── Body parsing ── */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* ── Sessions stored in PostgreSQL ── */
app.use(session({
  store: new ConnectPgSimple({
    pool,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  name: 'ds_sid',
  secret: process.env.SESSION_SECRET || 'digispex-change-this-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
}));

/* ================================================================
   AUTH ROUTES  /api/auth/*
================================================================ */
app.get('/api/auth/session', (req, res) => {
  res.json({ user: req.session?.user || null });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: 'Enter a valid email address.' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const normalEmail = email.trim().toLowerCase();
    const exists = await query('SELECT id FROM users WHERE email=$1', [normalEmail]);
    if (exists.rows.length)
      return res.status(409).json({ error: 'An account with this email already exists.' });

    const hash = await bcrypt.hash(password, 10);
    const uid  = 'u_' + Date.now();
    const result = await query(
      `INSERT INTO users (uid, name, email, password, role)
       VALUES ($1,$2,$3,$4,'customer') RETURNING uid, name, email, role`,
      [uid, name.trim(), normalEmail, hash]
    );
    const newUser = result.rows[0];
    req.session.user = { uid: newUser.uid, name: newUser.name, email: newUser.email, role: newUser.role };
    res.json({ user: req.session.user });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const result = await query('SELECT * FROM users WHERE email=$1', [email.trim().toLowerCase()]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Incorrect email or password.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Incorrect email or password.' });

    req.session.user = { uid: user.uid, name: user.name, email: user.email, role: user.role };
    res.json({ user: req.session.user });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('ds_sid');
    res.json({ ok: true });
  });
});

/* ================================================================
   CART ROUTES  /api/cart/*
================================================================ */
const uid = (req) => req.session.user.uid;

app.get('/api/cart', requireLogin, async (req, res) => {
  try {
    const r = await query('SELECT product_id, qty FROM carts WHERE user_uid=$1', [uid(req)]);
    res.json(r.rows.map(row => ({ productId: row.product_id, qty: row.qty })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/cart/add', requireLogin, async (req, res) => {
  try {
    const { productId } = req.body;
    await query(
      `INSERT INTO carts (user_uid, product_id, qty) VALUES ($1,$2,1)
       ON CONFLICT (user_uid, product_id) DO UPDATE SET qty = carts.qty + 1`,
      [uid(req), productId]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/cart/update', requireLogin, async (req, res) => {
  try {
    const { productId, delta } = req.body;
    const cur = await query('SELECT qty FROM carts WHERE user_uid=$1 AND product_id=$2', [uid(req), productId]);
    if (!cur.rows.length) return res.json({ ok: true });
    const newQty = cur.rows[0].qty + delta;
    if (newQty <= 0) await query('DELETE FROM carts WHERE user_uid=$1 AND product_id=$2', [uid(req), productId]);
    else await query('UPDATE carts SET qty=$3 WHERE user_uid=$1 AND product_id=$2', [uid(req), productId, newQty]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/cart/remove', requireLogin, async (req, res) => {
  try {
    await query('DELETE FROM carts WHERE user_uid=$1 AND product_id=$2', [uid(req), req.body.productId]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/cart/clear', requireLogin, async (req, res) => {
  try {
    await query('DELETE FROM carts WHERE user_uid=$1', [uid(req)]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ================================================================
   ORDERS ROUTES  /api/orders/*
================================================================ */
function dbToOrder(row) {
  return {
    id: row.order_id, userUid: row.user_uid, customer: row.customer,
    items: row.items, total: parseFloat(row.total), status: row.status,
    date: row.placed_at, updatedAt: row.updated_at,
  };
}

app.get('/api/orders', requireLogin, async (req, res) => {
  try {
    const r = await query('SELECT * FROM orders WHERE user_uid=$1 ORDER BY placed_at DESC', [uid(req)]);
    res.json(r.rows.map(dbToOrder));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/orders/all', requireAdmin, async (req, res) => {
  try {
    const r = await query('SELECT * FROM orders ORDER BY placed_at DESC');
    res.json(r.rows.map(dbToOrder));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/orders', requireLogin, async (req, res) => {
  try {
    const { orderId, customer, items, total } = req.body;
    await query(
      `INSERT INTO orders (order_id, user_uid, customer, items, total, status)
       VALUES ($1,$2,$3,$4,$5,'processing')`,
      [orderId, uid(req), JSON.stringify(customer || {}), JSON.stringify(items), total || 0]
    );
    await query('DELETE FROM carts WHERE user_uid=$1', [uid(req)]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/orders/:orderId', requireAdmin, async (req, res) => {
  try {
    await query('UPDATE orders SET status=$1, updated_at=NOW() WHERE order_id=$2', [req.body.status, req.params.orderId]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/orders/:orderId', requireAdmin, async (req, res) => {
  try {
    await query('DELETE FROM orders WHERE order_id=$1', [req.params.orderId]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ================================================================
   BUILD ROUTES  /api/build/*
================================================================ */
app.get('/api/build', requireLogin, async (req, res) => {
  try {
    const r = await query('SELECT slots FROM builds WHERE user_uid=$1', [uid(req)]);
    res.json(r.rows[0]?.slots || {});
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/build/save', requireLogin, async (req, res) => {
  try {
    await query(
      `INSERT INTO builds (user_uid, slots) VALUES ($1,$2)
       ON CONFLICT (user_uid) DO UPDATE SET slots=$2`,
      [uid(req), JSON.stringify(req.body.slots || {})]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/build/clear', requireLogin, async (req, res) => {
  try {
    await query(`INSERT INTO builds (user_uid, slots) VALUES ($1,'{}')
                 ON CONFLICT (user_uid) DO UPDATE SET slots='{}'`, [uid(req)]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ================================================================
   WISHLIST ROUTES  /api/wishlist/*
================================================================ */
app.get('/api/wishlist', requireLogin, async (req, res) => {
  try {
    const r = await query('SELECT product_ids FROM wishlists WHERE user_uid=$1', [uid(req)]);
    res.json(r.rows[0]?.product_ids || []);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/wishlist/toggle', requireLogin, async (req, res) => {
  try {
    const { productId } = req.body;
    const r = await query('SELECT product_ids FROM wishlists WHERE user_uid=$1', [uid(req)]);
    let ids = r.rows[0]?.product_ids || [];
    const idx = ids.indexOf(productId);
    const added = idx === -1;
    if (added) ids.push(productId); else ids.splice(idx, 1);
    await query(
      `INSERT INTO wishlists (user_uid, product_ids) VALUES ($1,$2)
       ON CONFLICT (user_uid) DO UPDATE SET product_ids=$2`,
      [uid(req), JSON.stringify(ids)]
    );
    res.json({ ok: true, added, ids });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ================================================================
   NOTIFICATIONS ROUTES  /api/notifications/*
================================================================ */
app.get('/api/notifications', requireLogin, async (req, res) => {
  try {
    const r = await query(
      'SELECT * FROM notifications WHERE user_uid=$1 ORDER BY created_at DESC LIMIT 100', [uid(req)]
    );
    res.json(r.rows.map(row => ({
      id: row.notif_id, type: row.type, title: row.title,
      body: row.body, orderId: row.order_id, read: row.read,
      ts: new Date(row.created_at).getTime(),
    })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/notifications/push', requireLogin, async (req, res) => {
  try {
    const { targetUid, notifId, type, title, body, orderId } = req.body;
    await query(
      `INSERT INTO notifications (user_uid, notif_id, type, title, body, order_id)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [targetUid || uid(req), notifId || ('n_' + Date.now()), type, title, body, orderId || null]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/notifications/read/:notifId', requireLogin, async (req, res) => {
  try {
    await query('UPDATE notifications SET read=TRUE WHERE notif_id=$1 AND user_uid=$2', [req.params.notifId, uid(req)]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/notifications/read-all', requireLogin, async (req, res) => {
  try {
    await query('UPDATE notifications SET read=TRUE WHERE user_uid=$1', [uid(req)]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/notifications/clear', requireLogin, async (req, res) => {
  try {
    await query('DELETE FROM notifications WHERE user_uid=$1', [uid(req)]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ================================================================
   MESSAGES ROUTES  /api/messages/*
================================================================ */
function dbToMsg(row) {
  return {
    id: row.id, threadId: row.thread_id, orderId: row.order_id,
    senderUid: row.sender_uid, senderRole: row.sender_role,
    body: row.body, sentAt: row.sent_at,
  };
}

app.get('/api/messages', requireLogin, async (req, res) => {
  try {
    const r = await query('SELECT * FROM messages WHERE thread_id=$1 ORDER BY sent_at ASC', [req.query.threadId]);
    res.json(r.rows.map(dbToMsg));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/messages/threads', requireAdmin, async (req, res) => {
  try {
    const r = await query(
      `SELECT DISTINCT ON (thread_id) thread_id, order_id, sender_uid, body, sent_at
       FROM messages ORDER BY thread_id, sent_at DESC`
    );
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/messages/my-threads', requireLogin, async (req, res) => {
  try {
    const r = await query(
      `SELECT DISTINCT ON (thread_id) thread_id, order_id, body, sent_at
       FROM messages WHERE sender_uid=$1 ORDER BY thread_id, sent_at DESC`,
      [uid(req)]
    );
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/messages', requireLogin, async (req, res) => {
  try {
    const { threadId, orderId, body } = req.body;
    await query(
      `INSERT INTO messages (thread_id, order_id, sender_uid, sender_role, body)
       VALUES ($1,$2,$3,$4,$5)`,
      [threadId, orderId || null, uid(req), req.session.user.role, body]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ================================================================
   ADMIN ROUTES  /api/admin/*
================================================================ */

/* Stock */
app.get('/api/admin/stock', async (req, res) => {
  try {
    const r = await query('SELECT product_id, status, qty FROM stock_status');
    const out = {};
    r.rows.forEach(row => { out[row.product_id] = { status: row.status, qty: row.qty }; });
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/stock', requireAdmin, async (req, res) => {
  try {
    const { productId, status, qty, productName } = req.body;
    const old = await query('SELECT status FROM stock_status WHERE product_id=$1', [productId]);
    const oldStatus = old.rows[0]?.status || 'normal';
    if (status === 'normal') await query('DELETE FROM stock_status WHERE product_id=$1', [productId]);
    else await query(
      `INSERT INTO stock_status (product_id, status, qty) VALUES ($1,$2,$3)
       ON CONFLICT (product_id) DO UPDATE SET status=$2, qty=$3`,
      [productId, status, qty || 0]
    );
    await query(
      `INSERT INTO audit_log (type, product_id, product_name, old_status, new_status, admin_uid)
       VALUES ('status_change',$1,$2,$3,$4,$5)`,
      [productId, productName || productId, oldStatus, status, req.session.user.uid]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/stock/bulk', requireAdmin, async (req, res) => {
  try {
    const { ids, status, allProds } = req.body;
    for (const productId of ids) {
      const old = await query('SELECT status FROM stock_status WHERE product_id=$1', [productId]);
      const oldStatus = old.rows[0]?.status || 'normal';
      if (status === 'normal') await query('DELETE FROM stock_status WHERE product_id=$1', [productId]);
      else await query(
        `INSERT INTO stock_status (product_id, status, qty) VALUES ($1,$2,0)
         ON CONFLICT (product_id) DO UPDATE SET status=$2`, [productId, status]
      );
      const name = (allProds || []).find(p => p.id === productId)?.name || productId;
      await query(
        `INSERT INTO audit_log (type, product_id, product_name, old_status, new_status, admin_uid)
         VALUES ('status_change',$1,$2,$3,$4,$5)`,
        [productId, name, oldStatus, status, req.session.user.uid]
      );
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Custom Products */
app.get('/api/admin/products', async (req, res) => {
  try {
    const r = await query('SELECT * FROM custom_products ORDER BY created_at ASC');
    res.json(r.rows.map(row => ({ ...row.data, _imageData: row.image_data, _description: row.description })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/products', requireAdmin, async (req, res) => {
  try {
    const { product, imageData, description } = req.body;
    await query(
      `INSERT INTO custom_products (product_id, data, image_data, description)
       VALUES ($1,$2,$3,$4) ON CONFLICT (product_id) DO UPDATE SET data=$2, image_data=$3, description=$4`,
      [product.id, JSON.stringify(product), imageData || null, description || null]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/products/:productId', requireAdmin, async (req, res) => {
  try {
    await query('DELETE FROM custom_products WHERE product_id=$1', [req.params.productId]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Hidden products */
app.get('/api/admin/hidden', async (req, res) => {
  try {
    const r = await query('SELECT product_id FROM hidden_products');
    res.json(r.rows.map(r => r.product_id));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/hidden', requireAdmin, async (req, res) => {
  try {
    await query('INSERT INTO hidden_products (product_id) VALUES ($1) ON CONFLICT DO NOTHING', [req.body.productId]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/hidden/:productId', requireAdmin, async (req, res) => {
  try {
    await query('DELETE FROM hidden_products WHERE product_id=$1', [req.params.productId]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/hidden/clear', requireAdmin, async (req, res) => {
  try {
    await query('DELETE FROM hidden_products');
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Packages */
app.get('/api/admin/packages', async (req, res) => {
  try {
    const r = await query('SELECT * FROM packages ORDER BY id ASC');
    res.json(r.rows.map(row => ({ ...row.data })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/packages', requireAdmin, async (req, res) => {
  try {
    const { packages } = req.body;
    await query('DELETE FROM packages');
    for (const pkg of packages) {
      const pkgId = pkg.id || pkg._id || ('pkg_' + Date.now() + Math.random());
      await query(
        `INSERT INTO packages (package_id, data) VALUES ($1,$2)
         ON CONFLICT (package_id) DO UPDATE SET data=$2, updated_at=NOW()`,
        [pkgId, JSON.stringify(pkg)]
      );
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Images */
app.get('/api/admin/images', async (req, res) => {
  try {
    const r = await query('SELECT product_id, image_data FROM custom_products WHERE image_data IS NOT NULL');
    const out = {};
    r.rows.forEach(row => { out[row.product_id] = row.image_data; });
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/images/:productId', requireAdmin, async (req, res) => {
  try {
    await query('UPDATE custom_products SET image_data=$2 WHERE product_id=$1', [req.params.productId, req.body.imageData]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/images/:productId', requireAdmin, async (req, res) => {
  try {
    await query('UPDATE custom_products SET image_data=NULL WHERE product_id=$1', [req.params.productId]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Audit */
app.get('/api/admin/audit', requireAdmin, async (req, res) => {
  try {
    const r = await query('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 500');
    res.json(r.rows.map(row => ({
      type: row.type, productId: row.product_id, productName: row.product_name,
      oldStatus: row.old_status, newStatus: row.new_status,
      adminUid: row.admin_uid, ts: new Date(row.created_at).getTime(), extra: row.extra,
    })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/audit', requireAdmin, async (req, res) => {
  try {
    await query('DELETE FROM audit_log');
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Users */
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const r = await query('SELECT uid, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ================================================================
   PAGE ROUTES — serve HTML with server-side auth guard
================================================================ */
const pub = (file) => path.join(__dirname, '..', 'public', file);

app.get('/',         (req, res) => res.sendFile(pub('index.html')));
app.get('/login',    (req, res) => req.session?.user ? res.redirect('/') : res.sendFile(pub('login.html')));
app.get('/register', (req, res) => req.session?.user ? res.redirect('/') : res.sendFile(pub('register.html')));
app.get('/admin',    requireAdmin, (req, res) => res.sendFile(pub('admin.html')));
app.get('/owner',    requireOwner, (req, res) => res.sendFile(pub('owner.html')));

/* Export for Vercel */
module.exports = app;
