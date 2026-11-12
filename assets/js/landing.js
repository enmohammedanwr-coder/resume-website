/* ==========================================================================
   Landing page logic — theme (persisted), AR/EN toggle, discreet admin entry.
   The admin link is not a plain anchor: it is revealed by a subtle control or
   the keyboard shortcut, so it is not an obvious target on the public page.
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var LS_THEME = 'theme';
  var LS_LANG = 'lang';

  /* ---------- i18n ---------- */
  var TEXT = {
    ar: {
      dir: 'rtl', lang: 'ar',
      greeting: 'مرحباً، أنا',
      role: 'خريج نظم المعلومات الحاسوبية، مطوّر مواقع وتطبيقات، ومتخصص في قواعد البيانات وتقنية المعلومات.',
      home: 'الرئيسية',
      theme: 'تبديل الوضع',
      lang: 'English',
      footer: 'جميع الحقوق محفوظة',
      title: 'محمد أنور عمران | مرحباً'
    },
    en: {
      dir: 'ltr', lang: 'en',
      greeting: 'Hello, I am',
      role: 'Information Systems graduate, web & app developer, specialised in databases and IT.',
      home: 'Home',
      theme: 'Toggle theme',
      lang: 'العربية',
      footer: 'All rights reserved',
      title: 'Mohammed Anwar Omran | Welcome'
    }
  };

  var state = {
    theme: localStorage.getItem(LS_THEME) || 'dark',
    lang: localStorage.getItem(LS_LANG) === 'en' ? 'en' : 'ar'
  };

  function applyTheme() {
    document.documentElement.dataset.theme = state.theme;
    localStorage.setItem(LS_THEME, state.theme);
  }

  function applyLang() {
    var t = TEXT[state.lang];
    var html = document.documentElement;
    html.lang = t.lang;
    html.dir = t.dir;
    document.title = t.title;
    $$('[data-t]').forEach(function (el) { el.textContent = t[el.dataset.t] || el.textContent; });
    $$('[data-t-aria]').forEach(function (el) { el.setAttribute('aria-label', t[el.dataset.tAria]); });
    $('#year').textContent = new Date().getFullYear();
    localStorage.setItem(LS_LANG, state.lang);
  }

  /* ---------- theme + language controls ---------- */
  $('#themeToggle').addEventListener('click', function () {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
  });
  $('#langToggle').addEventListener('click', function () {
    state.lang = state.lang === 'ar' ? 'en' : 'ar';
    applyLang();
  });

  /* ---------- discreet admin entry ----------
     Three ways in, none of which is an obvious public button:
       1) the low-opacity lock dot in the corner,
       2) Ctrl/Cmd + Shift + A,
       3) typing the Konami-style sequence "admin".
     All of them just navigate to the dashboard, which enforces login
     server-side. The URL is relative (not "/admin") so it also works when the
     site is served from a subpath (GitHub Pages project site). */
  var adminUrl = 'admin';

  function goAdmin() { window.location.href = adminUrl; }

  var lock = $('#adminLock');
  if (lock) lock.addEventListener('click', goAdmin);

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault(); goAdmin();
    }
  });

  var buffer = '';
  document.addEventListener('keydown', function (e) {
    if (e.key.length !== 1) return;
    buffer = (buffer + e.key.toLowerCase()).slice(-5);
    if (buffer === 'admin') goAdmin();
  });

  /* ---------- particles (light touch) ---------- */
  function initParticles() {
    var canvas = $('#particles');
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var ctx = canvas.getContext('2d');
    var w, h, parts, raf;
    var COUNT = Math.min(54, Math.round(window.innerWidth / 26));

    function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
    function make() {
      parts = Array.from({ length: COUNT }, function () {
        return {
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.32, vy: (Math.random() - 0.5) * 0.32,
          r: Math.random() * 1.7 + 0.5
        };
      });
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      var light = document.documentElement.dataset.theme === 'light';
      var c = light ? '47,124,246' : '56,189,248';
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + c + ',.65)'; ctx.fill();
        for (var j = i + 1; j < parts.length; j++) {
          var q = parts[j], dx = p.x - q.x, dy = p.y - q.y, d = Math.hypot(dx, dy);
          if (d < 130) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = 'rgba(' + c + ',' + (0.13 * (1 - d / 130)) + ')';
            ctx.lineWidth = 1; ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    resize(); make(); draw();
    window.addEventListener('resize', function () { resize(); make(); });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) cancelAnimationFrame(raf); else draw();
    });
  }

  applyTheme();
  applyLang();
  initParticles();
})();
