/* ============================================================
   DigiSpecs — auth-modal.js
   Handles auth state, nav UI, and modal fallbacks.

   Login / Register forms live in login.html and register.html.
   The modals in index.html are kept for "add to cart" prompts
   and inline switching — they still fully work.
============================================================ */

const AUTH_USERS_KEY   = 'ds_auth_users';
const AUTH_SESSION_KEY = 'ds_auth_session';

/*  Storage helpers  */
function _authRead(key)       { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } }
function _authWrite(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

function _getUsers()       { return _authRead(AUTH_USERS_KEY)   || []; }
function _getSession()     { return _authRead(AUTH_SESSION_KEY) || null; }
function _setSession(user) { _authWrite(AUTH_SESSION_KEY, user); }
function _clearSession()   { try { localStorage.removeItem(AUTH_SESSION_KEY); } catch {} }

/*  Built-in privileged accounts (seeded once)  */
(function _seedAccounts() {
  const users = _getUsers();
  const seeded = [
    { id: 'builtin_admin', name: 'DigiSpecs Admin', email: 'admin@digispecs.ph', password: 'admin123', role: 'admin',  createdAt: '2025-01-01T00:00:00.000Z' },
    { id: 'builtin_owner', name: 'DigiSpecs Owner', email: 'owner@digispecs.ph', password: 'owner123', role: 'owner',  createdAt: '2025-01-01T00:00:00.000Z' },
  ];
  let changed = false;
  seeded.forEach(s => {
    if (!users.find(u => u.id === s.id)) { users.push(s); changed = true; }
  });
  if (changed) _authWrite(AUTH_USERS_KEY, users);
})();

/*  Public API used across modules  */
function getCurrentUser() { return _getSession(); }
function isLoggedIn()     { return !!_getSession(); }

/*  Email validator  */
function _validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()); }

/*  Inline error helper  */
function _setError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent   = msg;
  el.style.display = msg ? 'block' : 'none';
}
function _clearErrors(prefix) {
  ['name', 'email', 'password', 'confirm', 'general']
    .forEach(f => _setError(prefix + '-err-' + f, ''));
}

/* 
   OPEN / CLOSE MODALS
   Nav buttons now redirect to dedicated pages.
   openLoginModal() / openRegisterModal() are still called
   from cart-gate and other places that need inline prompts.
 */
function openLoginModal() {
  // If a dedicated modal exists in the page, use it.
  const modal = document.getElementById('loginModal');
  if (modal) {
    _clearErrors('login');
    modal.classList.add('open');
  } else {
    // Fallback: navigate to login page
    window.location.href = '../html/login.html';
  }
}
function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.remove('open');
}

function openRegisterModal() {
  const modal = document.getElementById('registerModal');
  if (modal) {
    _clearErrors('reg');
    modal.classList.add('open');
  } else {
    window.location.href = '../html/register.html';
  }
}
function closeRegisterModal() {
  const modal = document.getElementById('registerModal');
  if (modal) modal.classList.remove('open');
}

function switchToRegister() { closeLoginModal(); openRegisterModal(); }
function switchToLogin()    { closeRegisterModal(); openLoginModal(); }

/* 
   REGISTRATION (modal path — in-page fallback)
 */
