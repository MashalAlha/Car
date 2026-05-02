import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Settings, Save, Shield, Globe, Monitor, 
  Mail, Lock, Bell, CheckCircle, XCircle, 
  Smartphone, Database, Clock, Palette
} from 'lucide-react';
import api from '../../utils/api';

export default function AdminSettings() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [settings, setSettings] = useState({
    site_name: 'Exotic Motors',
    contact_email: 'concierge@exoticmotors.com',
    maintenance_mode: false,
    dark_mode: true,
    accent_color: '#D4AF37',
    glassmorphism: true,
    animations: true,
    two_factor: false,
    session_timeout: 60,
    ip_whitelist: '',
    audit_logs_retention: 90,
    default_lang: 'en',
    timezone: 'UTC+3',
    currency: 'USD',
    date_format: 'DD/MM/YYYY'
  });

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      // In a real app, we would send this to the backend
      // await api.put('/admin/settings/', settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMessage('success');
      
      // Auto clear message
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error("Failed to save settings", err);
      setMessage('error');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: t('admin.settings.sections.general'), icon: <Monitor className="w-4 h-4" /> },
    { id: 'appearance', label: t('admin.settings.sections.appearance'), icon: <Palette className="w-4 h-4" /> },
    { id: 'security', label: t('admin.settings.sections.security'), icon: <Shield className="w-4 h-4" /> },
    { id: 'localization', label: t('admin.settings.sections.localization'), icon: <Globe className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen font-sans p-4 lg:p-8 text-white max-w-6xl mx-auto">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="text-gold-500 w-8 h-8" /> {t('admin.settings.title')}
          </h1>
          <p className="text-silver-400 mt-1">{t('admin.settings.subtitle')}</p>
        </div>
        
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center gap-2 bg-gold-500 text-premium-900 px-6 py-3 rounded-xl text-sm font-bold hover:bg-gold-400 transition-all shadow-[0_4px_20px_rgba(212,175,55,0.2)] disabled:opacity-50"
        >
          {saving ? <Database className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? t('admin.settings.saving') : t('admin.profile.save')}
        </button>
      </div>

      {message && (
        <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 text-sm animate-fade-in ${
          message === 'success'
            ? 'bg-green-900/20 border border-green-500/30 text-green-400'
            : 'bg-red-900/20 border border-red-500/30 text-red-400'
        }`}>
          {message === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {message === 'success' ? t('admin.settings.save_success') : t('admin.settings.save_failed')}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 shrink-0 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-premium-900/80 text-gold-500 border border-gold-500/20 shadow-lg' 
                  : 'text-silver-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="glass-panel p-8 rounded-2xl border border-premium-border/50 min-h-[500px]">
            {activeTab === 'general' && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-silver-500 font-bold block ml-1">
                      {t('admin.settings.general.site_name')}
                    </label>
                    <div className="relative">
                      <Monitor className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-600" />
                      <input 
                        className="luxury-input w-full pl-12 py-3.5 bg-premium-900/30" 
                        value={settings.site_name} 
                        onChange={(e) => setSettings({...settings, site_name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-silver-500 font-bold block ml-1">
                      {t('admin.settings.general.contact_email')}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-600" />
                      <input 
                        type="email"
                        className="luxury-input w-full pl-12 py-3.5 bg-premium-900/30" 
                        value={settings.contact_email} 
                        onChange={(e) => setSettings({...settings, contact_email: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-premium-900/50 border border-white/5">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{t('admin.settings.general.maintenance_mode')}</h4>
                        <p className="text-xs text-silver-500 mt-0.5">{t('admin.settings.general.maintenance_desc')}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSettings({...settings, maintenance_mode: !settings.maintenance_mode})}
                      className={`w-12 h-6 rounded-full transition-all relative ${settings.maintenance_mode ? 'bg-gold-500' : 'bg-silver-800'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.maintenance_mode ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'dark_mode', label: t('admin.settings.appearance.dark_mode') },
                    { key: 'glassmorphism', label: t('admin.settings.appearance.glassmorphism') },
                    { key: 'animations', label: t('admin.settings.appearance.animations') }
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-premium-900/50 border border-white/5">
                      <span className="text-sm font-bold text-silver-300">{item.label}</span>
                      <button 
                        onClick={() => setSettings({...settings, [item.key]: !settings[item.key]})}
                        className={`w-10 h-5 rounded-full transition-all relative ${settings[item.key] ? 'bg-gold-500' : 'bg-silver-800'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${settings[item.key] ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-4">
                  <label className="text-[10px] uppercase tracking-widest text-silver-500 font-bold block ml-1">
                    {t('admin.settings.appearance.accent_color')}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {['#D4AF37', '#3B82F6', '#EF4444', '#10B981', '#8B5CF6'].map(color => (
                      <button 
                        key={color}
                        onClick={() => setSettings({...settings, accent_color: color})}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${settings.accent_color === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex items-center justify-between p-4 rounded-xl bg-premium-900/50 border border-white/5">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{t('admin.settings.security.two_factor')}</h4>
                      <p className="text-xs text-silver-500 mt-0.5">Protect executive accounts with an extra layer of security.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSettings({...settings, two_factor: !settings.two_factor})}
                    className={`w-12 h-6 rounded-full transition-all relative ${settings.two_factor ? 'bg-gold-500' : 'bg-silver-800'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.two_factor ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-silver-500 font-bold block ml-1">
                      {t('admin.settings.security.session_timeout')}
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-600" />
                      <input 
                        type="number"
                        className="luxury-input w-full pl-12 py-3.5 bg-premium-900/30" 
                        value={settings.session_timeout} 
                        onChange={(e) => setSettings({...settings, session_timeout: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-silver-500 font-bold block ml-1">
                      {t('admin.settings.security.logs')}
                    </label>
                    <div className="relative">
                      <Database className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-600" />
                      <input 
                        type="number"
                        className="luxury-input w-full pl-12 py-3.5 bg-premium-900/30" 
                        value={settings.audit_logs_retention} 
                        onChange={(e) => setSettings({...settings, audit_logs_retention: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'localization' && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-silver-500 font-bold block ml-1">
                      {t('admin.settings.localization.default_lang')}
                    </label>
                    <select 
                      className="luxury-input w-full py-3.5 bg-premium-900/30 appearance-none"
                      value={settings.default_lang}
                      onChange={(e) => setSettings({...settings, default_lang: e.target.value})}
                    >
                      <option value="en" className="bg-premium-900">English (Global)</option>
                      <option value="ar" className="bg-premium-900">العربية (Regional)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-silver-500 font-bold block ml-1">
                      {t('admin.settings.localization.timezone')}
                    </label>
                    <select 
                      className="luxury-input w-full py-3.5 bg-premium-900/30 appearance-none"
                      value={settings.timezone}
                      onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                    >
                      <option value="UTC" className="bg-premium-900">UTC +00:00</option>
                      <option value="UTC+3" className="bg-premium-900">UTC +03:00 (Riyadh)</option>
                      <option value="UTC-5" className="bg-premium-900">UTC -05:00 (New York)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-silver-500 font-bold block ml-1">
                      {t('admin.settings.localization.currency')}
                    </label>
                    <select 
                      className="luxury-input w-full py-3.5 bg-premium-900/30 appearance-none"
                      value={settings.currency}
                      onChange={(e) => setSettings({...settings, currency: e.target.value})}
                    >
                      <option value="USD" className="bg-premium-900">USD ($)</option>
                      <option value="SAR" className="bg-premium-900">SAR (ر.س)</option>
                      <option value="EUR" className="bg-premium-900">EUR (€)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-silver-500 font-bold block ml-1">
                      {t('admin.settings.localization.date_format')}
                    </label>
                    <select 
                      className="luxury-input w-full py-3.5 bg-premium-900/30 appearance-none"
                      value={settings.date_format}
                      onChange={(e) => setSettings({...settings, date_format: e.target.value})}
                    >
                      <option value="DD/MM/YYYY" className="bg-premium-900">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY" className="bg-premium-900">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD" className="bg-premium-900">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
