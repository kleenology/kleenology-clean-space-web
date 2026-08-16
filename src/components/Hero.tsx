
import heroBg from "@/assets/hero-background-white.jpg";
import heroBgMobile from "@/assets/hero-background-mobile.jpg";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Shield, Sparkles, Calendar } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

export const Hero = () => {
  const { t } = useTranslation();

  const handleWhatsAppClick = useCallback(() => {
    // Track WhatsApp click
    if ((window as any).pixelTracker) {
      (window as any).pixelTracker.trackWhatsAppClick();
    }
    window.open('https://wa.me/966537519929', '_blank');
  }, []);

  const handleBookingPage = useCallback(() => {
    // Track the step-by-step booking route
    if ((window as any).pixelTracker) {
      (window as any).pixelTracker.trackButtonClick('booking_page');
    }
    window.location.href = '/booking';
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 pb-24 sm:pt-36 sm:pb-36"
    >
      {/* Professional Background with Gradient Overlay */}
      <div
        className="absolute inset-0 w-full h-full z-0 bg-cover bg-center bg-no-repeat scale-110 sm:scale-100"
        style={{
          backgroundImage: `linear-gradient(120deg, rgba(20,30,48,0.15) 30%, rgba(36,198,220,0.05)), url(${heroBg})`,
        }}
        aria-hidden="true"
      />

      {/* Hero Content */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center px-4 sm:px-0">
        <div className="max-w-2xl w-full mx-auto px-4 sm:px-10 py-12 sm:py-20 rounded-none sm:rounded-3xl bg-transparent sm:bg-white/5 backdrop-blur-none sm:backdrop-blur-xl shadow-none sm:shadow-2xl border-none sm:border sm:border-white/10 flex flex-col items-center gap-6 sm:gap-8 mb-10 sm:mb-16 animate-fade-in">
          {/* Main Professional Headline */}
          <h1 className="font-sans text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-center text-white drop-shadow-xl mb-3 sm:mb-4 leading-tight">
            {t('hero.headline')}
          </h1>
          {/* Elegant Tagline */}
          <p className="font-sans text-base sm:text-xl md:text-2xl text-center text-white/80 font-normal max-w-xl mx-auto mb-2 sm:mb-4 leading-relaxed">
            {t('hero.tagline')}
          </p>
          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full mt-2">
            <Button 
              onClick={handleWhatsAppClick}
              variant="hero"
              size="lg"
              className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-5 h-auto font-bold shadow-float w-full sm:w-auto"
            >
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              {t('hero.startBooking')}
            </Button>
            <Button
              onClick={handleBookingPage}
              variant="outline"
              size="lg"
              className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-5 h-auto font-semibold border-white/40 text-white/90 bg-transparent sm:bg-white/10 hover:bg-white/20 hover:text-brand-blue w-full sm:w-auto"
            >
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              {t('hero.bookOnline')}
            </Button>
          </div>
          {/* ما الذي يحدث بعد الضغط — يقلل تردد الزائر */}
          <p className="text-sm sm:text-base text-white/75 text-center font-medium -mt-1">
            {t('hero.reassurance')}
          </p>
        </div>
        {/* Stats Grid - Desktop only */}
        <div className="hidden sm:grid grid-cols-3 gap-8 max-w-4xl w-full mx-auto mt-2 animate-fade-in">
          {[
            // هذه الأرقام يجب أن تطابق قسم الإحصائيات في Stats.tsx
            { icon: Users, number: "690+", label: t('hero.stats.0') },
            { icon: Shield, number: "182+", label: t('hero.stats.1') },
            { icon: Sparkles, number: "98%", label: t('hero.stats.2') }
          ].map((stat, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-white/20 group"
              style={{boxShadow: '0 4px 24px 0 rgba(0,0,0,0.15)'}}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-yellow to-brand-blue rounded-full mb-4 shadow-xl">
                <stat.icon className="h-8 w-8 text-white drop-shadow-lg" />
              </div>
              <div className="text-3xl font-extrabold mb-1 text-white">
                {stat.number}
              </div>
              <div className="text-base font-medium text-white/80">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Scroll Indicator */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <div className="w-7 h-12 sm:w-8 sm:h-14 border-2 border-white/60 rounded-full flex justify-center items-start bg-white/10 shadow-lg">
          <div className="w-1.5 h-3 sm:w-2 sm:h-4 bg-gradient-to-b from-brand-yellow to-brand-blue rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};
