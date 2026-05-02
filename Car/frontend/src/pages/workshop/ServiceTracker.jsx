import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FileText, Wrench, CheckCircle, ChevronRight, Activity, Calendar, Clock, Building2, MapPin, CreditCard, History, LogOut } from 'lucide-react';
import api from '../../utils/api';

export default function ServiceTracker() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('id');
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/workshop/appointments/${orderId}/`);
      setData(response.data);
    } catch (err) {
      console.error(err);
      setError("Could not find order details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-premium-bg flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-premium-bg flex items-center justify-center p-4">
      <div className="glass-panel p-8 rounded-3xl text-center max-w-md">
        <Activity className="w-12 h-12 text-red-500 mx-auto mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-white mb-2">{error || "Unauthorized Access"}</h2>
        <p className="text-silver-400 mb-6 text-sm">We couldn't retrieve the tracking information for this service request.</p>
        <button onClick={() => window.history.back()} className="luxury-button px-6 py-2 text-xs">Return Back</button>
      </div>
    </div>
  );

  // Logic to determine step status
  // 1: Requested, 2: In Service, 3: Ready
  const getCurrentStepStatus = () => {
    if (data.status === 'Completed' || data.status === 'Maintenance_Done') return 3;
    if (data.work_order_status === 'In_Progress' || data.status === 'Approved') return 2;
    return 1;
  };

  const currentStep = getCurrentStepStatus();

  const steps = [
    { id: 1, title: t('tracker.step1_title'), description: t('tracker.step1_desc'), icon: <FileText /> },
    { id: 2, title: t('tracker.step2_title'), description: t('tracker.step2_desc'), icon: <Wrench /> },
    { id: 3, title: t('tracker.step3_title'), description: t('tracker.step3_desc'), icon: <CheckCircle /> },
  ];

  // Calculation Logic
  const baseServicePrice = Number(data.service_details?.base_price || 0);
  const additionalParts = Number(data.additional_parts_cost || 0);
  const unforeseen = Number(data.unforeseen_costs || 0);
  const grandTotal = Number(data.total_amount || 0);
  const initialBookingFeeFull = grandTotal - additionalParts - unforeseen;
  const locationFee = initialBookingFeeFull - baseServicePrice;

  return (
    <div className="min-h-screen bg-premium-bg pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase mb-2 flex items-center gap-3">
              <Activity className="text-gold-500 animate-pulse w-8 h-8" /> {t('tracker.title')}
            </h1>
            <p className="text-silver-500 text-[10px] font-black tracking-[0.3em] uppercase">{t('tracker.tracking_id', { id: data.id })}</p>
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <span className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${data.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 'bg-gold-500 text-premium-900'}`}>
               {t(`my_appointments.status.${data.status}`, { defaultValue: data.status })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Timeline */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-panel-premium p-8 rounded-[40px] border border-white/5">
              <div className="relative">
                <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-white/5"></div>
                
                {(data.status === 'Rejected' || data.status === 'Cancelled') && data.manager_notes && (
                  <div className="mb-10 p-8 rounded-[32px] bg-red-500/5 border border-red-500/20 relative overflow-hidden backdrop-blur-sm">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]"></div>
                    <div className="flex items-center gap-3 mb-4">
                       <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                          <LogOut className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.2em]">{t('admin.workshop_dashboard.management_note')}</p>
                          <h4 className="text-lg font-bold text-white tracking-tight leading-none mt-1">
                            {data.status === 'Rejected' ? t('my_appointments.status.Rejected') : t('my_appointments.status.Cancelled')}
                          </h4>
                       </div>
                    </div>
                    <p className="text-silver-300 text-sm italic font-medium leading-relaxed bg-white/2 p-4 rounded-2xl border border-white/5">
                      "{data.manager_notes}"
                    </p>
                  </div>
                )}
                
                <div className="space-y-12">
                  {steps.map((step) => {
                    const isCompleted = currentStep > step.id;
                    const isCurrent = currentStep === step.id;
                    
                    return (
                      <div key={step.id} className={`flex gap-6 relative z-10 transition-all duration-700 ${isCurrent ? 'opacity-100' : isCompleted ? 'opacity-70' : 'opacity-30 grayscale'}`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl border-2 transition-all duration-500 ${isCurrent ? 'bg-premium-900 border-gold-500 text-gold-500 scale-110 shadow-gold-500/20' : isCompleted ? 'bg-gold-500 border-gold-500 text-premium-900' : 'bg-premium-800 border-white/10 text-silver-500'}`}>
                          {step.icon}
                        </div>
                        <div className="pt-2">
                          <h4 className={`text-lg font-bold tracking-tight ${isCurrent ? 'text-gold-400' : 'text-white'}`}>{step.title}</h4>
                          <p className="text-silver-400 text-sm mt-1 max-w-sm">{step.description}</p>
                          
                          {isCurrent && (
                            <div className="mt-6 bg-white/2 border border-white/5 rounded-2xl p-5 animate-fade-in relative overflow-hidden group">
                              <div className="absolute top-0 left-0 w-1 h-full bg-gold-500 shadow-[0_0_15px_rgba(212,175,55,0.5)]"></div>
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-black text-silver-500 uppercase tracking-widest">{t('tracker.live_update')}</span>
                                <span className="text-[10px] text-silver-600 font-mono font-bold tracking-tighter">{t('car_details.loading')}</span>
                              </div>
                              <p className="text-sm text-white font-medium leading-relaxed italic">
                                {data.technician_notes || "Your vehicle is currently in queue for its next service phase. Our specialists are ensuring every detail meets our elite standards."}
                              </p>
                              <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-gold-500 uppercase tracking-widest">
                                <Activity className="w-3.5 h-3.5" /> {t('tracker.tech_label')}: {data.technician_name || "Assigning Specialist..."}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Itemized Parts Requisition */}
            {data.parts?.length > 0 && (
              <div className="glass-panel p-8 rounded-[40px] border border-white/5">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-xs font-black text-silver-400 uppercase tracking-widest flex items-center gap-2 italic">
                     <Wrench className="w-4 h-4 text-gold-500" /> {t('admin.workshop_dashboard.requisition_parts')}
                   </h3>
                   <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold text-silver-500 uppercase tracking-tighter">{data.parts.length} Items Indexed</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.parts.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-white/2 border border-white/5 rounded-2xl hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-premium-900 border border-white/5 flex items-center justify-center text-[10px] font-black text-gold-500 font-mono">x{p.quantity}</div>
                         <div>
                            <p className="text-xs font-bold text-white mb-0.5">{p.part_details.name}</p>
                            <p className="text-[9px] text-silver-500 font-mono tracking-tighter font-bold uppercase">{p.part_details.sku}</p>
                         </div>
                      </div>
                      <p className="text-xs font-bold text-silver-400 font-mono">${(p.price_at_time * p.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Detailed Summary Card */}
          <div className="space-y-6">
            <div className="glass-panel p-8 rounded-[40px] border border-gold-500/10 bg-gold-500/[0.02] sticky top-28">
              <div className="flex items-center gap-2 mb-8 border-b border-white/5 pb-6">
                <CreditCard className="w-5 h-5 text-gold-500" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('my_appointments.order_details')}</h3>
              </div>

              <div className="space-y-8">
                {/* Vehicle & Core Details */}
                <div className="space-y-4">
                   <div className="flex items-start gap-4 p-4 rounded-3xl bg-white/5 border border-white/5">
                      <div className="w-12 h-12 rounded-2xl bg-premium-800 flex items-center justify-center text-gold-500 border border-white/5 shadow-xl">
                        <Activity className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] text-silver-500 font-black uppercase tracking-widest mb-1">Service Type</p>
                        <p className="text-sm font-bold text-white leading-tight">
                          {data.service_details?.name ? t(`booking.services_list.${data.service_details.name}.name`, { defaultValue: data.service_details.name }) : 'Maintenance'}
                        </p>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-2xl bg-white/2 border border-white/5">
                        <p className="text-[9px] text-silver-600 font-black uppercase tracking-widest mb-2 flex items-center gap-1.5"><Calendar className="w-3 h-3 text-gold-500/50" /> Date</p>
                        <p className="text-xs font-bold text-white">{data.scheduled_date}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/2 border border-white/5">
                        <p className="text-[9px] text-silver-600 font-black uppercase tracking-widest mb-2 flex items-center gap-1.5"><Clock className="w-3 h-3 text-gold-500/50" /> Time</p>
                        <p className="text-xs font-bold text-white">{data.scheduled_time}</p>
                      </div>
                   </div>

                   <div className="p-4 rounded-2xl bg-white/2 border border-white/5">
                      <p className="text-[9px] text-silver-600 font-black uppercase tracking-widest mb-2 flex items-center gap-1.5"><Building2 className="w-3 h-3 text-gold-500/50" /> Facility</p>
                      <p className="text-xs font-bold text-white">{data.workshop_name}</p>
                   </div>
                </div>

                {/* Financial Sections */}
                <div className="pt-6 border-t border-white/5 space-y-4">
                   <div className="flex items-center justify-between">
                     <p className="text-[10px] text-green-500 font-black uppercase tracking-[0.2em]">{t('admin.workshop_dashboard.paid_deposit')}</p>
                     <span className="text-[8px] border border-green-500/20 text-green-500 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Settled</span>
                   </div>
                   <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-silver-400">{t('my_appointments.service_base')}</span>
                        <span className="text-white font-mono font-bold">${baseServicePrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-silver-400">{t('my_appointments.fees')}</span>
                        <span className="text-white font-mono font-bold">${locationFee.toLocaleString()}</span>
                      </div>
                   </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                  <p className="text-[10px] text-gold-500 font-black uppercase tracking-[0.2em]">{t('admin.workshop_dashboard.balance_due')}</p>
                  <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-silver-400">{t('my_appointments.total_parts')}</span>
                        <span className="text-white font-mono font-bold">${additionalParts.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-silver-400">{t('my_appointments.unforeseen_costs')}</span>
                        <span className="text-white font-mono font-bold">${unforeseen.toLocaleString()}</span>
                      </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                   <div>
                     <p className="text-[10px] text-silver-500 font-bold uppercase tracking-widest mb-1">{t('admin.workshop_dashboard.total_order_value')}</p>
                     <div className="flex items-center gap-2">
                        <p className="text-xs font-black uppercase tracking-[0.3em] font-mono text-gold-500/80 italic">{data.payment_status}</p>
                        <span className="w-1 h-1 rounded-full bg-silver-500"></span>
                        <p className="text-xs font-bold text-silver-500 uppercase tracking-widest">{t('admin.workshop_dashboard.balance_due')}: ${(additionalParts + unforeseen).toLocaleString()}</p>
                     </div>
                   </div>
                   <p className="text-3xl font-black text-gold-500 font-mono tracking-tighter italic">${grandTotal.toLocaleString()}</p>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/catalog')}
                className="w-full mt-6 luxury-button py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <ChevronRight className="w-4 h-4 rotate-180" /> {t('car_details.back_to_catalog')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
