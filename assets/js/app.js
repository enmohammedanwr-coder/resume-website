/* ==========================================================================
   Mohammed Anwar Omran — App logic
   i18n (AR/EN), RTL/LTR, dark/light theme, rendering, animations,
   project modal, contact form (with real integration hook + validation).
   ========================================================================== */

/* ---------- SVG icon set ---------- */
const ICONS = {
  web: '<path fill="currentColor" d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Zm2 3v11h14V8H5Zm2-2a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm2.5 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/>',
  code: '<path fill="currentColor" d="m8.7 16.3-4.3-4.3 4.3-4.3 1.4 1.4L7.2 12l2.9 2.9-1.4 1.4Zm6.6 0-1.4-1.4L16.8 12l-2.9-2.9 1.4-1.4 4.3 4.3-4.3 4.3Z"/>',
  android: '<path fill="currentColor" d="M6 9a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Zm12 0a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1ZM7 9h10v7a1.5 1.5 0 0 1-1.5 1.5H13V21a1 1 0 1 1-2 0v-3.5H8.5A1.5 1.5 0 0 1 7 16V9Zm1.6-4.4L7.4 3.4a.5.5 0 0 1 .9-.6L9.6 4A5.4 5.4 0 0 1 12 3.5c.9 0 1.7.2 2.4.5l1.3-1.2a.5.5 0 1 1 .9.6l-1.2 1.2A4.9 4.9 0 0 1 17 7H7a4.9 4.9 0 0 1 1.6-2.4ZM9.5 5.5a.6.6 0 1 0 0 1.2.6.6 0 0 0 0-1.2Zm5 0a.6.6 0 1 0 0 1.2.6.6 0 0 0 0-1.2Z"/>',
  database: '<path fill="currentColor" d="M12 3c4.4 0 8 1.2 8 2.6S16.4 8.2 12 8.2 4 7 4 5.6 7.6 3 12 3Zm8 5.2v3.2c0 1.4-3.6 2.6-8 2.6s-8-1.2-8-2.6V8.2c1.5 1.1 4.6 1.7 8 1.7s6.5-.6 8-1.7Zm0 5.2v3.2c0 1.4-3.6 2.6-8 2.6s-8-1.2-8-2.6v-3.2c1.5 1.1 4.6 1.7 8 1.7s6.5-.6 8-1.7Z"/>',
  building: '<path fill="currentColor" d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16h-3v-3H8v3H4Zm3-13h2v2H7V8Zm4 0h2v2h-2V8ZM7 11h2v2H7v-2Zm4 0h2v2h-2v-2Zm6-3h3a1 1 0 0 1 1 1v12h-4V8Z"/>',
  analysis: '<path fill="currentColor" d="M4 20V4a1 1 0 0 1 1-1h1a1 1 0 0 1 0 2H6v14h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Zm14.7-12.3-4.4 5.3-3-2.4a1 1 0 0 0-1.5.1l-3.2 4.4a1 1 0 1 0 1.6 1.2l2.5-3.4 3 2.4a1 1 0 0 0 1.5-.1l5.1-6.2a1 1 0 0 0-1.5-1.3Z"/>',
  data: '<path fill="currentColor" d="M4 5a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v4H6v10a1 1 0 1 1-2 0V5Zm4 5h11a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Zm2 3v2h2v-2h-2Zm3 0v2h2v-2h-2Z"/>',
  chart: '<path fill="currentColor" d="M5 20a1 1 0 0 1-1-1v-6a1 1 0 0 1 2 0v6a1 1 0 0 1-1 1Zm5 0a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v11a1 1 0 0 1-1 1Zm5 0a1 1 0 0 1-1-1v-4a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1Zm5 0a1 1 0 0 1-1-1V4a1 1 0 0 1 2 0v15a1 1 0 0 1-1 1Z"/>',
  office: '<path fill="currentColor" d="M4 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8L10.6 4.6A2 2 0 0 0 9.2 4H4Zm3.5 4.5h9a.75.75 0 1 1 0 1.5h-9a.75.75 0 1 1 0-1.5Zm0 3.5h9a.75.75 0 1 1 0 1.5h-9a.75.75 0 1 1 0-1.5Z"/>',
  repair: '<path fill="currentColor" d="m14.7 6.3 3 3a1 1 0 0 1 0 1.4l-1 1a1 1 0 0 1-1.4 0l-3-3A1 1 0 0 1 12 7.3l1-1a1 1 0 0 1 1.4 0ZM4.9 17.7l9.9-9.9-2.6-2.6-9.9 9.9a1 1 0 0 0 0 1.4l1.2 1.2a1 1 0 0 0 1.4 0Zm9.5-11.5 1.4-1.4a3 3 0 0 1 4.2 4.2l-1.4 1.4-4.2-4.2Z"/>',
  manage: '<path fill="currentColor" d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.5 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM2.5 18a1 1 0 0 1 1-1h11a1 1 0 1 1 0 2h-11a1 1 0 0 1-1-1Zm14.2-1.5a1 1 0 0 1 1-1h2.8a1 1 0 1 1 0 2h-2.8a1 1 0 0 1-1-1Z"/>',
  ai: '<path fill="currentColor" d="M12 2a1 1 0 0 1 1 1v1.2A5.8 5.8 0 0 1 17.8 9H19a1 1 0 1 1 0 2h-1.1a5.8 5.8 0 0 1-1.4 3.2l.8.8a1 1 0 0 1-1.4 1.4l-.8-.8A5.8 5.8 0 0 1 13 16.8V19a1 1 0 1 1-2 0v-2.2a5.8 5.8 0 0 1-2.1-1.2l-.8.8a1 1 0 1 1-1.4-1.4l.8-.8A5.8 5.8 0 0 1 6.1 11H5a1 1 0 1 1 0-2h1.2A5.8 5.8 0 0 1 11 4.2V3a1 1 0 0 1 1-1Zm0 5.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z"/>',
  security: '<path fill="currentColor" d="M12 2 4 5v6c0 5 3.4 8.9 8 11 4.6-2.1 8-6 8-11V5l-8-3Zm0 4a2.5 2.5 0 0 1 2.5 2.5c0 1-.6 1.9-1.5 2.3V15a1 1 0 0 1-2 0v-4.2a2.5 2.5 0 0 1 1-4.8Z"/>',
  solution: '<path fill="currentColor" d="M12 2a7 7 0 0 0-4 12.7V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.3A7 7 0 0 0 12 2Zm-2 19h4a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1Zm2-6.5V14a1 1 0 0 0 1-1 3 3 0 1 0-3-3 1 1 0 1 0 2 0 1 1 0 0 1 1 1 1 1 0 0 0-1 1v.5Z"/>',
  thinking: '<path fill="currentColor" d="M12 2a6 6 0 0 0-6 6c0 1.5.5 2.8 1.4 3.8-.3.9-.9 2-.9 3.2a1 1 0 0 0 2 .1c0-.5.3-1.1.6-1.7.6.3 1.2.5 1.9.6v4a1 1 0 1 0 2 0v-4a5.9 5.9 0 0 0 4.6-5.5A6 6 0 0 0 12 2Z"/>',
  details: '<path fill="currentColor" d="M11 4a7 7 0 1 0 4.2 12.6l3.6 3.6a1 1 0 0 0 1.4-1.4l-3.6-3.6A7 7 0 0 0 11 4Zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm-1 2v1.5h2V8h-2Zm0 2.5v4h2v-4h-2Z"/>',
  team: '<path fill="currentColor" d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-8 2c-2.7 0-5 1.3-5 3v1h10v-1c0-1.7-2.3-3-5-3Zm8 0c-.7 0-1.4.1-2 .3 1.2.8 2 1.7 2 2.7v1h5v-1c0-1.7-2.2-3-5-3Z"/>',
  learn: '<path fill="currentColor" d="M12 3 2 8l10 5 8-4v6a1 1 0 1 0 2 0V8L12 3ZM6 11.2V15c0 1.7 2.7 3 6 3s6-1.3 6-3v-3.8l-6 3-6-3Z"/>',
  hybrid: '<path fill="currentColor" d="M12 2 4 6v6c0 4.4 3.4 8.4 8 10 4.6-1.6 8-5.6 8-10V6l-8-4Zm-2.5 9 4-2 4 2v3.5c0 .8-.7 1.5-1.5 1.5h-5c-.8 0-1.5-.7-1.5-1.5V11Z"/>',
  phone: '<path fill="currentColor" d="M6.6 3h2.2c.5 0 .9.3 1 .8l.9 3.2c.1.4 0 .9-.4 1.2l-1.3 1A12 12 0 0 0 12 12.4l1-1.3c.3-.4.8-.5 1.2-.4l3.2.9c.5.1.8.5.8 1v2.2c0 1-.8 1.9-1.9 1.9A15.9 15.9 0 0 1 4.7 4.9C4.7 3.9 5.5 3 6.6 3Z"/>',
  mail: '<path fill="currentColor" d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Zm2 .4V18h14V6.4l-7 4.6-7-4.6ZM18.6 6H5.4L12 10.3 18.6 6Z"/>',
  whatsapp: '<path fill="currentColor" d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.4A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .1-1.7-.1a12 12 0 0 1-5.6-4.9c-.4-.7-.6-1.4-.5-2 .1-.6.6-1.3 1-1.5.3-.1.6 0 .8.3l.9 1.4c.1.3.1.5-.1.7l-.5.6c-.1.2-.2.4-.1.6.4.7 1.4 1.8 2.1 2.2.2.1.4.1.6-.1l.6-.5c.2-.2.4-.2.7-.1l1.5.7c.3.2.4.5.3.8Z"/>',
  linkedin: '<path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.7h.1A4.2 4.2 0 0 1 16.6 8.7c3 0 3.6 2 3.6 4.6V21h-4v-6.9c0-1.6 0-3.7-2.2-3.7s-2.6 1.7-2.6 3.6V21H9V9Z"/>',
  github: '<path fill="currentColor" d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2Z"/>',
  twitter: '<path fill="currentColor" d="M18.9 2H22l-7 8 8.2 12h-6.4l-5-6.6L6 22H3l7.5-8.6L2.5 2H9l4.5 6 5.4-6Zm-1.1 18h1.7L7.3 3.8H5.5L17.8 20Z"/>'
};
const icon = (n) => `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">${ICONS[n] || ICONS.code}</svg>`;

