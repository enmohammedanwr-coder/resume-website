/* ==========================================================================
   Admin editor — logic
   Edit all site content (AR/EN), upload images, add/remove items,
   save a local draft, preview it, and publish to GitHub with one click.
   ========================================================================== */

/* ---------- Constants ---------- */
const ICON_OPTIONS = ['web','code','android','database','building','analysis','data','chart','office',
  'repair','manage','ai','security','solution','thinking','details','team','learn','hybrid'];

const LS_DRAFT = 'siteDraft';
const LS_GH = 'ghPublish';

/* ---------- State ---------- */
const state = {
  lang: 'ar',
  draft: null,
  active: 'identity',
  dirty: false
};

/* ---------- Helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clone = (o) => JSON.parse(JSON.stringify(o));
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
function setPath(obj, path, value) {
  const keys = path.split('.');
  const last = keys.pop();
  const target = keys.reduce((o, k) => (o[k] = o[k] ?? {}), obj);
  target[last] = value;
}
// Content lives under the active language, except meta.* which is shared.
function rootFor(path) {
  return path.startsWith('meta.') ? state.draft : state.draft[state.lang];
}
function setField(path, value) { setPath(rootFor(path), path, value); }
function getField(path) { return getPath(rootFor(path), path); }

/* ---------- Draft load / save ---------- */
function loadDraft() {
  const saved = localStorage.getItem(LS_DRAFT);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { /* fall through */ }
  }
  return clone(window.SITE_DATA);
}
function saveDraft() {
  const st = $('#saveState');
  try {
    localStorage.setItem(LS_DRAFT, JSON.stringify(state.draft));
    state.dirty = false;
    st.textContent = '✓ تم الحفظ';
    st.className = 'save-state ok';
    setTimeout(() => { st.textContent = ''; }, 1500);
  } catch (e) {
    st.textContent = '⚠ مساحة التخزين ممتلئة';
    st.className = 'save-state err';
  }
}
let saveTimer = null;
function scheduleSave() {
  state.dirty = true;
  const st = $('#saveState');
  st.textContent = '… جارٍ الحفظ';
  st.className = 'save-state';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveDraft, 600);
}

/* ---------- Toast ---------- */
let toastEl = null;
function toast(msg, kind = '') {
  if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; document.body.appendChild(toastEl); }
  toastEl.textContent = msg;
  toastEl.className = 'toast show ' + kind;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toastEl.className = 'toast ' + kind; }, 2600);
}

/* ---------- Field HTML builders ---------- */
function fText(label, path, val, ph = '') {
  return `<div class="field"><label>${esc(label)}</label>
    <input type="text" data-path="${path}" value="${esc(val)}" placeholder="${esc(ph)}"></div>`;
}
function fArea(label, path, val, rows = 3) {
  return `<div class="field"><label>${esc(label)}</label>
    <textarea data-path="${path}" rows="${rows}">${esc(val)}</textarea></div>`;
}
function fList(label, path, arr, hint = 'عنصر واحد في كل سطر') {
  return `<div class="field"><label>${esc(label)} <span class="muted">(${esc(hint)})</span></label>
    <textarea data-path-list="${path}" rows="${Math.max(3, (arr || []).length)}">${esc((arr || []).join('\n'))}</textarea></div>`;
}
function fIcon(label, path, val) {
  const opts = ICON_OPTIONS.map(k => `<option value="${k}" ${k === val ? 'selected' : ''}>${k}</option>`).join('');
  return `<div class="field"><label>${esc(label)}</label>
    <select data-path="${path}">${opts}</select></div>`;
}
function fImage(label, path, val) {
  return `<div class="field"><label>${esc(label)}</label>
    <div class="imgpick">
      <img class="imgpick__preview" data-img-preview="${path}" src="${esc(val)}" alt="">
      <div class="imgpick__ctrl">
        <div class="imgpick__row">
          <button class="btn btn--ghost btn--sm" data-img-btn="${path}">📁 رفع صورة</button>
          <button class="btn btn--ghost btn--sm" data-img-clear="${path}">مسح</button>
        </div>
        <input type="text" data-path="${path}" value="${esc(val)}" placeholder="أو الصق رابط الصورة">
        <span class="muted">يفضّل صورة مربعة للصورة الشخصية (800×800)، وأفقية 16:10 لصور المشاريع.</span>
      </div>
    </div></div>`;
}

