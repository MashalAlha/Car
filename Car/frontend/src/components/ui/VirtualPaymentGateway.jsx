import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Lock, ShieldCheck, X, Loader2, CheckCircle2 } from 'lucide-react';

export default function VirtualPaymentGateway({ amount, onSuccess, onCancel }) {
  const { t } = useTranslation();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholder, setCardholder] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePayment = (e) => {
    e.preventDefault();
    setProcessing(true);
    
    // Simulation: Wait for authorization HUD
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      
      // Auto-close on success after animation
      setTimeout(() => {
        onSuccess({
          transaction_id: `MOCK-TXN-${Date.now()}`,
          payment_method: `Visa Ending ${cardNumber.slice(-4) || '4242'}`
        });
      }, 1500);
    }, 2500);
  };

  // Card Number Formatting
  const handleCardChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 16);
    const parts = value.match(/.{1,4}/g) || [];
    setCardNumber(parts.join(' '));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel-premium rounded-3xl border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/5">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-gold-500/10 rounded-lg">
                <Lock className="w-5 h-5 text-gold-500" />
             </div>
             <h3 className="text-xl font-bold text-white uppercase tracking-wider">{t('payment.terminal_title')}</h3>
           </div>
           {!processing && !success && (
             <button onClick={onCancel} className="text-silver-500 hover:text-white transition-colors">
               <X className="w-6 h-6" />
             </button>
           )}
        </div>

        {/* Content */}
        <div className="p-8">
          {success ? (
            <div className="py-12 flex flex-col items-center text-center animate-scale-up">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                 <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <h4 className="text-2xl font-bold text-white mb-2">{t('payment.success')}</h4>
              <p className="text-silver-400 text-sm">{t('payment.secure_notice')}</p>
            </div>
          ) : processing ? (
            <div className="py-12 flex flex-col items-center text-center">
               <Loader2 className="w-16 h-16 text-gold-500 animate-spin mb-6" />
               <h4 className="text-xl font-bold text-white mb-2">{t('payment.processing')}</h4>
               <div className="w-48 bg-white/5 h-1.5 rounded-full overflow-hidden mt-4">
                  <div className="bg-gold-500 h-full animate-progress" />
               </div>
            </div>
          ) : (
            <form onSubmit={handlePayment} className="space-y-6">
              
              {/* Virtual Card Visualization */}
              <div className="relative h-48 w-full bg-gradient-to-br from-premium-800 to-black rounded-2xl p-6 border border-white/10 shadow-xl overflow-hidden mb-8 group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-gold-500/10 transition-colors" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold-500/5 rounded-full -ml-16 -mb-16 blur-3xl" />
                
                <div className="relative flex flex-col h-full justify-between">
                   <div className="flex justify-between items-start">
                     <CreditCard className="w-10 h-10 text-gold-500/40" />
                     <div className="text-[10px] text-silver-500 font-bold uppercase tracking-widest italic flex items-center gap-1">
                        <Lock className="w-2 h-2" /> Encrypted Node
                     </div>
                   </div>
                   
                   <div className="text-xl font-mono text-white tracking-[0.2em]">
                     {cardNumber || '•••• •••• •••• ••••'}
                   </div>

                   <div className="flex justify-between items-end capitalize text-xs">
                      <div>
                        <p className="text-[8px] text-silver-500 uppercase tracking-tighter mb-0.5">Card Holder</p>
                        <p className="font-bold tracking-wider">{cardholder || 'YOUR NAME'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] text-silver-500 uppercase tracking-tighter mb-0.5">Expires</p>
                        <p className="font-bold">{expiry || 'MM/YY'}</p>
                      </div>
                   </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] text-silver-500 uppercase font-black mb-1.5 px-1">{t('payment.cardholder')}</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500/50 transition-colors placeholder:text-silver-700"
                    placeholder="Ebrahem Alwish"
                    value={cardholder}
                    onChange={(e) => setCardholder(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-silver-500 uppercase font-black mb-1.5 px-1">{t('payment.card_number')}</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500/50 transition-colors placeholder:text-silver-700 font-mono"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={handleCardChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-silver-500 uppercase font-black mb-1.5 px-1">{t('payment.expiry')}</label>
                    <input 
                      required
                      type="text" 
                      maxLength="5"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500/50 transition-colors placeholder:text-silver-700"
                      placeholder="MM / YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-silver-500 uppercase font-black mb-1.5 px-1">{t('payment.cvv')}</label>
                    <input 
                      required
                      type="password" 
                      maxLength="4"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500/50 transition-colors placeholder:text-silver-700"
                      placeholder="•••"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 mt-4 bg-gold-500 text-premium-900 font-black uppercase tracking-widest rounded-xl hover:bg-gold-400 active:scale-95 transition-all shadow-[0_10px_30px_rgba(212,175,55,0.2)]"
              >
                {t('payment.pay_now', { amount: amount.toLocaleString() })}
              </button>

              <div className="flex items-center justify-center gap-2 text-silver-500 text-[10px] uppercase font-bold">
                 <ShieldCheck className="w-3 h-3" /> {t('payment.secure_notice')}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
