import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Calendar, Clock, FileText, Info, ArrowLeft, Printer, Car, CreditCard } from 'lucide-react';

import api from '../../utils/api';

export default function PurchaseDetails() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/cars/my-purchases/${id}/`);
        setPurchase(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-premium-950">
      <div className="text-center animate-pulse">
        <div className="w-20 h-20 border-b-2 border-gold-500 rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-silver-400 font-mono uppercase tracking-[0.2em]">{t('my_purchases.loading')}</p>
      </div>
    </div>
  );

  if (!purchase) return (
    <div className="min-h-screen flex items-center justify-center bg-premium-950">
      <div className="text-center p-8 glass-panel rounded-3xl border border-red-500/20">
        <Info className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">{t('car_details.not_found')}</h2>
        <button onClick={() => navigate('/my-purchases')} className="text-gold-500 hover:underline mt-4">
          {t('my_purchases.back_to_list')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-premium-950">
      <div className="max-w-5xl mx-auto">
        {/* Navigation / Actions */}
        <div className="flex justify-between items-center mb-10 print:hidden">
          <button 
            onClick={() => navigate('/my-purchases')}
            className="flex items-center gap-2 text-silver-400 hover:text-white transition-colors group font-bold tracking-widest uppercase text-[10px]"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            {t('my_purchases.back_to_list')}
          </button>
          
          <div className="flex gap-4">
            <button 
              onClick={handlePrint}
              className="luxury-button px-6 py-2.5 text-[10px] font-bold tracking-widest uppercase flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> {t('my_purchases.print_agreement')}
            </button>
          </div>
        </div>

        {/* Purchase Header */}
        <div className="glass-panel p-8 rounded-3xl border border-premium-border/50 mb-8 relative overflow-hidden print:hidden shadow-2xl">
          <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
            {purchase.car?.image_url ? (
               <img src={purchase.car.image_url} alt="car" className="w-full md:w-80 h-48 object-cover rounded-2xl border border-white/10 shadow-2xl" />
            ) : (
               <div className="w-full md:w-80 h-48 bg-premium-900 rounded-2xl flex items-center justify-center border border-white/10">
                 <Car className="w-16 h-16 text-silver-700" />
               </div>
            )}
            
            <div className="flex-1 text-center md:text-start">
              <span className="text-gold-500 font-mono text-xs uppercase tracking-[0.3em] font-black">{t('my_purchases.details_title')}</span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4 leading-tight">
                {purchase.car ? `${purchase.car.year} ${purchase.car.make} ${purchase.car.model}` : 'Vehicle Acquisition'}
              </h1>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                 <div className="bg-white/5 px-5 py-3 rounded-2xl border border-white/5 flex flex-col items-center md:items-start min-w-[120px]">
                   <span className="text-[10px] text-silver-600 font-bold uppercase tracking-wider mb-1">{t('my_purchases.purchased_on')}</span>
                   <span className="text-white font-mono text-sm font-bold">{new Date(purchase.purchase_date).toLocaleDateString()}</span>
                 </div>
                 <div className="bg-white/5 px-5 py-3 rounded-2xl border border-white/5 flex flex-col items-center md:items-start min-w-[120px]">
                   <span className="text-[10px] text-silver-600 font-bold uppercase tracking-wider mb-1">Status</span>
                   <span className={`text-sm font-black uppercase tracking-widest ${
                     purchase.status === 'approved' ? 'text-green-400' : 
                     purchase.status === 'rejected' ? 'text-red-400' : 
                     purchase.status === 'cancelled' ? 'text-silver-400' : 'text-gold-400'
                   }`}>{t(`my_purchases.status_${purchase.status}`, { defaultValue: purchase.status })}</span>
                 </div>
              </div>
            </div>
          </div>
          
          {/* Subtle Background Decoration */}
          <ShoppingBag className="absolute -bottom-20 -right-20 w-96 h-96 text-white/5 pointer-events-none rotate-12" />
        </div>

        {/* Content Tabs / Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 print:block">
           {/* Agreement Column */}
           <div className="lg:col-span-2 space-y-8 print-agreement-area">
              <div className="glass-panel p-10 rounded-3xl border border-white/5 min-h-[700px] flex flex-col shadow-xl print:border-none print:shadow-none print:bg-white print:text-black print:p-0">
                 <div className="flex items-center justify-between mb-10 print:hidden border-b border-white/10 pb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                       <FileText className="w-6 h-6 text-gold-500" /> {t('my_purchases.agreement_tab')}
                    </h3>
                    {purchase.status === 'delivered' && (
                       <div className="flex items-center gap-2 bg-green-500/10 text-green-400 text-[10px] px-4 py-1.5 rounded-full border border-green-500/20 font-black tracking-widest uppercase shadow-lg shadow-green-500/5">
                         <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                         Dossier Finalized
                       </div>
                    )}
                 </div>
                 
                 <div className="flex-1 font-serif text-xl leading-relaxed text-silver-300 whitespace-pre-wrap print:text-black print:text-sm print:leading-normal bg-white/5 print:bg-white p-6 rounded-2xl border border-white/5 print:border-none">
                    {purchase.contract_notes || t('my_purchases.no_agreement_yet')}
                 </div>
                 
                 {/* Signatures for Print */}
                 <div className="hidden print:grid grid-cols-2 gap-20 mt-20 text-black">
                    <div className="border-t-2 border-black pt-6">
                       <p className="text-xs font-bold uppercase tracking-widest">Seller Signature</p>
                       <p className="text-[10px] text-gray-400 mt-2">Executive Delegate of Exotic Motors</p>
                    </div>
                    <div className="border-t-2 border-black pt-6">
                       <p className="text-xs font-bold uppercase tracking-widest">Buyer Signature</p>
                       <p className="text-[10px] text-gray-400 mt-2">{purchase.user?.username || 'Authorized Client ID'} - Verified</p>
                    </div>
                 </div>
                 
                 {/* Print Footer */}
                 <div className="hidden print:block mt-12 pt-8 border-t border-gray-100 text-[8px] text-gray-400 uppercase tracking-widest text-center">
                    This document is a certified digital copy generated by Exotic Motors Luxury Automotive Systems.
                 </div>
              </div>
           </div>

           {/* Sidebar Info */}
           <div className="space-y-6 print:hidden">
              <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-xl">
                 <h4 className="text-[10px] text-silver-600 font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gold-500" /> {t('my_purchases.delivery_details')}
                 </h4>
                 <div className="space-y-6">
                    <div className="space-y-1.5">
                       <p className="text-[10px] text-silver-500 font-bold uppercase tracking-tighter">{t('my_purchases.preferred_date')}</p>
                       <p className="text-white font-bold bg-white/5 p-3 rounded-xl border border-white/5">{purchase.delivery_date || t('car_details.currently_booked')}</p>
                    </div>
                    <div className="space-y-1.5">
                       <p className="text-[10px] text-silver-500 font-bold uppercase tracking-tighter">{t('my_purchases.arrival_window')}</p>
                       <p className="text-white font-bold bg-white/5 p-3 rounded-xl border border-white/5 font-mono">{purchase.delivery_time || '--:--'}</p>
                    </div>
                 </div>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-xl">
                 <h4 className="text-[10px] text-silver-600 font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gold-500" /> {t('my_purchases.transaction_recap')}
                 </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                       <span className="text-sm text-silver-400">{t('my_purchases.net_value')}:</span>
                       <span className="text-gold-400 font-mono font-bold text-lg">${Number(purchase.price_paid).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                       <span className="text-sm text-silver-400">{t('my_purchases.method')}:</span>
                       <span className="text-white font-black text-xs uppercase tracking-widest">{purchase.payment_method}</span>
                    </div>
                    {purchase.payment_status && (
                       <div className="bg-green-500/10 p-3 rounded-xl text-center text-[10px] text-green-400 font-black border border-green-500/10 tracking-[0.2em] mt-4">
                          {t('my_purchases.secure_payment_authorized')}
                       </div>
                    )}
                 </div>
              </div>

              {purchase.status === 'rejected' && purchase.rejection_reason && (
                 <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-3xl shadow-xl shadow-red-500/5">
                    <h4 className="text-[10px] text-red-500 font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                       <Info className="w-4 h-4" /> {t('my_purchases.rejected_reason_title')}
                    </h4>
                    <p className="text-sm text-red-300 italic leading-relaxed font-serif">{purchase.rejection_reason}</p>
                 </div>
              )}
           </div>
        </div>
      </div>
      
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden !important; }
          .print-agreement-area, .print-agreement-area * { visibility: visible !important; }
          .print-agreement-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white !important;
            color: black !important;
          }
          @page {
            margin: 20mm;
          }
        }
      `}} />
    </div>
  );
}
