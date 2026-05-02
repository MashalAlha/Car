import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Search, ChevronDown, ChevronUp, Truck, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import api from '../../utils/api';

const STATUS_PIPELINE = ['Paid', 'Prepared', 'Out_For_Delivery', 'Delivered'];

const STATUS_CONFIG = {
  Paid: { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: Clock, next: 'Prepared' },
  Prepared: { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Package, next: 'Out_For_Delivery' },
  Out_For_Delivery: { color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', icon: Truck, next: 'Delivered' },
  Delivered: { color: 'text-green-400 bg-green-500/10 border-green-500/20', icon: CheckCircle, next: null },
};

export default function ProductOrders() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updating, setUpdating] = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const resp = await api.get('/store/admin/orders/', { useAdminToken: true });
      setOrders(resp.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const advanceStatus = async (orderId, nextStatus) => {
    setUpdating(orderId);
    try {
      const resp = await api.post(`/store/admin/orders/${orderId}/update_status/`, { status: nextStatus }, { useAdminToken: true });
      setOrders(prev => prev.map(o => o.id === orderId ? resp.data : o));
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to update status');
    } finally { setUpdating(null); }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = `#${o.id}`.includes(searchQuery) ||
      (o.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 lg:p-8 font-sans max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
            {t('admin.product_orders.title')}
          </h1>
          <p className="text-silver-500 text-sm font-medium">
            {t('admin.product_orders.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-premium-800 p-1.5 rounded-xl border border-white/5">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse ms-3"></div>
          <span className="text-xs font-bold text-silver-300 pe-3 uppercase tracking-widest">Live Fulfillment</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {STATUS_PIPELINE.map(s => {
          const count = orders.filter(o => o.status === s).length;
          const cfg = STATUS_CONFIG[s];
          const Icon = cfg.icon;
          return (
            <div key={s} className="glass-panel p-6 rounded-2xl border border-premium-border/50 flex flex-col gap-4 group hover:border-gold-500/30 transition-all">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cfg.color} border transition-transform group-hover:scale-110`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-black text-white mb-1">{count}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-silver-500 group-hover:text-gold-500 transition-colors">
                  {t(`admin.product_orders.status_${s.toLowerCase()}`)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters Container */}
      <div className="glass-panel p-6 rounded-2xl border border-premium-border/50">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-500" />
            <input
              type="text"
              placeholder={t('admin.product_orders.search_placeholder')}
              className="w-full bg-premium-900/50 border border-white/10 rounded-xl py-3 ps-12 pe-4 text-white text-sm focus:border-gold-500 outline-none transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-premium-900/50 border border-white/10 rounded-xl py-3 px-6 text-white text-sm focus:border-gold-500 outline-none cursor-pointer font-bold uppercase tracking-widest rtl:text-right"
            >
              <option value="all">{t('admin.common.filters.all_statuses')}</option>
              {STATUS_PIPELINE.map(s => (
                <option key={s} value={s}>{t(`admin.product_orders.status_${s.toLowerCase()}`)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="glass-panel rounded-2xl border border-premium-border/50 overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
            <p className="text-silver-500 text-xs font-black uppercase tracking-widest">{t('admin.common.loading')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse rtl:text-right">
              <thead>
                <tr className="bg-premium-800/50 text-silver-500 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="p-6">{t('admin.product_orders.col_order')}</th>
                  <th className="p-6">{t('admin.product_orders.col_customer')}</th>
                  <th className="p-6">{t('admin.product_orders.col_items')}</th>
                  <th className="p-6">{t('admin.product_orders.col_total')}</th>
                  <th className="p-6 text-center">{t('admin.product_orders.col_status')}</th>
                  <th className="p-6 pe-8">{t('admin.product_orders.col_action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-20 text-center">
                      <Package className="w-12 h-12 text-white/5 mx-auto mb-4" />
                      <p className="text-silver-500 text-sm font-bold uppercase tracking-widest">{t('admin.product_orders.no_orders')}</p>
                    </td>
                  </tr>
                ) : filteredOrders.map(order => {
                  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.Paid;
                  const isExpanded = expandedId === order.id;
                  return (
                    <React.Fragment key={order.id}>
                      <tr 
                        className={`text-sm transition-all cursor-pointer group ${isExpanded ? 'bg-white/[0.02]' : 'hover:bg-white/[0.03]'}`} 
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      >
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-premium-900 border border-white/5 group-hover:border-gold-500/50 transition-colors`}>
                              <Package className="w-4 h-4 text-gold-500" />
                            </div>
                            <div>
                              <p className="font-black text-white tracking-tight">#{order.id}</p>
                              <p className="text-[10px] text-silver-500 font-bold uppercase">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <p className="text-white font-bold">{order.customer_name}</p>
                          <p className="text-xs text-silver-400">{order.customer_email}</p>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded bg-premium-900 flex items-center justify-center text-[10px] font-black text-silver-300 border border-white/5">
                                {(order.items || []).length}
                             </div>
                             <span className="text-silver-400 text-xs font-bold uppercase tracking-wider">{t('admin.product_orders.items_label')}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <span className="text-gold-500 font-black text-lg">${parseFloat(order.total_price).toFixed(2)}</span>
                        </td>
                        <td className="p-6">
                          <div className="flex justify-center">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${cfg.color} shadow-lg shadow-black/20`}>
                              {t(`admin.product_orders.status_${order.status.toLowerCase()}`)}
                            </span>
                          </div>
                        </td>
                        <td className="p-6 pe-8">
                          {cfg.next ? (
                            <button
                              disabled={updating === order.id}
                              onClick={(e) => { e.stopPropagation(); advanceStatus(order.id, cfg.next); }}
                              className="w-full luxury-button px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center justify-between group/btn disabled:opacity-50"
                            >
                              <span>{updating === order.id ? '...' : t(`admin.product_orders.status_${cfg.next.toLowerCase()}`)}</span>
                              <ArrowRight className="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                          ) : (
                            <div className="flex items-center justify-center gap-2 text-green-400 text-[10px] font-black uppercase tracking-widest bg-green-500/10 border border-green-500/20 py-2 rounded-xl">
                              <CheckCircle className="w-3.5 h-3.5" /> {t('admin.product_orders.completed')}
                            </div>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan="6" className="p-0 border-none">
                            <div className="bg-premium-900/40 p-8 space-y-4 animate-slide-down border-y border-white/5 shadow-inner">
                               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-silver-500 mb-2">Order Line Items</p>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(order.items || []).map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-4 p-4 bg-premium-800 rounded-2xl border border-white/5 hover:border-gold-500/20 transition-all group/item">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-premium-900 flex-shrink-0 border border-white/10 group-hover/item:border-gold-500/30 transition-all">
                                      {item.part_details?.image ? (
                                        <img src={item.part_details.image} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-white/5" /></div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-white text-sm font-black truncate">{item.part_details?.name}</p>
                                      <div className="flex items-center gap-3 mt-1">
                                         <span className="text-[10px] text-silver-500 font-bold uppercase tracking-wider">SKU: {item.part_details?.sku}</span>
                                         <span className="w-1 h-1 rounded-full bg-white/10"></span>
                                         <span className="text-[10px] text-gold-500 font-black">Qty: {item.quantity}</span>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-white font-black text-sm">${(item.quantity * parseFloat(item.price_at_time)).toFixed(2)}</p>
                                      <p className="text-[9px] text-silver-500 font-bold italic">${parseFloat(item.price_at_time).toFixed(2)} / unit</p>
                                    </div>
                                  </div>
                                ))}
                               </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
