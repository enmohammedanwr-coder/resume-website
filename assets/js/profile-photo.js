/* ==========================================================================
   Unified profile photo — one source for every page.
   The photo always comes from `meta.photo` in the content layer, the exact
   same field the CV hero uses:
     1) the value published into data.js (window.SITE_DATA.meta.photo), and
     2) the live value edited from the dashboard (KV, served at /api/content),
        which wins when a backend is present.
   Every <img data-profile-photo> is kept in sync, so the landing welcome card
   and the CV hero always show the same picture — upload once, both update.
   ========================================================================== */
(function () {
  'use strict';

  function apply(url) {
    if (!url || typeof url !== 'string') return;
    document.querySelectorAll('[data-profile-photo]').forEach(function (el) {
      if (el.getAttribute('src') !== url) el.setAttribute('src', url);
    });
  }

  // Shared setter: the CV page's app.js calls this with the meta.photo it
  // already loaded, so both pages go through one code path.
  window.applyProfilePhoto = apply;

  // The CV site runs app.js, which is the single setter (it loads live content
  // and handles draft preview). Only pages without it fetch the photo here.
  if (document.getElementById('profilePhoto') ||
      document.querySelector('script[src*="app.js"]')) return;
  if (new URLSearchParams(location.search).has('preview')) return;

  // Fallback published into data.js (used as-is on hosts with no backend).
  apply(window.SITE_DATA && window.SITE_DATA.meta && window.SITE_DATA.meta.photo);

  // Live value from the dashboard, when a backend is available.
  try {
    fetch('/api/content', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        var url = j && j.ok && j.content && j.content.meta && j.content.meta.photo;
        if (url) apply(url);
      })
      .catch(function () { /* offline / not configured → keep current src */ });
  } catch (e) { /* no fetch support → keep current src */ }
})();
