/* ============================================================
   DigiSpex — auth-modal.js  (API-backed version)
   All auth is server-side PostgreSQL sessions via DS_API.
   No localStorage or sessionStorage for auth data.
============================================================ */

function getCurrentUser() { return DS_API.auth.getSession(); }
function isLoggedIn()     { return DS_API.auth.isLoggedIn(); }

function _validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()); }

function _setError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent   = msg;
  el.style.display = msg ? 'block' : 'none';
}
function _clearErrors(prefix) {
  ['name','email','password','confirm','general'].forEach(f => _setError(prefix+'-err-'+f, ''));
}

function openLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) { _clearErrors('login'); modal.classList.add('open'); }
  else window.location.href = '/login';
}
function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.remove('open');
}
function openRegisterModal() {
  const modal = document.getElementById('registerModal');
  if (modal) { _clearErrors('reg'); modal.classList.add('open'); }
  else window.location.href = '/register';
}
function closeRegisterModal() {
  const modal = document.getElementById('registerModal');
  if (modal) modal.classList.remove('open');
}
function switchToRegister() { closeLoginModal(); openRegisterModal(); }
function switchToLogin()    { closeRegisterModal(); openLoginModal(); }

async function handleRegister(e) {
  e.preventDefault();
  _clearErrors('reg');
  const name     = (document.getElementById('regName')?.value     || '').trim();
  const email    = (document.getElementById('regEmail')?.value    || '').trim().toLowerCase();
  const password = (document.getElementById('regPassword')?.value || '').trim();
  const confirm  = (document.getElementById('regConfirm')?.value  || '').trim();

  let valid = true;
  if (!name)                    { _setError('reg-err-name',     'Name is required.');                        valid = false; }
  if (!email)                   { _setError('reg-err-email',    'Email is required.');                       valid = false; }
  else if (!_validEmail(email)) { _setError('reg-err-email',    'Enter a valid email address.');             valid = false; }
  if (!password)                { _setError('reg-err-password', 'Password is required.');                    valid = false; }
  else if (password.length < 6){ _setError('reg-err-password', 'Password must be at least 6 characters.'); valid = false; }
  if (!confirm)                 { _setError('reg-err-confirm',  'Please confirm your password.');            valid = false; }
  else if (password !== confirm){ _setError('reg-err-confirm',  'Passwords do not match.');                  valid = false; }
  if (!valid) return;

  try {
    const user = await DS_API.auth.register(name, email, password);
    closeRegisterModal();
    _onAuthChange(user, 'registered');
  } catch (err) {
    const msg = err.message || 'Registration failed.';
    if (msg.toLowerCase().includes('email')) _setError('reg-err-email', msg);
    else _setError('reg-err-general', msg);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  _clearErrors('login');
  const email    = (document.getElementById('loginEmail')?.value    || '').trim().toLowerCase();
  const password = (document.getElementById('loginPassword')?.value || '').trim();

  let valid = true;
  if (!email)                   { _setError('login-err-email',    'Email is required.');           valid = false; }
  else if (!_validEmail(email)) { _setError('login-err-email',    'Enter a valid email address.'); valid = false; }
  if (!password)                { _setError('login-err-password', 'Password is required.');        valid = false; }
  if (!valid) return;

  try {
    const user = await DS_API.auth.login(email, password);
    closeLoginModal();
    if (user.role === 'admin') { window.location.href = '/admin'; return; }
    if (user.role === 'owner') { window.location.href = '/owner'; return; }
    _onAuthChange(user, 'loggedin');
  } catch (err) {
    _setError('login-err-general', err.message || 'Incorrect email or password.');
  }
}

async function handleLogout() {
  await DS_API.auth.logout();
  window.location.href = '/';
}

function _onAuthChange(user, action) {
  _updateAuthNav(user);
  if (action === 'registered') showToast('Welcome, ' + user.name + '! Account created.', 'success');
  if (action === 'loggedin')   showToast('Welcome back, ' + user.name + '!', 'success');
  if (action === 'loggedout')  showToast('You have been logged out.', 'success');
}

function _updateAuthNav(user) {
  const guestArea   = document.getElementById('navAuthGuest');
  const userArea    = document.getElementById('navAuthUser');
  const userLabel   = document.getElementById('navUserLabel');
  const bellWrap    = document.getElementById('notifBellWrap');
  const msgBtn      = document.getElementById('navMsgBtn');
  const ordersTab   = document.getElementById('navOrdersTab');
  const wishlistTab = document.getElementById('navWishlistTab');

  if (!guestArea || !userArea) return;

  if (user) {
    guestArea.style.display = 'none';
    userArea.style.display  = 'flex';
    if (userLabel) userLabel.textContent = user.name;

    const existingPanelBtn = document.getElementById('navPanelBtn');
    if (existingPanelBtn) existingPanelBtn.remove();
    if (user.role === 'admin' || user.role === 'owner') {
      const panelBtn = document.createElement('a');
      panelBtn.id        = 'navPanelBtn';
      panelBtn.className = 'nav-auth-btn nav-login-btn';
      panelBtn.style.cssText = 'background:rgba(124,58,237,0.18);color:#a78bfa;border-color:rgba(124,58,237,0.4);';
      panelBtn.href = user.role === 'admin' ? '/admin' : '/owner';
      panelBtn.textContent = user.role === 'admin' ? 'Admin Panel' : 'Owner Panel';
      userArea.insertBefore(panelBtn, userArea.firstChild);
    }
    if (bellWrap)     bellWrap.style.display    = '';
    if (msgBtn)       msgBtn.style.display      = 'flex';
    if (ordersTab)    ordersTab.style.display   = '';
    if (wishlistTab)  wishlistTab.style.display = '';
    if (typeof _renderMsgBadge    === 'function') _renderMsgBadge();
    if (typeof _refreshBell       === 'function') _refreshBell();
    if (typeof _updateWishlistBadge === 'function') _updateWishlistBadge();
    const wlOpt = document.getElementById('sortWishlistOption');
    if (wlOpt) wlOpt.style.display = '';
  } else {
    guestArea.style.display = 'flex';
    userArea.style.display  = 'none';
    if (bellWrap)     bellWrap.style.display    = 'none';
    if (msgBtn)       msgBtn.style.display      = 'none';
    if (ordersTab)    ordersTab.style.display   = 'none';
    if (wishlistTab)  wishlistTab.style.display = 'none';
    const wlOpt = document.getElementById('sortWishlistOption');
    if (wlOpt) wlOpt.style.display = 'none';
    const activePage = document.querySelector('.page.active');
    if (activePage && (activePage.id === 'page-orders' || activePage.id === 'page-wishlist') && typeof showPage === 'function') {
      showPage('store');
    }
  }
}

function togglePasswordVis(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  const show = inp.type === 'password';
  inp.type      = show ? 'text' : 'password';
  btn.innerHTML = show ? '&#128584;' : '&#128065;';
}

async function initAuth() {
  const session = DS_API.auth.getSession();
  if (!session) {
    const activePage = document.querySelector('.page.active');
    if (activePage && activePage.id === 'page-home' && typeof showPage === 'function') {
      showPage('store');
    }
  }
  _updateAuthNav(session);

  ['loginModal','registerModal'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', ev => { if (ev.target === el) el.classList.remove('open'); });
  });
  document.addEventListener('keydown', ev => {
    if (ev.key !== 'Escape') return;
    closeLoginModal(); closeRegisterModal();
  });
}

document.addEventListener('DOMContentLoaded', initAuth);
