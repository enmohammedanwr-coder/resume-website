/* ==========================================================================
   درجاتي — Grades UI
   Renders the grades panel from GRADES_DATA (assets/js/grades.js).
   The panel stays hidden until the visitor clicks the "درجاتي" button.
   ========================================================================== */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  function currentLang() {
    return (window.SITE_DATA && localStorage.getItem('lang')) === 'en' ? 'en' : 'ar';
  }

  // Pick the right translation for a { ar, en } object.
  function tr(obj) {
    if (obj == null) return '';
    if (typeof obj === 'string') return obj;
    return obj[currentLang()] ?? obj.ar ?? '';
  }

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function semesterAverage(subjects) {
    if (!subjects.length) return null;
    return Math.round((subjects.reduce((a, s) => a + s.grade, 0) / subjects.length) * 100) / 100;
  }

  function renderTable(subjects, L, S) {
    const rows = subjects.map((s) => {
      const pass = s.grade >= S.passMark;
      return `
        <tr>
          <td>${esc(tr(s.name))}</td>
          <td class="num grade-val">${esc(s.grade)}</td>
          <td class="num"><span class="grade-badge grade-badge--${pass ? 'pass' : 'fail'}">${esc(pass ? tr(L.pass) : tr(L.fail))}</span></td>
        </tr>`;
    }).join('');

    const avg = semesterAverage(subjects);
    const avgLine = (S.showSemesterAverage && avg !== null)
      ? `<p class="grade-sem__avg">${esc(tr(L.semesterAvg))}: <b>${esc(avg)}</b> / ${esc(S.maxMark)}</p>`
      : '';

    return `
      <table class="grade-table">
        <thead>
          <tr>
            <th>${esc(tr(L.subject))}</th>
            <th class="num">${esc(tr(L.grade))}</th>
            <th class="num">${esc(tr(L.status))}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      ${avgLine}`;
  }

  function renderSemester(sem, L, S) {
    const title = `<h4 class="grade-sem__title">${esc(tr(sem.name))}</h4>`;
    if (!sem.recorded || !sem.subjects || !sem.subjects.length) {
      return `<div class="grade-sem">${title}<div class="grade-sem__pending">${esc(tr(L.pending))}</div></div>`;
    }
    return `<div class="grade-sem">${title}${renderTable(sem.subjects, L, S)}</div>`;
  }

  function renderLevel(level, L, S) {
    const sems = level.semesters.map((s) => renderSemester(s, L, S)).join('');
    return `
      <div class="grade-level">
        <div class="grade-level__head">
          <span>${esc(tr(level.name))}</span>
          <span class="grade-level__year">${esc(tr(L.academicYear))}: ${esc(level.year)}</span>
        </div>
        ${sems}
      </div>`;
  }

  function renderPanel() {
    const data = window.GRADES_DATA;
    const body = $('#gradesBody');
    if (!data || !body) return;
    const L = data.labels;
    const S = data.settings;
    body.innerHTML = data.levels.map((lv) => renderLevel(lv, L, S)).join('');
  }

  function syncLabels() {
    const data = window.GRADES_DATA;
    if (!data) return;
    const L = data.labels;
    const btnLabel = $('[data-grades-label]');
    if (btnLabel) btnLabel.textContent = tr(L.button);
    const title = $('[data-grades-title]');
    if (title) title.textContent = tr(L.title);
    const sub = $('[data-grades-subtitle]');
    if (sub) sub.textContent = tr(L.subtitle);
    const btn = $('#gradesToggle');
    if (btn) btn.title = tr(L.button);
  }

  function openPanel() {
    const panel = $('#gradesPanel');
    const btn = $('#gradesToggle');
    if (!panel) return;
    renderPanel();
    syncLabels();
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closePanel() {
    const panel = $('#gradesPanel');
    const btn = $('#gradesToggle');
    if (!panel) return;
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function togglePanel() {
    const panel = $('#gradesPanel');
    if (!panel) return;
    if (panel.classList.contains('open')) closePanel();
    else openPanel();
  }

  function init() {
    const btn = $('#gradesToggle');
    if (btn) btn.addEventListener('click', togglePanel);
    const close = $('#gradesClose');
    if (close) close.addEventListener('click', closePanel);
    const panel = $('#gradesPanel');
    if (panel) panel.addEventListener('click', (e) => { if (e.target === panel) closePanel(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel && panel.classList.contains('open')) closePanel();
    });

    // Re-label and re-render when the site language changes.
    const langBtn = $('#langToggle');
    if (langBtn) langBtn.addEventListener('click', () => {
      const p = $('#gradesPanel');
      if (p && p.classList.contains('open')) renderPanel();
      syncLabels();
    });

    syncLabels();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // Expose for debugging / future extensions.
  window.GradesUI = { open: openPanel, close: closePanel, toggle: togglePanel, render: renderPanel };
})();
