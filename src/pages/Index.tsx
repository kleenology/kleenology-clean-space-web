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
import { Reveal, ScrollProgress } from "@/components/Reveal";
import { CleanIntro } from "@/components/CleanIntro";

const Index = () => {
  const { t, i18n } = useTranslation();
  
  console.log('Index component rendering, i18n language:', i18n.language);
  
  const handleWhatsAppClick = () => {
    if ((window as any).pixelTracker) {
      (window as any).pixelTracker.trackWhatsAppClick();
    }
    window.open('https://wa.me/966537519929', '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* نفس عنوان ووصف index.html — كان هنا عنوان إنجليزي يستبدل العربي بعد التحميل */}
      <SEO
        title="كلينولوجي - خدمات تنظيف احترافية في الرياض | Kleenology"
        description="كلينولوجي — شركة تنظيف احترافية في الرياض. تنظيف منازل، مكاتب، سجاد، وتنظيف عميق بمواد آمنة وضمان الرضا ١٠٠٪. احجز الآن!"
        keywords="تنظيف منازل الرياض, شركة تنظيف الرياض, تنظيف عميق, تنظيف سجاد, تنظيف مكاتب, كلينولوجي, cleaning company Riyadh"
        url="https://kleenology.me"
      />
      
      <PromoBanner />
      <Header />

      <CleanIntro />
      <ScrollProgress />
      <Hero />
      <Stats />
      <Reveal><TrustBadges /></Reveal>
      <Reveal><ClientSectors /></Reveal>
      <Reveal><Services /></Reveal>
      <Reveal><BeforeAfterShowcase /></Reveal>
      <Reveal><Testimonials /></Reveal>
      <Reveal><FAQ /></Reveal>
      <Reveal><Contact /></Reveal>
      
      <Footer />
    </div>
  );
};

export default Index;