/* ---------- Section: identity ---------- */
function panelIdentity() {
  const L = state.draft[state.lang], M = state.draft.meta;
  return `
  <div class="panel">
    <div class="panel__head"><div><h2>الرئيسية والهوية</h2><p class="muted">الصورة الشخصية والعناوين الرئيسية.</p></div></div>
    <h3 class="h3">الصورة الشخصية</h3>
    ${fImage('صورتك الشخصية', 'meta.photo', M.photo)}
    <h3 class="h3">النصوص (${state.lang === 'ar' ? 'العربية' : 'English'})</h3>
    ${fText('الاسم المختصر (الشعار)', `brand`, L.brand)}
    ${fText('الاسم الكامل', `hero.name`, L.hero.name)}
    ${fArea('المسمى المهني', `hero.title`, L.hero.title, 2)}
    ${fArea('النبذة التعريفية', `hero.tagline`, L.hero.tagline, 3)}
    <div class="grid-2">
      ${fText('زر: المشاريع', `hero.buttons.projects`, L.hero.buttons.projects)}
      ${fText('زر: المهارات', `hero.buttons.skills`, L.hero.buttons.skills)}
      ${fText('زر: التواصل', `hero.buttons.contact`, L.hero.buttons.contact)}
      ${fText('زر: تحميل السيرة', `hero.buttons.cv`, L.hero.buttons.cv)}
    </div>
  </div>`;
}

/* ---------- Section: about ---------- */
function panelAbout() {
  const L = state.draft[state.lang];
  const facts = L.about.facts.map((x, i) => `
    <div class="item is-open"><div class="item__body" style="border-top:0;padding-top:1rem">
      <div class="grid-2">
        ${fText('العنوان', `about.facts.${i}.label`, x.label)}
        ${fText('القيمة', `about.facts.${i}.value`, x.value)}
      </div>
      <button class="btn btn--danger btn--xs" data-del="about.facts.${i}">حذف</button>
    </div></div>`).join('');
  return `
  <div class="panel">
    <div class="panel__head"><div><h2>من أنا</h2><p class="muted">النبذة والمعلومات الأساسية.</p></div></div>
    ${fText('العنوان', `about.title`, L.about.title)}
    ${fText('العنوان الفرعي', `about.lead`, L.about.lead)}
    ${fArea('الفقرة الأولى', `about.paragraphs.0`, L.about.paragraphs[0] || '', 4)}
    ${fArea('الفقرة الثانية', `about.paragraphs.1`, L.about.paragraphs[1] || '', 4)}
  </div>
  <div class="panel">
    <div class="panel__head"><div><h2>البطاقات السريعة</h2></div>
      <button class="btn btn--primary btn--sm" data-add="about.facts">+ إضافة بطاقة</button></div>
    ${facts || '<div class="empty">لا توجد بطاقات</div>'}
  </div>`;
}

/* ---------- Generic repeatable section ---------- */
function itemsPanel(cfg) {
  const L = state.draft[state.lang];
  const arr = getPath(L, cfg.path) || [];
  const items = arr.map((it, i) => {
    const title = esc(getPath(it, cfg.titleKey) || 'بدون عنوان');
    const body = cfg.fields.map(fl => {
      const p = `${cfg.path}.${i}.${fl.key}`;
      if (fl.type === 'area') return fArea(fl.label, p, it[fl.key] || '', fl.rows || 3);
      if (fl.type === 'list') return fList(fl.label, p, it[fl.key] || []);
      if (fl.type === 'icon') return fIcon(fl.label, p, it[fl.key] || 'code');
      if (fl.type === 'image') return fImage(fl.label, p, it[fl.key] || '');
      return fText(fl.label, p, it[fl.key] || '');
    }).join('');
    return `<div class="item" data-item>
      <div class="item__head" data-toggle>
        <span class="item__handle">⋮⋮</span>
        <span class="item__title">${title}</span>
        <div class="item__actions">
          <button class="btn btn--ghost btn--xs" data-move-up="${cfg.path}.${i}" title="أعلى">↑</button>
          <button class="btn btn--ghost btn--xs" data-move-down="${cfg.path}.${i}" title="أسفل">↓</button>
          <button class="btn btn--danger btn--xs" data-del="${cfg.path}.${i}">حذف</button>
        </div>
        <span class="item__chev">▾</span>
      </div>
      <div class="item__body">${body}</div>
    </div>`;
  }).join('');

  return `
  <div class="panel">
    <div class="panel__head">
      <div><h2>${esc(cfg.title)}</h2><p class="muted">${esc(cfg.subtitle || '')}</p></div>
      <button class="btn btn--primary btn--sm" data-add="${cfg.path}">+ إضافة جديد</button>
    </div>
    ${items || '<div class="empty">لا توجد عناصر بعد. اضغط «إضافة جديد».</div>'}
  </div>`;
}