/* ---------- State ---------- */
const state = {
  lang: localStorage.getItem('lang') || 'ar',
  theme: localStorage.getItem('theme') || 'dark',
  data: null
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const get = (obj, path) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);

/* ---------- Rendering ---------- */
function render() {
  const L = state.data[state.lang];
  const M = state.data.meta;
  const html = document.documentElement;

  html.lang = L.lang;
  html.dir = L.dir;
  document.title = state.lang === 'ar'
    ? 'محمد أنور عمران | مطوّر برمجيات ومتخصص نظم معلومات'
    : 'Mohammed Anwar Omran | Software Developer & IS Specialist';

  // Simple field bindings
  $$('[data-field]').forEach(el => {
    const val = get(L, el.dataset.field);
    if (typeof val === 'string') el.textContent = val;
  });

  // Nav
  $$('[data-nav]').forEach(el => { el.textContent = L.nav[el.dataset.nav]; });

  // Hero buttons / cv
  const cvBtn = $('#cvDownload');
  if (cvBtn) { cvBtn.href = M.cvFile; cvBtn.setAttribute('download', ''); }
  $('#profilePhoto').src = M.photo;
  $('#langLabel').textContent = state.lang === 'ar' ? 'EN' : 'ع';
  $('#year').textContent = new Date().getFullYear();
  $('#footerBuilt').textContent = L.footer.built;
  $('#footerRights').textContent = L.footer.rights;

  // About
  $('#aboutText').innerHTML = L.about.paragraphs.map(p => `<p>${p}</p>`).join('');
  $('#aboutFacts').innerHTML = L.about.facts.map(f => `
    <div class="fact"><span class="fact__label">${f.label}</span><span class="fact__value">${f.value}</span></div>
  `).join('');

  // Projects
  $('#projectsGrid').innerHTML = L.projects.items.map(p => `
    <article class="card reveal" data-project="${p.id}">
      <div class="card__media">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'">
        <span class="card__tech-badge tags">${p.tech.map(t => `<span class="tag">${t}</span>`).join('')}</span>
      </div>
      <div class="card__body">
        <h3 class="card__title">${p.name}</h3>
        <p class="card__desc">${p.short}</p>
        <div class="card__actions">
          <button class="btn btn--ghost btn--sm" data-open="${p.id}">${L.projects.viewDetails}</button>
        </div>
      </div>
    </article>
  `).join('');

  // Services
  $('#servicesGrid').innerHTML = L.services.items.map((s, i) => `
    <article class="card service-card reveal">
      <div class="icon-wrap">${icon(s.icon)}</div>
      <h3>${s.name}</h3>
      <p>${s.desc}</p>
      <div class="card__actions">
        <button class="btn btn--primary btn--sm" data-request="${i}">${L.services.request}</button>
      </div>
    </article>
  `).join('');

  // Skills
  $('#skillsGrid').innerHTML = L.skills.groups.map(g => `
    <div class="skill-card reveal">
      <div class="skill-card__head">
        <div class="icon-wrap">${icon(g.icon)}</div>
        <h3>${g.title}</h3>
      </div>
      <div class="chips">${g.items.map(i => `<span class="chip">${i}</span>`).join('')}</div>
    </div>
  `).join('');

  // Qualifications
  const tl = (arr) => arr.map(x => `
    <div class="tl-item">
      <h4>${x.title}</h4>
      <p class="tl-org">${x.org}</p>
      ${x.meta ? `<span class="tl-meta">${x.meta}</span>` : ''}
    </div>`).join('');
  $('#eduTimeline').innerHTML = tl(L.qualifications.edu);
  $('#certTimeline').innerHTML = tl(L.qualifications.certs);

  // Why
  $('#whyGrid').innerHTML = L.why.items.map(w => `
    <div class="why-card reveal">
      <div class="icon-wrap">${icon(w.icon)}</div>
      <h3>${w.title}</h3>
      <p>${w.desc}</p>
    </div>
  `).join('');

  // Contact info
  const waText = state.lang === 'ar' ? 'مرحباً، أرغب في الاستفسار عن خدمة' : 'Hello, I would like to inquire about a service';
  $('#contactInfo').innerHTML = `
    <div class="info-card">
      <div class="icon-wrap">${icon('phone')}</div>
      <div><div class="info-label">${L.contact.phoneLabel}</div><div class="info-value">${M.phone}</div></div>
    </div>
    ${M.emails.map(e => `
      <div class="info-card">
        <div class="icon-wrap">${icon('mail')}</div>
        <div><div class="info-label">${L.contact.emailLabel}</div><div class="info-value">${e}</div></div>
      </div>`).join('')}
    <div class="info-buttons">
      <a class="btn btn--accent" href="https://wa.me/${M.whatsapp}?text=${encodeURIComponent(waText)}" target="_blank" rel="noopener">${icon('whatsapp')}<span>${L.contact.whatsappBtn}</span></a>
      <a class="btn btn--ghost" href="mailto:${M.emails[0]}">${icon('mail')}<span>${L.contact.emailBtn}</span></a>
    </div>
  `;

  // Form labels
  const F = L.contact.form;
  mapField('cf-name', F.name, F.namePh);
  mapField('cf-email', F.email, F.emailPh);
  mapField('cf-subject', F.subject, F.subjectPh);
  mapField('cf-message', F.message, F.messagePh);
  $('#cfSubmit').textContent = F.submit;

  // Social
  renderSocial(M.social);

  // Re-observe new reveals
  observeReveals();
}

