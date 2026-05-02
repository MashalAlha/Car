import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-premium-900 px-4 relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold-500/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold-500/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl">
        <div className="mb-8 relative inline-block">
          <h1 className="text-[150px] md:text-[200px] font-black leading-none italic luxury-gradient-text opacity-20 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-gold-500 text-xs md:text-sm font-black uppercase tracking-[1em] md:tracking-[1.5em] drop-shadow-lg">
                {t('errors.404.title')}
             </span>
          </div>
        </div>

        <h2 className="text-2xl md:text-4xl font-bold text-white mb-6 italic tracking-tight">
          {t('errors.404.subtitle')}
        </h2>
        
        <p className="text-silver-400 text-sm md:text-lg mb-12 leading-relaxed max-w-lg mx-auto">
          {t('errors.404.description')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link 
            to="/" 
            className="luxury-button px-10 py-4 flex items-center gap-3 text-xs font-black uppercase tracking-widest shadow-2xl shadow-gold-500/10 group"
          >
            <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
            {t('errors.404.cta')}
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-silver-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {t('common.back') || 'Go Back'}
          </button>
        </div>
      </div>

      {/* Aesthetic Border/Frame Overlay */}
      <div className="absolute inset-8 border border-white/5 pointer-events-none rounded-[40px] hidden md:block"></div>
      <div className="absolute inset-12 border border-white/5 pointer-events-none rounded-[40px] hidden md:block"></div>
    </div>
  );
}