/* ---------- Section: nav & footer ---------- */
function panelNav() {
  const L = state.draft[state.lang];
  return `
  <div class="panel">
    <div class="panel__head"><div><h2>القائمة الرئيسية</h2></div></div>
    <div class="grid-2">
      ${Object.keys(L.nav).map(k => fText(k, `nav.${k}`, L.nav[k])).join('')}
    </div>
  </div>
  <div class="panel">
    <div class="panel__head"><div><h2>التذييل</h2></div></div>
    ${fText('سطر الحقوق', `footer.rights`, L.footer.rights)}
    ${fText('سطر التعريف', `footer.built`, L.footer.built)}
  </div>`;
}

/* ---------- Section: contact ---------- */
function panelContact() {
  const L = state.draft[state.lang];
  const F = L.contact.form;
  return `
  <div class="panel">
    <div class="panel__head"><div><h2>قسم التواصل</h2><p class="muted">العناوين والرسائل. أرقام الهاتف والبريد تُعدّل من «الإعدادات».</p></div></div>
    ${fText('العنوان', `contact.title`, L.contact.title)}
    ${fText('العنوان الفرعي', `contact.subtitle`, L.contact.subtitle)}
    ${fText('تسمية الهاتف', `contact.phoneLabel`, L.contact.phoneLabel)}
    ${fText('تسمية البريد', `contact.emailLabel`, L.contact.emailLabel)}
    ${fText('زر واتساب', `contact.whatsappBtn`, L.contact.whatsappBtn)}
    ${fText('زر البريد', `contact.emailBtn`, L.contact.emailBtn)}
  </div>
  <div class="panel">
    <div class="panel__head"><div><h2>نموذج التواصل</h2></div></div>
    <div class="grid-2">
      ${fText('حقل: الاسم', `contact.form.name`, F.name)}
      ${fText('حقل: البريد', `contact.form.email`, F.email)}
      ${fText('حقل: الموضوع', `contact.form.subject`, F.subject)}
      ${fText('حقل: الرسالة', `contact.form.message`, F.message)}
      ${fText('زر الإرسال', `contact.form.submit`, F.submit)}
      ${fText('رسالة النجاح', `contact.form.success`, F.success)}
    </div>
  </div>`;
}

