import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { BeforeAfterShowcase } from "@/components/BeforeAfterShowcase";
import { CorporateCleaning } from "@/components/CorporateCleaning";
import { ClientSectors } from "@/components/ClientSectors";
import { Stats } from "@/components/Stats";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { TrustBadges } from "@/components/TrustBadges";
import { PromoBanner } from "@/components/PromoBanner";
import { Header } from "@/components/Header";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { SEO } from "@/components/SEO";

const Index = () => {
  const { t, i18n } = useTranslation();
  
  console.log('Index component rendering, i18n language:', i18n.language);
  
  const handleWhatsAppClick = () => {
    if ((window as any).pixelTracker) {
      (window as any).pixelTracker.trackWhatsAppClick();
    }
    window.open('https://wa.me/966537519929', '_blank');
  };

  const isRTL = i18n.dir() === "rtl";

  const homeJsonLd = [
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": isRTL ? "الرئيسية" : "Home", "item": "https://kleenology.me" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={isRTL
          ? "كلينولوجي - خدمات تنظيف احترافية في الرياض | Kleenology"
          : "Kleenology - Professional Cleaning Services Riyadh | كلينولوجي"}
        description={isRTL
          ? "كلينولوجي — شركة تنظيف احترافية في الرياض. تنظيف منازل، مكاتب، سجاد، وتنظيف عميق بمواد آمنة وضمان الرضا ١٠٠٪. احجز الآن!"
          : "Kleenology delivers spotless cleaning results using eco-friendly products. Professional home and office cleaning services in Riyadh with 100% satisfaction guarantee."}
        keywords={isRTL
          ? "تنظيف منازل الرياض, شركة تنظيف الرياض, تنظيف عميق, تنظيف سجاد, تنظيف مكاتب, كلينولوجي"
          : "cleaning services Riyadh, professional cleaning, house cleaning, office cleaning, eco-friendly cleaning, deep cleaning, Kleenology"}
        url="https://kleenology.me"
        locale={isRTL ? "ar_SA" : "en_US"}
        jsonLd={homeJsonLd}
      />
      
      <PromoBanner />
      <Header />

      <Hero />
      <Stats />
      <TrustBadges />
      <ClientSectors />
      <Services />
      <BeforeAfterShowcase />
      <Testimonials />
      <FAQ />
      <Contact />
      
      <Footer />
      
      <Button
        onClick={handleWhatsAppClick}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-[#25D366] hover:bg-[#20BA5A] shadow-float hover:shadow-lg transform hover:scale-110 transition-all duration-300"
        size="icon"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle className="h-7 w-7 text-white" />
      </Button>
    </div>
  );
};

export default Index;