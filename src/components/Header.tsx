import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Menu, CalendarCheck } from "lucide-react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerClose,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  onLogoClick?: () => void;
  onNavClick?: () => void;
}

export const Header = ({ onLogoClick, onNavClick }: HeaderProps) => {
  const { i18n, t } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/966537519929', '_blank');
  };

  const handleCallClick = () => {
    window.location.href = 'tel:+966537519929';
  };

  // For accessibility, control Drawer open state
  const [open, setOpen] = useState(false);

  // Language switcher
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  // Helper for smooth mobile nav
  const handleMobileNav = (sectionId: string) => {
    setOpen(false);
    setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 h-20 sm:h-24 flex items-center justify-between">
        <div className="flex items-center">
          <a 
            href="/" 
            className="cursor-pointer"
            onClick={(e) => {
              if (onLogoClick) {
                e.preventDefault();
                onLogoClick();
              }
            }}
          >
            <img 
              src="/lovable-uploads/afda02d7-63e7-4998-92eb-dbe3d776cea3.png" 
              alt="Kleenology Logo" 
              className="h-16 sm:h-20 w-auto hover:opacity-80 transition-opacity"
            />
          </a>
        </div>
        {/* Desktop Nav */}
        <nav className={`hidden lg:flex items-center ${isRTL ? 'flex-row-reverse gap-x-6 xl:gap-x-8' : 'flex-row gap-x-6 xl:gap-x-8'}`}>
          <a 
            href="#home" 
            onClick={(e) => {
              e.preventDefault();
              if (onNavClick) {
                onNavClick();
              }
              setTimeout(() => {
                document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="text-foreground hover:text-primary transition-colors cursor-pointer font-medium"
          >
            {t('nav.home')}
          </a>
          <a
            href="/about"
            className="text-foreground hover:text-primary transition-colors cursor-pointer font-medium"
          >
            {t('nav.about')}
          </a>
          <a 
            href="#services" 
            onClick={(e) => {
              e.preventDefault();
              if (onNavClick) {
                onNavClick();
              }
              setTimeout(() => {
                document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="text-foreground hover:text-primary transition-colors cursor-pointer font-medium"
          >
            {t('nav.services')}
          </a>
          <a 
            href="#showcase" 
            onClick={(e) => {
              e.preventDefault();
              if (onNavClick) {
                onNavClick();
              }
              setTimeout(() => {
                document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="text-foreground hover:text-primary transition-colors cursor-pointer font-medium"
          >
            {t('nav.showcase')}
          </a>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              if (onNavClick) {
                onNavClick();
              }
              setTimeout(() => {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="text-foreground hover:text-primary transition-colors cursor-pointer font-medium"
          >
            {t('nav.contact')}
          </a>
          <a
            href="/blog"
            className="text-foreground hover:text-primary transition-colors cursor-pointer font-medium"
          >
            {t('nav.blog')}
          </a>
          <a
            href="/booking"
            className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            <CalendarCheck className="h-4 w-4" />
            {t('nav.book')}
          </a>
        </nav>
        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-2 sm:gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleCallClick}
            className="text-sm"
          >
            <Phone className="h-4 w-4 mr-2" />
            {t('nav.call')}
          </Button>
          <Button 
            onClick={handleWhatsAppClick}
            className="bg-[#25D366] hover:bg-[#20BA5A] text-white text-sm px-3 py-2 sm:px-4"
          >
            <MessageCircle className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{t('nav.whatsapp')}</span>
            <span className="sm:hidden">{t('nav.whatsapp')}</span>
          </Button>
        </div>
        {/* Mobile Hamburger */}
        <div className="flex lg:hidden items-center">
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="p-2" aria-label="Open menu">
                <Menu className="h-7 w-7" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="pb-8 pt-4 px-4">
              <DrawerTitle className="text-lg font-semibold mb-2">Menu</DrawerTitle>
              <DrawerDescription className="sr-only">Main navigation for Kleenology website</DrawerDescription>
              <nav className="flex flex-col gap-4 mt-4">
                <a
                  href="#home"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavClick) {
                      onNavClick();
                    }
                    handleMobileNav('home');
                  }}
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                >
                  {t('nav.home')}
                </a>
                <a
                  href="/about"
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                >
                  {t('nav.about')}
                </a>
                <a
                  href="#services"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavClick) {
                      onNavClick();
                    }
                    handleMobileNav('services');
                  }}
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                >
                  {t('nav.services')}
                </a>
                <a
                  href="#showcase"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavClick) {
                      onNavClick();
                    }
                    handleMobileNav('showcase');
                  }}
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                >
                  {t('nav.showcase')}
                </a>
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavClick) {
                      onNavClick();
                    }
                    handleMobileNav('contact');
                  }}
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                >
                  {t('nav.contact')}
                </a>
                <a
                  href="/blog"
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                >
                  {t('nav.blog')}
                </a>
                <a
                  href="/booking"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-3 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors"
                >
                  <CalendarCheck className="h-5 w-5" />
                  {t('nav.book')}
                </a>
              </nav>
              <div className="flex flex-col gap-3 mt-8">
                <Button 
                  variant="ghost" 
                  size="lg"
                  onClick={() => { setOpen(false); handleCallClick(); }}
                  className="w-full justify-center text-base"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Call
                </Button>
                <Button 
                  onClick={() => { setOpen(false); handleWhatsAppClick(); }}
                  className="bg-[#25D366] hover:bg-[#20BA5A] text-white text-base px-4 py-3 w-full justify-center"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  WhatsApp
                </Button>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" className="w-full mt-6" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </DrawerClose>
            </DrawerContent>
          </Drawer>
        </div>
        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="ml-2 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm font-semibold border border-gray-300"
        >
          {i18n.language === 'en' ? 'العربية' : 'English'}
        </button>
      </div>
    </header>
  );
};