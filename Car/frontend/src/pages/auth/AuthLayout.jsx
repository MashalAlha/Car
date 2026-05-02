import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useLoading } from '../../components/ui/LoadingManager';

export default function AuthLayout() {
  const { t, i18n } = useTranslation();
  const { stopLoading } = useLoading();

  useEffect(() => {
    // Dismiss the global transition loader specifically once auth components mount
    const timer = setTimeout(() => stopLoading(), 100);
    return () => clearTimeout(timer);
  }, [stopLoading]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    localStorage.setItem('lang', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };
  return (
    <div className="min-h-screen bg-premium-900 flex relative overflow-hidden">
      {/* Abstract Luxury Background Element */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gold-600/10 blur-[120px]" />
        <div className="absolute bottom-[10%] -left-[20%] w-[50%] h-[50%] rounded-full bg-silver-400/5 blur-[100px]" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex w-full">
        {/* Left pane - Image/Branding (hidden on small screens) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-premium-900 border-r border-gold-500/10 items-center justify-center p-12 overflow-hidden">
          {/* Main Background Image with cinematic effect */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center animate-ken-burns"
            style={{ 
              backgroundImage: "url('/assets/images/admin_login_bg.png')",
              filter: "brightness(0.7) contrast(1.1)"
            }}
          />
          
          {/* Multi-layered Overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-premium-900 via-transparent to-transparent z-10 opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-premium-900 via-transparent to-premium-900/40 z-10" />
          
          {/* Subtle accent border */}
          <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-gold-500/20 to-transparent z-20" />

          <div className="relative z-30 flex flex-col items-center text-center animate-fade-in px-8">
            <div className="w-20 h-1 bg-gold-500 mb-8 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
            <h1 className="text-6xl font-bold text-white tracking-tight mb-6 leading-tight">
              {t('auth.layout_title')}
            </h1>
            <p className="text-xl text-silver-300 max-w-lg font-light leading-relaxed">
              {t('auth.layout_subtitle')}
            </p>
            <div className="mt-12 flex gap-4">
              <div className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-silver-500/30" />
              <div className="w-2 h-2 rounded-full bg-silver-500/30" />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 animate-slide-up relative">
          {/* Language Toggle */}
          <button 
            onClick={toggleLanguage} 
            className="absolute top-6 end-6 flex items-center gap-1.5 p-2 text-silver-400 hover:text-gold-500 transition-colors rounded-lg hover:bg-white/5 z-50"
            title={i18n.language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            <Globe className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">{i18n.language === 'ar' ? 'EN' : 'ع'}</span>
          </button>
          
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