function mapField(id, label, ph) {
  const el = $('#' + id);
  const lab = document.querySelector(`label[for="${id}"]`);
  if (lab) lab.textContent = label;
  if (el && ph) el.placeholder = ph;
}

function renderSocial(social) {
  const links = [];
  if (social.github) links.push(`<a href="${social.github}" target="_blank" rel="noopener" aria-label="GitHub">${icon('github')}</a>`);
  if (social.linkedin) links.push(`<a href="${social.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn">${icon('linkedin')}</a>`);
  if (social.twitter) links.push(`<a href="${social.twitter}" target="_blank" rel="noopener" aria-label="Twitter">${icon('twitter')}</a>`);
  links.push(`<a href="mailto:${state.data.meta.emails[0]}" aria-label="Email">${icon('mail')}</a>`);
  links.push(`<a href="https://wa.me/${state.data.meta.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon('whatsapp')}</a>`);
  const html = links.join('');
  $('#heroSocial').innerHTML = html;
  $('#footerSocial').innerHTML = html;
}

/* ---------- Theme ---------- */
function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  localStorage.setItem('theme', state.theme);
}
$('#themeToggle').addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
});

/* ---------- Language ---------- */
$('#langToggle').addEventListener('click', () => {
  state.lang = state.lang === 'ar' ? 'en' : 'ar';
  localStorage.setItem('lang', state.lang);
  render();
});

