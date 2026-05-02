import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, Calendar, Clock, Printer, CheckCircle, ChevronLeft, User, Car as CarIcon, ShieldCheck } from 'lucide-react';

import api from '../../utils/api';

export default function ContractFinalizer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [contractContent, setContractContent] = useState('');
  const [message, setMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPurchase = async () => {
      try {
        const res = await api.get(`/cars/all-purchases/${id}/`);
        const data = res.data;
        setPurchase(data);
        setDeliveryDate(data.delivery_date || '');
        setDeliveryTime(data.delivery_time || '');
        
        if (data.contract_notes) {
          setContractContent(data.contract_notes);
        } else {
          generateDefaultContract(data);
        }
      } catch (err) {
        console.error("Failed to fetch purchase details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchase();
  }, [id]);

  const generateDefaultContract = (data) => {
    const adminName = localStorage.getItem('admin_username') || 'System Administrator';
    const dateStr = new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US');
    
    const template = `
${t('admin.purchase_mgmt.contract_title').toUpperCase()}
--------------------------------------------------
Ref ID: ACQ-${data.id}-${data.transaction_id?.slice(-6).toUpperCase()}
Date of Draft: ${dateStr}

1. PARTIES
Seller Representative: ${adminName}
Executing Entity: ${t('brand')} ${t('brand_sub')}
Buyer: ${data.user?.username} (${data.user?.email})

2. VEHICLE DESCRIPTION
Make: ${data.car?.make}
Model: ${data.car?.model}
Year: ${data.car?.year}
VIN / Serial: ${data.car?.vin || 'EM-' + Math.random().toString(36).substring(7).toUpperCase()}

3. FINANCIAL TERMS
Agreed Purchase Price: $${Number(data.price_paid).toLocaleString()}
Payment Method: ${data.payment_method}
Payment Status: VERIFIED / FULLY PAID

4. DELIVERY SCHEDULE
Scheduled Date: [TO BE FINALIZED BELOW]
Scheduled Time: [TO BE FINALIZED BELOW]

5. TERMS & CONDITIONS
The Seller agrees to deliver the vehicle in the condition verified during acquisition. 
Ownership is transferred upon final signature. All luxury assets are sold with the standard 
${t('brand')} Concierge Warranty unless specified otherwise.

--------------------------------------------------
SIGNATURES

__________________________          __________________________
${t('admin.purchase_mgmt.sign_seller')}                ${t('admin.purchase_mgmt.sign_buyer')}
Admin: ${adminName}                 Buyer: ${data.user?.username}
    `.trim();
    setContractContent(template);
  };

  const handleFinalize = async () => {
    if (!deliveryDate || !deliveryTime) {
      setMessage({ type: 'error', text: 'Please schedule both date and time.' });
      return;
    }
    
    setIsSaving(true);
    try {
      await api.patch(`/cars/all-purchases/${id}/`, { 
        status: 'approved',
        delivery_date: deliveryDate,
        delivery_time: deliveryTime,
        contract_notes: contractContent
      });
      
      setMessage({ type: 'success', text: 'Contract finalized and acquisition approved.' });
      setTimeout(() => navigate('/admin/purchases'), 2000);
    } catch (e) {
      console.error("Finalization error:", e);
      setMessage({ type: 'error', text: 'Finalization failed.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-silver-400 font-mono animate-pulse">
      {t('admin.common.loading')}
    </div>
  );

  if (!purchase) return <div className="p-20 text-center text-red-400 font-bold">Purchase record not found.</div>;

  return (
    <div className="min-h-screen p-4 md:p-8 text-white max-w-6xl mx-auto">
      {/* Header - Hidden on Print */}
      <div className="flex flex-col md:flex-row flex-wrap justify-between items-start md:items-center mb-10 gap-4 print:hidden">
        <div>
          <button 
            onClick={() => navigate('/admin/purchases')}
            className="flex items-center gap-2 text-silver-500 hover:text-gold-500 transition-colors mb-4 font-bold text-sm"
          >
            <ChevronLeft className="w-4 h-4" /> {t('admin.sidebar.car_acquisitions')}
          </button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
             <FileText className="text-gold-500" /> {t('admin.purchase_mgmt.contract_title')}
          </h1>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={handlePrint}
            className="bg-premium-800 border border-white/10 px-4 md:px-5 py-2.5 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> <span className="hidden md:inline">{t('admin.purchase_mgmt.print_pdf')}</span>
          </button>
          
          {purchase.status === 'pending' && (
            <button 
              onClick={handleFinalize}
              disabled={isSaving}
              className="bg-gold-500 text-premium-900 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? '...' : <CheckCircle className="w-4 h-4" />} {t('admin.purchase_mgmt.finalize_btn')}
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`mb-8 p-4 rounded-xl border flex items-center gap-3 animate-fade-in print:hidden ${
          message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          <ShieldCheck className="w-5 h-5" />
          <p className="text-sm font-bold uppercase tracking-wider">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel - Hidden on Print */}
        <div className="lg:col-span-1 space-y-6 print:hidden">
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h3 className="text-silver-500 text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {t('admin.purchase_mgmt.delivery_date')}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-silver-600 uppercase font-bold mb-1 block">{t('admin.purchase_mgmt.scheduled_date')}</label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-premium-900 border border-white/10 rounded-lg p-3 text-sm focus:border-gold-500 outline-none"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  disabled={purchase.status !== 'pending'}
                />
              </div>
              
              <div>
                <label className="text-[10px] text-silver-600 uppercase font-bold mb-1 block">{t('admin.purchase_mgmt.scheduled_time')}</label>
                <input 
                  type="time" 
                  className="w-full bg-premium-900 border border-white/10 rounded-lg p-3 text-sm focus:border-gold-500 outline-none uppercase"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  disabled={purchase.status !== 'pending'}
                />
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h3 className="text-silver-500 text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> {t('admin.purchase_mgmt.buyer_details')}
            </h3>
            <p className="font-bold text-white mb-1">{purchase.user?.username}</p>
            <p className="text-xs text-silver-400 font-mono mb-4">{purchase.user?.email}</p>
            
            <h3 className="text-silver-500 text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 pt-4 border-t border-white/5">
              <CarIcon className="w-4 h-4" /> {t('admin.purchase_mgmt.vehicle_specs')}
            </h3>
            <p className="font-bold text-gold-400">{purchase.car?.make} {purchase.car?.model}</p>
            <p className="text-xs text-silver-400 font-mono italic">{purchase.car?.year} Edition</p>
          </div>
        </div>

        {/* Contract Drafter */}
        <div className="lg:col-span-2 space-y-4 print-content">
          <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/10 print:bg-white print:text-black print:border-none print:p-0 print:shadow-none min-h-[500px] md:min-h-[800px] flex flex-col">
            <div className="print:hidden mb-4 flex justify-between items-center bg-white/5 p-4 rounded-xl">
               <span className="text-xs font-bold text-gold-500">{t('admin.purchase_mgmt.draft_mode')}</span>
               <span className="text-[10px] text-silver-500">{t('admin.purchase_mgmt.edit_notice')}</span>
            </div>
            
            {/* Screen View: Editable Textarea */}
            <textarea
              className="w-full flex-1 bg-transparent border-none outline-none resize-none font-serif text-lg leading-relaxed print:hidden"
              value={contractContent}
              onChange={(e) => setContractContent(e.target.value)}
              disabled={purchase.status !== 'pending'}
              placeholder="Drafting acquisition agreement..."
            />

            {/* Print View: Formatted Text */}
            <div className="hidden print:block text-black font-serif whitespace-pre-wrap leading-relaxed text-sm">
              {contractContent}
            </div>
          </div>
          
          {/* Print only CSS */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * { visibility: hidden !important; }
              .print-content, .print-content * { visibility: visible !important; }
              .print-content { 
                position: absolute; 
                left: 0; 
                top: 0; 
                width: 100%; 
                margin: 0;
                padding: 0;
              }
              @page {
                margin: 20mm;
              }
            }
          `}} />
        </div>
      </div>
    </div>
  );
}
