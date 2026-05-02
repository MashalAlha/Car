import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, DollarSign, Users, Car, TrendingUp, RefreshCw } from 'lucide-react';
import api from '../../utils/api';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    metrics: {
      revenue: '$0.0M',
      active_users: '0',
      vehicles_sold: '0',
      uptime: '99.9%'
    },
    activities: []
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/operations/dashboard/', { useAdminToken: true });
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 60) return `${diffInMins} ${t('admin.admin_dashboard.mins')} ${t('admin.admin_dashboard.ago')}`;
    if (diffInHours < 24) return `${diffInHours} ${t(`admin.admin_dashboard.${diffInHours === 1 ? 'hour' : 'hours'}`)} ${t('admin.admin_dashboard.ago')}`;
    return `${diffInDays} ${t(`admin.admin_dashboard.${diffInDays === 1 ? 'day' : 'days'}`)} ${t('admin.admin_dashboard.ago')}`;
  };

  const metrics = [
    { label: t('admin.admin_dashboard.revenue'), value: data.metrics.revenue, icon: <DollarSign className="w-5 h-5" />, trend: '+12.5%' },
    { label: t('admin.admin_dashboard.active_users'), value: data.metrics.active_users, icon: <Users className="w-5 h-5" />, trend: '+4.2%' },
    { label: t('admin.admin_dashboard.vehicles_sold'), value: data.metrics.vehicles_sold, icon: <Car className="w-5 h-5" />, trend: '+8.1%' },
    { label: t('admin.admin_dashboard.platform_uptime'), value: data.metrics.uptime, icon: <Activity className="w-5 h-5" />, trend: t('admin.admin_dashboard.stable') },
  ];

  return (
    <div className="p-4 lg:p-8 font-sans animate-fade-in">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 italic tracking-tighter">{t('admin.admin_dashboard.title')}</h1>
          <p className="text-silver-400">{t('admin.admin_dashboard.subtitle')}</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          disabled={loading}
          className={`p-3 rounded-xl glass-panel border border-white/5 hover:border-gold-500/30 transition-all ${loading ? 'animate-spin opacity-50' : ''}`}
        >
          <RefreshCw className="w-5 h-5 text-gold-500" />
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {metrics.map((m, i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl border border-premium-border/50 hover:border-gold-500/30 transition-all group relative overflow-hidden">
            {loading && <div className="absolute inset-0 bg-white/5 animate-pulse z-10"></div>}
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-500 group-hover:bg-gold-500 group-hover:text-premium-900 transition-colors">
                {m.icon}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${m.trend === t('admin.admin_dashboard.stable') ? 'bg-silver-500/20 text-silver-300' : 'bg-green-500/20 text-green-400'}`}>
                {m.trend}
              </span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">{m.value}</h2>
              <p className="text-silver-400 text-xs font-semibold uppercase tracking-wider">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart & Activity Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-premium-border/50 h-[450px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white uppercase tracking-widest text-[10px]">{t('admin.admin_dashboard.revenue_trajectory')}</h3>
            <span className="text-gold-500 flex items-center gap-2 text-sm font-bold italic"><TrendingUp className="w-4 h-4"/> {t('admin.admin_dashboard.ytd_growth')}</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-xl bg-white/[0.01]">
             <Activity className="w-12 h-12 text-silver-800 mb-4" />
             <p className="text-silver-500 font-mono text-sm tracking-widest uppercase">{t('admin.admin_dashboard.chart_pending')}</p>
             <p className="text-[10px] text-silver-700 mt-2">REAL-TIME TELEMETRY CONNECTED</p>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl border border-premium-border/50 h-[450px] flex flex-col">
          <div className="mb-6 border-b border-white/5 pb-4">
            <h3 className="text-lg font-bold text-white uppercase tracking-widest text-[10px]">{t('admin.admin_dashboard.recent_activity')}</h3>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
             {loading ? (
               Array(5).fill(0).map((_, i) => (
                 <div key={i} className="flex gap-4 items-start animate-pulse">
                   <div className="w-2 h-2 rounded-full bg-silver-800 mt-2"></div>
                   <div className="flex-1 space-y-2">
                     <div className="h-3 bg-silver-800 rounded w-3/4"></div>
                     <div className="h-2 bg-silver-900 rounded w-1/4"></div>
                   </div>
                 </div>
               ))
             ) : data.activities.length > 0 ? (
               data.activities.map((log, i) => (
                <div key={i} className="flex gap-4 items-start border-b border-white/5 pb-4 last:border-0 hover:bg-white/[0.02] transition-colors rounded-lg p-2 -mx-2">
                  <div className={`mt-2 w-2 h-2 rounded-full shrink-0 shadow-lg ${
                    log.type === 'purchase' ? 'bg-gold-500 shadow-gold-500/50' : 
                    log.type === 'rental' ? 'bg-blue-500 shadow-blue-500/50' : 
                    log.type === 'user' ? 'bg-green-500 shadow-green-500/50' : 
                    'bg-silver-500'
                  }`}></div>
                  <div>
                    <p className="text-sm text-silver-300 leading-snug">{log.text}</p>
                    <span className="text-[10px] text-silver-600 uppercase tracking-widest font-black mt-1 block">
                      {formatTime(log.date)}
                    </span>
                  </div>
                </div>
               ))
             ) : (
               <div className="flex flex-col items-center justify-center h-full text-silver-600 italic text-sm">
                 <RefreshCw className="w-8 h-8 mb-2 opacity-20" />
                 No recent signals detected
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
