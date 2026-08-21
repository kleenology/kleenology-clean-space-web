import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Sparkles, Wind, Sofa, Home, Building2, Square, Zap, AppWindow } from "lucide-react";
import deepCleaningImg from "@/assets/deep-cleaning.jpg";
import furnitureCleaningImg from "@/assets/furniture-cleaning.jpg";
import rehabCleaningImg from "@/assets/rehab-cleaning.jpg";
import carpetCleaningImg from "@/assets/carpet-cleaning.jpg";
import windowsCleaningImg from "@/assets/windows-cleaning.jpg";
import cleaningPattern from "@/assets/cleaning-pattern.jpg";
import officeCleaningBg from "@/assets/office-cleaning-bg.jpg";
import { useTranslation } from "react-i18next";

export const Services = () => {
  const { t } = useTranslation();
  const handleWhatsAppClick = () => {
    window.open('https://wa.me/966537519929', '_blank');
  };

  const services = [
    {
      title: t('services.popular.2'),
      description: t('services.description'),
      image: deepCleaningImg,
      icon: Sparkles
    },
    {
      title: t('services.popular.1'),
      description: t('services.description'),
      image: furnitureCleaningImg,
      icon: Sofa
    },
    {
      title: t('services.popular.4'),
      description: t('services.description'),
      image: rehabCleaningImg,
      icon: Wind
    },
    {
      title: t('services.popular.3'),
      description: t('services.description'),
      image: carpetCleaningImg,
      icon: Home
    },
    {
      // popular.5 is Windows Cleaning: already listed as a service and already
      // has a description in both locales, but never had a card.
      title: t('services.popular.5'),
      description: t('services.description'),
      image: windowsCleaningImg,
      icon: AppWindow
    }
  ];

  const popularServices = [
    { title: t('services.popular.0'), icon: Building2 },
    { title: t('services.popular.1'), icon: Home },
    { title: t('services.popular.2'), icon: Sparkles },
    { title: t('services.popular.3'), icon: Square },
    { title: t('services.popular.4'), icon: Zap },
    { title: t('services.popular.5'), icon: Wind }
  ];

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on mobile
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let animationFrame: number;
    let scrollAmount = 0;
    const scrollStep = 1.5; // px per frame
    function autoScroll() {
      if (window.innerWidth >= 640) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
        el.scrollTo({ left: 0, behavior: 'auto' });
        scrollAmount = 0;
      } else {
        scrollAmount = el.scrollLeft + scrollStep;
        el.scrollTo({ left: scrollAmount, behavior: 'smooth' });
      }
      animationFrame = requestAnimationFrame(autoScroll);
    }
    animationFrame = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
      <section id="services" className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
        {/* Enhanced Background Images and Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute bottom-10 left-10 w-60 h-60 opacity-12">
            <img src={cleaningPattern} alt="Cleaning services pattern background" className="w-full h-full object-cover rounded-2xl rotate-12 shadow-xl" />
          </div>
          {/* Enhanced floating decorative elements */}
          <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-brand-yellow/30 rounded-full animate-float shadow-lg"></div>
          <div className="absolute top-1/3 right-1/5 w-6 h-6 bg-primary/25 rounded-full animate-float shadow-md" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/4 right-1/3 w-10 h-10 bg-accent/25 rounded-full animate-float shadow-lg" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-2/3 left-1/6 w-4 h-4 bg-brand-yellow/20 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-1/3 right-1/6 w-6 h-6 bg-primary/20 rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
          {/* Gradient overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/85 to-background/90"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Featured Service */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-foreground">
              {t('services.title')}
            </h2>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 text-primary px-4">
              {t('services.subtitle')}
            </h3>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              {t('services.description')}
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {services.map((service, index) => (
              <Card key={index} className="group border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-clean overflow-hidden">
                <div className="relative">
                  <img 
                    src={service.image} 
                    alt={`${service.title} - Professional cleaning service`}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                      <service.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </section>
  );
};