import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PremiumLoadingPage() {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-premium-900 overflow-hidden font-sans rtl:font-sans">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold-500/10 via-premium-900 to-premium-900 opacity-50"></div>
      
      {/* Top Decorative Line */}
      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-30"></div>

      <div className="relative flex flex-col items-center gap-12 text-center px-6">
        {/* Animated Logo Container */}
        <div className="relative group">
          <div className="absolute -inset-8 bg-gold-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="w-24 h-24 rounded-2xl bg-gold-500 flex items-center justify-center font-black text-premium-900 text-3xl shadow-[0_0_50px_rgba(212,175,55,0.4)] animate-bounce-slow">
            EM
          </div>
          {/* Ornamental Circles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-gold-500/20 rounded-full animate-ping-slow"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-gold-500/10 rounded-full animate-ping-slow delay-700"></div>
        </div>

        {/* Typography */}
        <div className="space-y-4 animate-fade-in-up">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-relaxed">
            {t('loading_page.title')}
          </h1>
          <p className="text-gold-500 text-lg md:text-xl font-medium tracking-wide opacity-80 decoration-gold-500/30 underline underline-offset-8">
            {t('loading_page.welcome')}
          </p>
        </div>

        {/* Progress System */}
        <div className="w-64 flex flex-col items-center gap-3">
          <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gold-500 animate-progress-full shadow-[0_0_10px_rgba(212,175,55,0.8)]"></div>
          </div>
          <p className="text-[10px] uppercase tracking-[0.5em] text-silver-600 font-bold">
            Exotic Motors Excellence
          </p>
        </div>
      </div>

      {/* Bottom Decorative Line */}
      <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-30"></div>
      
      {/* Corner Accents */}
      <div className="absolute top-10 left-10 w-20 h-20 border-t border-l border-gold-500/20"></div>
      <div className="absolute bottom-10 right-10 w-20 h-20 border-b border-r border-gold-500/20"></div>
    </div>
  );
}
