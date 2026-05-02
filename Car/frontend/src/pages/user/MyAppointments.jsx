import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, MapPin, Wrench, CheckCircle2, History, CreditCard, ArrowRight, FileText } from 'lucide-react';
import api from '../../utils/api';
import VirtualPaymentGateway from '../../components/ui/VirtualPaymentGateway';

export default function MyAppointments() {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/workshop/appointments/');
      setAppointments(response.data);
    } catch (e) {
      console.error("Failed to load appointments:", e);
    } finally {
      setLoading(false);
    }
  };

  const handlePayMaintenance = (appt) => {
    setPayingId(appt.id);
    const balance = parseFloat(appt.additional_parts_cost || 0) + parseFloat(appt.unforeseen_costs || 0);
    setPaymentAmount(balance);
    setShowPaymentGateway(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      const response = await api.post(`/workshop/appointments/${payingId}/pay_maintenance/`);
      if (response.status === 200 || response.status === 204) {
        setShowPaymentGateway(false);
        fetchAppointments();
      }
    } catch (e) {
      console.error("Payment sync failed:", e);
    } finally {
      setPayingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Pending': return 'bg-gold-500/10 text-gold-400 border-gold-500/20';
      case 'Cancelled': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-silver-500/10 text-silver-400 border-silver-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-premium-bg pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 md:mb-12 px-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-2 leading-none">
              {t('my_appointments.title')}
            </h1>
            <p className="text-silver-400 text-sm md:text-base font-medium">{t('my_appointments.subtitle')}</p>
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <div className="px-4 py-2 bg-gold-500 text-premium-900 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <History className="w-4 h-4" /> {t('my_appointments.all_history')}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-20 glass-panel border-dashed border-white/10 rounded-3xl">
            <Wrench className="w-16 h-16 text-silver-600 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">{t('my_appointments.no_appointments')}</h3>
            <p className="text-silver-400 mb-8">{t('my_appointments.no_appointments_desc')}</p>
            <button 
              onClick={() => window.location.href='/workshop/book'}
              className="luxury-button px-8 py-3 text-sm"
            >
              Book First Service
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {appointments.map((appt) => (
              <div key={appt.id} className="glass-panel p-6 md:p-8 rounded-3xl border border-white/5 hover:border-gold-500/20 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative flex flex-col lg:flex-row lg:items-center gap-8">
                  {/* Service Icon & Badge */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-premium-800 rounded-2xl flex items-center justify-center text-gold-500 border border-white/5 shadow-xl">
                      <Wrench className="w-8 h-8" />
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="flex-grow space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold text-white tracking-wide">
                        {appt.service_details?.name ? (
                          t(`booking.services_list.${appt.service_details.name}.name`, { defaultValue: appt.service_details.name })
                        ) : 'Vehicle Service'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(appt.status)}`}>
                        {t(`my_appointments.status.${appt.status}`, { defaultValue: appt.status })}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-8">
                      <div className="flex items-center gap-2 text-silver-400">
                        <Calendar className="w-4 h-4 text-gold-500/60" />
                        <span className="text-sm font-medium">{appt.scheduled_date || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-silver-400">
                        <Clock className="w-4 h-4 text-gold-500/60" />
                        <span className="text-sm font-medium">{appt.scheduled_time || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-silver-400">
                        <MapPin className="w-4 h-4 text-gold-500/60" />
                        <span className="text-sm font-medium">
                          {appt.is_home_service ? t('booking.mobile_home') : (appt.workshop_name || t('booking.at_workshop'))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment & Action */}
                  <div className="lg:text-right border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-10 min-w-[200px]">
                    <div className="mb-4">
                      <p className="text-[10px] text-silver-500 font-black uppercase tracking-widest mb-1">{t('my_appointments.payment_status')}</p>
                      <div className="flex items-center lg:justify-end gap-2">
                        <CreditCard className="w-4 h-4 text-silver-400" />
                        <span className="text-sm font-bold text-white uppercase tracking-tighter">
                          {appt.payment_status || 'Pending'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-lg font-black text-gold-500 tracking-tighter">${parseFloat(appt.total_amount || 0).toLocaleString()}</p>
                      
                      {appt.status === 'Maintenance_Done' ? (
                        <button 
                          onClick={() => handlePayMaintenance(appt)}
                          className="luxury-button px-4 py-2 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-gold-500/10"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          {t('my_appointments.settle_payment') || 'Settle & Finalize'}
                        </button>
                      ) : (
                        <div className="flex flex-col lg:flex-row gap-2 lg:items-center lg:justify-end">
                          <button 
                            onClick={() => setExpandedId(expandedId === appt.id ? null : appt.id)}
                            className="text-[10px] text-silver-400 hover:text-white font-black uppercase tracking-widest flex items-center justify-start lg:justify-end gap-1.5 transition-colors px-2 py-1"
                          >
                            <FileText className="w-3 h-3" /> {expandedId === appt.id ? 'Hide Details' : 'View Summary'}
                          </button>
                          <button 
                            onClick={() => window.location.href=`/workshop/track?id=${appt.id}`}
                            className="text-[10px] text-gold-400 hover:text-white font-black uppercase tracking-widest flex items-center justify-start lg:justify-end gap-1.5 transition-colors"
                          >
                            {t('my_appointments.track_progress')} <ArrowRight className="w-3 h-3 text-gold-500 rtl:rotate-180" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Detailed Breakdown Expansion */}
                {expandedId === appt.id && (
                  <div className="mt-8 pt-8 border-t border-white/5 animate-fade-in text-left">
                    <div className="flex items-center gap-2 mb-6">
                      <History className="w-4 h-4 text-gold-500" />
                      <h4 className="text-xs font-black text-silver-400 uppercase tracking-widest">{t('my_appointments.order_details')}</h4>
                    </div>

                    {(appt.status === 'Rejected' || appt.status === 'Cancelled') && appt.manager_notes && (
                      <div className="mb-8 p-6 rounded-2xl bg-red-500/5 border border-red-500/20 animate-pulse">
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-2 h-2 rounded-full bg-red-500"></div>
                           <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">{t('admin.workshop_dashboard.management_note')}</p>
                        </div>
                        <p className="text-sm font-medium text-white italic">"{appt.manager_notes}"</p>
                      </div>
                    )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Identification */}
                    <div className="space-y-4">
                      <p className="text-[10px] text-silver-500 font-black uppercase tracking-widest">{t('my_appointments.assigned_tech')}</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gold-500 font-bold">
                          {appt.technician_name?.[0] || '?'}
                        </div>
                        <p className="text-white font-bold text-sm">{appt.technician_name || t('admin.workshop_dashboard.status_unassigned')}</p>
                      </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">{t('admin.workshop_dashboard.paid_deposit')}</p>
                        <span className="text-[8px] border border-green-500/20 text-green-500 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Settled</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-silver-400">{t('my_appointments.service_base')}</span>
                          <span className="text-white font-mono font-bold">${Number(appt.service_details?.base_price || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-silver-400">{t('my_appointments.fees')}</span>
                          <span className="text-white font-mono font-bold">
                            ${(Number(appt.total_amount || 0) - 
                               Number(appt.additional_parts_cost || 0) - 
                               Number(appt.unforeseen_costs || 0) - 
                               Number(appt.service_details?.base_price || 0)).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Extras / Balance Due */}
                    <div className="space-y-4">
                      <p className="text-[10px] text-gold-500 font-black uppercase tracking-widest">{t('admin.workshop_dashboard.balance_due')}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-silver-400">{t('my_appointments.total_parts')}</span>
                          <span className="text-white font-mono font-bold">${Number(appt.additional_parts_cost || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-silver-400">{t('my_appointments.unforeseen_costs')}</span>
                          <span className="text-white font-mono font-bold">${Number(appt.unforeseen_costs || 0).toLocaleString()}</span>
                        </div>
                        <div className="pt-2 border-t border-white/5 flex justify-between text-xs">
                          <span className="text-gold-500 font-black uppercase tracking-widest">{t('admin.workshop_dashboard.balance_due')}</span>
                          <span className="text-gold-500 font-mono font-black italic">${(Number(appt.additional_parts_cost || 0) + Number(appt.unforeseen_costs || 0)).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Parts List if applicable */}
                  {(appt.parts?.length || 0) > 0 && (
                    <div className="mt-8 pt-6 border-t border-white/5">
                      <p className="text-[10px] text-silver-500 font-black uppercase tracking-widest mb-4">{t('admin.workshop_dashboard.requisition_parts')}</p>
                      <div className="flex flex-wrap gap-3">
                        {appt.parts.map(p => (
                          <div key={p.id} className="bg-white/5 border border-white/5 rounded-xl px-4 py-2 flex items-center gap-3">
                            <span className="text-[10px] font-black text-gold-500 font-mono">x{p.quantity}</span>
                            <span className="text-xs text-white font-medium">{p.part_details?.name || 'Spare Part'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showPaymentGateway && (
        <VirtualPaymentGateway 
          amount={paymentAmount}
          onSuccess={handlePaymentSuccess}
          onCancel={() => {
            setShowPaymentGateway(false);
            setPayingId(null);
          }}
        />
      )}
    </div>
  );
}
