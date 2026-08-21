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

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Kleenology - Professional Cleaning Services | Excellence in Every Inch"
        description="Kleenology delivers spotless cleaning results using eco-friendly products. Professional home and office cleaning services with satisfaction guarantee."
        keywords="cleaning services, professional cleaning, house cleaning, office cleaning, eco-friendly cleaning, deep cleaning, sanitization"
        url="https://kleenology.me"
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
    </div>
  );
};

export default Index;