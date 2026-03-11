/* ============================================================
   DigiSpex — theme.js
   ── DARK / LIGHT THEME TOGGLE SYSTEM ──

   Features:
   • Switches between dark mode (default) and light mode
   • Saves preference to localStorage
   • Applies instantly on page load (no flash)
   • Updates toggle button icon + label
   • Uses CSS custom properties (--bg, --surface, etc.)
============================================================ */

const THEME_KEY  = 'ds_theme';
const DARK_ATTR  = 'dark';
const LIGHT_ATTR = 'light';

/* ── Apply a theme to <html> element ───────────────────── */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  // Update all toggle buttons (there may be one in nav + one in mobile menu)
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    if (theme === LIGHT_ATTR) {
      btn.innerHTML  = '&#9790;';   // crescent moon → switch to dark
      btn.title      = 'Switch to Dark Mode';
      btn.setAttribute('aria-label', 'Switch to Dark Mode');
    } else {
      btn.innerHTML  = '&#9728;';   // sun → switch to light
      btn.title      = 'Switch to Light Mode';
      btn.setAttribute('aria-label', 'Switch to Light Mode');
    }
  });
}

/* ── Toggle between dark and light ─────────────────────── */
function toggleTheme() {
  const current = localStorage.getItem(THEME_KEY) || DARK_ATTR;
  const next    = current === DARK_ATTR ? LIGHT_ATTR : DARK_ATTR;
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

/* ── Init: load saved preference immediately ────────────── */
(function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || DARK_ATTR;
  applyTheme(saved);
})();
