# ربط عداد الزوار بـ Google Analytics

عداد الزوار في الصفحة الرئيسية يقرأ العدد الحقيقي من Google Analytics عبر الدالة
`netlify/functions/visitors.mjs`. حتى يعمل، يجب إكمال الخطوات التالية مرة واحدة فقط.
إذا لم تكتمل الإعدادات، يعود العداد تلقائياً للمصدر الاحتياطي (Abacus).

## 1. إنشاء حساب خدمة في Google Cloud

1. افتح [console.cloud.google.com](https://console.cloud.google.com) بنفس حساب Google المرتبط بـ Analytics.
2. أنشئ مشروعاً جديداً (أو استخدم مشروعاً موجوداً).
3. من القائمة: **APIs & Services → Library** وفعّل **Google Analytics Data API**.
4. من القائمة: **IAM & Admin → Service Accounts → Create Service Account**.
   - أي اسم مناسب، مثلاً: `kleenology-visitors`.
   - لا حاجة لمنحه أي أدوار في المشروع.
5. افتح حساب الخدمة بعد إنشائه → تبويب **Keys** → **Add Key → Create new key → JSON**.
   سيتم تنزيل ملف JSON — احتفظ به، ستحتاج منه قيمتين:
   - `client_email`
   - `private_key`

## 2. منح حساب الخدمة صلاحية القراءة في Google Analytics

1. افتح [analytics.google.com](https://analytics.google.com) → **Admin** (الترس أسفل اليسار).
2. في عمود الخاصية (Property) الخاصة بموقع kleenology.me → **Property Access Management**.
3. اضغط **+** وأضف بريد حساب الخدمة (قيمة `client_email` من ملف JSON) بدور **Viewer**.
4. من نفس عمود الخاصية → **Property Settings** وانسخ **Property ID** (رقم فقط، مثل `4123456789` — هذا غير المعرّف `G-1FHH5FNM55`).

## 3. إضافة متغيرات البيئة في Netlify

من لوحة Netlify: **Site configuration → Environment variables** وأضف:

| المتغير | القيمة |
|---|---|
| `GA_PROPERTY_ID` | رقم الخاصية من الخطوة 2.4 |
| `GA_CLIENT_EMAIL` | قيمة `client_email` من ملف JSON |
| `GA_PRIVATE_KEY` | قيمة `private_key` من ملف JSON كاملة (تبدأ بـ `-----BEGIN PRIVATE KEY-----`) |

ثم أعد نشر الموقع (**Deploys → Trigger deploy**).

## 4. التحقق

افتح `https://kleenology.me/api/visitors` — يجب أن ترى:

```json
{ "visitors": 12345 }
```

وسيعرض العداد في الصفحة الرئيسية نفس الرقم (يُحدَّث كل ساعة).

## ملاحظات

- المفتاح الخاص لا يظهر أبداً للمتصفح؛ يبقى في بيئة Netlify فقط.
- الرقم المعروض هو **إجمالي المستخدمين (totalUsers)** منذ `2023-01-01` — يمكن تغيير
  تاريخ البداية من ثابت `START_DATE` في `netlify/functions/visitors.mjs`.
- لا ترفع ملف JSON الخاص بحساب الخدمة إلى المستودع إطلاقاً.
