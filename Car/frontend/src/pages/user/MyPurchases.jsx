import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Car, ShoppingBag, Calendar, Search, FileText, Info } from 'lucide-react';

import api from '../../utils/api';

export default function MyPurchases() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const statusFilters = [
    { label: t('my_purchases.filter_all'), value: 'all' },
    { label: t('my_purchases.filter_pending'), value: 'pending' },
    { label: t('my_purchases.filter_approved'), value: 'approved' },
    { label: t('my_purchases.filter_delivered'), value: 'delivered' },
    { label: t('my_purchases.filter_rejected'), value: 'rejected' },
  ];

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const res = await api.get('/cars/my-purchases/');
        setPurchases(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchPurchases();
  }, []);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10 px-4 sm:px-0">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3 tracking-tighter uppercase"><ShoppingBag className="w-8 h-8 text-gold-500" /> {t('my_purchases.heading')}</h1>
          <p className="text-silver-400 text-sm">{t('my_purchases.subtitle')}</p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute inset-y-0 start-3 top-1/2 -translate-y-1/2 text-silver-500" />
            <input 
              type="text" 
              placeholder={t('my_purchases.search_placeholder')} 
              className="w-full bg-premium-800/50 border border-white/5 rounded-xl py-3 ps-10 pe-4 text-white focus:border-gold-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map(sf => (
              <button key={sf.value} onClick={() => setActiveFilter(sf.value)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all border ${activeFilter === sf.value ? 'bg-gold-500 text-premium-900 border-gold-500' : 'bg-premium-800 text-silver-400 hover:text-white border-white/5'}`}>
                {sf.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-silver-400 animate-pulse">{t('my_purchases.loading')}</div>
        ) : purchases.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center border border-white/5">
            <Car className="w-12 h-12 text-silver-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">{t('my_purchases.no_purchases')}</h3>
            <p className="text-silver-400 text-sm mb-6">{t('my_purchases.no_purchases_hint')}</p>
            <a href="/catalog" className="luxury-button px-8 py-3 inline-flex items-center gap-2 text-sm font-bold">{t('my_purchases.browse')}</a>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases
              .filter(p => {
                const matchesSearch = `${p.car?.make} ${p.car?.model}`.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesStatus = activeFilter === 'all' || p.status === activeFilter;
                return matchesSearch && matchesStatus;
              })
              .map((purchase) => (
              <div key={purchase.id} className="glass-panel p-6 rounded-2xl border border-premium-border/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  {purchase.car?.image_url ? (
                    <img src={purchase.car.image_url} alt="car" className="w-20 h-14 rounded-lg object-cover border border-white/10 hidden sm:block" />
                  ) : (
                    <div className="w-20 h-14 rounded-lg bg-premium-900 border border-white/10 flex items-center justify-center hidden sm:flex"><Car className="w-5 h-5 text-silver-600" /></div>
                  )}
                  <div>
                    <p className="font-bold text-white text-base md:text-lg tracking-tight">{purchase.car ? `${purchase.car.year} ${purchase.car.make} ${purchase.car.model}` : 'Vehicle (removed from inventory)'}</p>
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-4 text-[10px] md:text-xs text-silver-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gold-500/60" /> {t('my_purchases.purchased_on')}: {new Date(purchase.purchase_date).toLocaleDateString()}
                        </span>
                      </div>
                      {purchase.delivery_date && (
                        <div className="flex items-center gap-1 text-[10px] md:text-xs text-gold-500 font-bold bg-gold-500/5 py-1 px-2 rounded-lg border border-gold-500/10 w-fit mt-1 uppercase tracking-widest">
                          <Calendar className="w-3 h-3" /> {t('my_purchases.delivery_scheduled')}: {purchase.delivery_date}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 min-w-[150px]">
                  <div className="text-end">
                    <p className="text-gold-400 font-bold text-xl font-mono">${Number(purchase.price_paid).toLocaleString()}</p>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border mt-2 block w-fit ms-auto ${
                      purchase.status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                      purchase.status === 'pending' ? 'bg-gold-500/20 text-gold-400 border-gold-500/30' :
                      purchase.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      'bg-silver-500/20 text-silver-400 border-white/10'
                    }`}>
                      {t(`my_purchases.status_${purchase.status}`, { defaultValue: purchase.status })}
                    </span>
                  </div>
                  
                  {purchase.status === 'rejected' && purchase.rejection_reason && (
                    <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-lg flex items-start gap-2 max-w-[200px]">
                      <Info className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-red-300 italic">{purchase.rejection_reason}</p>
                    </div>
                  )}

                  <button 
                    onClick={() => navigate(`/my-purchases/${purchase.id}`)}
                    className="luxury-button px-4 py-2 text-xs font-bold flex items-center gap-2 w-full justify-center"
                  >
                    <FileText className="w-3.5 h-3.5" /> {t('my_purchases.view_details')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
