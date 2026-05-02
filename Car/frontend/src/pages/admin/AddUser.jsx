import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, User, Mail, Shield, ShieldAlert, CheckCircle, Smartphone, Key } from 'lucide-react';
import api from '../../utils/api';

export default function AddUser() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    role: 'Customer',
    is_verified: false,
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/users/admin-users/', formData, { useAdminToken: true });
      alert(t('admin.client_relations.success_create'));
      navigate('/admin/users');
    } catch (err) {
      console.error("Creation failed", err);
      alert(err.response?.data?.detail || "Account provisioning failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-10 text-white font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="flex items-center gap-6 mb-12">
           <button 
             onClick={() => navigate('/admin/users')}
             className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-silver-400 hover:text-white hover:bg-white/10 transition-all shadow-lg"
           >
             <ArrowLeft className={`w-6 h-6 ${isAr ? 'rotate-180' : ''}`} />
           </button>
           <div>
              <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-1">
                {t('admin.client_relations.add_user')}
              </h1>
              <p className="text-silver-500 text-xs font-black uppercase tracking-[0.2em]">{t('admin.client_relations.provisioning')}</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           
           {/* Form Section */}
           <div className="lg:col-span-2 space-y-8">
              <form onSubmit={handleSubmit} className="glass-panel p-10 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
                    <Plus className="w-64 h-64 text-gold-500" />
                 </div>

                 <div className="space-y-10 relative">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-silver-500 uppercase tracking-widest flex items-center gap-2">
                             <User className="w-3 h-3 text-gold-500" /> {t('admin.client_relations.username')}
                          </label>
                          <input 
                            required
                            className="luxury-input w-full py-4 px-6 text-base"
                            value={formData.username}
                            onChange={e => setFormData({...formData, username: e.target.value})}
                            placeholder="e.g. Alish_X"
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-silver-500 uppercase tracking-widest flex items-center gap-2">
                             <Mail className="w-3 h-3 text-gold-500" /> {t('admin.client_relations.email')}
                          </label>
                          <input 
                            required
                            type="email"
                            className="luxury-input w-full py-4 px-6 text-base"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            placeholder="client@exoticmotors.com"
                          />
                       </div>
                    </div>

                    {/* Contact & Role */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-silver-500 uppercase tracking-widest flex items-center gap-2">
                             <Smartphone className="w-3 h-3 text-gold-500" /> {t('admin.client_relations.phone')}
                          </label>
                          <input 
                            className="luxury-input w-full py-4 px-6 text-base font-mono"
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                            placeholder="+966 5X XXX XXXX"
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-silver-500 uppercase tracking-widest flex items-center gap-2">
                             <Shield className="w-3 h-3 text-gold-500" /> {t('admin.client_relations.role')}
                          </label>
                          <select 
                            required
                            className="luxury-input w-full py-4 px-6 text-base cursor-pointer appearance-none"
                            value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value})}
                          >
                             <option value="Customer">{t('admin.common.roles.Customer')}</option>
                             <option value="WorkshopManager">{t('admin.common.roles.WorkshopManager')}</option>
                             <option value="Admin">{t('admin.common.roles.Admin')}</option>
                          </select>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-silver-500 uppercase tracking-widest flex items-center gap-2">
                          <Key className="w-3 h-3 text-gold-500" /> {t('admin.client_relations.password')}
                       </label>
                       <input 
                         required
                         type="password"
                         className="luxury-input w-full py-4 px-6 text-base"
                         value={formData.password}
                         onChange={e => setFormData({...formData, password: e.target.value})}
                         placeholder="••••••••••••"
                       />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6">
                       <button 
                         type="button" 
                         onClick={() => navigate('/admin/users')}
                         className="flex-1 py-4 rounded-2xl bg-white/5 text-silver-500 font-black tracking-widest text-[10px] uppercase hover:text-white transition-all border border-white/5"
                       >
                         {t('admin.common.cancel')}
                       </button>
                       <button 
                         type="submit" 
                         disabled={submitting}
                         className="flex-1 luxury-button py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-gold-500/20"
                       >
                         {submitting ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                         ) : (
                            <Plus className="w-4 h-4" />
                         )}
                         {t('admin.client_relations.add_user')}
                       </button>
                    </div>
                 </div>
              </form>
           </div>

           {/* Sidebar Detail */}
           <div className="space-y-8">
              <div className="glass-panel p-8 rounded-[32px] border border-white/5 shadow-xl">
                 <h4 className="text-[10px] font-black text-silver-500 uppercase tracking-widest mb-6">{t('admin.client_relations.verification_status')}</h4>
                 <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 mb-6">
                    <div>
                       <p className="text-white font-bold text-sm mb-1">{formData.is_verified ? t('admin.client_relations.verified') : t('admin.client_relations.unverified')}</p>
                       <p className="text-[9px] text-silver-500 uppercase font-black tracking-tighter">{t('admin.client_relations.manual_override')}</p>
                    </div>
                    <div 
                      onClick={() => setFormData({...formData, is_verified: !formData.is_verified})}
                      className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-all duration-500 ease-in-out shadow-inner ${formData.is_verified ? 'bg-green-500 shadow-green-900/50' : 'bg-premium-900 shadow-black'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-2xl transform transition-transform duration-500 ${formData.is_verified ? (isAr ? '-translate-x-7' : 'translate-x-7') : 'translate-x-0'}`} />
                    </div>
                 </div>
                 
                 <div className="p-4 rounded-xl bg-gold-500/5 border border-gold-500/10 text-[10px] text-gold-500/70 leading-relaxed italic">
                    {formData.is_verified 
                      ? t('admin.client_relations.verified_desc')
                      : t('admin.client_relations.unverified_desc')
                    }
                 </div>
              </div>

              <div className="glass-panel p-8 rounded-[32px] border border-white/5 shadow-xl">
                 <h4 className="text-[10px] font-black text-silver-500 uppercase tracking-widest mb-4">{t('admin.client_relations.account_policy')}</h4>
                 <div className="space-y-4">
                    <div className="flex items-start gap-3">
                       <CheckCircle className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                       <p className="text-[11px] text-silver-400 font-medium">{t('admin.client_relations.password_policy')}</p>
                    </div>
                    <div className="flex items-start gap-3">
                       <ShieldAlert className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                       <p className="text-[11px] text-silver-400 font-medium">{t('admin.client_relations.role_policy')}</p>
                    </div>
                 </div>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}
