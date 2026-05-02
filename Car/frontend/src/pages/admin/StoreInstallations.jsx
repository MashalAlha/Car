import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Search, Clock, CheckCircle, ArrowRight, Truck } from 'lucide-react';
import api from '../../utils/api';

export default function StoreInstallations() {
  const { t } = useTranslation();
  
  const [installationOrders, setInstallationOrders] = useState([]);
  const [loadingInstallations, setLoadingInstallations] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchInstallationOrders();
  }, []);

  const fetchInstallationOrders = async () => {
    setLoadingInstallations(true);
    try {
      const resp = await api.get('/store/installation-orders/', { useAdminToken: true });
      setInstallationOrders(resp.data);
    } catch (e) {
      console.error("Failed to fetch installation orders", e);
    } finally {
      setLoadingInstallations(false);
    }
  };

  const updateInstallationStatus = async (orderId, newStatus) => {
    try {
      const resp = await api.post(`/store/installation-orders/${orderId}/update_status/`, { status: newStatus }, { useAdminToken: true });
      setInstallationOrders(prev => prev.map(o => o.id === orderId ? resp.data : o));
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to update status');
    }
  };

  const filteredOrders = installationOrders.filter(order => {
    const matchesSearch = `#${order.id}`.includes(searchQuery) ||
      (order.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Ready_For_Installation':
        return 'text-gold-500 border-gold-500/20 bg-gold-500/5';
      case 'Delivered_With_Installation':
        return 'text-green-400 border-green-500/20 bg-green-500/5';
      case 'Delivered_Only':
        return 'text-silver-400 border-white/10 bg-white/5';
      default:
        return 'text-silver-500 border-white/10 bg-white/5';
    }
  };

  return (
    <div className="p-4 lg:p-8 font-sans max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
            {t('admin.workshop_dashboard.installations_title')}
          </h1>
          <p className="text-silver-500 text-sm font-medium">
            {t('admin.workshop_dashboard.installations_subtitle')}
          </p>
        </div>
        
        <div className="bg-gold-500/10 border border-gold-500/20 px-6 py-3 rounded-2xl flex flex-col items-center min-w-[140px]">
          <span className="text-gold-500 font-black text-2xl leading-none">{installationOrders.length}</span>
          <span className="text-silver-500 text-[9px] uppercase font-bold tracking-[0.2em] mt-1">{t('admin.workshop_dashboard.active_requests')}</span>
        </div>
      </div>

      {/* Filters Container */}
      <div className="glass-panel p-6 rounded-2xl border border-premium-border/50">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-500" />
            <input
              type="text"
              placeholder={t('admin.common.filters.search_placeholder')}
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
              <option value="Ready_For_Installation">{t('admin.workshop_dashboard.status_unassigned')}</option>
              <option value="Delivered_With_Installation">{t('admin.workshop_dashboard.status_completed')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="glass-panel rounded-2xl border border-premium-border/50 overflow-hidden">
        {loadingInstallations ? (
          <div className="py-24 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
            <p className="text-silver-500 text-xs font-black uppercase tracking-widest">{t('admin.common.loading')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse rtl:text-right">
              <thead>
                <tr className="bg-premium-800/50 text-silver-500 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="p-6">{t('admin.common.order')}</th>
                  <th className="p-6">{t('admin.common.customer')}</th>
                  <th className="p-6">{t('admin.workshop_dashboard.scheduled_at')}</th>
                  <th className="p-6">{t('admin.workshop_dashboard.parts_count')}</th>
                  <th className="p-6 text-center">{t('admin.common.status')}</th>
                  <th className="p-6 pe-8">{t('admin.common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-20 text-center">
                      <Truck className="w-12 h-12 text-white/5 mx-auto mb-4" />
                      <p className="text-silver-500 text-sm font-bold uppercase tracking-widest">{t('admin.workshop_dashboard.no_installations')}</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="text-sm hover:bg-white/[0.02] transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-premium-900 border border-white/5 group-hover:border-gold-500/50 transition-colors">
                            <Package className="w-4 h-4 text-gold-500" />
                          </div>
                          <div>
                            <p className="font-black text-white tracking-tight">#{order.id}</p>
                            <p className="text-[10px] text-silver-500 font-bold uppercase">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col">
                          <span className="text-white font-bold">{order.customer_name}</span>
                          <span className="text-xs text-silver-400">{order.customer_phone}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col">
                          <span className="text-white font-black italic tracking-tighter">{order.workshop_date}</span>
                          <span className="text-[10px] text-gold-500 font-bold uppercase tracking-widest">{order.workshop_time}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded bg-premium-900 flex items-center justify-center text-[10px] font-black text-silver-300 border border-white/5">
                              {order.items?.length || 0}
                           </div>
                           <span className="text-silver-400 text-xs font-bold uppercase tracking-wider">{t('admin.product_orders.items_label')}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex justify-center">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${getStatusStyle(order.status)} shadow-lg shadow-black/20 animate-fade-in`}>
                            {t(`admin.common.${order.status.toLowerCase()}`)}
                          </span>
                        </div>
                      </td>
                      <td className="p-6 pe-8">
                        <div className="flex items-center justify-center gap-2">
                           {(order.status === 'Ready_For_Installation' || order.status === 'Pending') && (
                             <>
                               <button 
                                 onClick={() => updateInstallationStatus(order.id, 'Delivered_With_Installation')}
                                 className="flex-1 bg-gold-500 text-premium-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/10 min-w-[120px]"
                               >
                                 {t('admin.workshop_dashboard.mark_installed')}
                               </button>
                               <button 
                                 onClick={() => updateInstallationStatus(order.id, 'Delivered_Only')}
                                 className="flex-1 bg-premium-800 text-silver-300 border border-white/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-premium-700 transition-all"
                               >
                                 {t('admin.workshop_dashboard.mark_pickup_only')}
                               </button>
                             </>
                           )}
                           {(order.status === 'Delivered_With_Installation' || order.status === 'Delivered_Only') && (
                             <div className="flex items-center justify-center gap-2 text-green-400 text-[10px] font-black uppercase tracking-widest bg-green-500/10 border border-green-500/20 py-2.5 px-6 rounded-xl w-full">
                               <CheckCircle className="w-4 h-4" /> {t('admin.common.completed')}
                             </div>
                           )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