/* ---------- Panel registry ---------- */
const PANELS = [
  { id: 'identity', icon: '🏠', title: 'الرئيسية', render: panelIdentity },
  { id: 'about', icon: '👤', title: 'من أنا', render: panelAbout },
  { id: 'projects', icon: '📁', title: 'المشاريع', render: () => itemsPanel({
      path: 'projects.items', title: 'المشاريع', titleKey: 'name', subtitle: 'أضف مشاريعك وصورها ووصفها.',
      fields: [
        { key: 'name', label: 'اسم المشروع' },
        { key: 'short', label: 'وصف مختصر', type: 'area', rows: 2 },
        { key: 'details', label: 'التفاصيل الكاملة', type: 'area', rows: 4 },
        { key: 'tech', label: 'التقنيات', type: 'list' },
        { key: 'image', label: 'صورة المشروع', type: 'image' }
      ] }) },
  { id: 'services', icon: '🛠', title: 'الخدمات', render: () => itemsPanel({
      path: 'services.items', title: 'الخدمات', titleKey: 'name', subtitle: 'الخدمات التي تقدّمها للعملاء.',
      fields: [
        { key: 'name', label: 'اسم الخدمة' },
        { key: 'desc', label: 'الوصف', type: 'area', rows: 2 },
        { key: 'icon', label: 'الأيقونة', type: 'icon' }
      ] }) },
  { id: 'skills', icon: '💡', title: 'المهارات', render: () => itemsPanel({
      path: 'skills.groups', title: 'مجموعات المهارات', titleKey: 'title', subtitle: 'نظّم مهاراتك في مجموعات.',
      fields: [
        { key: 'title', label: 'اسم المجموعة' },
        { key: 'icon', label: 'الأيقونة', type: 'icon' },
        { key: 'items', label: 'المهارات', type: 'list' }
      ] }) },
  { id: 'quals', icon: '🎓', title: 'المؤهلات', render: () => itemsPanel({
      path: 'qualifications.edu', title: 'المؤهلات العلمية', titleKey: 'title', subtitle: 'الدرجات العلمية.',
      fields: [
        { key: 'title', label: 'المؤهل' },
        { key: 'org', label: 'الجهة' },
        { key: 'meta', label: 'ملاحظة (سنة/معدل)' }
      ] }) + itemsPanel({
      path: 'qualifications.certs', title: 'الشهادات والدورات', titleKey: 'title', subtitle: 'الشهادات والدورات.',
      fields: [
        { key: 'title', label: 'الشهادة' },
        { key: 'org', label: 'الجهة' },
        { key: 'meta', label: 'ملاحظة' }
      ] }) },
  { id: 'why', icon: '⭐', title: 'لماذا أنا', render: () => itemsPanel({
      path: 'why.items', title: 'نقاط القوة', titleKey: 'title', subtitle: 'ما يميّزك عن غيرك.',
      fields: [
        { key: 'title', label: 'العنوان' },
        { key: 'desc', label: 'الوصف', type: 'area', rows: 2 },
        { key: 'icon', label: 'الأيقونة', type: 'icon' }
      ] }) },
  { id: 'nav', icon: '🧭', title: 'القائمة والتذييل', render: panelNav },
  { id: 'contact', icon: '📞', title: 'التواصل', render: panelContact }
];

/* ---------- Render ---------- */
function renderSideNav() {
  $('#sideNav').innerHTML = PANELS.map(p =>
    `<a class="side__link ${p.id === state.active ? 'is-active' : ''}" data-panel="${p.id}">
      <span class="ic">${p.icon}</span><span>${esc(p.title)}</span></a>`).join('');
}
function renderPanel() {
  const p = PANELS.find(x => x.id === state.active) || PANELS[0];
  $('#main').innerHTML = p.render();
  bindItemToggles();
}
function render() { renderSideNav(); renderPanel(); }

function bindItemToggles() {
  $$('[data-toggle]').forEach(h => h.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    h.closest('.item').classList.toggle('is-open');
  }));
}

/* ---------- Editing events (delegated) ---------- */
function bindEditing() {
  const main = $('#main');

  main.addEventListener('input', (e) => {
    const el = e.target;
    if (el.dataset.path) {
      setField(el.dataset.path, el.value);
      if (el.dataset.imgPreview) return;
      scheduleSave();
    } else if (el.dataset.pathList) {
      const arr = el.value.split('\n').map(s => s.trim()).filter(Boolean);
      setField(el.dataset.pathList, arr);
      scheduleSave();
    }
  });
  main.addEventListener('change', (e) => {
    const el = e.target;
    if (el.tagName === 'SELECT' && el.dataset.path) {
      setField(el.dataset.path, el.value);
      scheduleSave();
    }
  });

  main.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add]');
    if (add) { addItem(add.dataset.add); return; }
    const del = e.target.closest('[data-del]');
    if (del) { deleteItem(del.dataset.del); return; }
    const up = e.target.closest('[data-move-up]');
    if (up) { moveItem(up.dataset.moveUp, -1); return; }
    const dn = e.target.closest('[data-move-down]');
    if (dn) { moveItem(dn.dataset.moveDown, 1); return; }
    const imgBtn = e.target.closest('[data-img-btn]');
    if (imgBtn) { pickImage(imgBtn.dataset.imgBtn); return; }
    const imgClear = e.target.closest('[data-img-clear]');
    if (imgClear) { setField(imgClear.dataset.imgClear, ''); renderPanel(); scheduleSave(); return; }
  });
}

