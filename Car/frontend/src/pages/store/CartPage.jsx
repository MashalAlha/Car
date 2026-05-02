import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Package, Wrench, Trash2, Plus, Minus, Building2, Calendar, Clock, MapPin, ArrowRight, CreditCard, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import api from '../../utils/api';
import VirtualPaymentGateway from '../../components/ui/VirtualPaymentGateway';

export default function CartPage() {
  const { t } = useTranslation();
  const { cartItems, installableItems, selfInstallItems, subtotal, removeFromCart, updateQuantity, clearCart } = useCart();

  // Workshop booking state
  const [wantInstallation, setWantInstallation] = useState(false);
  const [workshopStep, setWorkshopStep] = useState(1); // 1=workshop, 2=schedule, 3=location
  const [workshops, setWorkshops] = useState([]);
  const [wsLoading, setWsLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [workshopData, setWorkshopData] = useState({
    workshopId: '',
    workshopName: '',
    date: '',
    time: '',
    isHomeService: false,
    address: '',
    onSiteFee: 0,
    mobileFee: 0
  });

  // Payment state
  const [showPayment, setShowPayment] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [processing, setProcessing] = useState(false);

  const workshopFee = wantInstallation
    ? (workshopData.isHomeService ? workshopData.mobileFee : workshopData.onSiteFee)
    : 0;
  const grandTotal = subtotal + workshopFee;

  // Fetch workshops filtered to Maintenance_Accessories category
  useEffect(() => {
    if (wantInstallation && workshopStep === 1) {
      fetchWorkshops();
    }
  }, [wantInstallation, workshopStep]);

  // Fetch booked slots when date/workshop changes  
  useEffect(() => {
    if (workshopData.date && workshopData.workshopId && workshopStep === 2) {
      fetchBookedSlots(workshopData.workshopId, workshopData.date);
    }
  }, [workshopData.date, workshopData.workshopId, workshopStep]);

  const fetchWorkshops = async () => {
    setWsLoading(true);
    try {
      const resp = await api.get('/workshop/facilities/');
      const filtered = resp.data.filter(w => w.category === 'Maintenance_Accessories');
      setWorkshops(filtered);
    } catch (e) { console.error(e); }
    finally { setWsLoading(false); }
  };

  const fetchBookedSlots = async (wsId, date) => {
    try {
      const resp = await api.get(`/workshop/facilities/${wsId}/booked_slots/?date=${date}`);
      setBookedSlots(resp.data);
    } catch (e) { console.error(e); }
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

  const isWorkshopBookingComplete = wantInstallation
    ? (workshopData.workshopId && workshopData.date && workshopData.time)
    : true;

  const onPaymentSuccess = async (paymentData) => {
    setShowPayment(false);
    setProcessing(true);
    try {
      const payload = {
        items: cartItems.map(item => ({ part_id: item.id, quantity: item.quantity })),
        requires_installation: wantInstallation,
        payment_transaction_id: paymentData.transaction_id
      };

      if (wantInstallation) {
        payload.workshop_id = workshopData.workshopId;
        payload.scheduled_date = workshopData.date;
        payload.scheduled_time = workshopData.time;
        payload.is_home_service = workshopData.isHomeService;
        payload.address_notes = workshopData.address;
        payload.workshop_fee = workshopFee;
      }

      const resp = await api.post('/store/orders/', payload);

      const result = resp.data;
      setOrderResult(result);
      setOrderSuccess(true);
      clearCart();
    } catch (e) {
      console.error(e);
      const detail = e.response?.data?.detail || 'Order failed. Please try again.';
      alert(detail);
    } finally {
      setProcessing(false);
    }
  };

  // SUCCESS STATE
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-premium-950 flex items-center justify-center px-4 pt-24">
        <div className="glass-panel-premium p-12 rounded-[2rem] border border-white/5 shadow-2xl max-w-lg text-center animate-slide-up">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/10 mb-8 border border-green-500/20">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">{t('cart.order_confirmed')}</h2>
          <p className="text-silver-400 mb-8 text-sm">{t('cart.order_confirmed_desc')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/my-orders" className="luxury-button px-8 py-3 text-xs uppercase font-black tracking-widest">
              {t('cart.view_orders')}
            </Link>
            <Link to="/store" className="luxury-button-secondary px-8 py-3 text-xs uppercase font-black tracking-widest">
              {t('cart.continue_shopping')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // EMPTY CART STATE
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-premium-950 flex items-center justify-center px-4 pt-24">
        <div className="text-center">
          <ShoppingCart className="w-24 h-24 text-white/5 mx-auto mb-8" />
          <h2 className="text-3xl font-black text-silver-400 mb-4 uppercase tracking-tighter">{t('cart.empty_title')}</h2>
          <p className="text-silver-600 mb-10 text-sm max-w-md mx-auto">{t('cart.empty_desc')}</p>
          <Link to="/store" className="luxury-button px-10 py-4 text-sm font-black uppercase tracking-widest inline-flex items-center gap-3">
            <ShoppingCart className="w-5 h-5" /> {t('cart.browse_store')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-premium-950 pt-28 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-black luxury-gradient-text mb-3 uppercase tracking-tighter">{t('cart.title')}</h1>
          <p className="text-silver-400 text-sm font-medium">{t('cart.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN CONTENT: Products + Workshop */}
          <div className="lg:col-span-2 space-y-8">

            {/* SECTION 1: INSTALLATION AVAILABLE PRODUCTS */}
            {installableItems.length > 0 && (
              <div className="glass-panel-premium rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-5 border-b border-white/5 flex items-center gap-3 bg-gold-500/5">
                  <Wrench className="w-5 h-5 text-gold-500" />
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest">{t('cart.installation_available')}</h3>
                  <span className="text-gold-500 text-xs font-black bg-gold-500/10 px-2 py-0.5 rounded-full">{installableItems.length}</span>
                </div>
                <div className="divide-y divide-white/5">
                  {installableItems.map(item => (
                    <CartItemRow key={item.id} item={item} onRemove={removeFromCart} onUpdate={updateQuantity} t={t} />
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 2: SELF-INSTALL / PICKUP PRODUCTS */}
            {selfInstallItems.length > 0 && (
              <div className="glass-panel-premium rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-5 border-b border-white/5 flex items-center gap-3">
                  <Package className="w-5 h-5 text-silver-400" />
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest">{t('cart.self_install')}</h3>
                  <span className="text-silver-500 text-xs font-black bg-white/5 px-2 py-0.5 rounded-full">{selfInstallItems.length}</span>
                </div>
                <div className="divide-y divide-white/5">
                  {selfInstallItems.map(item => (
                    <CartItemRow key={item.id} item={item} onRemove={removeFromCart} onUpdate={updateQuantity} t={t} />
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 3: WORKSHOP BOOKING TOGGLE */}
            {installableItems.length > 0 && (
              <div className="glass-panel-premium rounded-2xl border border-white/5 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-gold-500" />
                    <h3 className="text-white font-bold text-sm uppercase tracking-widest">{t('cart.workshop_booking')}</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wantInstallation}
                      onChange={(e) => {
                        setWantInstallation(e.target.checked);
                        if (!e.target.checked) {
                          setWorkshopStep(1);
                          setWorkshopData({ workshopId: '', workshopName: '', date: '', time: '', isHomeService: false, address: '', onSiteFee: 0, mobileFee: 0 });
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-gold-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
                <p className="text-silver-500 text-xs mb-6">{t('cart.workshop_booking_desc')}</p>

                {wantInstallation && (
                  <div className="animate-fade-in space-y-6">
                    {/* Progress Bar */}
                    <div className="flex items-center justify-between mb-6 px-4">
                      {[1, 2, 3].map((num) => (
                        <div key={num} className="flex flex-col items-center relative z-10">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all duration-500 ${workshopStep >= num ? 'bg-gold-500 text-premium-900 shadow-[0_0_20px_rgba(212,175,55,0.3)]' : 'bg-white/5 text-silver-600 border border-white/10'}`}>
                            {num}
                          </div>
                          <span className="text-[8px] text-silver-600 mt-1 font-bold uppercase tracking-widest">
                            {num === 1 ? t('cart.ws_step_workshop') : num === 2 ? t('cart.ws_step_schedule') : t('cart.ws_step_location')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* WS STEP 1: Select Workshop */}
                    {workshopStep === 1 && (
                      <div className="space-y-3 animate-slide-up">
                        <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">{t('cart.select_workshop')}</h4>
                        {wsLoading ? (
                          <div className="py-12 flex flex-col items-center gap-3 text-gold-500/50">
                            <div className="w-8 h-8 border-3 border-gold-500/10 border-t-gold-500 rounded-full animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">{t('cart.scanning_facilities')}</span>
                          </div>
                        ) : workshops.map(ws => (
                          <button
                            key={ws.id}
                            onClick={() => {
                              setWorkshopData(prev => ({
                                ...prev,
                                workshopId: ws.id,
                                workshopName: ws.name,
                                onSiteFee: parseFloat(ws.on_site_fee || 0),
                                mobileFee: parseFloat(ws.mobile_fee || 0)
                              }));
                              setWorkshopStep(2);
                            }}
                            className="w-full p-5 rounded-xl border border-white/5 bg-white/5 hover:border-gold-500/50 hover:bg-gold-500/5 text-left flex items-center justify-between transition-all group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-premium-800 rounded-lg flex items-center justify-center text-gold-500 border border-white/5">
                                <Building2 className="w-5 h-5" />
                              </div>
                              <div>
                                <h5 className="text-white font-bold text-sm">{ws.name}</h5>
                                <p className="text-silver-500 text-[10px]">{ws.working_days} | {ws.working_hours}</p>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gold-500 opacity-0 group-hover:opacity-100 transition-all" />
                          </button>
                        ))}
                        {!wsLoading && workshops.length === 0 && (
                          <p className="text-center text-silver-500 py-8 text-sm">{t('cart.no_workshops')}</p>
                        )}
                      </div>
                    )}

                    {/* WS STEP 2: Schedule */}
                    {workshopStep === 2 && (
                      <div className="space-y-6 animate-slide-up max-w-lg mx-auto">
                        <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">{t('cart.schedule_session')}</h4>
                        <div>
                          <label className="block text-[10px] font-black text-silver-500 uppercase tracking-widest mb-2">{t('cart.appointment_date')}</label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500/40" />
                            <input
                              type="date"
                              className="luxury-input pl-14 w-full"
                              value={workshopData.date}
                              onChange={e => setWorkshopData(prev => ({ ...prev, date: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-silver-500 uppercase tracking-widest mb-2">{t('cart.time_slot')}</label>
                          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                            {TIME_SLOTS.map(tStr => {
                              const booked = isSlotBooked(tStr);
                              return (
                                <button
                                  key={tStr}
                                  type="button"
                                  disabled={booked}
                                  onClick={() => setWorkshopData(prev => ({ ...prev, time: tStr }))}
                                  className={`py-2.5 text-[10px] font-black rounded-lg border transition-all ${
                                    workshopData.time === tStr
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
                    )}

                    {/* WS STEP 3: Location & Fees */}
                    {workshopStep === 3 && (
                      <div className="space-y-6 animate-slide-up max-w-lg mx-auto">
                        <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">{t('cart.service_location')}</h4>
                        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
                          <button
                            type="button"
                            onClick={() => setWorkshopData(prev => ({ ...prev, isHomeService: false }))}
                            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${!workshopData.isHomeService ? 'bg-gold-500 text-premium-900 shadow-xl' : 'text-silver-500 hover:text-white'}`}
                          >
                            {t('cart.at_workshop')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setWorkshopData(prev => ({ ...prev, isHomeService: true }))}
                            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${workshopData.isHomeService ? 'bg-gold-500 text-premium-900 shadow-xl' : 'text-silver-500 hover:text-white'}`}
                          >
                            {t('cart.mobile_home')}
                          </button>
                        </div>

                        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-gold-500/5">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-silver-400 text-sm">{t('cart.workshop_name')}</span>
                            <span className="text-white font-bold text-sm">{workshopData.workshopName}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-silver-400 text-sm">{t('cart.location_fee')}</span>
                            <span className="text-gold-500 font-bold">${workshopData.isHomeService ? workshopData.mobileFee : workshopData.onSiteFee}</span>
                          </div>
                        </div>

                        {workshopData.isHomeService && (
                          <div className="animate-fade-in">
                            <label className="block text-[10px] font-black text-silver-500 uppercase tracking-widest mb-2">{t('cart.address_label')}</label>
                            <input
                              type="text"
                              placeholder={t('cart.address_placeholder')}
                              className="luxury-input w-full"
                              value={workshopData.address}
                              onChange={e => setWorkshopData(prev => ({ ...prev, address: e.target.value }))}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Workshop Navigation */}
                    {workshopStep > 1 && (
                      <div className="flex justify-between pt-4 border-t border-white/5">
                        <button
                          onClick={() => setWorkshopStep(s => s - 1)}
                          className="text-silver-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors"
                        >
                          {t('cart.btn_back')}
                        </button>
                        {workshopStep < 3 && (
                          <button
                            disabled={workshopStep === 2 && (!workshopData.date || !workshopData.time)}
                            onClick={() => setWorkshopStep(s => s + 1)}
                            className="luxury-button px-6 py-2 flex items-center gap-2 text-xs uppercase font-black tracking-widest disabled:opacity-30"
                          >
                            {t('cart.btn_continue')} <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SIDEBAR: Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass-panel-premium rounded-2xl border border-white/5 p-6 sticky top-28">
              <h3 className="text-white font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gold-500" /> {t('cart.order_summary')}
              </h3>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-silver-400">
                  <span>{t('cart.products')} ({cartItems.length})</span>
                  <span className="text-white font-bold">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                {wantInstallation && workshopData.workshopId && (
                  <div className="flex justify-between text-silver-400 animate-fade-in">
                    <span className="flex items-center gap-1"><Wrench className="w-3 h-3 text-gold-500" /> {t('cart.workshop_fee')}</span>
                    <span className="text-gold-500 font-bold">${workshopFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-black border-t border-white/10 pt-4 mt-4">
                  <span className="text-white">{t('cart.grand_total')}</span>
                  <span className="text-gold-500">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {wantInstallation && workshopData.workshopId && (
                <div className="mb-6 p-3 rounded-xl bg-gold-500/5 border border-gold-500/20 text-[10px] space-y-1 animate-fade-in">
                  <div className="flex justify-between text-silver-400">
                    <span>{t('cart.workshop_label')}</span>
                    <span className="text-white font-bold">{workshopData.workshopName}</span>
                  </div>
                  {workshopData.date && (
                    <div className="flex justify-between text-silver-400">
                      <span>{t('cart.date_label')}</span>
                      <span className="text-white font-bold">{workshopData.date} @ {workshopData.time}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-silver-400">
                    <span>{t('cart.location_label')}</span>
                    <span className="text-white font-bold">{workshopData.isHomeService ? t('cart.mobile_home') : t('cart.at_workshop')}</span>
                  </div>
                </div>
              )}

              <button
                disabled={!isWorkshopBookingComplete || processing}
                onClick={() => setShowPayment(true)}
                className="w-full luxury-button py-4 text-xs uppercase font-black tracking-widest flex items-center justify-center gap-3 disabled:opacity-30"
              >
                {processing ? (
                  <span className="animate-pulse">{t('cart.processing')}</span>
                ) : (
                  <><ShieldCheck className="w-4 h-4" /> {t('cart.proceed_to_payment')}</>
                )}
              </button>

              {wantInstallation && !isWorkshopBookingComplete && (
                <p className="text-center text-[10px] text-amber-500/80 font-bold mt-3">{t('cart.complete_booking_first')}</p>
              )}

              <div className="flex items-center justify-center gap-2 text-[9px] text-silver-600 font-bold uppercase tracking-widest mt-4">
                <ShieldCheck className="w-3 h-3 text-gold-500/50" /> {t('cart.secure_checkout')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPayment && (
        <VirtualPaymentGateway
          amount={grandTotal}
          onSuccess={onPaymentSuccess}
          onCancel={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}

// ────── Cart Item Row Component ──────
function CartItemRow({ item, onRemove, onUpdate, t }) {
  return (
    <div className="flex gap-4 p-4 group">
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-premium-800 border border-white/5 flex-shrink-0">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-white/10" /></div>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <p className="text-[9px] uppercase tracking-widest text-gold-500 font-bold">{item.brand || 'Collection'}</p>
          <h4 className="text-sm font-bold text-white leading-tight truncate">{item.name}</h4>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onUpdate(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-silver-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-white font-black text-sm min-w-[24px] text-center">{item.quantity}</span>
            <button
              onClick={() => onUpdate(item.id, item.quantity + 1)}
              className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-silver-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gold-500 font-black text-sm">${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <button
              onClick={() => onRemove(item.id)}
              className="p-1.5 text-silver-600 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
