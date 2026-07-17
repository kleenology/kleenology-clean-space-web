import { MessageCircle, Phone, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

interface FooterProps {
  onTermsClick?: () => void;
  onNavClick?: () => void;
}

export const Footer = ({ onTermsClick, onNavClick }: FooterProps) => {
  const { t } = useTranslation();
  const handleWhatsAppClick = () => {
    window.open('https://wa.me/966537519929', '_blank');
  };

  const handleCallClick = () => {
    window.location.href = 'tel:+966537519929';
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:Contract@kleenology.net';
  };

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div>
            <a href="/" className="cursor-pointer inline-block">
              <img 
                src="/logo.png" 
                alt="Kleenology Logo" 
                className="h-12 w-auto mb-4 brightness-0 invert hover:opacity-80 transition-opacity"
              />
            </a> 
            <p className="text-sm text-background/80 leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.servicesTitle')}</h3>
            <div className="space-y-2">
              <a href="/home-cleaning" className="block text-sm text-background/80 hover:text-brand-yellow transition-colors">{t('footer.homeCleaningLink')}</a>
              <a href="/office-cleaning" className="block text-sm text-background/80 hover:text-brand-yellow transition-colors">{t('footer.officeCleaningLink')}</a>
              <a href="/deep-cleaning" className="block text-sm text-background/80 hover:text-brand-yellow transition-colors">{t('footer.deepCleaningLink')}</a>
              <a href="/carpet-cleaning" className="block text-sm text-background/80 hover:text-brand-yellow transition-colors">{t('footer.carpetCleaningLink')}</a>
              <a href="/post-construction-cleaning" className="block text-sm text-background/80 hover:text-brand-yellow transition-colors">{t('footer.postConstructionLink')}</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <div className="space-y-2">
              <a 
                href="/" 
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavClick) {
                    onNavClick();
                  }
                  setTimeout(() => {
                    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="block text-sm text-background/80 hover:text-brand-yellow transition-colors cursor-pointer"
              >
                {t('footer.home')}
              </a>
              <a 
                href="/#about" 
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavClick) {
                    onNavClick();
                  }
                  setTimeout(() => {
                    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="block text-sm text-background/80 hover:text-brand-yellow transition-colors cursor-pointer"
              >
                {t('footer.about')}
              </a>
              <a 
                href="/#services" 
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavClick) {
                    onNavClick();
                  }
                  setTimeout(() => {
                    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="block text-sm text-background/80 hover:text-brand-yellow transition-colors cursor-pointer"
              >
                {t('footer.services')}
              </a>
              <a 
                href="/#contact" 
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavClick) {
                    onNavClick();
                  }
                  setTimeout(() => {
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="block text-sm text-background/80 hover:text-brand-yellow transition-colors cursor-pointer"
              >
                {t('footer.contact')}
              </a>
              <a
                href="/about"
                className="block text-sm text-background/80 hover:text-brand-yellow transition-colors cursor-pointer"
              >
                {t('footer.aboutUs')}
              </a>
              <a
                href="/booking"
                className="block text-sm text-background/80 hover:text-brand-yellow transition-colors cursor-pointer"
              >
                {t('footer.booking')}
              </a>
              <a
                href="/terms-and-conditions"
                onClick={(e) => {
                  // Allow default link behavior to navigate to the terms page
                  if (onTermsClick) {
                    e.preventDefault();
                    onTermsClick();
                  }
                }}
                className="block text-sm text-background/80 hover:text-brand-yellow transition-colors cursor-pointer"
              >
                {t('footer.terms')}
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.contactInfo')}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-4 w-4 text-brand-yellow" />
                <button 
                  onClick={handleWhatsAppClick}
                  className="text-sm text-background/80 hover:text-brand-yellow transition-colors"
                >
                  +966-53-7519929
                </button>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-brand-yellow" />
                <button 
                  onClick={handleCallClick}
                  className="text-sm text-background/80 hover:text-brand-yellow transition-colors"
                >
                  +966-53-7519929
                </button>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-brand-yellow" />
                <button 
                  onClick={handleEmailClick}
                  className="text-sm text-background/80 hover:text-brand-yellow transition-colors"
                >
                  Contract@kleenology.net
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/20 mt-8 pt-8 text-center">
          <p className="text-sm text-background/60">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
};