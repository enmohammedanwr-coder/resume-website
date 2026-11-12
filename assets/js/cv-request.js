/* ==========================================================================
   CV request — secure download-approval + consent flow (frontend)
   --------------------------------------------------------------------------
   The CV PDF is NOT exposed as a static file. The flow is:
     1) Visitor sends a download request  ->  POST /api/cv-request
     2) The owner is notified and approves (out of band).
     3) On approval the visitor receives a short-lived, signed token.
     4) Before downloading, the visitor must accept the usage consent.
        The token is validated server-side (GET /api/cv-download?token=...).
   ========================================================================== */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const REQUEST_API = '/api/cv-request';
  const TOKEN_API = '/api/cv-download';
  const TOKEN_KEY = 'cvToken'; // survives a reload after approval

  // When the site and API share a domain (Cloudflare Pages) this is empty and
  // all calls are relative. Set meta.apiBase to point at a separate backend
  // (e.g. a Cloudflare Worker) when hosting the site elsewhere (GitHub Pages).
  const apiBase = () => (meta().apiBase || '').replace(/\/$/, '');
  const requestUrl = () => `${apiBase()}${REQUEST_API}`;
  const downloadUrl = (token) =>
    `${apiBase()}${TOKEN_API}?token=${encodeURIComponent(token)}&consent=1&lang=${lang()}`;

  function lang() {
    return localStorage.getItem('lang') === 'en' ? 'en' : 'ar';
  }
  function siteText(key) {
    const d = window.SITE_DATA;
    if (!d) return {};
    const l = d[lang()] || d.ar;
    return l[key] || (d.ar && d.ar[key]) || {};
  }
  const cvText = () => siteText('cvRequest');
  const consentText = () => siteText('cvConsent');
  const meta = () => (window.SITE_DATA && window.SITE_DATA.meta) || {};

  /* ---------- generic modal helpers ---------- */
  function openModal(id) {
    const m = $(id);
    if (!m) return;
    m.classList.add('open');
    m.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(id) {
    const m = $(id);
    if (!m) return;
    m.classList.remove('open');
    m.setAttribute('aria-hidden', 'true');
    if (!$('.modal.open') && !$('.grades-panel.open')) document.body.style.overflow = '';
  }

  /* ---------- labels ---------- */
  function syncRequestLabels() {
    const T = cvText();
    const M = meta();
    const set = (sel, val) => { const el = $(sel); if (el && val != null) el.textContent = val; };
    set('#cvModalTitle', T.title);
    set('[data-cv="intro"]', T.intro);
    set('[data-cv="nameLabel"]', T.nameLabel);
    set('[data-cv="emailLabel"]', T.emailLabel);
    set('[data-cv="reasonLabel"]', T.reasonLabel);
    set('#cvSubmit', T.submit);
    set('#cvWhatsapp', T.whatsapp);
    set('#cvHaveToken', T.haveToken);
    const name = $('#cv-name'); if (name) name.placeholder = T.namePh || '';
    const email = $('#cv-email'); if (email) email.placeholder = T.emailPh || '';
    const reason = $('#cv-reason'); if (reason) reason.placeholder = T.reasonPh || '';
    const wa = $('#cvWhatsapp');
    if (wa) wa.href = `https://wa.me/${M.whatsapp || ''}?text=${encodeURIComponent(T.waText || '')}`;
  }

  function syncConsentLabels() {
    const C = consentText();
    const set = (sel, val) => { const el = $(sel); if (el && val != null) el.textContent = val; };
    set('#cvConsentTitle', C.title);
    set('[data-consent="intro"]', C.intro);
    set('[data-consent="agree"]', C.agree);
    set('#cvConsentDownload', C.download);
    set('#cvConsentCancel', C.cancel);
    const list = $('#cvConsentList');
    if (list && Array.isArray(C.points)) {
      list.innerHTML = C.points.map((p) => `<li>${escapeHtml(p)}</li>`).join('');
    }
  }

  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- request form ---------- */
  function setError(name, message) {
    const field = document.querySelector(`#cv-${name}`)?.closest('.field');
    const err = document.querySelector(`[data-cv-err="${name}"]`);
    if (field) field.classList.toggle('has-error', !!message);
    if (err) err.textContent = message || '';
  }
  function clearErrors() {
    $$('#cvRequestForm .field').forEach((f) => f.classList.remove('has-error'));
    $$('#cvRequestForm .field__error').forEach((e) => (e.textContent = ''));
  }

  async function submitRequest(e) {
    e.preventDefault();
    const T = cvText();
    const status = $('#cvStatus');
    const btn = $('#cvSubmit');
    clearErrors();

    const fd = new FormData(e.target);
    const payload = {
      name: (fd.get('name') || '').toString().trim(),
      email: (fd.get('email') || '').toString().trim(),
      reason: (fd.get('reason') || '').toString().trim(),
      website: (fd.get('website') || '').toString(), // honeypot
      lang: lang()
    };
    if (payload.website) return; // silently drop bots

    let bad = false;
    if (!payload.name) { setError('name', T.errName); bad = true; }
    if (!EMAIL_RE.test(payload.email)) { setError('email', T.errEmail); bad = true; }
    if (bad) { status.className = 'form-status err'; status.textContent = T.error; return; }

    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = T.sending;
    status.className = 'form-status';
    status.textContent = '';

    try {
      const res = await fetch(requestUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.status === 404 || res.status === 501) {
        status.className = 'form-status info';
        status.textContent = T.notConfigured;
        return;
      }
      if (!res.ok) throw new Error('request failed');
      const data = await res.json().catch(() => ({}));
      status.className = 'form-status ok';
      status.textContent = T.success;
      e.target.reset();

      // If the owner had already approved this email, hand over the token.
      if (data && data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        closeModal('#cvModal');
        openConsent(data.token);
      }
    } catch (err) {
      status.className = 'form-status err';
      status.textContent = T.error;
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  }

  /* ---------- consent + download ---------- */
  function openConsent(token) {
    syncConsentLabels();
    const box = $('#cvConsentAgree');
    const dl = $('#cvConsentDownload');
    if (box) box.checked = false;
    if (dl) dl.disabled = true;
    const modal = $('#cvConsentModal');
    if (modal) modal.dataset.token = token || localStorage.getItem(TOKEN_KEY) || '';
    openModal('#cvConsentModal');
  }

  function startDownload() {
    const modal = $('#cvConsentModal');
    const token = (modal && modal.dataset.token) || localStorage.getItem(TOKEN_KEY) || '';
    const status = $('#cvConsentStatus');
    const C = consentText();
    if (!token) {
      if (status) { status.className = 'form-status err'; status.textContent = C.noToken; }
      return;
    }
    // The server validates the token, checks consent was recorded, and streams
    // the PDF. We never expose a static PDF path.
    window.location.href = downloadUrl(token);
    if (status) { status.className = 'form-status ok'; status.textContent = C.downloading; }
  }

  function init() {
    const openBtn = $('#cvRequestBtn');
    if (openBtn) openBtn.addEventListener('click', () => { syncRequestLabels(); openModal('#cvModal'); });

    const form = $('#cvRequestForm');
    if (form) form.addEventListener('submit', submitRequest);

    // "Already have an approval code?" → open the consent modal.
    const haveToken = $('#cvHaveToken');
    if (haveToken) haveToken.addEventListener('click', (ev) => {
      ev.preventDefault();
      closeModal('#cvModal');
      openConsent(localStorage.getItem(TOKEN_KEY) || '');
    });

    const agree = $('#cvConsentAgree');
    if (agree) agree.addEventListener('change', () => {
      const dl = $('#cvConsentDownload');
      if (dl) dl.disabled = !agree.checked;
    });
    const dl = $('#cvConsentDownload');
    if (dl) dl.addEventListener('click', startDownload);

    $$('[data-cv-close]').forEach((el) => el.addEventListener('click', () => closeModal('#cvModal')));
    $$('[data-consent-close]').forEach((el) => el.addEventListener('click', () => closeModal('#cvConsentModal')));
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if ($('#cvConsentModal')?.classList.contains('open')) closeModal('#cvConsentModal');
      else if ($('#cvModal')?.classList.contains('open')) closeModal('#cvModal');
    });

    const langBtn = $('#langToggle');
    if (langBtn) langBtn.addEventListener('click', () => { syncRequestLabels(); syncConsentLabels(); });

    syncRequestLabels();
    syncConsentLabels();

    // Approval link opened from the owner's email: /?cv=<token>
    const urlToken = new URLSearchParams(window.location.search).get('cv');
    if (urlToken) {
      localStorage.setItem(TOKEN_KEY, urlToken);
      // Clean the token out of the address bar.
      const clean = new URL(window.location.href);
      clean.searchParams.delete('cv');
      window.history.replaceState({}, '', clean.pathname + clean.hash);
      openConsent(urlToken);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.CvRequest = { open: () => openModal('#cvModal'), openConsent, close: () => closeModal('#cvModal') };
})();
