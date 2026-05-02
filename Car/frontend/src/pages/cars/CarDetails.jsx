import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, Gauge, Settings, ShieldCheck, ChevronLeft, ChevronRight, Activity, Palette, AlertCircle, CreditCard, Lock, ArrowRight, ShoppingBag, CheckCircle, Clock } from 'lucide-react';
import VirtualPaymentGateway from '../../components/ui/VirtualPaymentGateway';

import api from '../../utils/api';

export default function CarDetails() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(false);

  // Rental state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // User state for verification check
  const [isVerified, setIsVerified] = useState(false);
  
  // Payment state
  const [showPayment, setShowPayment] = useState(false);
  const [showPurchasePayment, setShowPurchasePayment] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const isLoggedIn = !!localStorage.getItem('user_access_token');

  const fetchCar = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/cars/inventory/${id}/`);
      setCar(res.data);
    } catch (err) {
      console.error('Error fetching car:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile/');
      const data = res.data;
      setIsVerified(data.is_verified);
      localStorage.setItem('user_data', JSON.stringify(data));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchCar();
  }, [id]);

  const handleBook = async () => {
    const today = new Date().toISOString().split('T')[0];
    if (!startDate || !endDate) {
      alert(t('admin.inventory.add_failed'));
      return;
    }
    if (startDate < today) {
      alert("Rental start date cannot be in the past.");
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (paymentData) => {
    setShowPayment(false);
    setBooking(true);
    try {
      const res = await api.post(`/cars/inventory/${id}/rent/`, { 
        start_date: startDate, 
        end_date: endDate,
        transaction_id: paymentData.transaction_id,
        payment_method: paymentData.payment_method
      });

      alert(t('trust.success_submit'));
      // Refresh car data to show new booking status
      await fetchCar();
    } catch (err) {
      console.error(err);
      const errData = err.response?.data;
      alert(errData?.detail || t('trust.error_submit'));
    } finally {
      setBooking(false);
    }
  };

  const handlePurchaseSuccess = async (paymentData) => {
    setShowPurchasePayment(false);
    setPurchasing(true);
    try {
      const res = await api.post(`/cars/inventory/${id}/purchase/`, {
        transaction_id: paymentData.transaction_id,
        payment_method: paymentData.payment_method
      });

      setPurchaseSuccess(true);
      fetchCar(); // Refresh car data to show it's sold
    } catch (err) {
      console.error('Purchase error:', err);
      const data = err.response?.data;
      alert(data?.detail || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-premium-900">
        <div className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin mb-4"></div>
        <p className="text-silver-400 font-medium tracking-widest uppercase text-xs">{t('car_details.loading')}</p>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-premium-900 px-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6 opacity-80" />
        <h2 className="text-3xl font-bold text-white mb-2">{t('car_details.not_found')}</h2>
        <p className="text-silver-400 mb-8 max-w-md">{t('car_details.not_found_desc')}</p>
        <Link to="/catalog" className="luxury-button px-8 py-3 flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> {t('car_details.return_btn')}
        </Link>
      </div>
    );
  }

  // Calculate rental total
  const calculateTotal = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // If start and end are same day, count as 1 day. If they are valid, return max(1, diff).
    if (diffDays === 0 && startDate === endDate) return 1;
    return diffDays > 0 ? diffDays : 0;
  };

  const daysCount = calculateTotal();
  const totalAmount = daysCount * parseFloat(car.daily_rent_price || 0);

  // Map JSON specs to the UI format
  const getSpecsArray = (specs) => {
    if (!specs) return [];
    const mapping = {
      engine: { label: t('car_details.specs.engine'), icon: <Settings className="w-5 h-5" /> },
      top_speed: { label: t('car_details.specs.top_speed'), icon: <Gauge className="w-5 h-5" /> },
      "0_to_60mph": { label: t('car_details.specs.0_to_60mph'), icon: <Activity className="w-5 h-5" /> },
      color: { label: t('car_details.specs.exterior'), icon: <Palette className="w-5 h-5" /> }
    };

    return Object.entries(specs).map(([key, value]) => ({
      label: mapping[key]?.label || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: value,
      icon: mapping[key]?.icon || <Settings className="w-5 h-5" />
    }));
  };

  const specsArray = getSpecsArray(car.specs);

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Image Section */}
      <div className="relative h-[50vh] md:h-[75vh] w-full bg-premium-950 overflow-hidden group">
        <div className="absolute inset-0 bg-premium-900 z-10 opacity-30 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-premium-900 via-transparent to-premium-900/40 z-10"></div>
        
        {/* Main Image Slider */}
        <div 
          className="w-full h-full flex transition-transform duration-700 ease-out" 
          style={{ transform: `translateX(${activeImageIndex * (isRTL ? 100 : -100)}%)` }}
        >
          {car.images && car.images.length > 0 ? (
            car.images.map((img, idx) => (
              <div key={img.id} className="w-full h-full shrink-0">
                <img 
                  src={img.image} 
                  alt={`${car.model} - ${idx + 1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))
          ) : (
            <div className="w-full h-full shrink-0">
              <img 
                src={car.image_url || 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80'} 
                alt={car.model} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        {car.images && car.images.length > 1 && (
          <>
            <button 
              onClick={() => isRTL ? 
                setActiveImageIndex(prev => (prev === car.images.length - 1 ? 0 : prev + 1)) : 
                setActiveImageIndex(prev => (prev === 0 ? car.images.length - 1 : prev - 1))
              }
              className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/20 hover:bg-gold-500 hover:text-premium-900 backdrop-blur-md border border-white/10 text-white transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => isRTL ? 
                setActiveImageIndex(prev => (prev === 0 ? car.images.length - 1 : prev - 1)) : 
                setActiveImageIndex(prev => (prev === car.images.length - 1 ? 0 : prev + 1))
              }
              className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/20 hover:bg-gold-500 hover:text-premium-900 backdrop-blur-md border border-white/10 text-white transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Thumbnail Navigation Indicators */}
            <div className="absolute bottom-40 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {car.images.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-12 h-1 rounded-full transition-all ${activeImageIndex === idx ? 'bg-gold-500 w-16' : 'bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>
          </>
        )}
        
        <div className="absolute top-8 left-8 z-20">
          <Link to="/catalog" className="flex items-center gap-2 text-white hover:text-gold-400 backdrop-blur-sm bg-black/20 px-4 py-2 rounded-lg transition-colors border border-white/10">
            <ChevronLeft className="w-5 h-5" /> {t('car_details.back_to_catalog')}
          </Link>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8 animate-slide-up">
            <div className="glass-panel p-8 md:p-10 rounded-2xl">
              <div className="flex justify-between items-start mb-4">
                <div className="inline-block px-3 py-1 border border-gold-500 text-gold-500 rounded-full text-sm font-semibold uppercase tracking-wider">
                  {t('car_details.model_year', { year: car.year })}
                </div>
                {car.current_rental && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-bold uppercase tracking-widest animate-pulse">
                    <Calendar className="w-3.5 h-3.5" />
                    {t('car_details.booked_until', { date: car.current_rental.end_date })}
                  </div>
                )}
              </div>
              <h1 className="text-3xl md:text-6xl font-black text-white mb-2 leading-none">{car.make} <span className="font-light">{car.model}</span></h1>
              <p className="text-silver-300 text-sm md:text-lg leading-relaxed mt-6">
                {car.description || t('car_details.default_description')}
              </p>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {specsArray.map((spec, idx) => (
                <div key={idx} className="bg-premium-800 border border-white/5 p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:border-gold-500/30 transition-colors">
                  <div className="text-gold-500 mb-2 md:mb-3">{spec.icon}</div>
                  <h4 className="text-white font-bold text-sm md:text-base">{spec.value}</h4>
                  <p className="text-silver-400 text-[10px] uppercase tracking-widest mt-1 font-bold">{spec.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            {car.is_for_sale && (
              <div className={`glass-panel p-8 rounded-2xl border-t-4 ${car.current_rental ? 'border-t-silver-500 opacity-80' : 'border-t-gold-500'}`}>
                <p className="text-silver-400 text-sm font-medium uppercase tracking-wider mb-2">{t('car_details.acquire_now')}</p>
                <div className="text-4xl font-bold text-white mb-6">${parseFloat(car.price).toLocaleString()}</div>
                
                {!isLoggedIn ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-premium-900 border border-gold-500/10 rounded-xl">
                      <p className="text-[10px] text-gold-500 font-bold uppercase tracking-widest mb-1">{t('auth.login_required_title')}</p>
                      <p className="text-[10px] text-silver-400 leading-relaxed italic">
                        {t('auth.login_required_desc')}
                      </p>
                    </div>
                    <Link to="/login" className="luxury-button w-full py-4 text-sm font-bold flex items-center justify-center gap-2">
                       {t('auth.action_login')} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : car.current_rental ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-premium-900 border border-white/5 rounded-xl flex gap-3 items-start">
                       <AlertCircle className="w-5 h-5 text-silver-400 shrink-0 mt-0.5" />
                       <p className="text-xs text-silver-400 leading-relaxed italic">
                         {t('car_details.purchase_disabled_desc')}
                       </p>
                    </div>
                    <button disabled className="w-full py-4 rounded-lg font-bold uppercase tracking-widest bg-premium-800 text-silver-600 cursor-not-allowed border border-white/10">
                      {t('car_details.purchase_unavailable')}
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowPurchasePayment(true)}
                    disabled={purchasing || car.has_ongoing_deal}
                    className={`w-full py-4 text-lg transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${
                      car.has_ongoing_deal ? 'bg-premium-800 text-silver-600 cursor-not-allowed border border-white/10 opacity-50' : 'luxury-button'
                    }`}
                  >
                    {purchasing ? t('profile.saving') : car.has_ongoing_deal ? (
                      <>{t('car_details.ongoing_deal_label')}</>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" /> {t('car_details.initiate_purchase')}
                      </>
                    )}
                  </button>
                )}
                
                <p className="text-silver-500 text-xs text-center mt-4">{t('car_details.secure_transaction')}</p>
              </div>
            )}

            {car.has_ongoing_deal && (
              <div className="glass-panel p-6 rounded-2xl border border-gold-500/30 bg-gold-500/5 animate-fade-in">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-500 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-1">{t('car_details.ongoing_deal_label')}</h4>
                    <p className="text-xs text-silver-400 leading-relaxed italic">
                      {t('car_details.ongoing_deal_alert')}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {car.is_for_rent && (
              <div className="glass-panel p-8 rounded-2xl">
                 <p className="text-silver-400 text-sm font-medium uppercase tracking-wider mb-2">{t('car_details.experience_rent')}</p>
                 <div className="text-3xl font-bold text-white mb-1">${parseFloat(car.daily_rent_price).toLocaleString()} <span className="text-lg text-silver-400 font-normal">{t('car_details.per_day')}</span></div>
                 
                 <div className="my-6 space-y-4">
                    <div>
                      <label className="block text-xs text-silver-300 mb-1">{t('car_details.start_date')}</label>
                      <input 
                        type="date" 
                        min={new Date().toISOString().split('T')[0]}
                        className="luxury-input py-2 text-sm" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-silver-300 mb-1">{t('car_details.end_date')}</label>
                      <input 
                        type="date" 
                        min={startDate || new Date().toISOString().split('T')[0]}
                        className="luxury-input py-2 text-sm" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                 </div>

                 {daysCount > 0 && (
                   <div className="mb-6 animate-fade-in">
                     <div className="flex justify-between items-center text-silver-400 text-xs uppercase tracking-widest mb-1">
                        <span>{t('car_details.total_due')}</span>
                        <span>{t('car_details.days_count', { count: daysCount })}</span>
                     </div>
                     <div className="text-2xl font-bold text-gold-500">
                        ${totalAmount.toLocaleString()}
                     </div>
                   </div>
                 )}

                 {!isLoggedIn ? (
                    <div className="mt-8 space-y-4">
                      <div className="p-4 bg-premium-900 border border-gold-500/10 rounded-xl">
                        <p className="text-[10px] text-gold-500 font-bold uppercase tracking-widest mb-1">{t('auth.login_required_title')}</p>
                        <p className="text-[10px] text-silver-400 leading-relaxed italic text-center">
                          {t('auth.login_required_desc')}
                        </p>
                      </div>
                      <Link to="/login" className="luxury-button w-full py-4 text-sm font-bold flex items-center justify-center gap-2">
                        {t('auth.action_login')} <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : (
                    <>
                      {!isVerified ? (
                        <div className="mb-6 p-4 bg-premium-900 border border-white/5 rounded-xl">
                          <div className="flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-1">{t('car_details.trust_required')}</h4>
                              <p className="text-[10px] text-silver-400 leading-relaxed mb-3">{t('car_details.trust_required_desc')}</p>
                              <Link to="/trust-requests" className="text-xs text-gold-500 font-bold hover:text-gold-400 underline">{t('car_details.trust_btn')}</Link>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      <button 
                        disabled={!isVerified || booking || car.user_has_pending_request || !!car.current_rental || car.has_ongoing_deal}
                        onClick={handleBook}
                        className={`w-full py-4 rounded-lg font-semibold transition-all shadow-lg ${
                          (!isVerified || car.user_has_pending_request || !!car.current_rental) 
                            ? 'bg-premium-800 text-silver-600 cursor-not-allowed opacity-50' 
                            : 'bg-premium-800 text-gold-400 border border-gold-500/50 hover:bg-gold-500 hover:text-premium-900 shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] animate-shimmer'
                        }`}
                      >
                        {booking 
                          ? t('profile.saving') 
                          : (car.has_ongoing_deal
                              ? t('car_details.ongoing_deal_label')
                              : (car.current_rental
                                  ? t('car_details.currently_booked')
                                  : (car.user_has_pending_request 
                                      ? t('car_details.request_exists') 
                                      : t('car_details.reserve_btn'))))}
                      </button>
                    </>
                  )}
                </div>
             )}
           </div>
         </div>
       </div>

       {showPayment && (
         <VirtualPaymentGateway 
           amount={totalAmount}
           onSuccess={handlePaymentSuccess}
           onCancel={() => setShowPayment(false)}
         />
       )}

       {showPurchasePayment && car && (
         <VirtualPaymentGateway 
           amount={car.price}
           onSuccess={handlePurchaseSuccess}
           onCancel={() => setShowPurchasePayment(false)}
         />
       )}

       {/* Purchase Success Modal */}
       {purchaseSuccess && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-premium-900/90 backdrop-blur-sm animate-fade-in">
           <div className="glass-panel max-w-md w-full p-8 rounded-2xl border border-gold-500/30 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl font-black"></div>
              <div className="w-20 h-20 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-500 mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{t('car_details.purchase_success_title')}</h2>
              <p className="text-silver-400 text-sm leading-relaxed mb-8">
                {t('car_details.purchase_success_desc')}
              </p>
              <div className="flex flex-col gap-3">
                <Link to="/my-purchases" className="luxury-button w-full py-3 font-bold text-sm">
                  {t('my_purchases.heading')}
                </Link>
                <button onClick={() => setPurchaseSuccess(false)} className="text-silver-500 hover:text-white text-xs underline transition-colors">
                  {t('common.close', { defaultValue: 'Close' })}
                </button>
              </div>
           </div>
         </div>
       )}
     </div>
   );
}
