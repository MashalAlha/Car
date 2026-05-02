import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, ShoppingBag, Wrench, Clock, ChevronDown, ChevronUp, MapPin, Calendar, CreditCard, Building2 } from 'lucide-react';
import api from '../../utils/api';

const STATUS_CONFIG = {
  Paid: { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', label: 'my_orders.status_paid' },
  Prepared: { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', label: 'my_orders.status_prepared' },
  Out_For_Delivery: { color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', label: 'my_orders.status_out_for_delivery' },
  Delivered: { color: 'text-green-400 bg-green-500/10 border-green-500/20', label: 'my_orders.status_delivered' },
  Ready_For_Installation: { color: 'text-gold-500 bg-gold-500/10 border-gold-500/20', label: 'my_orders.status_ready_install' },
  Delivered_With_Installation: { color: 'text-green-400 bg-green-500/10 border-green-500/20', label: 'my_orders.status_delivered_installed' },
  Delivered_Only: { color: 'text-silver-400 bg-white/5 border-white/10', label: 'my_orders.status_delivered_only' },
};

export default function MyOrders() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const resp = await api.get('/store/orders/');
      setOrders(resp.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-premium-950 pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-black luxury-gradient-text mb-3 uppercase tracking-tighter">{t('my_orders.title')}</h1>
          <p className="text-silver-400 text-sm font-medium">{t('my_orders.subtitle')}</p>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-3 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
            <p className="text-silver-500 text-xs font-black uppercase tracking-widest">{t('my_orders.loading')}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-20 h-20 text-white/5 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-silver-400 mb-3">{t('my_orders.empty_title')}</h3>
            <p className="text-silver-600 text-sm mb-8">{t('my_orders.empty_desc')}</p>
            <a href="/store" className="luxury-button px-8 py-3 text-xs font-black uppercase tracking-widest inline-flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> {t('my_orders.browse_store')}
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const isExpanded = expandedId === order.id;
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.Paid;
              return (
                <div key={order.id} className="glass-panel-premium rounded-2xl border border-white/5 overflow-hidden">
                  {/* Order Header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    className="w-full p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-premium-800 border border-white/5 flex items-center justify-center">
                        {order.requires_installation ? <Wrench className="w-5 h-5 text-gold-500" /> : <Package className="w-5 h-5 text-silver-400" />}
                      </div>
                      <div className="text-left">
                        <p className="text-white font-bold text-sm">#{order.id}</p>
                        <p className="text-silver-500 text-[10px] font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${cfg.color}`}>
                        {t(cfg.label)}
                      </span>
                      <span className="text-gold-500 font-black text-sm">${parseFloat(order.total_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-silver-500" /> : <ChevronDown className="w-4 h-4 text-silver-500" />}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-white/5 p-5 space-y-6 animate-fade-in">
                      {/* Items */}
                      <div>
                        <h4 className="text-[10px] font-black text-silver-500 uppercase tracking-widest mb-3">{t('my_orders.ordered_items')}</h4>
                        <div className="space-y-2">
                          {(order.items || []).map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-premium-800/50 rounded-xl border border-white/5">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-premium-900 flex-shrink-0">
                                {item.part_details?.image ? (
                                  <img src={item.part_details.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-white/10" /></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-bold truncate">{item.part_details?.name}</p>
                                <p className="text-silver-500 text-[10px]">{t('my_orders.qty')}: {item.quantity} × ${parseFloat(item.price_at_time).toFixed(2)}</p>
                              </div>
                              <span className="text-gold-500 font-bold text-sm">${(item.quantity * parseFloat(item.price_at_time)).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Workshop Details */}
                      {order.requires_installation && order.workshop_name && (
                        <div className="p-4 rounded-xl bg-gold-500/5 border border-gold-500/20">
                          <h4 className="text-[10px] font-black text-gold-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5" /> {t('my_orders.workshop_details')}
                          </h4>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-silver-500">{t('my_orders.workshop')}</span>
                              <p className="text-white font-bold">{order.workshop_name}</p>
                            </div>
                            <div>
                              <span className="text-silver-500">{t('my_orders.appointment')}</span>
                              <p className="text-white font-bold">{order.workshop_date} @ {order.workshop_time}</p>
                            </div>
                            <div>
                              <span className="text-silver-500">{t('my_orders.service_type')}</span>
                              <p className="text-white font-bold">{order.is_home_service ? t('my_orders.mobile_service') : t('my_orders.at_workshop')}</p>
                            </div>
                            <div>
                              <span className="text-silver-500">{t('my_orders.workshop_fee')}</span>
                              <p className="text-gold-500 font-bold">${parseFloat(order.workshop_fee).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Payment Info */}
                      <div className="flex items-center justify-between p-3 bg-premium-800/50 rounded-xl border border-white/5 text-xs">
                        <div className="flex items-center gap-2 text-silver-400">
                          <CreditCard className="w-3.5 h-3.5 text-gold-500" />
                          <span>{t('my_orders.transaction_id')}</span>
                        </div>
                        <span className="text-white font-mono text-[10px]">{order.payment_transaction_id || '—'}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
