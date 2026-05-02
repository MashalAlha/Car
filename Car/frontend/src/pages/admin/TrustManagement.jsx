import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Check, X, ExternalLink, User, CreditCard, Calendar, MessageSquare, Mail, Phone, CheckCircle, AlertTriangle } from 'lucide-react';

import api from '../../utils/api';

export default function TrustManagement() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [currentReason, setCurrentReason] = useState({});

  const fetchRequests = async () => {
    try {
      const res = await api.get('/users/trust-requests/', { useAdminToken: true });
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch trust requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, status) => {
    if (status === 'Approved' && !window.confirm(t('admin_trust.confirm_approve'))) return;
    if (status === 'Rejected' && !window.confirm(t('admin_trust.confirm_reject'))) return;

    setMessage(null);
    try {
      const payload = { status };
      if (status === 'Rejected') {
        payload.rejection_reason = currentReason[id] || 'Information does not match records.';
      }

      await api.patch(`/users/trust-requests/${id}/`, payload, { useAdminToken: true });

      setMessage({ type: 'success', text: status === 'Approved' ? t('trust.status_approved') : t('trust.status_rejected') });
      fetchRequests();
      const newReasons = { ...currentReason };
      delete newReasons[id];
      setCurrentReason(newReasons);
    } catch (err) {
      console.error("Trust action failed", err);
      setMessage({ type: 'error', text: t('trust.error_submit') });
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'Processing');
  const otherRequests = requests.filter(r => r.status !== 'Processing');

  return (
    <div className="min-h-screen p-4 lg:p-8 text-white">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="text-gold-500 w-8 h-8" /> {t('admin_trust.title')}
          </h1>
          <p className="text-silver-400 mt-1">{t('admin_trust.subtitle')}</p>
        </div>
      </div>

      {message && (
        <div className={`mb-8 p-4 rounded-xl border flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-green-900/20 border-green-500/30 text-green-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span className="font-medium text-sm">{message.text}</span>
        </div>
      )}

      <div className="space-y-12">
        {/* Pending Requests */}
        <div>
          <h2 className="text-gold-500 uppercase tracking-widest text-xs font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse"></span>
            {t('trust.status_processing')} ({pendingRequests.length})
          </h2>
          
          <div className="grid grid-cols-1 gap-6">
            {pendingRequests.map((request) => (
              <div key={request.id} className="glass-panel p-8 rounded-2xl border border-gold-500/20 bg-gold-500/[0.02]">
                <div className="flex flex-col lg:flex-row gap-10">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                      <div className="w-12 h-12 rounded-full bg-premium-900 border border-gold-500/30 flex items-center justify-center text-gold-500 text-xl font-bold">
                        {request.user_details?.username?.[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg">{request.user_details?.username}</h3>
                            <p className="text-[10px] text-silver-500 uppercase tracking-widest">{t('admin_trust.user')} ID: #{request.user}</p>
                          </div>
                          <div className="text-right space-y-1">
                             <p className="text-xs text-silver-400 flex items-center justify-end gap-1.5"><Mail className="w-3.5 h-3.5" /> {request.user_details?.email}</p>
                             <p className="text-xs text-silver-400 flex items-center justify-end gap-1.5"><Phone className="w-3.5 h-3.5" /> {request.user_details?.phone || t('admin_trust.no_phone')}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-silver-500 font-bold flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> {t('trust.license_number')}</label>
                        <p className="font-mono text-white text-lg">{request.license_number}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-silver-500 font-bold flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {t('trust.license_expiry')}</label>
                        <p className="font-mono text-white text-lg">{request.expiry_date}</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4">
                       <label className="text-[10px] uppercase tracking-widest text-silver-500 font-bold flex items-center gap-1.5"><MessageSquare className="w-3 h-3" /> {t('admin_trust.reject')}</label>
                       <textarea 
                         className="luxury-input w-full py-3 text-sm h-20 resize-none"
                         placeholder={t('admin_trust.reason_placeholder')}
                         value={currentReason[request.id] || ''}
                         onChange={(e) => setCurrentReason({...currentReason, [request.id]: e.target.value})}
                       />
                    </div>
                  </div>

                  <div className="lg:w-80 space-y-4">
                    <a 
                      href={request.license_photo} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group relative block w-full aspect-video rounded-xl overflow-hidden border border-white/10 hover:border-gold-500/50 transition-all"
                    >
                      <img src={request.license_photo} alt="License" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-bold gap-2">
                        <ExternalLink className="w-4 h-4" /> View Full Image
                      </div>
                    </a>

                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => handleAction(request.id, 'Approved')}
                        className="flex items-center justify-center gap-2 py-4 bg-green-500 text-white rounded-xl font-bold hover:bg-green-400 transition-all"
                      >
                        <Check className="w-5 h-5" /> {t('admin_trust.approve')}
                      </button>
                      <button 
                        onClick={() => handleAction(request.id, 'Rejected')}
                        className="flex items-center justify-center gap-2 py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-400 transition-all"
                      >
                        <X className="w-5 h-5" /> {t('admin_trust.reject')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {pendingRequests.length === 0 && (
              <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/5 text-silver-500 italic">
                No pending requests.
              </div>
            )}
          </div>
        </div>

        {/* History */}
        <div>
           <h3 className="text-silver-500 uppercase tracking-widest text-xs font-bold mb-6">{t('trust.history')}</h3>
           <div className="bg-premium-800/30 rounded-2xl border border-premium-border/50 overflow-x-auto">
             <table className="w-full text-left border-collapse rtl:text-right">
               <thead>
                 <tr className="bg-premium-900/50 text-silver-500 text-xs uppercase tracking-wider">
                   <th className="p-4 ps-6">{t('admin_trust.user')}</th>
                   <th className="p-4">{t('admin_trust.license')}</th>
                   <th className="p-4">{t('admin.inventory.col_status')}</th>
                   <th className="p-4 pe-6 text-end">{t('trust.history')}</th>
                 </tr>
               </thead>
                <tbody className="divide-y divide-premium-border/30 text-sm">
                  {otherRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-premium-800/20 transition-colors">
                      <td className="p-4 ps-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-premium-900 border border-white/10 flex items-center justify-center text-silver-400 text-xs font-bold">{request.user_details?.username?.[0].toUpperCase()}</div>
                          <span className="font-bold">{request.user_details?.username}</span>
                        </div>
                      </td>
                     <td className="p-4">
                       <div className="font-mono text-xs text-silver-400">
                         <p>{request.license_number}</p>
                         <p>Exp: {request.expiry_date}</p>
                       </div>
                     </td>
                     <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${request.status === 'Approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                          {t(`trust.status_${request.status.toLowerCase()}`)}
                        </span>
                     </td>
                     <td className="p-4 pe-6 text-end">
                       <span className="text-xs text-silver-500">{new Date(request.created_at).toLocaleDateString()}</span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
}