/* ---------- Header / nav ---------- */
const header = $('#header');
const nav = $('#nav');
const menuBtn = $('#menuToggle');
$('#menuToggle').addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});
$$('.nav__link').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
}));

const progress = $('#scrollProgress');
const backTop = $('#backToTop');
function onScroll() {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 20);
  const h = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  backTop.classList.toggle('show', y > 500);
  updateActiveNav(y);
}
window.addEventListener('scroll', onScroll, { passive: true });
backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

function updateActiveNav(y) {
  const links = $$('.nav__link');
  let current = '';
  $$('section[id]').forEach(sec => {
    if (y >= sec.offsetTop - 120) current = sec.id;
  });
  links.forEach(l => {
    const target = l.getAttribute('href').slice(1);
    l.classList.toggle('active', target === current);
  });
}

/* ---------- Reveal on scroll ---------- */
let revealObserver;
function observeReveals() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObserver.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  }
  $$('.reveal').forEach(el => { if (!el.classList.contains('in')) revealObserver.observe(el); });
}

/* ---------- Card pointer glow ---------- */
document.addEventListener('pointermove', (e) => {
  const card = e.target.closest('.card');
  if (!card) return;
  const r = card.getBoundingClientRect();
  card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
  card.style.setProperty('--my', (e.clientY - r.top) + 'px');
});

