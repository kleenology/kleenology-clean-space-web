// تطبيع النص العربي للبحث.
// بدونه لا يجد المشرف "أبو خالد" حين يكتب "ابو خالد"، ولا يجد رقماً
// مخزّناً بصيغة "+966 55 540 4667" حين يكتب "0555404667".

const DIACRITICS = /[ؐ-ًؚ-ٰٟۖ-ۭ]/g;
const TATWEEL = /ـ/g;

export function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(DIACRITICS, "")
    .replace(TATWEEL, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    // الأرقام العربية الشرقية إلى اللاتينية
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/\s+/g, " ")
    .trim();
}

/** أرقام الجوال تُقارن بأرقامها وحدها، بلا مسافات ولا رمز دولة */
export function normalizePhone(value) {
  // \d لا تشمل الأرقام العربية الشرقية، فتُحوَّل أولاً وإلا مُسحت مع الرموز
  const digits = String(value ?? "")
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/\D/g, "");
  if (!digits) return "";
  // 966xxxxxxxxx و 05xxxxxxxx و 5xxxxxxxx كلها نفس الرقم
  if (digits.startsWith("966")) return digits.slice(3).replace(/^0/, "");
  return digits.replace(/^0/, "");
}

/**
 * هل يطابق السجل نص البحث؟
 * يطابق أي كلمة من الاستعلام في أي من الحقول، ويطابق الأرقام كأرقام.
 */
export function matchesQuery(record, query) {
  const q = normalizeText(query);
  if (!q) return true;

  const haystack = normalizeText(
    [record?.customerName, record?.location, record?.supervisor, record?.siteType, record?.notes]
      .filter(Boolean)
      .join(" "),
  );

  const phone = normalizePhone(record?.phone);
  const queryPhone = normalizePhone(query);

  if (queryPhone.length >= 4 && phone.includes(queryPhone)) return true;

  // كل كلمة في الاستعلام يجب أن ترد، فالبحث بكلمتين يضيّق النتائج لا يوسّعها
  return q.split(" ").every((word) => haystack.includes(word));
}
