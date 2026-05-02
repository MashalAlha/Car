import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, Lock, Home } from 'lucide-react';

export default function Unauthorized() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-premium-950 px-4 relative overflow-hidden font-sans">
      {/* Security Scanning Effect */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/20 to-transparent animate-scan z-0"></div>
      
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-red-500/20 rounded-full animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-red-500/10 rounded-full"></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl glass-panel p-12 md:p-20 rounded-[40px] border border-red-500/20 shadow-4xl backdrop-blur-2xl">
        <div className="w-24 h-24 bg-red-500/10 rounded-3xl border border-red-500/30 flex items-center justify-center mx-auto mb-10 shadow-inner group">
          <ShieldAlert className="w-12 h-12 text-red-500 group-hover:scale-110 transition-transform duration-500" />
        </div>

        <span className="text-red-500 text-[10px] md:text-xs font-black uppercase tracking-[0.8em] mb-4 block">
          {t('errors.401.title')}
        </span>
        
        <h1 className="text-2xl md:text-5xl font-black text-white mb-6 italic tracking-tight uppercase leading-none">
          {t('errors.401.subtitle')}
        </h1>
        
        <p className="text-silver-400 text-sm md:text-lg mb-12 leading-relaxed max-w-md mx-auto">
          {t('errors.401.description')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 border-t border-white/5">
          <Link 
            to="/login" 
            className="bg-red-500 hover:bg-red-600 text-white px-12 py-4 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-red-500/20 group"
          >
            <Lock className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
            {t('errors.401.cta')}
          </Link>
          
          <Link 
            to="/" 
            className="flex items-center gap-2 text-silver-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <Home className="w-4 h-4" />
            {t('errors.401.home_cta')}
          </Link>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.1; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.2; }
        }
        .animate-scan { animation: scan 4s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
      `}} />
    </div>
  );
}
