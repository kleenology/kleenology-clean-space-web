import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useTranslation } from "react-i18next";

const PrivacyPolicy = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  const sections = isRTL
    ? [
        {
          title: "المعلومات التي نجمعها",
          content: [
            "عند استخدامك لنموذج الحجز أو المعاينة الذاتية، نجمع: الاسم الكامل، رقم الجوال، الحي أو العنوان، وتفاصيل الخدمة المطلوبة.",
            "عند تصفحك للموقع، قد تجمع أدوات التحليل التلقائي (Google Analytics، Meta Pixel، TikTok Pixel، Snapchat Pixel، Google Tag Manager): عنوان IP، نوع المتصفح، الصفحات التي زرتها، ومدة الزيارة.",
          ],
        },
        {
          title: "كيف نستخدم معلوماتك",
          content: [
            "التواصل معك عبر واتساب لتأكيد الحجز وتقديم الخدمة.",
            "تحسين تجربة الموقع وفهم سلوك الزوار بشكل مجمّع وغير شخصي.",
            "عرض إعلانات ذات صلة عبر منصات التواصل الاجتماعي (Meta، TikTok، Snapchat).",
            "لا نبيع بياناتك الشخصية لأي جهة ثالثة.",
          ],
        },
        {
          title: "ملفات تعريف الارتباط (Cookies)",
          content: [
            "يستخدم الموقع ملفات تعريف ارتباط لأغراض تحليلية وإعلانية عبر أدوات الجهات الخارجية المذكورة أعلاه.",
            "يمكنك تعطيل ملفات تعريف الارتباط من إعدادات متصفحك في أي وقت، وإن كان ذلك قد يؤثر على بعض وظائف الموقع.",
          ],
        },
        {
          title: "مشاركة البيانات مع أطراف ثالثة",
          content: [
            "Google Analytics وGoogle Tag Manager: لأغراض التحليل وقياس الأداء.",
            "Meta (Facebook): لأغراض إعلانية عبر Meta Pixel.",
            "TikTok: لأغراض إعلانية عبر TikTok Pixel.",
            "Snapchat: لأغراض إعلانية عبر Snapchat Pixel.",
            "جميع هذه الأطراف لديها سياسات خصوصية خاصة بها وتخضع لاتفاقياتها.",
          ],
        },
        {
          title: "حقوقك",
          content: [
            "يحق لك طلب الاطلاع على بياناتك الشخصية المحفوظة لدينا، وطلب تعديلها أو حذفها.",
            "للتواصل بشأن أي طلب متعلق ببياناتك، يرجى التواصل عبر البريد الإلكتروني: Contract@kleenology.net",
          ],
        },
        {
          title: "الامتثال لنظام حماية البيانات الشخصية",
          content: [
            "نلتزم بأحكام نظام حماية البيانات الشخصية في المملكة العربية السعودية (PDPL) الصادر بالمرسوم الملكي رقم م/19 لعام 2021.",
          ],
        },
        {
          title: "تحديثات السياسة",
          content: [
            "قد نقوم بتحديث هذه السياسة من وقت لآخر. سيُشار إلى تاريخ آخر تحديث في أسفل الصفحة. نوصي بمراجعة الصفحة بشكل دوري.",
          ],
        },
      ]
    : [
        {
          title: "Information We Collect",
          content: [
            "When you use our booking or self-inspection form, we collect: full name, phone number, neighborhood or address, and service details.",
            "When you browse the site, analytics tools (Google Analytics, Meta Pixel, TikTok Pixel, Snapchat Pixel, Google Tag Manager) may automatically collect: IP address, browser type, pages visited, and visit duration.",
          ],
        },
        {
          title: "How We Use Your Information",
          content: [
            "To contact you via WhatsApp to confirm bookings and deliver services.",
            "To improve the site experience and understand aggregated, non-personal visitor behavior.",
            "To show relevant ads on social platforms (Meta, TikTok, Snapchat).",
            "We do not sell your personal data to any third party.",
          ],
        },
        {
          title: "Cookies",
          content: [
            "This site uses cookies for analytics and advertising purposes through the third-party tools listed above.",
            "You can disable cookies in your browser settings at any time, though some site functionality may be affected.",
          ],
        },
        {
          title: "Data Sharing with Third Parties",
          content: [
            "Google Analytics & Google Tag Manager: for performance analysis.",
            "Meta (Facebook): for advertising via Meta Pixel.",
            "TikTok: for advertising via TikTok Pixel.",
            "Snapchat: for advertising via Snapchat Pixel.",
            "Each of these third parties maintains its own privacy policy.",
          ],
        },
        {
          title: "Your Rights",
          content: [
            "You have the right to request access to, correction of, or deletion of your personal data held by us.",
            "To make any data-related request, please contact us at: Contract@kleenology.net",
          ],
        },
        {
          title: "PDPL Compliance",
          content: [
            "We comply with Saudi Arabia's Personal Data Protection Law (PDPL), issued by Royal Decree No. M/19 of 2021.",
          ],
        },
        {
          title: "Policy Updates",
          content: [
            "We may update this policy periodically. The last updated date is shown at the bottom of this page. We recommend reviewing it regularly.",
          ],
        },
      ];

  return (
    <div className={`min-h-screen bg-muted/30 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <SEO
        title={isRTL ? "سياسة الخصوصية | كلينولوجي" : "Privacy Policy | Kleenology"}
        description={
          isRTL
            ? "تعرف على كيفية جمع كلينولوجي لبياناتك واستخدامها وحمايتها وفقاً لنظام حماية البيانات الشخصية في المملكة العربية السعودية."
            : "Learn how Kleenology collects, uses, and protects your data in compliance with Saudi Arabia's Personal Data Protection Law (PDPL)."
        }
        url="https://kleenology.me/privacy-policy"
      />
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-3">
              {isRTL ? "سياسة الخصوصية" : "Privacy Policy"}
            </h1>
            <p className="text-muted-foreground">
              {isRTL
                ? "كيف نجمع بياناتك ونستخدمها ونحميها"
                : "How we collect, use, and protect your data"}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-border shadow-sm p-6 md:p-10 space-y-8">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-lg font-bold text-foreground mb-3">{section.title}</h2>
                <ul className="space-y-2">
                  {section.content.map((item, i) => (
                    <li key={i} className="text-muted-foreground text-sm leading-relaxed flex gap-2">
                      <span className="text-primary mt-1 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <p className="text-xs text-muted-foreground border-t border-border pt-6">
              {isRTL
                ? `آخر تحديث: مايو ٢٠٢٦ · للتواصل: Contract@kleenology.net`
                : `Last updated: May 2026 · Contact: Contract@kleenology.net`}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
