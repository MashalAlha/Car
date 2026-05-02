import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MessageSquare, Clock, Send, Trash2, CheckCircle, 
  User, Mail, Shield, Filter, Search, X, 
  CornerDownRight, AlertCircle
} from 'lucide-react';
import api from '../../utils/api';

export default function AdminMessages() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
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

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/interactions/messages/${selectedMessage.id}/reply/`, { admin_reply: replyText });
      setReplyText('');
      setSelectedMessage(null);
      fetchMessages();
    } catch (err) {
      alert(t('admin.messages.reply_failed') || "Failed to send reply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.messages.delete_confirm') || "Are you sure you want to delete this message?")) return;
    try {
      await api.delete(`/interactions/messages/${id}/`);
      fetchMessages();
    } catch (err) {
      alert(t('admin.messages.delete_failed') || "Delete failed");
    }
  };

  const filteredMessages = messages.filter(m => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  return (
    <div className="min-h-screen p-4 lg:p-8 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">
              {t('admin.messages.title') || 'Concierge Hub'}
            </h1>
            <p className="text-silver-500 text-xs font-bold uppercase tracking-[0.2em]">
              {t('admin.messages.subtitle') || 'MANAGE INCOMING REQUESTS AND COMMUNICATIONS'}
            </p>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-xl">
               {['all', 'open', 'replied'].map((s) => (
                 <button
                   key={s}
                   onClick={() => setFilter(s)}
                   className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                     filter === s ? 'bg-gold-500 text-premium-900 shadow-lg shadow-gold-500/20' : 'text-silver-400 hover:text-white'
                   }`}
                 >
                   {t(`messages.status_filters.${s}`) || s}
                 </button>
               ))}
             </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-4">
             <div className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
             <p className="text-silver-500 font-bold uppercase tracking-widest text-[10px]">{t('common.loading')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* List Sidebar */}
            <div className="lg:col-span-1 space-y-4">
               <div className="glass-panel rounded-[32px] border border-white/5 overflow-hidden">
                  <div className="p-6 border-b border-white/5 bg-white/5">
                     <p className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Filter className="w-3 h-3 text-gold-500" /> {t('admin.messages.incoming_list') || 'Message Feed'}
                     </p>
                  </div>
                  <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                     {filteredMessages.length === 0 ? (
                        <div className="p-20 text-center text-silver-500">
                           <AlertCircle className="w-10 h-10 mx-auto mb-4 opacity-20" />
                           <p className="text-[10px] font-black uppercase tracking-widest">{t('admin.messages.no_results') || 'No messages'}</p>
                        </div>
                     ) : filteredMessages.map((m) => (
                        <div 
                          key={m.id}
                          onClick={() => setSelectedMessage(m)}
                          className={`p-6 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5 ${
                            selectedMessage?.id === m.id ? 'bg-white/10 border-s-4 border-s-gold-500' : ''
                          }`}
                        >
                           <div className="flex justify-between items-start mb-2">
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                m.status === 'replied' ? 'bg-green-500/20 text-green-500' : 'bg-gold-500/10 text-gold-500'
                              }`}>
                               {t(`messages.status.${m.status}`) || m.status}
                              </span>
                              <span className="text-[9px] text-silver-500 font-bold">{m.created_at_fmt.split(' ')[0]}</span>
                           </div>
                           <h4 className="text-white font-bold text-sm mb-1 truncate">{m.subject}</h4>
                           <p className="text-silver-400 text-xs truncate italic">"{m.message}"</p>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Content View */}
            <div className="lg:col-span-2">
               {selectedMessage ? (
                  <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                     {/* Client Info Card */}
                     <div className="glass-panel p-8 rounded-[32px] border border-white/5">
                        <div className="flex items-start justify-between mb-8">
                           <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-gold-500 flex items-center justify-center text-premium-900 shadow-xl">
                                 <User className="w-7 h-7" />
                              </div>
                              <div>
                                 <h3 className="text-2xl font-black text-white italic truncate max-w-md">{selectedMessage.name}</h3>
                                 <p className="text-silver-500 text-xs font-bold flex items-center gap-2">
                                    <Mail className="w-3 h-3" /> {selectedMessage.email}
                                    {selectedMessage.username && <span className="ps-2 border-s border-white/10">@{selectedMessage.username}</span>}
                                 </p>
                              </div>
                           </div>
                           <button 
                             onClick={() => handleDelete(selectedMessage.id)}
                             className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>

                        <div className="space-y-6">
                           <div className="bg-white/5 p-8 rounded-[24px] border border-white/5 relative">
                              <div className="flex items-center gap-2 mb-4 text-gold-500">
                                 <MessageSquare className="w-4 h-4" />
                                 <span className="text-[10px] font-black uppercase tracking-widest">{t('admin.messages.client_inquiry') || 'INQUIRY'}</span>
                              </div>
                              <p className="text-white text-lg leading-relaxed">{selectedMessage.message}</p>
                           </div>

                           {selectedMessage.admin_reply ? (
                              <div className="ps-8 lg:ps-16 py-4">
                                 <div className="flex items-center gap-3 text-green-500 mb-4">
                                    <CornerDownRight className="w-5 h-5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest italic">{t('admin.messages.your_response') || 'SYSTEM RESPONSE'}</span>
                                 </div>
                                 <div className="bg-green-500/5 p-8 rounded-[24px] border border-green-500/10 italic text-silver-300">
                                    {selectedMessage.admin_reply}
                                 </div>
                              </div>
                           ) : (
                              <div className="ps-8 lg:ps-16 pt-6">
                                 <form onSubmit={handleReply} className="space-y-4">
                                    <div className="flex items-center gap-2 text-gold-500 mb-2">
                                       <CornerDownRight className="w-5 h-5" />
                                       <label className="text-[10px] font-black uppercase tracking-widest">{t('admin.messages.write_reply') || 'PROPOSE RESPONSE'}</label>
                                    </div>
                                    <textarea 
                                       required
                                       value={replyText}
                                       onChange={(e) => setReplyText(e.target.value)}
                                       className="luxury-input w-full p-8 rounded-[24px] text-white min-h-[160px] focus:border-gold-500/50"
                                       placeholder={t('admin.messages.reply_placeholder') || 'Express professional guidance...'}
                                    />
                                    <button 
                                      type="submit" 
                                      disabled={submitting}
                                      className="luxury-button w-full sm:w-auto px-10 py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3"
                                    >
                                       {submitting ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Send className="w-4 h-4" />}
                                       {t('admin.messages.send_reply') || 'Execute Response'}
                                    </button>
                                 </form>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="glass-panel h-full flex flex-col items-center justify-center p-20 rounded-[32px] border border-white/5 opacity-40">
                     <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                        <Search className="w-10 h-10 text-silver-500" />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-silver-500">{t('admin.messages.select_hint') || 'SELECT A CONVERSATION TO INTERACT'}</p>
                  </div>
               )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
