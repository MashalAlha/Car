import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Car, Clock, Filter, Search } from 'lucide-react';

import api from '../../utils/api';

export default function MyRentals() {
  const { t } = useTranslation();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRentals = async (statusFilter) => {
    setLoading(true);
    try {
      let url = '/cars/my-rentals/';
      if (statusFilter && statusFilter !== 'all') url += `?status=${statusFilter}`;
      const res = await api.get(url);
      setRentals(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRentals(activeFilter); }, [activeFilter]);

  const filters = [
    { label: t('my_rentals.filter_all'), value: 'all' },
    { label: t('my_rentals.filter_pending'), value: 'pending' },
    { label: t('my_rentals.filter_active'), value: 'active' },
    { label: t('my_rentals.filter_completed'), value: 'completed' },
    { label: t('my_rentals.filter_rejected'), value: 'rejected' },
  ];

  const statusStyle = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed': return 'bg-silver-500/20 text-silver-400 border-white/10';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-silver-500/20 text-silver-400 border-white/10';
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10 px-4 sm:px-0">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3 tracking-tighter uppercase"><Calendar className="w-8 h-8 text-gold-500" /> {t('my_rentals.heading')}</h1>
          <p className="text-silver-400 text-sm">{t('my_rentals.subtitle')}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute inset-y-0 start-3 top-1/2 -translate-y-1/2 text-silver-500" />
            <input 
              type="text" 
              placeholder={t('my_rentals.search_placeholder')} 
              className="w-full bg-premium-800/50 border border-white/5 rounded-xl py-3 ps-10 pe-4 text-white focus:border-gold-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map(f => (
              <button key={f.value} onClick={() => setActiveFilter(f.value)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeFilter === f.value ? 'bg-gold-500 text-premium-900 border-transparent' : 'bg-premium-800 text-silver-400 hover:text-white border border-white/5'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-silver-400 animate-pulse">{t('my_rentals.loading')}</div>
        ) : rentals.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center border border-white/5">
            <Filter className="w-12 h-12 text-silver-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">{t('my_rentals.no_rentals')}</h3>
            <p className="text-silver-400 text-sm">{activeFilter === 'all' ? t('my_rentals.no_rentals_hint') : `${t('my_rentals.no_status_hint')} "${t(`my_rentals.status_${activeFilter}`)}".`}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rentals
              .filter(r => {
                const searchStr = `${r.car?.make} ${r.car?.model}`.toLowerCase();
                return searchStr.includes(searchQuery.toLowerCase());
              })
              .map((rental) => (
              <div key={rental.id} className="glass-panel p-6 rounded-2xl border border-premium-border/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  {rental.car?.image_url ? (
                    <img src={rental.car.image_url} alt="car" className="w-20 h-14 rounded-lg object-cover border border-white/10 hidden xs:block" />
                  ) : (
                    <div className="w-20 h-14 rounded-lg bg-premium-900 border border-white/10 flex items-center justify-center hidden xs:flex"><Car className="w-5 h-5 text-silver-600" /></div>
                  )}
                  <div>
                    <p className="font-bold text-white">{rental.car ? `${rental.car.year} ${rental.car.make} ${rental.car.model}` : `Vehicle #${rental.car}`}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-silver-400"><span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {rental.start_date} → {rental.end_date}</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-gold-400 font-bold text-lg">${rental.total_price}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusStyle(rental.status)}`}>
                    {t(`my_rentals.status_${rental.status}`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