/* ---------- Item CRUD ---------- */
const ITEM_TEMPLATES = {
  'projects.items': { name: 'مشروع جديد', short: '', details: '', tech: ['C#'], image: '' },
  'services.items': { name: 'خدمة جديدة', desc: '', icon: 'code' },
  'skills.groups': { title: 'مجموعة جديدة', icon: 'code', items: [] },
  'qualifications.edu': { title: 'مؤهل جديد', org: '', meta: '' },
  'qualifications.certs': { title: 'شهادة جديدة', org: '', meta: '' },
  'why.items': { title: 'نقطة جديدة', desc: '', icon: 'solution' },
  'about.facts': { label: 'عنوان', value: 'قيمة' }
};
function addItem(path) {
  const L = state.draft[state.lang];
  const arr = getPath(L, path);
  if (!Array.isArray(arr)) return;
  const tpl = ITEM_TEMPLATES[path];
  if (tpl) arr.push(clone(tpl));
  else if (path === 'about.facts') arr.push({ label: '', value: '' });
  else arr.push('');
  renderPanel(); scheduleSave();
  toast('تمت الإضافة', 'ok');
}
function deleteItem(path) {
  const keys = path.split('.');
  const idx = Number(keys.pop());
  const arr = getPath(state.draft[state.lang], keys.join('.'));
  if (!Array.isArray(arr)) return;
  if (!confirm('هل تريد حذف هذا العنصر؟')) return;
  arr.splice(idx, 1);
  renderPanel(); scheduleSave();
}
function moveItem(path, dir) {
  const keys = path.split('.');
  const idx = Number(keys.pop());
  const arr = getPath(state.draft[state.lang], keys.join('.'));
  const j = idx + dir;
  if (!Array.isArray(arr) || j < 0 || j >= arr.length) return;
  [arr[idx], arr[j]] = [arr[j], arr[idx]];
  renderPanel(); scheduleSave();
}

/* ---------- Image upload (compress → dataURL) ---------- */
let pendingImgPath = null;
let fileInput = null;
function pickImage(path) {
  pendingImgPath = path;
  if (!fileInput) {
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    fileInput.addEventListener('change', onFileChosen);
  }
  fileInput.value = '';
  fileInput.click();
}
function onFileChosen() {
  const file = fileInput.files && fileInput.files[0];
  if (!file || !pendingImgPath) return;
  compressImage(file, (dataUrl) => {
    setField(pendingImgPath, dataUrl);
    const prev = $(`[data-img-preview="${pendingImgPath}"]`);
    if (prev) prev.src = dataUrl;
    const txt = $(`input[data-path="${pendingImgPath}"]`);
    if (txt) txt.value = '(صورة مرفوعة)';
    scheduleSave();
    toast('تم رفع الصورة', 'ok');
  });
}
function compressImage(file, cb, maxW = 1400, quality = 0.82) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      cb(c.toDataURL('image/jpeg', quality));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

/* ---------- Language switch ---------- */
function initLangSeg() {
  $$('[data-editor-lang]').forEach(b => b.addEventListener('click', () => {
    state.lang = b.dataset.editorLang;
    $$('[data-editor-lang]').forEach(x => x.classList.toggle('is-active', x === b));
    renderPanel();
  }));
}

/* ---------- Modals ---------- */
function openModal(id) { $(id).classList.add('open'); $(id).setAttribute('aria-hidden', 'false'); }
function closeModal(id) { $(id).classList.remove('open'); $(id).setAttribute('aria-hidden', 'true'); }
function initModals() {
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) {
      const m = e.target.closest('.modal'); if (m) { m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); }
    }
  });
}

