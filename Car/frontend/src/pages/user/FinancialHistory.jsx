import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Calendar, 
  ArrowLeft, 
  Download, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Receipt
} from 'lucide-react';
import api from '../../utils/api';

export default function FinancialHistory() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const isAr = i18n.language === 'ar';

  useEffect(() => {
    fetchFinancialRecord();
  }, []);

  const fetchFinancialRecord = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/financial-record/');
      setTransactions(res.data);
    } catch (err) {
      console.error("Failed to fetch financial record", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const s = status.toLowerCase();
    if (s.includes('paid') || s.includes('delivered') || s.includes('approved') || s.includes('completed')) return 'text-green-400 bg-green-400/10 border-green-400/20';
    if (s.includes('pending') || s.includes('waiting') || s.includes('progress')) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    if (s.includes('rejected') || s.includes('cancelled')) return 'text-red-400 bg-red-400/10 border-red-400/20';
    return 'text-silver-400 bg-white/5 border-white/10';
  };

  const getStatusIcon = (status) => {
    const s = status.toLowerCase();
    if (s.includes('paid') || s.includes('delivered') || s.includes('approved') || s.includes('completed')) return <CheckCircle className="w-3.5 h-3.5" />;
    if (s.includes('pending') || s.includes('waiting') || s.includes('progress')) return <Clock className="w-3.5 h-3.5" />;
    if (s.includes('rejected') || s.includes('cancelled')) return <XCircle className="w-3.5 h-3.5" />;
    return null;
  };

  return (
    <div className="min-h-screen py-10">
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            .glass-panel { 
              background: white !important; 
              color: black !important; 
              border: 1px solid #eee !important;
              box-shadow: none !important;
            }
            .text-white { color: black !important; }
            .text-silver-500, .text-silver-400 { color: #666 !important; }
            .text-gold-500 { color: #8a6d3b !important; }
            body { background: white !important; color: black !important; }
            table { border: 1px solid #eee !important; }
            th { background: #f9f9f9 !important; color: black !important; }
            tr { border-bottom: 1px solid #eee !important; }
          }
        `}
      </style>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-silver-400 hover:text-white hover:bg-white/10 transition-all no-print"
            >
              <ArrowLeft className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-1">{t('finances.title')}</h1>
              <p className="text-silver-500 text-sm font-medium">{t('finances.subtitle')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 no-print">
             <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
             >
               <Download className="w-4 h-4" /> {t('finances.export_pdf')}
             </button>
          </div>
        </div>

        {/* Unified Record Card */}
        <div className="glass-panel rounded-[32px] border border-white/5 overflow-hidden shadow-2xl relative">
           <div className="absolute top-0 right-0 p-8 opacity-5">
             <Receipt className="w-32 h-32 text-gold-500" />
           </div>

           {loading ? (
             <div className="py-20 flex flex-col items-center justify-center">
               <div className="w-10 h-10 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin mb-4" />
               <p className="text-silver-500 text-xs font-black uppercase tracking-widest animate-pulse">{t('common.loading')}</p>
             </div>
           ) : transactions.length === 0 ? (
             <div className="py-24 text-center">
               <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                 <CreditCard className="w-8 h-8 text-silver-700" />
               </div>
               <p className="text-silver-400 font-bold mb-2">{t('finances.no_records')}</p>
               <button onClick={() => navigate('/profile')} className="text-gold-500 text-sm font-black uppercase tracking-widest hover:underline">{t('finances.back_to_profile')}</button>
             </div>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-white/2">
                     <th className={`px-6 py-5 text-[10px] font-black text-silver-500 uppercase tracking-[0.2em] ${isAr ? 'text-right' : 'text-left'}`}>
                       {t('finances.col_date')}
                     </th>
                     <th className={`px-6 py-5 text-[10px] font-black text-silver-500 uppercase tracking-[0.2em] ${isAr ? 'text-right' : 'text-left'}`}>
                       {t('finances.col_type')}
                     </th>
                     <th className={`px-6 py-5 text-[10px] font-black text-silver-500 uppercase tracking-[0.2em] ${isAr ? 'text-right' : 'text-left'}`}>
                       {t('finances.col_description')}
                     </th>
                     <th className={`px-6 py-5 text-[10px] font-black text-silver-500 uppercase tracking-[0.2em] ${isAr ? 'text-right' : 'text-left'}`}>
                       {t('finances.col_amount')}
                     </th>
                     <th className={`px-6 py-5 text-[10px] font-black text-silver-500 uppercase tracking-[0.2em] ${isAr ? 'text-right' : 'text-left'}`}>
                       {t('finances.col_status')}
                     </th>
                     <th className="px-6 py-5"></th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {transactions.map((tx, idx) => (
                     <tr key={tx.id} className="hover:bg-white/[0.03] transition-colors group">
                       <td className="px-6 py-6">
                         <div className="flex flex-col">
                           <span className="text-white font-mono text-xs">{new Date(tx.date).toLocaleDateString(i18n.language, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                           <span className="text-[9px] text-silver-600 font-bold">{new Date(tx.date).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}</span>
                         </div>
                       </td>
                       <td className="px-6 py-6">
                         <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-gold-500 shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
                            <span className="text-gold-500 text-[10px] font-black uppercase tracking-tighter">{isAr ? tx.type_ar : tx.type}</span>
                         </div>
                       </td>
                       <td className="px-6 py-6">
                         <div className="max-w-[200px] md:max-w-xs">
                           <p className="text-white text-xs font-bold truncate">{tx.description}</p>
                           <p className="text-[9px] text-silver-600 font-mono tracking-tighter">{tx.id}</p>
                         </div>
                       </td>
                       <td className="px-6 py-6">
                         <div className="flex items-center gap-1">
                           <TrendingDown className="w-3 h-3 text-red-400 opacity-50" />
                           <span className="text-white font-black text-sm">${parseFloat(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                         </div>
                       </td>
                       <td className="px-6 py-6">
                         <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusColor(tx.status)}`}>
                           {getStatusIcon(tx.status)}
                           {isAr ? tx.status_ar : tx.status}
                         </span>
                       </td>
                       <td className="px-6 py-6 text-right no-print">
                         <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-silver-500 hover:text-gold-500 hover:border-gold-500/30 transition-all">
                           <ExternalLink className="w-4 h-4" />
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
        </div>

        {/* Quick Footer Stats */}
        {!loading && transactions.length > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
             <div className="glass-panel p-6 rounded-2xl border border-white/5 flex justify-between items-center">
                <span className="text-[10px] font-black text-silver-500 uppercase tracking-widest">{t('finances.total_records')}</span>
                <span className="text-xl font-black text-white italic">{transactions.length}</span>
             </div>
             <div className="glass-panel p-6 rounded-2xl border border-white/5 flex justify-between items-center lg:col-span-2">
                <span className="text-[10px] font-black text-gold-500 uppercase tracking-widest">{t('finances.lifetime_value')}</span>
                <span className="text-xl font-black text-gold-500 italic font-mono">
                  ${transactions.reduce((acc, curr) => acc + parseFloat(curr.amount), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
