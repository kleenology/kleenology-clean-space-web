import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Sparkles, Calendar, Clock } from "lucide-react";
import { HeroWash } from "@/components/HeroWash";
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

  // هذه الأرقام يجب أن تطابق قسم الإحصائيات في Stats.tsx
  const proof = [
    { icon: Users, text: `690+ ${t('hero.stats.0')}` },
    { icon: Sparkles, text: `98% ${t('hero.stats.2')}` },
    { icon: Clock, text: t('hero.reassurance') },
  ];

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-b from-brand-blue/10 via-background to-background pt-24 pb-14 sm:pt-32 sm:pb-24"
    >
      {/* زخرفة خلفية خفيفة بألوان الهوية */}
      <div className="absolute -top-24 -start-24 w-72 h-72 rounded-full bg-brand-yellow/20 blur-3xl" aria-hidden="true" />
      <div className="absolute top-1/3 -end-32 w-96 h-96 rounded-full bg-brand-blue/15 blur-3xl" aria-hidden="true" />

      {/* على الجوال تأتي البطاقة بعد العنوان مباشرة حتى تُرى الحركة بلا تمرير،
          وعلى الشاشة الكبيرة تأخذ عموداً كاملاً بجانب النص */}
      <div className="relative max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-x-14 gap-y-8 items-center">
        <div className="text-center lg:text-start lg:self-end animate-fade-in">
          <h1 className="font-sans text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight text-foreground leading-[1.4] sm:leading-[1.4] lg:leading-[1.45] mb-5">
            <span className="bg-[linear-gradient(transparent_68%,hsl(var(--brand-yellow)/0.55)_68%)] box-decoration-clone">
              {t('hero.headline')}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
            {t('hero.tagline')}
          </p>
        </div>

        <div className="px-2 sm:px-6 lg:px-0 pt-4 lg:col-start-2 lg:row-start-1 lg:row-span-2">
          <HeroWash />
        </div>

        <div className="text-center lg:text-start lg:self-start lg:col-start-1 lg:row-start-2">
          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
            <Button
              onClick={handleWhatsAppClick}
              variant="hero"
              size="lg"
              className="text-base sm:text-lg px-7 py-4 h-auto font-bold shadow-float"
            >
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              {t('hero.startBooking')}
            </Button>
            <Button
              onClick={handleBookingPage}
              variant="outline"
              size="lg"
              className="text-base sm:text-lg px-7 py-4 h-auto font-semibold border-2 border-brand-blue/30 text-brand-blue-deeper hover:bg-brand-blue/5"
            >
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              {t('hero.bookOnline')}
            </Button>
          </div>

          <ul className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2">
            {proof.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                <Icon className="h-4 w-4 text-brand-blue" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
