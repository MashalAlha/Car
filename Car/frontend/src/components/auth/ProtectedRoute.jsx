import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { logout } from '../../utils/auth';

export default function ProtectedRoute({ children }) {
  const { t } = useTranslation();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('user_access_token');

  if (!isLoggedIn) {
    // If we're on a strictly protected route without a token, force clear and show login requirement
    // In some cases we might want to logout('user') but here we show a custom screen
    // Let's at least ensure storage is clean if token is missing
    if (localStorage.getItem('user_data')) {
      logout('user');
      return null;
    }
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full glass-panel p-10 rounded-3xl text-center border-t-4 border-t-gold-500 animate-fade-in">
          <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Lock className="w-10 h-10 text-gold-500" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">
            {t('auth.login_required_title')}
          </h2>
          
          <p className="text-silver-400 mb-10 leading-relaxed">
            {t('auth.login_required_desc')}
          </p>

          <div className="space-y-4">
            <Link 
              to="/login" 
              state={{ from: location }}
              className="w-full luxury-button py-4 flex items-center justify-center gap-2 group"
            >
              {t('auth.action_login')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              to="/register" 
              className="w-full flex items-center justify-center gap-2 py-4 text-silver-300 hover:text-white transition-colors text-sm font-bold"
            >
              <ShieldAlert className="w-4 h-4" /> {t('auth.action_join')}
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-4 text-[10px] text-silver-500 uppercase tracking-[0.2em] font-bold">
            <span>Encrypted Access</span>
            <span className="w-1 h-1 bg-white/20 rounded-full"></span>
            <span>Identity Secured</span>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
