import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, ArrowRight, CheckCircle, AlertCircle, ChevronLeft } from 'lucide-react';

import { API_BASE } from '../../config';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_BASE}/users/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('user_access_token', data.access);
        localStorage.setItem('user_refresh_token', data.refresh);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        
        setSuccess(`${t('auth.welcome_back')}, ${data.user.username}!`);
        setTimeout(() => navigate('/catalog'), 1200);
      } else {
        setError(data.detail || data.non_field_errors?.[0] || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Cannot connect to the server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-8 sm:p-10 rounded-2xl">
      <Link to="/" className="inline-flex items-center gap-2 text-silver-400 hover:text-gold-500 mb-6 group transition-colors text-sm font-medium">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        {t('auth.return_to_site')}
      </Link>
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold luxury-gradient-text mb-3">{t('auth.welcome_back')}</h2>
        <p className="text-silver-400 text-sm">{t('auth.enter_credentials')}</p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-2 text-green-400 text-sm animate-fade-in">
          <CheckCircle className="w-4 h-4 flex-shrink-0" /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-silver-300 mb-2">{t('auth.email_address')}</label>
          <div className="relative group/input">
            <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none z-10">
              <Mail className="h-4 w-4 text-silver-600 group-focus-within/input:text-gold-500 transition-colors" />
            </div>
            <input 
              type="email" 
              className="w-full bg-premium-input border border-premium-border rounded-lg py-3.5 ps-11 pe-4 text-white placeholder-silver-600/50 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all text-sm" 
              placeholder="admin@exclusive.cars"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-silver-300">{t('auth.password')}</label>
            <a href="#" className="text-xs text-gold-500 hover:text-gold-400 transition-colors">{t('auth.forgot_password')}</a>
          </div>
          <div className="relative group/input">
            <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none z-10">
              <Lock className="h-4 w-4 text-silver-600 group-focus-within/input:text-gold-500 transition-colors" />
            </div>
            <input 
              type="password" 
              className="w-full bg-premium-input border border-premium-border rounded-lg py-3.5 ps-11 pe-4 text-white placeholder-silver-600/50 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all text-sm" 
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
          className="luxury-button w-full py-3.5 flex items-center justify-center gap-2 mt-4 text-sm font-bold tracking-wide disabled:opacity-70"
        >
          {loading ? <span className="animate-pulse">{t('auth.authenticating')}</span> : <>{t('auth.sign_in')} <ArrowRight className="h-4 w-4 rtl:rotate-180" /></>}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-silver-400 text-sm">
          {t('auth.no_account')}{' '}
          <Link to="/register" className="text-gold-500 hover:text-gold-400 font-medium transition-colors">
            {t('auth.request_invitation')}
          </Link>
        </p>
      </div>
    </div>
  );
}