/* ---------- Project modal ---------- */
const modal = $('#projectModal');
function openProject(id) {
  const L = state.data[state.lang];
  const p = L.projects.items.find(x => x.id === id);
  if (!p) return;
  $('#modalImg').src = p.image;
  $('#modalImg').alt = p.name;
  $('#modalTitle').textContent = p.name;
  $('#modalTags').innerHTML = p.tech.map(t => `<span class="tag">${t}</span>`).join('');
  $('#modalDesc').textContent = p.details;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
document.addEventListener('click', (e) => {
  const openBtn = e.target.closest('[data-open]');
  if (openBtn) { openProject(openBtn.dataset.open); return; }
  const reqBtn = e.target.closest('[data-request]');
  if (reqBtn) { requestService(Number(reqBtn.dataset.request)); return; }
  if (e.target.closest('[data-close]')) closeModal();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

/* Service request → focus contact form + prefill */
function requestService(index) {
  const L = state.data[state.lang];
  const service = L.services.items[index];
  if (!service) return;
  const subjectEl = $('#cf-subject');
  const msgEl = $('#cf-message');
  subjectEl.value = state.lang === 'ar' ? `طلب خدمة: ${service.name}` : `Service Request: ${service.name}`;
  msgEl.value = state.lang === 'ar'
    ? `مرحباً، أرغب في طلب خدمة: ${service.name}.\n\nالتفاصيل: `
    : `Hello, I would like to request the service: ${service.name}.\n\nDetails: `;
  document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => msgEl.focus(), 600);
}

/* ---------- Contact form ---------- */
/* Integration hook: set SITE_DATA.meta.formEndpoint to a real endpoint
   (e.g. Formspree: https://formspree.io/f/xxxx) to enable real sending.
   Without it, the form never shows a fake success message. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function setError(name, message) {
  const input = document.querySelector(`[name="${name}"]`);
  const field = input?.closest('.field');
  const err = document.querySelector(`[data-err="${name}"]`);
  if (field) field.classList.toggle('has-error', !!message);
  if (err) err.textContent = message || '';
}
function clearErrors() {
  $$('.field').forEach(f => f.classList.remove('has-error'));
  $$('.field__error').forEach(e => e.textContent = '');
}
function validateForm(data) {
  const F = state.data[state.lang].contact.form;
  const errors = {};
  if (!data.name.trim()) errors.name = F.errName;
  if (!EMAIL_RE.test(data.email.trim())) errors.email = F.errEmail;
  if (!data.subject.trim()) errors.subject = F.errSubject;
  if (data.message.trim().length < 10) errors.message = F.errMessage;
  return errors;
}

$('#contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const F = state.data[state.lang].contact.form;
  const status = $('#formStatus');
  const submitBtn = $('#cfSubmit');
  clearErrors();

  const fd = new FormData(e.target);
  const data = {
    name: fd.get('name') || '',
    email: fd.get('email') || '',
    subject: fd.get('subject') || '',
    message: fd.get('message') || '',
    website: fd.get('website') || ''   // honeypot
  };

  // Anti-spam: if honeypot filled, silently ignore
  if (data.website) return;

  const errors = validateForm(data);
  if (Object.keys(errors).length) {
    Object.entries(errors).forEach(([k, v]) => setError(k, v));
    status.className = 'form-status err';
    status.textContent = state.lang === 'ar' ? 'يرجى تصحيح الحقول المُظللة.' : 'Please correct the highlighted fields.';
    return;
  }

  const endpoint = state.data.meta.formEndpoint;
  if (!endpoint) {
    // No real backend configured → be honest, offer direct channels
    status.className = 'form-status info';
    status.textContent = F.notConfigured;
    return;
  }

  submitBtn.disabled = true;
  const originalText = submitBtn.textContent;
  submitBtn.textContent = F.sending;
  status.className = 'form-status';
  status.textContent = '';

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: data.name, email: data.email, subject: data.subject, message: data.message })
    });
    if (!res.ok) throw new Error('Request failed');
    status.className = 'form-status ok';
    status.textContent = F.success;
    e.target.reset();
  } catch (err) {
    status.className = 'form-status err';
    status.textContent = F.error;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

/* ---------- Particles background ---------- */
function initParticles() {
  const canvas = $('#particles');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles, raf;
  const COUNT = Math.min(70, Math.round(window.innerWidth / 22));

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  function make() {
    particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.6
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    const light = document.documentElement.dataset.theme === 'light';
    const pColor = light ? '47,124,246' : '56,189,248';
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${pColor},.7)`;
      ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${pColor},${0.14 * (1 - dist / 120)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(draw);
  }
  resize(); make(); draw();
  window.addEventListener('resize', () => { resize(); make(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else draw();
  });
}

/* ---------- Init ---------- */
function init() {
  // Draft preview: admin panel opens index.html?preview=1 to show unsaved edits
  const isPreview = new URLSearchParams(location.search).has('preview');
  let data = window.SITE_DATA;
  if (isPreview) {
    try {
      const draft = JSON.parse(localStorage.getItem('siteDraft'));
      if (draft) data = draft;
    } catch (e) { /* keep original */ }
    showPreviewBanner();
  }
  state.data = data;
  applyTheme();
  render();
  onScroll();
  initParticles();
}

function showPreviewBanner() {
  const el = document.createElement('div');
  el.className = 'preview-banner';
  el.setAttribute('dir', 'rtl');
  el.innerHTML = '👁 <b>وضع المعاينة</b> — هذه تعديلاتك غير المنشورة. ' +
    'لنشرها على الإنترنت ارجع إلى لوحة التحكم واضغط «🚀 نشر».';
  document.body.appendChild(el);
}
init();
