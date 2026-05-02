import React, { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Calendar, Clock, MapPin, Wrench, ArrowRight, CheckCircle2, Building2, CreditCard, ShieldCheck } from 'lucide-react';
import api from '../../utils/api';
import VirtualPaymentGateway from '../../components/ui/VirtualPaymentGateway';

export default function BookService() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wsLoading, setWsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  
  const [formData, setFormData] = useState({
    serviceId: '',
    serviceName: '',
    serviceCategory: '',
    basePrice: 0,
    workshopId: '',
    workshopName: '',
    date: '',
    time: '',
    isHomeService: false,
    address: '',
    onSiteFee: 0,
    mobileFee: 0
  });

  const [bookedSlots, setBookedSlots] = useState([]);

  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (step === 2 && formData.serviceCategory) {
      fetchWorkshops(formData.serviceCategory);
    }
    if (step === 3 && formData.date && formData.workshopId) {
      fetchBookedSlots(formData.workshopId, formData.date);
    }
  }, [step, formData.serviceCategory, formData.date, formData.workshopId]);

  const fetchServices = async () => {
    try {
      const response = await api.get('/workshop/service-types/');
      setServices(response.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchWorkshops = async (category) => {
    setWsLoading(true);
    try {
      const response = await api.get('/workshop/facilities/');
      const data = response.data;
      const filtered = data.filter(w => w.category === category);
      setWorkshops(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setWsLoading(false);
    }
  };

  const fetchBookedSlots = async (wsId, date) => {
    try {
      const resp = await api.get(`/workshop/facilities/${wsId}/booked_slots/?date=${date}`);
      setBookedSlots(resp.data);
    } catch (e) { console.error(e); }
  };

  const handleServiceSelect = (service) => {
    setFormData({
      ...formData, 
      serviceId: service.id, 
      serviceName: service.name,
      serviceCategory: service.workshop_category,
      basePrice: parseFloat(service.base_price) 
    });
    handleNext();
  };

  const handleWorkshopSelect = (workshop) => {
    setFormData({
      ...formData, 
      workshopId: workshop.id, 
      workshopName: workshop.name,
      onSiteFee: parseFloat(workshop.on_site_fee),
      mobileFee: parseFloat(workshop.mobile_fee)
    });
    handleNext();
  };

  const handleNext = () => setStep((s) => Math.min(s + 1, 6));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const calculateTotal = () => {
    const fee = formData.isHomeService ? formData.mobileFee : formData.onSiteFee;
    return formData.basePrice + fee;
  };

  const isSlotBooked = (time) => {
    const tVal = parseFloat(time.replace(':', '.'));
    return bookedSlots.some(s => {
      const start = parseFloat(s.start.replace(':', '.'));
      const end = start + s.duration;
      return tVal >= start && tVal < end;
    });
  };

  const TIME_SLOTS = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00"
  ];

  const onPaymentSuccess = async (paymentData) => {
    setShowPayment(false);
    try {
      const response = await api.post('/workshop/appointments/', {
        service: formData.serviceId,
        workshop: formData.workshopId,
        scheduled_date: formData.date,
        scheduled_time: formData.time,
        is_home_service: formData.isHomeService,
        address_notes: formData.address,
        payment_status: 'Paid',
        payment_transaction_id: paymentData.transaction_id
      });
      
      const result = response.data;
      setBookingResult(result);
      setStep(6); // Success
    } catch (e) {
      console.error(e);
      const detail = e.response?.data?.detail || "Booking failed. Please check availability.";
      alert(detail);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-20 animate-fade-in mt-6 md:mt-10">
      <div className="text-center mb-8 md:mb-12 px-4">
        <h1 className="text-3xl md:text-4xl font-black luxury-gradient-text mb-4 uppercase tracking-tighter">
          {step === 6 ? t('booking.success_title') : t('booking.title')}
        </h1>
        <p className="text-silver-400 font-medium text-sm md:text-base">{t('booking.subtitle')}</p>
      </div>

      <div className="glass-panel-premium p-6 sm:p-12 rounded-[2rem] relative overflow-hidden border border-white/5 shadow-2xl">
        {/* Progress Tracker */}
        {step < 6 && (
          <div className="flex items-center justify-between mb-12 md:mb-16 relative z-10 px-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="flex flex-col items-center relative z-10">
                <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl flex items-center justify-center font-black text-[10px] md:text-xs transition-all duration-500 ${step >= num ? 'bg-gold-500 text-premium-900 shadow-[0_0_20px_rgba(212,175,55,0.3)]' : 'bg-white/5 text-silver-600 border border-white/10'}`}>
                  {num}
                </div>
              </div>
            ))}
            <div className="absolute top-3.5 md:top-4 left-10 right-10 h-[1px] bg-white/5 -z-10">
              <div className="h-full bg-gold-500 transition-all duration-1000 origin-left" style={{ width: `${(step - 1) * 25}%` }} />
            </div>
          </div>
        )}

        {/* STEP 1: Service Type */}
        {step === 1 && (
          <div className="animate-slide-up space-y-6">
            <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest text-center">{t('booking.select_service')}</h3>
            {loading ? (
              <div className="flex justify-center py-10"><Wrench className="w-10 h-10 text-gold-500 animate-spin" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((svc) => (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => handleServiceSelect(svc)}
                    className="p-6 rounded-2xl border border-white/5 bg-white/5 hover:border-gold-500/50 hover:bg-gold-500/5 text-left transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <Wrench className="w-8 h-8 text-gold-500/40 group-hover:text-gold-500 transition-colors" />
                      <span className="text-gold-500 font-black italic">${parseFloat(svc.base_price).toLocaleString()}</span>
                    </div>
                    <h4 className="text-white font-bold mb-1">{t(`booking.services_list.${svc.name}.name`, { defaultValue: svc.name })}</h4>
                    <p className="text-silver-500 text-xs line-clamp-2">{t(`booking.services_list.${svc.name}.desc`, { defaultValue: svc.description })}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Workshop Selection */}
        {step === 2 && (
          <div className="animate-slide-up space-y-6">
            <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest text-center">{t('booking.select_facility')}</h3>
            <div className="grid grid-cols-1 gap-4">
              {wsLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4 text-gold-500/50">
                  <div className="w-10 h-10 border-4 border-gold-500/10 border-t-gold-500 rounded-full animate-spin"></div>
                  <span className="text-xs font-black uppercase tracking-widest animate-pulse">Scanning specialized facilities...</span>
                </div>
              ) : (
                <>
                  {workshops.map((ws) => (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => handleWorkshopSelect(ws)}
                      className="p-6 rounded-2xl border border-white/5 bg-white/5 hover:border-gold-500/50 hover:bg-gold-500/5 text-left flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-premium-800 rounded-xl flex items-center justify-center text-gold-500 border border-white/5">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold">{ws.name}</h4>
                          <p className="text-silver-500 text-xs">{ws.working_days} | {ws.working_hours}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gold-500 opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                  ))}
                  {workshops.length === 0 && <p className="text-center text-silver-500 py-12">{t('booking.no_facilities')}</p>}
                </>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Schedule */}
        {step === 3 && (
          <div className="animate-slide-up space-y-8 max-w-xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest text-center">{t('booking.schedule_session')}</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-silver-500 uppercase tracking-widest mb-3">{t('booking.app_date')}</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500/40" />
                  <input required type="date" className="luxury-input pl-14" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-silver-500 uppercase tracking-widest mb-3">{t('booking.time_slot')}</label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {TIME_SLOTS.map(tStr => {
                    const booked = isSlotBooked(tStr);
                    return (
                      <button
                        key={tStr}
                        type="button"
                        disabled={booked}
                        onClick={() => setFormData({...formData, time: tStr})}
                        className={`py-3 text-[10px] font-black rounded-lg border transition-all ${
                          formData.time === tStr 
                            ? 'bg-gold-500 text-premium-900 border-gold-500 shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                            : booked 
                              ? 'bg-red-500/5 text-red-500/30 border-red-500/10 cursor-not-allowed line-through' 
                              : 'bg-white/5 text-silver-400 border-white/5 hover:border-white/20'
                        }`}
                      >
                        {tStr}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Location & Fees */}
        {step === 4 && (
          <div className="animate-slide-up space-y-8 max-w-xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest text-center">{t('booking.service_location')}</h3>
            <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
              <button 
                type="button" 
                onClick={() => setFormData({...formData, isHomeService: false})}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${!formData.isHomeService ? 'bg-gold-500 text-premium-900 shadow-xl' : 'text-silver-500 hover:text-white'}`}
              >
                {t('booking.at_workshop')}
              </button>
              <button 
                type="button"
                onClick={() => setFormData({...formData, isHomeService: true})}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${formData.isHomeService ? 'bg-gold-500 text-premium-900 shadow-xl' : 'text-silver-500 hover:text-white'}`}
              >
                {t('booking.mobile_home')}
              </button>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-gold-500/5">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-silver-400 text-sm">{t('booking.base_price')}</span>
                 <span className="text-white font-bold">${formData.basePrice}</span>
               </div>
               <div className="flex justify-between items-center mb-4">
                 <span className="text-silver-400 text-sm">{t('booking.location_fee')}</span>
                 <span className="text-gold-500 font-bold">${formData.isHomeService ? formData.mobileFee : formData.onSiteFee}</span>
               </div>
               <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                 <span className="text-white font-black uppercase tracking-widest text-xs">{t('booking.total_estimated')}</span>
                 <span className="text-2xl font-black text-white">${calculateTotal()}</span>
               </div>
            </div>

            {formData.isHomeService && (
              <div className="space-y-4 animate-fade-in">
                <label className="block text-[10px] font-black text-silver-500 uppercase tracking-widest mb-1">{t('booking.address_label')}</label>
                <input required type="text" placeholder={t('booking.address_placeholder')} className="luxury-input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Payment */}
        {step === 5 && (
          <div className="animate-slide-up text-center py-8">
             <div className="w-20 h-20 bg-gold-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gold-500/20">
                <CreditCard className="w-10 h-10 text-gold-500" />
             </div>
             <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">{t('booking.payment_terminal')}</h3>
             <div className="text-silver-400 text-sm mb-10 max-w-xs mx-auto">
                <Trans i18nKey="booking.authorize_msg" values={{ amount: calculateTotal() }}>
                  Authorize your service booking fee of <span className="text-white font-bold">${calculateTotal()}</span> to proceed.
                </Trans>
             </div>
             <button onClick={() => setShowPayment(true)} className="luxury-button px-10 py-4 flex items-center justify-center gap-3 w-full max-w-md mx-auto">
                <ShieldCheck className="w-5 h-5" /> {t('booking.open_terminal')}
             </button>
          </div>
        )}

        {/* STEP 6: Success */}
        {step === 6 && (
          <div className="animate-slide-up text-center py-12">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/10 mb-8 border border-green-500/20">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">{t('booking.success_title')}</h2>
            <div className="text-silver-400 max-w-md mx-auto mb-10 text-sm">
              <Trans i18nKey="booking.success_message" values={{ type: t(`booking.services_list.${formData.serviceName}.name`, { defaultValue: formData.serviceName }), date: formData.date }}>
                Your service request for <span className="text-gold-500 font-bold">{t(`booking.services_list.${formData.serviceName}.name`, { defaultValue: formData.serviceName })}</span> for {formData.date} at {formData.time} is confirmed.
              </Trans>
            </div>
            <div className="flex gap-4 justify-center">
              <button onClick={() => window.location.href='/my-appointments'} className="luxury-button px-8 py-3 text-xs uppercase font-black tracking-widest">
                {t('my_appointments.title')}
              </button>
              <button onClick={() => window.location.href='/'} className="luxury-button-secondary px-8 py-3 text-xs uppercase font-black tracking-widest">
                {t('booking.btn_return')}
              </button>
            </div>
          </div>
        )}
        
        {/* Navigation Controls */}
        {step > 1 && step < 5 && (
          <div className="flex justify-between mt-16 pt-8 border-t border-white/5">
            <button onClick={handlePrev} className="text-silver-500 hover:text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-colors">
              {t('booking.btn_back')}
            </button>
            <button 
              onClick={handleNext} 
              disabled={(step === 3 && (!formData.date || !formData.time)) || (step === 4 && formData.isHomeService && !formData.address)}
              className="luxury-button px-10 py-3 flex items-center gap-2 text-xs uppercase font-black tracking-widest disabled:opacity-30"
            >
              {t('booking.btn_continue')} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {showPayment && (
        <VirtualPaymentGateway 
          amount={calculateTotal()}
          onSuccess={onPaymentSuccess}
          onCancel={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}
