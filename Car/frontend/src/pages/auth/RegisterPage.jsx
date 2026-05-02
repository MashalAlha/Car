import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Lock, ArrowRight, CheckCircle, AlertCircle, ChevronLeft } from 'lucide-react';

import { API_BASE } from '../../config';

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    username: '',
    email: '', 
    phone: '', 
    password: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_BASE}/users/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        const errorMessages = Object.values(data).flat().join(' ');
        setError(errorMessages || 'Registration failed. Please check your details.');
      }
    } catch (err) {
      setError('Cannot connect to the server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-8 sm:p-10 rounded-2xl">
      <Link to="/" className="inline-flex items-center gap-2 text-silver-400 hover:text-gold-500 mb-8 group transition-colors text-sm font-medium">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        {t('auth.return_to_site')}
      </Link>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold luxury-gradient-text mb-2">{t('auth.register_title')}</h2>
        <p className="text-silver-400 text-sm">{t('auth.register_subtitle')}</p>
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

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-silver-300 mb-1.5">{t('auth.username')}</label>
          <div className="relative group/input">
            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none z-10">
              <User className="h-4 w-4 text-silver-600 group-focus-within/input:text-gold-500 transition-colors" />
            </div>
            <input 
              type="text" 
              className="w-full bg-premium-input border border-premium-border rounded-lg py-2.5 ps-10 pe-4 text-white placeholder-silver-600/50 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all text-sm" 
              placeholder="johndoe"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-silver-300 mb-1.5">{t('auth.email_address')}</label>
          <div className="relative group/input">
            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none z-10">
              <Mail className="h-4 w-4 text-silver-600 group-focus-within/input:text-gold-500 transition-colors" />
            </div>
            <input 
              type="email" 
              className="w-full bg-premium-input border border-premium-border rounded-lg py-2.5 ps-10 pe-4 text-white placeholder-silver-600/50 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all text-sm" 
              placeholder="vip@example.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-silver-300 mb-1.5">{t('auth.phone_number')}</label>
          <div className="relative group/input">
            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none z-10">
              <Phone className="h-4 w-4 text-silver-600 group-focus-within/input:text-gold-500 transition-colors" />
            </div>
            <input 
              type="tel" 
              className="w-full bg-premium-input border border-premium-border rounded-lg py-2.5 ps-10 pe-4 text-white placeholder-silver-600/50 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all text-sm" 
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-silver-300 mb-1.5">{t('auth.password')}</label>
          <div className="relative group/input">
            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none z-10">
              <Lock className="h-4 w-4 text-silver-600 group-focus-within/input:text-gold-500 transition-colors" />
            </div>
            <input 
              type="password" 
              className="w-full bg-premium-input border border-premium-border rounded-lg py-2.5 ps-10 pe-4 text-white placeholder-silver-600/50 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all text-sm" 
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
          className="luxury-button w-full py-3 flex items-center justify-center gap-2 mt-6 text-sm font-bold tracking-wide disabled:opacity-70"
        >
          {loading ? <span className="animate-pulse">{t('auth.creating_account')}</span> : <>{t('auth.complete_application')} <ArrowRight className="h-4 w-4 rtl:rotate-180" /></>}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-silver-400 text-xs">
          {t('auth.already_member')}{' '}
          <Link to="/login" className="text-gold-500 hover:text-gold-400 font-medium transition-colors">
            {t('auth.sign_in_here')}
          </Link>
        </p>
      </div>
    </div>
  );
}
