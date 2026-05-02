import React, { useState } from 'react';
import { LifeBuoy, FileText, Send, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';

export default function SupportCenter() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/interactions/messages/', formData);
      setSubmitted(true);
      setFormData({ subject: '', message: '' });
    } catch (err) {
      console.error("Failed to send message:", err);
      alert(t('contact.error_msg') || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-premium-900 pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12 animate-fade-in px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-500/10 mb-6 border border-gold-500/20">
            <LifeBuoy className="w-8 h-8 text-gold-500" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 uppercase tracking-tighter">
            {t('profile.link_support')}
          </h1>
          <p className="text-silver-400 text-sm md:text-lg max-w-2xl mx-auto">
            {t('profile.link_support_desc')}
          </p>
        </div>

        <div className="glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden border-t-2 border-t-gold-500">
          
          {submitted ? (
            <div className="text-center py-16 animate-fade-in px-4">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{t('contact.form_success_title', { defaultValue: 'Ticket Submitted' })}</h2>
              <p className="text-silver-300 text-sm max-w-md mx-auto mb-8">
                {t('contact.form_success_desc', { defaultValue: 'Your request has been routed to our support team. We will notify you when a concierge responds.' })}
              </p>
              <button onClick={() => setSubmitted(false)} className="text-gold-400 font-semibold hover:text-white transition-colors border-b border-gold-400 hover:border-white pb-1 text-sm">
                {t('contact.submit_another', { defaultValue: 'Submit Another Query' })}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up relative z-10">
              
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-silver-500 mb-2 font-black flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> {t('contact.subject')}
                </label>
                <input 
                  type="text" 
                  required
                  placeholder={t('contact.subject_placeholder', { defaultValue: 'E.g., Query regarding recent Work Order #WO-101' })}
                  className="luxury-input w-full py-3"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-silver-500 mb-2 font-black flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> {t('contact.message')}
                </label>
                <textarea 
                  required
                  rows={6}
                  placeholder={t('contact.message_placeholder', { defaultValue: 'Please provide as much detail as possible so we can assist you rapidly...' })}
                  className="luxury-input w-full py-3 resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
                <p className="text-[10px] text-silver-600 uppercase tracking-widest font-bold">
                  {t('contact.response_time', { defaultValue: 'Typical response time' })}: <span className="text-gold-500">Under 1 hour</span>
                </p>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="luxury-button w-full sm:w-auto px-10 py-4 flex items-center justify-center gap-2 text-xs uppercase font-black tracking-widest disabled:opacity-50"
                >
                  {loading ? t('contact.sending', { defaultValue: 'Sending...' }) : t('contact.send')} <Send className="w-4 h-4" />
                </button>
              </div>

            </form>
          )}

          {/* Decorative background element */}
          <div className="absolute -bottom-24 -right-24 text-white/[0.02] transform -rotate-12 pointer-events-none z-0">
             <LifeBuoy className="w-96 h-96" />
          </div>
        </div>

      </div>
    </div>
  );
}