/* ---------- Settings ---------- */
function initSettings() {
  const M = state.draft.meta;
  $('#setPhone').value = M.phone || '';
  $('#setEmail1').value = M.emails[0] || '';
  $('#setEmail2').value = M.emails[1] || '';
  $('#setGithub').value = M.social.github || '';
  $('#setLinkedin').value = M.social.linkedin || '';
  $('#setTwitter').value = M.social.twitter || '';
  $('#setEndpoint').value = M.formEndpoint || '';
}
function openSettings() {
  initSettings();
  openModal('#settingsModal');
}
function bindSettings() {
  $('#saveSettings').addEventListener('click', () => {
    const M = state.draft.meta;
    M.phone = $('#setPhone').value.trim();
    M.whatsapp = M.phone.replace(/[^0-9]/g, '');
    const e1 = $('#setEmail1').value.trim(), e2 = $('#setEmail2').value.trim();
    M.emails = [e1, e2].filter(Boolean);
    M.social.github = $('#setGithub').value.trim();
    M.social.linkedin = $('#setLinkedin').value.trim();
    M.social.twitter = $('#setTwitter').value.trim();
    M.formEndpoint = $('#setEndpoint').value.trim();
    saveDraft();
    closeModal('#settingsModal');
    toast('تم حفظ الإعدادات', 'ok');
  });
}

/* ---------- Generate data.js ---------- */
function generateDataJS(data) {
  const clean = clone(data);
  const header = `/* ==========================================================================
   ملف المحتوى — تم إنشاؤه من لوحة التحكم (admin.html)
   عدّل من لوحة التحكم ثم اضغط «نشر». يمكنك أيضاً تعديل هذا الملف يدوياً.
   ========================================================================== */

`;
  const body = 'const SITE_DATA = ' + JSON.stringify(clean, null, 2) + ';\n\nwindow.SITE_DATA = SITE_DATA;\n';
  return header + body;
}

/* ---------- Extract uploaded images (dataURL → files) ---------- */
function extractImages(data) {
  const uploads = [];
  const seen = new Set();
  const walk = (obj, pathParts) => {
    if (Array.isArray(obj)) { obj.forEach((v, i) => walk(v, pathParts.concat(i))); return; }
    if (obj && typeof obj === 'object') { Object.keys(obj).forEach(k => walk(obj[k], pathParts.concat(k))); return; }
    if (typeof obj === 'string' && obj.startsWith('data:image')) {
      const name = 'upload-' + hashStr(obj).slice(0, 10) + '.jpg';
      const filePath = 'assets/img/' + name;
      const b64 = obj.split(',')[1];
      if (!seen.has(filePath)) { seen.add(filePath); uploads.push({ path: filePath, base64: b64 }); }
      setPath(data, pathParts.join('.'), filePath);
    }
  };
  walk(data, []);
  return uploads;
}
function hashStr(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16);
}

