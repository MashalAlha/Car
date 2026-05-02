import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Shield, Edit, Save, LogOut, Car, Calendar, Heart, MessageSquare, CheckCircle, XCircle, Wrench, Package, CreditCard } from 'lucide-react';

import api from '../../utils/api';

export default function UserProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user_data');
    if (!stored) { navigate('/login'); return; }
    const parsed = JSON.parse(stored);
    setUser(parsed);
    setFormData({ username: parsed.username, email: parsed.email, phone: parsed.phone || '' });
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile/');
      const data = res.data;
      setUser(data);
      setFormData({ username: data.username, email: data.email, phone: data.phone || '' });
      localStorage.setItem('user_data', JSON.stringify(data));
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    setSaving(true); setMessage('');
    try {
      const res = await api.put('/users/profile/', formData);
      const data = res.data;
      setUser(data); localStorage.setItem('user_data', JSON.stringify(data));
      setEditing(false); setMessage(t('profile.updated'));
    } catch (e) { 
      console.error(e);
      setMessage(t('profile.update_failed')); 
    } finally { setSaving(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_access_token');
    localStorage.removeItem('user_refresh_token');
    localStorage.removeItem('user_data');
    navigate('/');
  };

  if (!user) return null;

  const links = [
    { label: t('profile.link_rentals'), icon: <Calendar className="w-5 h-5" />, href: '/my-rentals', desc: t('profile.link_rentals_desc') },
    { label: t('profile.link_purchases'), icon: <Car className="w-5 h-5" />, href: '/my-purchases', desc: t('profile.link_purchases_desc') },
    { label: t('profile.link_appointments'), icon: <Wrench className="w-5 h-5" />, href: '/my-appointments', desc: t('profile.link_appointments_desc') },
    { label: t('profile.link_orders'), icon: <Package className="w-5 h-5" />, href: '/my-orders', desc: t('profile.link_orders_desc') },
    { label: t('profile.link_finances'), icon: <CreditCard className="w-5 h-5" />, href: '/profile/finances', desc: t('profile.link_finances_desc') },
    { label: t('profile.link_garage'), icon: <Heart className="w-5 h-5" />, href: '/favorites', desc: t('profile.link_garage_desc') },
    { label: t('trust.title'), icon: <Shield className="w-5 h-5" />, href: '/trust-requests', desc: t('trust.subtitle') },
    { label: t('profile.link_support'), icon: <MessageSquare className="w-5 h-5" />, href: '/profile/messages', desc: t('profile.link_support_desc') },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">{t('profile.heading')}</h1>
          <p className="text-silver-400">{t('profile.subtitle')}</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 text-sm animate-fade-in ${message === t('profile.updated') ? 'bg-green-900/20 border border-green-500/30 text-green-400' : 'bg-red-900/20 border border-red-500/30 text-red-400'}`}>
            {message === t('profile.updated') ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="glass-panel p-8 rounded-2xl border border-premium-border/50 text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-gold-500/10 border-2 border-gold-500/30 flex items-center justify-center text-gold-500 text-3xl font-black mb-6">
              {user.username?.substring(0, 2).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{user.username}</h2>
            <p className="text-silver-400 text-sm mb-4">{user.email}</p>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 ${user.role === 'Admin' ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20' : user.role === 'WorkshopManager' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-silver-500/10 text-silver-400 border border-white/10'}`}>
              <Shield className="w-3 h-3" /> {user.role}
            </span>
            <div className="flex items-center justify-center gap-2 mb-6">
              {user.is_verified ? (
                <span className="flex items-center gap-1.5 text-xs text-green-400 font-bold"><CheckCircle className="w-3.5 h-3.5" /> {t('profile.verified')}</span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-red-400 font-bold"><XCircle className="w-3.5 h-3.5" /> {t('profile.not_verified')}</span>
              )}
            </div>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-all text-sm font-bold">
              <LogOut className="w-4 h-4" /> {t('profile.logout')}
            </button>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="glass-panel p-8 rounded-2xl border border-premium-border/50">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">{t('profile.personal_info')}</h3>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-2 text-gold-500 hover:text-gold-400 text-sm font-bold"><Edit className="w-4 h-4" /> {t('profile.edit')}</button>
                ) : (
                  <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-gold-500 text-premium-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gold-400 transition-colors disabled:opacity-50">
                    <Save className="w-4 h-4" /> {saving ? t('profile.saving') : t('profile.save')}
                  </button>
                )}
              </div>
              <div className="space-y-5">
                <div>
                  <label className="text-xs uppercase tracking-wider text-silver-500 font-bold mb-2 block flex items-center gap-2"><User className="w-3.5 h-3.5" /> {t('profile.username')}</label>
                  {editing ? <input className="luxury-input w-full py-3" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} /> : <p className="text-white font-medium py-3 border-b border-white/5">{user.username}</p>}
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-silver-500 font-bold mb-2 block flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {t('profile.email_label')}</label>
                  {editing ? <input type="email" className="luxury-input w-full py-3" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /> : <p className="text-white font-medium py-3 border-b border-white/5">{user.email}</p>}
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-silver-500 font-bold mb-2 block flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {t('profile.phone')}</label>
                  {editing ? <input type="tel" className="luxury-input w-full py-3" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /> : <p className="text-white font-medium py-3 border-b border-white/5">{user.phone || t('profile.not_provided')}</p>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {links.map((link) => (
                <Link key={link.label} to={link.href} className="glass-panel p-6 rounded-2xl border border-premium-border/50 hover:border-gold-500/30 transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500 group-hover:bg-gold-500 group-hover:text-premium-900 transition-all shrink-0">{link.icon}</div>
                    <div>
                      <h4 className="text-white font-bold text-sm mb-1">{link.label}</h4>
                      <p className="text-silver-500 text-xs">{link.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
