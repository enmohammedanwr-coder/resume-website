# نشر الموقع مع طلب تنزيل السيرة الذاتية / Deployment guide

الموقع ثابت (HTML/CSS/JS) ومعه واجهة برمجية (Cloudflare Pages Functions) لتنظيم
**طلب تنزيل السيرة الذاتية** — لا يوجد ملف PDF منشور للتنزيل المباشر. الملف محفوظ
بشكل **خاص** في Cloudflare KV، ولا يُسلَّم إلا بعد موافقة صاحب السيرة.

The site is static; a small serverless API (Cloudflare Pages Functions) handles
the CV **request → owner approval → consent → download** flow. The PDF is stored
**privately** in Cloudflare KV and is never a public asset.

---

## 1) المتطلبات / Prerequisites

- حساب Cloudflare مجاني (خطة Free كافية).
- اسم نطاق اختياري (Cloudflare يعطيك رابط `*.pages.dev` مجاناً).

---

## 2) أنشئ مساحة KV / Create the KV namespace

لوحة Cloudflare → **Workers & Pages → KV** → **Create namespace** باسم `cv-files`.

ثم في مشروع Pages → **Settings → Functions → KV namespace bindings** أضف ربطاً:

| Variable name | KV namespace |
| ------------- | ------------ |
| `CV_KV`       | `cv-files`   |

> ⚠️ اسم المتغير يجب أن يكون `CV_KV` بالحرف.

---

## 3) متغيرات البيئة / Environment variables

مشروع Pages → **Settings → Environment variables** (Production + Preview):

| Name             | Value                                  | الغرض |
| ---------------- | -------------------------------------- | ----- |
| `ADMIN_KEY`      | مفتاح سري طويل وعشوائي                 | يُستخدم في رابط الموافقة (تفتحه أنت فقط) |
| `TOKEN_SECRET`   | مفتاح سري آخر (يمكن تركه ليأخذ قيمة ADMIN_KEY) | توقيع روابط التنزيل (HMAC) |
| `SITE_URL`       | `https://<your-site>.pages.dev`        | يُستخدم في رابط الموافقة داخل الإشعار |
| `TOKEN_TTL_HOURS`| `48` (اختياري)                          | صلاحية رابط التنزيل بالساعات |

**اختياري — لإرسال إشعار بالبريد عند وصول طلب جديد:**

| Name           | Value                       |
| -------------- | --------------------------- |
| `MAIL_API_KEY` | مفتاح Resend (`re_...`)     |
| `MAIL_FROM`    | عنوان مُوثَّق في Resend      |
| `NOTIFY_EMAIL` | بريدك لاستقبال الإشعارات     |

بدون هذه القيم يعمل الموقع لكن **بدون** إشعار بريدي (تظهر الطلبات في السجل فقط).

**اختياري — حماية من البوتات:** `TURNSTILE_SECRET` (+ مفتاح الموقع في الواجهة).

---

## 4) ارفع ملفات السيرة الذاتية إلى KV / Upload the PDFs

الملفات تُبنى في `tools/cv/dist/` (خارج مجلد النشر، وغير مُتتبَّعة في git).

```bash
python3 tools/cv/build-cv.py          # ينتج النسخة العربية والإنجليزية

export CF_ACCOUNT_ID=...              # من لوحة Cloudflare
export CF_KV_NAMESPACE_ID=...         # معرّف مساحة cv-files
export CF_API_TOKEN=...               # توكن بصلاحية Workers KV Storage: Edit
python3 tools/cv/publish-kv.py        # يرفع pdf:ar و pdf:en
```

أو باستخدام wrangler:

```bash
npx wrangler kv key put --remote --namespace-id <ID> pdf:ar \
    --path tools/cv/dist/Mohammed-Anwar-CV.pdf
npx wrangler kv key put --remote --namespace-id <ID> pdf:en \
    --path tools/cv/dist/Mohammed-Anwar-CV-EN.pdf
```

---

## 5) انشر على Cloudflare Pages / Deploy

1. اربط مستودع GitHub بالمشروع (أو ارفع الملفات مباشرة).
2. إعدادات البناء:
   - **Build command:** `python3 tools/build-site.py`
   - **Build output directory:** `public`
3. بعد أول نشر، تأكد من ربط `CV_KV` (الخطوة 2).

`tools/build-site.py` يجمّع `public/` من: `index.html`, `assets/`, `functions/`,
`robots.txt`, `sitemap.xml`, `404.html`, `.nojekyll`.

---

## 6) اختبر محلياً قبل النشر / Test locally

محاكي Pages كامل (ثابت + Functions + KV) بدون أي حساب Cloudflare:

```bash
node tools/dev-server.mjs 12000
# افتح http://localhost:12000
```

- يقدّم `public/` ويوجّه `/api/*` إلى `functions/api/` الحقيقية.
- يحمّل ملفات PDF تلقائياً في KV (`pdf:ar`, `pdf:en`).
- المفاتيح الافتراضية: `ADMIN_KEY=dev-admin-key`, `TOKEN_SECRET=dev-token-secret`.

### كيف تجرّب مسار الموافقة كاملاً؟

```bash
# 1) أرسل طلباً (أو استخدم النموذج في الصفحة)
curl -s -X POST localhost:12000/api/cv-request \
  -H 'content-type: application/json' \
  -d '{"name":"Test","email":"test@example.com","lang":"ar"}'
#    → {"ok":true,"id":"..."}

# 2) افتح رابط الموافقة (هذا ما يصلك في البريد)
#    http://localhost:12000/api/cv-approve?req=<ID>&k=dev-admin-key

# 3) اطلب مجدداً بنفس البريد → يعيد رابط التنزيل الموقّع
curl -s -X POST localhost:12000/api/cv-request \
  -H 'content-type: application/json' \
  -d '{"name":"Test","email":"test@example.com"}'
#    → {"ok":true,"alreadyApproved":true,"token":"..."}

# 4) نزّل الملف (consent=1 مطلوب)
curl -OJ "localhost:12000/api/cv-download?token=<TOKEN>&consent=1&lang=ar"
```

في الواجهة: زر **«لديك رمز موافقة بالفعل؟»** يفتح نافذة الشروط؛ عند الموافقة
يُرسل الرمز إلى `/api/cv-download` فيبدأ التنزيل. ولو فتحت رابطاً بصيغة
`index.html?cv=<TOKEN>` تُفتح نافذة الشروط تلقائياً.

---

## 7) استضافة الواجهة على GitHub Pages (بديل)

لو أردت الموقع على GitHub Pages مع إبقاء الواجهة البرمجية على Cloudflare:
ضع رابط الـ API في `assets/js/data.js` → `meta.apiBase`، مثلاً:

```js
apiBase: "https://<your-worker>.workers.dev",
```

واتركه فارغاً عندما يكون الموقع والـ API على نفس النطاق.

> مهم: لا تُرفع ملفات PDF إلى مستودع GitHub Pages — فهي ستكون عامة.
> اتركها في KV فقط.

---

## الأمان / Security notes

- ملف الـ PDF **غير منشور** ولا يوجد رابط ثابت له؛ يُقرأ من KV عند التنزيل فقط.
- رابط التنزيل **موقّع (HMAC-SHA256)** و**مؤقت** (`TOKEN_TTL_HOURS`).
- التنزيل يتطلب `consent=1`، ويُسجَّل إقرار الموافقة (وقت + بصمة IP) في KV.
- رابط الموافقة محمي بـ `ADMIN_KEY` — لا تشاركه.
- ترويسات حماية على كل ردود الـ API: `nosniff`, `no-referrer`, `DENY` frames.
