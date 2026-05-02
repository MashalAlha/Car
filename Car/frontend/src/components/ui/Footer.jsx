import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, Instagram, Twitter, Facebook, ArrowRight } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-premium-900 border-t border-white/5 mt-auto">
      {/* CTA Bar */}
      <div className="bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-premium-900 text-2xl font-bold">{t('footer.cta_heading')}</h3>
            <p className="text-premium-900/70 text-sm">{t('footer.cta_subtitle')}</p>
          </div>
          <Link to="/workshop/book" className="bg-premium-900 text-gold-400 px-8 py-3 rounded-lg font-bold text-sm hover:bg-black transition-colors flex items-center gap-2">
            {t('footer.cta_button')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gold-500 flex items-center justify-center font-black text-premium-900 text-lg">
                EM
              </div>
              <div>
                <h4 className="text-white font-bold text-lg leading-none">{t('brand')}</h4>
                <p className="text-gold-500 text-[10px] font-bold uppercase tracking-[0.2em]">Since 2024</p>
              </div>
            </div>
            <p className="text-silver-400 text-sm leading-relaxed mb-6">
              {t('footer.brand_desc')}
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-silver-400 hover:bg-gold-500 hover:text-premium-900 hover:border-gold-500 transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-silver-400 hover:bg-gold-500 hover:text-premium-900 hover:border-gold-500 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-silver-400 hover:bg-gold-500 hover:text-premium-900 hover:border-gold-500 transition-all">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-6">{t('footer.quick_links')}</h4>
            <ul className="space-y-3">
              {[
                { name: t('nav.showroom'), href: '/catalog' },
                { name: t('nav.boutique'), href: '/store' },
                { name: t('nav.workshop'), href: '/workshop/book' },
                { name: t('nav.favorites'), href: '/favorites' },
              ].map(link => (
                <li key={link.name}>
                  <Link to={link.href} className="text-silver-400 hover:text-gold-400 text-sm transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-silver-600 group-hover:bg-gold-500 rounded-full transition-colors"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-6">{t('footer.services')}</h4>
            <ul className="space-y-3">
              {[
                t('services.sales_title'),
                t('services.rentals_title'),
                t('services.workshop_title'),
                t('services.parts_title'),
              ].map(service => (
                <li key={service}>
                  <span className="text-silver-400 text-sm flex items-center gap-2">
                    <span className="w-1 h-1 bg-silver-600 rounded-full"></span>
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-6">{t('footer.contact')}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" />
                <span className="text-silver-400 text-sm" style={{whiteSpace:'pre-line'}}>{t('contact.visit_address')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold-500 flex-shrink-0" />
                <a href="tel:+15551234567" className="text-silver-400 hover:text-gold-400 text-sm transition-colors">{t('contact.call_number')}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold-500 flex-shrink-0" />
                <a href="mailto:concierge@exoticmotors.com" className="text-silver-400 hover:text-gold-400 text-sm transition-colors">concierge@exoticmotors.com</a>
              </li>
            </ul>
            <div className="mt-6 text-xs text-silver-600">
              <p>{t('contact.hours_weekday')}</p>
              <p>{t('contact.hours_weekend')}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-silver-600 text-xs">&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
          <div className="flex gap-6 text-xs text-silver-600">
            <a href="#" className="hover:text-silver-400 transition-colors">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-silver-400 transition-colors">{t('footer.terms')}</a>
            <a href="#" className="hover:text-silver-400 transition-colors">{t('footer.cookies')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
