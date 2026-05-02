import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Shield, Edit, Save, ShieldAlert, CheckCircle, XCircle, Key, Clock } from 'lucide-react';

import api from '../../utils/api';

export default function AdminProfile() {
  const { t } = useTranslation();
  const [admin, setAdmin] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('admin_data');
    if (stored) {
      const parsed = JSON.parse(stored);
      setAdmin(parsed);
      setFormData({ username: parsed.username, email: parsed.email, phone: parsed.phone || '' });
    }
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const res = await api.get('/users/profile/', { useAdminToken: true });
      const data = res.data;
      setAdmin(data);
      setFormData({ username: data.username, email: data.email, phone: data.phone || '' });
      localStorage.setItem('admin_data', JSON.stringify(data));
    } catch (err) {
      console.error("Failed to fetch admin profile", err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await api.put('/users/profile/', formData, { useAdminToken: true });
      const data = res.data;
      setAdmin(data);
      localStorage.setItem('admin_data', JSON.stringify(data));
      setEditing(false);
      setMessage('success');
    } catch (e) {
      console.error("Failed to save profile", e);
      setMessage('error');
    } finally {
      setSaving(false);
    }
  };

  if (!admin) return null;

  const roleConfig = {
    Admin: {
      icon: <ShieldAlert className="w-5 h-5" />,
      color: 'gold',
      label: t('admin.profile.role_admin'),
    },
    WorkshopManager: {
      icon: <Shield className="w-5 h-5" />,
      color: 'blue',
      label: t('admin.profile.role_manager'),
    },
  };

  const role = roleConfig[admin.role] || roleConfig.Admin;

  return (
    <div className="min-h-screen font-sans p-4 lg:p-8 text-white">
      <div className="mb-10">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <User className="text-gold-500 w-8 h-8" /> {t('admin.profile.title')}
        </h1>
        <p className="text-silver-400 mt-1">{t('admin.profile.subtitle')}</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 text-sm animate-fade-in ${
          message === 'success'
            ? 'bg-green-900/20 border border-green-500/30 text-green-400'
            : 'bg-red-900/20 border border-red-500/30 text-red-400'
        }`}>
          {message === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {message === 'success' ? t('admin.profile.updated') : t('admin.profile.update_failed')}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Panel — Identity Card */}
        <div className="glass-panel p-8 rounded-2xl border border-premium-border/50 text-center">
          <div className={`w-24 h-24 mx-auto rounded-full bg-${role.color}-500/10 border-2 border-${role.color}-500/30 flex items-center justify-center text-${role.color}-500 text-3xl font-black mb-6`}>
            {admin.username?.substring(0, 2).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{admin.username}</h2>
          <p className="text-silver-400 text-sm mb-4">{admin.email}</p>

          {/* Role Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-4 bg-${role.color}-500/10 text-${role.color}-400 border border-${role.color}-500/20`}>
            {role.icon}
            {role.label}
          </div>

          {/* Verification */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {admin.is_verified ? (
              <span className="flex items-center gap-1.5 text-xs text-green-400 font-bold">
                <CheckCircle className="w-3.5 h-3.5" /> {t('admin.profile.verified')}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-red-400 font-bold">
                <XCircle className="w-3.5 h-3.5" /> {t('admin.profile.not_verified')}
              </span>
            )}
          </div>

          {/* Security Info */}
          <div className="bg-premium-900/50 rounded-xl p-4 border border-white/5 space-y-3 text-left">
            <div className="flex items-center gap-3">
              <Key className="w-4 h-4 text-gold-500" />
              <div>
                <p className="text-[10px] text-silver-500 uppercase tracking-widest font-bold">{t('admin.profile.user_id')}</p>
                <p className="text-sm text-white font-mono">{admin.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gold-500" />
              <div>
                <p className="text-[10px] text-silver-500 uppercase tracking-widest font-bold">{t('admin.profile.session_status')}</p>
                <p className="text-sm text-green-400 font-bold">{t('admin.profile.active')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel — Editable Info */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-8 rounded-2xl border border-premium-border/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">{t('admin.profile.personal_info')}</h3>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="flex items-center gap-2 text-gold-500 hover:text-gold-400 text-sm font-bold transition-colors">
                  <Edit className="w-4 h-4" /> {t('admin.profile.edit')}
                </button>
              ) : (
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-gold-500 text-premium-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gold-400 transition-colors disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? t('admin.profile.saving') : t('admin.profile.save')}
                </button>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs uppercase tracking-wider text-silver-500 font-bold mb-2 block flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> {t('admin.profile.username')}
                </label>
                {editing ? (
                  <input className="luxury-input w-full py-3" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                ) : (
                  <p className="text-white font-medium py-3 border-b border-white/5">{admin.username}</p>
                )}
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-silver-500 font-bold mb-2 block flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> {t('admin.profile.email')}
                </label>
                {editing ? (
                  <input type="email" className="luxury-input w-full py-3" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                ) : (
                  <p className="text-white font-medium py-3 border-b border-white/5">{admin.email}</p>
                )}
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-silver-500 font-bold mb-2 block flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> {t('admin.profile.phone')}
                </label>
                {editing ? (
                  <input type="tel" className="luxury-input w-full py-3" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                ) : (
                  <p className="text-white font-medium py-3 border-b border-white/5">{admin.phone || t('admin.profile.not_provided')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
