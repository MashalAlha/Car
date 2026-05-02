import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Key, AlertCircle, CheckCircle, Globe } from 'lucide-react';
import { useLoading } from '../../components/ui/LoadingManager';

import api from '../../utils/api';

export default function AdminLoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { stopLoading } = useLoading();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Dismiss the global transition loader specifically once the admin portal mounts
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/users/login/', formData, {
        _skipInterceptor: true
      });
      
      const data = res.data;
      
      if (data.user.role === 'Admin' || data.user.role === 'WorkshopManager') {
        localStorage.setItem('admin_access_token', data.access);
        localStorage.setItem('admin_refresh_token', data.refresh);
        localStorage.setItem('admin_data', JSON.stringify(data.user));
        
        setSuccess(`Authorization granted: ${data.user.role}`);
        
        const targetPath = data.user.role === 'WorkshopManager' ? '/admin/workshop' : '/admin';
        setTimeout(() => navigate(targetPath), 1200);
      } else {
        setError('Access Denied: Administrative privileges required.');
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.status === 401) {
        const data = err.response.data;
        const errorMsg = data.detail === 'no_workshop_assigned' 
          ? t('admin_auth.error_no_workshop')
          : (data.detail || data.non_field_errors?.[0] || 'Invalid credentials. Please try again.');
        setError(errorMsg);
      } else {
        setError('Cannot connect to the server. Session verification failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-premium-900 flex relative overflow-hidden">
      
      {/* Left Pane - Cinematic Car Showcase */}
      <div className="hidden lg:flex lg:w-3/5 relative bg-black overflow-hidden border-e border-gold-500/10">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center animate-ken-burns scale-110"
          style={{ 
            backgroundImage: "url('/assets/images/admin_login_bg.png')",
            filter: "brightness(0.6) contrast(1.2)"
          }}
        />
        
        {/* Advanced Overlays for Executive Depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-premium-900/40 via-transparent to-premium-900 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-premium-900 via-transparent to-premium-900/20 z-10" />
        <div className="absolute inset-0 bg-gold-900/10 mix-blend-overlay z-10" />

        {/* Branding Overlay */}
        <div className="relative z-20 flex flex-col justify-end p-20 w-full animate-fade-in">
          <div className="w-24 h-1 bg-gold-500 mb-8 shadow-[0_0_20px_rgba(212,175,55,0.6)]" />
          <h1 className="text-7xl font-black text-white tracking-tighter mb-4">
            EXECUTIVE <span className="text-gold-500">PORTAL</span>
          </h1>
          <p className="text-xl text-silver-400 font-light max-w-xl leading-relaxed tracking-wide">
            Access the command center for the world's most exclusive automotive collection. Authenticate to manage high-value assets and VIP relations.
          </p>
          
          <div className="mt-12 flex items-center gap-6">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-gold-500 animate-pulse" />
              <div className="w-3 h-3 rounded-full bg-gold-500/30" />
              <div className="w-3 h-3 rounded-full bg-gold-500/30" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-silver-500 font-bold">Secure Protocol Active</span>
          </div>
        </div>
      </div>

      {/* Right Pane - Login Interface */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-6 sm:p-12 relative">
        
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-gold-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Language Toggle */}
        <button 
          onClick={toggleLanguage} 
          className="absolute top-8 end-8 flex items-center gap-1.5 p-2 text-silver-400 hover:text-gold-500 transition-colors rounded-lg hover:bg-white/5 z-50"
          title={i18n.language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
        >
          <Globe className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">{i18n.language === 'ar' ? 'EN' : 'ع'}</span>
        </button>

        <div className="w-full max-w-md relative z-10 animate-slide-up">
          
          {/* Dealership Admin Branding for Mobile */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-16 h-16 mx-auto rounded-xl bg-gold-500 flex items-center justify-center font-black text-premium-900 text-3xl mb-6 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
              EM
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wider uppercase">{t('admin_auth.portal_title')}</h2>
          </div>

          <div className="mb-10 hidden lg:block">
            <h2 className="text-sm font-bold text-gold-500 tracking-[0.3em] uppercase mb-2">{t('admin_auth.portal_title')}</h2>
            <p className="text-3xl font-bold text-white">{t('admin_auth.initialize_session')}</p>
          </div>

          <div className="glass-panel p-8 sm:p-10 rounded-2xl border-t border-t-gold-500/30 shadow-2xl relative overflow-hidden group">
            {/* Gloss effect on card */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-500/30 flex items-start gap-3 text-red-400 text-sm animate-fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> 
                <p>{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 rounded-lg bg-green-900/20 border border-green-500/30 flex items-center gap-3 text-green-400 text-sm animate-fade-in">
                <CheckCircle className="w-5 h-5 flex-shrink-0" /> 
                <p className="font-mono">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-silver-500 uppercase tracking-[0.2em]">{t('admin_auth.admin_email')}</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none z-10">
                    <Mail className="h-4 w-4 text-silver-600 group-focus-within/input:text-gold-500 transition-colors" />
                  </div>
                  <input 
                    type="email" 
                    className="w-full bg-premium-900/80 border border-white/5 rounded-xl py-4 ps-11 pe-4 text-white placeholder-white/10 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all font-mono text-sm" 
                    placeholder="admin@exoticmotors.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-silver-500 uppercase tracking-[0.2em]">{t('admin_auth.access_protocol')}</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none z-10">
                    <Lock className="h-4 w-4 text-silver-600 group-focus-within/input:text-gold-500 transition-colors" />
                  </div>
                  <input 
                    type="password" 
                    className="w-full bg-premium-900/80 border border-white/5 rounded-xl py-4 ps-11 pe-4 text-white placeholder-white/10 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all font-mono text-sm" 
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="luxury-button w-full py-5 rounded-xl flex items-center justify-center gap-4 text-base font-black tracking-[0.25em] uppercase transition-all hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] active:scale-[0.98] disabled:opacity-50 mt-6 group/btn"
              >
                {loading ? (
                  <span className="animate-pulse">{t('admin_auth.authenticating')}</span>
                ) : (
                  <>
                    {t('admin_auth.initialize_session')} 
                    <Key className="h-5 w-5 group-hover:rotate-45 transition-transform duration-300" />
                  </>
                )}
              </button>
            </form>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-silver-600 text-[10px] uppercase tracking-[0.4em] font-bold opacity-50">
              {t('admin_auth.warning')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