function handleRegister(e) {
  e.preventDefault();
  _clearErrors('reg');

  const name     = (document.getElementById('regName')?.value     || '').trim();
  const email    = (document.getElementById('regEmail')?.value    || '').trim().toLowerCase();
  const password = (document.getElementById('regPassword')?.value || '').trim();
  const confirm  = (document.getElementById('regConfirm')?.value  || '').trim();

  let valid = true;
  if (!name)                     { _setError('reg-err-name',     'Name is required.');                        valid = false; }
  if (!email)                    { _setError('reg-err-email',    'Email is required.');                       valid = false; }
  else if (!_validEmail(email))  { _setError('reg-err-email',    'Enter a valid email address.');             valid = false; }
  if (!password)                 { _setError('reg-err-password', 'Password is required.');                    valid = false; }
  else if (password.length < 6) { _setError('reg-err-password', 'Password must be at least 6 characters.'); valid = false; }
  if (!confirm)                  { _setError('reg-err-confirm',  'Please confirm your password.');            valid = false; }
  else if (password !== confirm) { _setError('reg-err-confirm',  'Passwords do not match.');                  valid = false; }
  if (!valid) return;

  const users = _getUsers();
  if (users.find(u => u.email === email)) {
    _setError('reg-err-email', 'An account with this email already exists.');
    return;
  }

  const newUser = {
    id:        'u_' + Date.now(),
    name, email, password,
    role:      'customer',
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  _authWrite(AUTH_USERS_KEY, users);

  const sessionUser = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
  _setSession(sessionUser);
  closeRegisterModal();
  _onAuthChange(sessionUser, 'registered');
}

/* 
   LOGIN (modal path — in-page fallback)
 */
function handleLogin(e) {
  e.preventDefault();
  _clearErrors('login');

  const email    = (document.getElementById('loginEmail')?.value    || '').trim().toLowerCase();
  const password = (document.getElementById('loginPassword')?.value || '').trim();

  let valid = true;
  if (!email)                   { _setError('login-err-email',    'Email is required.');            valid = false; }
  else if (!_validEmail(email)) { _setError('login-err-email',    'Enter a valid email address.');  valid = false; }
  if (!password)                { _setError('login-err-password', 'Password is required.');         valid = false; }
  if (!valid) return;

  const users = _getUsers();
  const found  = users.find(u => u.email === email && u.password === password);
  if (!found) {
    _setError('login-err-general', 'Incorrect email or password.');
    return;
  }

  const sessionUser = { id: found.id, name: found.name, email: found.email, role: found.role || 'customer' };
  _setSession(sessionUser);
  closeLoginModal();

  /*  Role-based redirect  */
  if (sessionUser.role === 'admin') {
    window.location.href = '../html/admin.html';
    return;
  }
  if (sessionUser.role === 'owner') {
    window.location.href = '../html/owner.html';
    return;
  }

  _onAuthChange(sessionUser, 'loggedin');
}

/* 
   LOGOUT
 */
function handleLogout() {
  _clearSession();
  _onAuthChange(null, 'loggedout');
}

/* 
   AUTH STATE CHANGE — runs on every login / logout / register
 */
function _onAuthChange(user, action) {
  _updateAuthNav(user);
  if (action === 'registered') showToast('Welcome, ' + user.name + '! Account created.', 'success');
  if (action === 'loggedin')   showToast('Welcome back, ' + user.name + '!', 'success');
  if (action === 'loggedout')  showToast('You have been logged out.', 'success');
}

/* 
   NAV UPDATE
   Controls visibility of:
     - Guest buttons (Login / Register)
     - User area (username + Logout)
     - Notification bell (logged-in only)
     - Message button (logged-in only)
     - Orders tab (logged-in only)
 */
function _updateAuthNav(user) {
  const guestArea   = document.getElementById('navAuthGuest');
  const userArea    = document.getElementById('navAuthUser');
  const userLabel   = document.getElementById('navUserLabel');
  const bellWrap    = document.getElementById('notifBellWrap');   // notification bell container
  const msgBtn      = document.getElementById('navMsgBtn');
  const ordersTab   = document.getElementById('navOrdersTab');
  const wishlistTab = document.getElementById('navWishlistTab');

  if (!guestArea || !userArea) return;

  if (user) {
    //  Logged-in state 
    guestArea.style.display = 'none';
    userArea.style.display  = 'flex';
    if (userLabel)    userLabel.textContent     = user.name;

    /*  Panel shortcut for admin / owner  */
    const existingPanelBtn = document.getElementById('navPanelBtn');
    if (existingPanelBtn) existingPanelBtn.remove();
    if (user.role === 'admin' || user.role === 'owner') {
      const panelBtn = document.createElement('a');
      panelBtn.id        = 'navPanelBtn';
      panelBtn.className = 'nav-auth-btn nav-login-btn';
      panelBtn.style.cssText = 'background:rgba(124,58,237,0.18);color:#a78bfa;border-color:rgba(124,58,237,0.4);';
      panelBtn.href = user.role === 'admin' ? 'admin.html' : 'owner.html';
      panelBtn.textContent = user.role === 'admin' ? 'Admin Panel' : 'Owner Panel';
      userArea.insertBefore(panelBtn, userArea.firstChild);
    }
    if (bellWrap)     bellWrap.style.display    = '';      // show bell
    if (msgBtn)       msgBtn.style.display      = 'flex';
    if (ordersTab)    ordersTab.style.display   = '';     // show Orders tab
    if (wishlistTab)  wishlistTab.style.display = '';     // show Wishlist tab
    if (typeof _renderMsgBadge === 'function') _renderMsgBadge();
    if (typeof _refreshBell    === 'function') _refreshBell();
    if (typeof _updateWishlistBadge === 'function') _updateWishlistBadge();
    /* Show "My Wishlist" sort option */
    const wlOpt = document.getElementById('sortWishlistOption');
    if (wlOpt) wlOpt.style.display = '';
  } else {
    //  Guest state 
    guestArea.style.display = 'flex';
    userArea.style.display  = 'none';
    if (bellWrap)     bellWrap.style.display    = 'none';  // hide bell
    if (msgBtn)       msgBtn.style.display      = 'none';
    if (ordersTab)    ordersTab.style.display   = 'none';  // hide Orders tab
    if (wishlistTab)  wishlistTab.style.display = 'none';  // hide Wishlist tab
    /* Hide "My Wishlist" sort option */
    const wlOpt = document.getElementById('sortWishlistOption');
    if (wlOpt) wlOpt.style.display = 'none';
    // Kick guests off restricted pages
    const activePage = document.querySelector('.page.active');
    if (activePage && (activePage.id === 'page-orders' || activePage.id === 'page-wishlist') && typeof showPage === 'function') {
      showPage('store');
    }
  }
}


/* 
   PASSWORD VISIBILITY TOGGLE
 */
function togglePasswordVis(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  const show = inp.type === 'password';
  inp.type      = show ? 'text' : 'password';
  btn.innerHTML = show ? '&#128584;' : '&#128065;';
}

/* 
   INIT — runs on DOMContentLoaded
 */
function initAuth() {
  const session = _getSession();

  /*  Guest redirect: non-logged visitors go to Store, not Home  */
  if (!session) {
    const activePage = document.querySelector('.page.active');
    if (activePage && activePage.id === 'page-home' && typeof showPage === 'function') {
      showPage('store');
    }
  }

  /* Apply nav state immediately */
  _updateAuthNav(session);

  /* Close modals on overlay click */
  ['loginModal', 'registerModal'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', ev => {
      if (ev.target === el) el.classList.remove('open');
    });
  });

  /* Close modals on Escape */
  document.addEventListener('keydown', ev => {
    if (ev.key !== 'Escape') return;
    closeLoginModal();
    closeRegisterModal();
  });
}

document.addEventListener('DOMContentLoaded', initAuth);
