import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MessageSquare, Clock, Send, CheckCircle, 
  AlertCircle, Shield, ArrowRight, Trash2, 
  ChevronRight, Search, Mail
} from 'lucide-react';
import api from '../../utils/api';

export default function MyMessages() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/interactions/messages/');
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(m => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  return (
    <div className="min-h-screen p-4 lg:p-8 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">
              {t('messages.user_title') || 'Concierge Messages'}
            </h1>
            <p className="text-silver-500 text-xs font-bold uppercase tracking-[0.2em]">
              {t('messages.user_subtitle') || 'TRACK YOUR CONVERSATIONS WITH OUR TEAM'}
            </p>
          </div>

          <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-xl">
            {['all', 'open', 'replied'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === s ? 'bg-gold-500 text-premium-900' : 'text-silver-400 hover:text-white'
                }`}
              >
                {t(`messages.status_filters.${s}`) || s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
             <div className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
             <p className="text-silver-500 font-bold uppercase tracking-widest text-[10px]">{t('common.loading')}</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="glass-panel p-20 rounded-[32px] border border-white/5 text-center">
            <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-gold-500/50" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t('messages.no_messages_title') || 'No Messages Found'}</h3>
            <p className="text-silver-400 text-sm max-w-sm mx-auto mb-8">
              {t('messages.no_messages_desc') || 'Your communication history with our concierge will appear here. Start by sending us a message!'}
            </p>
            <button 
              onClick={() => window.location.href = '/#contact'}
              className="luxury-button px-8 py-3 text-[10px] font-black uppercase tracking-widest"
            >
              {t('messages.send_first') || 'Send a Message'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredMessages.map((msg) => (
              <div key={msg.id} className="glass-panel p-8 rounded-[32px] border border-white/5 hover:border-gold-500/30 transition-all group">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Message Content */}
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gold-500 border border-white/10">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-silver-500 font-black uppercase tracking-widest mb-1">{msg.subject}</p>
                          <h3 className="text-white font-bold">{msg.created_at_fmt}</h3>
                        </div>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        msg.status === 'replied' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-gold-500/10 text-gold-500 border-gold-500/20'
                      }`}>
                        {t(`messages.status.${msg.status}`) || msg.status}
                      </span>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-silver-300 text-sm leading-relaxed italic">"{msg.message}"</p>
                    </div>

                    {msg.admin_reply && (
                      <div className="relative mt-8 group-hover:translate-x-2 transition-transform">
                        <div className="absolute top-0 bottom-0 start-0 w-1 bg-gold-500 rounded-full"></div>
                        <div className="ps-8 lg:ps-12">
                          <div className="flex items-center gap-2 mb-3 text-gold-500">
                             <Shield className="w-4 h-4" />
                             <span className="text-[10px] font-black uppercase tracking-widest italic">{t('messages.admin_response') || 'CONCIERGE RESPONSE'}</span>
                          </div>
                          <p className="text-white text-base font-medium leading-relaxed">
                            {msg.admin_reply}
                          </p>
                          <p className="text-[10px] text-silver-500 font-bold uppercase tracking-widest mt-4">
                            {t('messages.replied_on') || 'REPLIED ON'} {msg.updated_at.split('T')[0]}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