/* ---------- GitHub publish ---------- */
function b64EncodeUtf8(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach(b => bin += String.fromCharCode(b));
  return btoa(bin);
}
async function ghRequest(owner, repo, token, apiPath, opts = {}) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}${apiPath}`, {
    ...opts,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(opts.headers || {})
    }
  });
  return res;
}
async function putFile(owner, repo, branch, token, path, base64, message, log) {
  let sha = null;
  const g = await ghRequest(owner, repo, token, `/contents/${path}?ref=${branch}`);
  if (g.ok) { const j = await g.json(); sha = j.sha; }
  const body = { message, content: base64, branch };
  if (sha) body.sha = sha;
  const r = await ghRequest(owner, repo, token, `/contents/${path}`, { method: 'PUT', body: JSON.stringify(body) });
  if (!r.ok) { const t = await r.text(); throw new Error(`${path} → ${r.status} ${t.slice(0, 140)}`); }
  log(`✓ ${path}`);
}
async function publish() {
  const owner = $('#ghOwner').value.trim();
  const repo = $('#ghRepo').value.trim();
  const branch = ($('#ghBranch').value.trim() || 'main');
  const token = $('#ghToken').value.trim();
  const log = (m) => { const el = $('#publishLog'); el.textContent += m + '\n'; el.scrollTop = el.scrollHeight; };
  const btn = $('#doPublish');
  $('#publishLog').textContent = '';

  if (!owner || !repo || !token) { toast('أكمل بيانات GitHub أولاً', 'err'); return; }
  localStorage.setItem(LS_GH, JSON.stringify({ owner, repo, branch }));

  btn.disabled = true; const orig = btn.textContent; btn.textContent = 'جارٍ النشر...';
  try {
    const data = clone(state.draft);
    log('• تجهيز الصور المرفوعة...');
    const uploads = extractImages(data);

    log('• توليد ملف المحتوى data.js...');
    const dataJs = generateDataJS(data);
    const b64 = b64EncodeUtf8(dataJs);

    log('• جلب ملفات الموقع الحالية...');
    const files = ['index.html', 'admin.html', 'assets/css/style.css', 'assets/css/admin.css',
      'assets/js/app.js', 'assets/js/admin.js', 'README.md', 'robots.txt', 'sitemap.xml',
      '404.html', '.nojekyll', 'assets/cv/Mohammed-Anwar-CV.pdf',
      'assets/img/profile.jpg', 'assets/img/project-airport.jpg', 'assets/img/project-traffic.jpg',
      'assets/img/project-guardian.jpg', 'assets/img/project-training.jpg'];

    const msg = `Update site content via admin panel — ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;

    log('• رفع ملف data.js...');
    await putFile(owner, repo, branch, token, 'assets/js/data.js', b64, msg, log);

    log('• رفع الصور المرفوعة...');
    for (const up of uploads) { await putFile(owner, repo, branch, token, up.path, up.base64, msg, log); }

    log('• رفع باقي ملفات الموقع...');
    for (const f of files) {
      try {
        const r = await fetch(f, { cache: 'no-store' });
        if (!r.ok) { log(`– تخطّي ${f} (${r.status})`); continue; }
        const buf = new Uint8Array(await r.arrayBuffer());
        let bin = ''; buf.forEach(x => bin += String.fromCharCode(x));
        await putFile(owner, repo, branch, token, f, btoa(bin), msg, log);
      } catch (err) { log(`– تخطّي ${f}: ${err.message}`); }
    }

    log('• تفعيل GitHub Pages...');
    const pages = await ghRequest(owner, repo, token, '/pages', {
      method: 'POST', body: JSON.stringify({ source: { branch, path: '/' } })
    });
    log(pages.ok || pages.status === 409 ? '✓ GitHub Pages مُفعّل' : `– Pages: ${pages.status}`);

    log('\n✅ تم النشر بنجاح! سيظهر التحديث خلال دقيقة تقريباً.');
    toast('تم النشر بنجاح 🎉', 'ok');
  } catch (err) {
    log('\n✗ خطأ: ' + err.message);
    toast('فشل النشر — راجع السجل', 'err');
  } finally {
    btn.disabled = false; btn.textContent = orig;
  }
}

/* ---------- Preview ---------- */
function openPreview() {
  localStorage.setItem(LS_DRAFT, JSON.stringify(state.draft));
  window.open('index.html?preview=1', '_blank');
}

/* ---------- Init ---------- */
function initEditor() {
  state.draft = loadDraft();
  initLangSeg();
  initModals();
  bindEditing();
  bindSettings();
  render();

  $('#sideNav').addEventListener('click', (e) => {
    const l = e.target.closest('[data-panel]');
    if (!l) return;
    state.active = l.dataset.panel;
    render();
  });

  $('#previewBtn').addEventListener('click', openPreview);
  $('#resetBtn').addEventListener('click', () => {
    if (!confirm('سيتم استرجاع المحتوى الأصلي وإلغاء كل التعديلات. متابعة؟')) return;
    localStorage.removeItem(LS_DRAFT);
    state.draft = clone(window.SITE_DATA);
    render();
    toast('تم استرجاع المحتوى الأصلي', 'ok');
  });

  // Publish modal
  $('#publishBtn').addEventListener('click', () => {
    const saved = JSON.parse(localStorage.getItem(LS_GH) || '{}');
    $('#ghOwner').value = saved.owner || 'enmohammedanwr-coder';
    $('#ghRepo').value = saved.repo || 'resume-website';
    $('#ghBranch').value = saved.branch || 'main';
    $('#publishLog').textContent = '';
    openModal('#publishModal');
  });
  $('#doPublish').addEventListener('click', publish);

  // Settings button (injected into side nav area)
  const setBtn = document.createElement('button');
  setBtn.className = 'btn btn--ghost btn--sm';
  setBtn.style.marginTop = '.6rem';
  setBtn.style.width = '100%';
  setBtn.textContent = '⚙ الإعدادات';
  setBtn.addEventListener('click', openSettings);
  $('#sideNav').after(setBtn);
}

/* ---------- Boot ---------- */
initEditor();
