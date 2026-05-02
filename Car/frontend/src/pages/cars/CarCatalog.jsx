import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import CarCard from '../../components/ui/CarCard';
import { Search, Car } from 'lucide-react';

import api from '../../utils/api';

export default function CarCatalog() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('buy');
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCars = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab === 'buy') {
        params.append('is_for_sale', 'true');
      } else {
        params.append('is_for_rent', 'true');
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const res = await api.get(`/cars/inventory/?${params.toString()}`);
      setCars(res.data);
    } catch (err) {
      console.error('Failed to fetch cars:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    const debounce = setTimeout(() => { fetchCars(); }, 300);
    return () => clearTimeout(debounce);
  }, [fetchCars]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16 animate-fade-in px-4">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 uppercase tracking-tighter">{t('catalog.heading')}</h1>
        <p className="text-silver-300 text-sm md:text-lg">{t('catalog.subtitle')}</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 animate-slide-up px-4 sm:px-0">
        <div className="bg-premium-800 p-1.5 rounded-xl border border-white/5 inline-flex w-full md:w-auto overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('buy')} className={`flex-1 md:flex-none whitespace-nowrap px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'buy' ? 'bg-gold-500 text-premium-900 shadow-md' : 'text-silver-400 hover:text-white'}`}>
            {t('catalog.tab_buy')}
          </button>
          <button onClick={() => setActiveTab('rent')} className={`flex-1 md:flex-none whitespace-nowrap px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'rent' ? 'bg-gold-500 text-premium-900 shadow-md' : 'text-silver-400 hover:text-white'}`}>
            {t('catalog.tab_rent')}
          </button>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-silver-400" />
            <input type="text" placeholder={t('catalog.search_placeholder')} className="luxury-input w-full ps-10 text-sm py-2.5" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse flex space-x-2">
            <div className="w-3 h-3 bg-gold-500 rounded-full"></div>
            <div className="w-3 h-3 bg-gold-500 rounded-full animation-delay-200"></div>
            <div className="w-3 h-3 bg-gold-500 rounded-full animation-delay-400"></div>
          </div>
        </div>
      ) : cars.length === 0 ? (
        <div className="text-center py-20 bg-premium-800/30 rounded-2xl border border-white/5 border-dashed">
          <Car className="w-12 h-12 text-silver-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            {searchQuery ? `${t('catalog.no_results_title')} "${searchQuery}"` : t('catalog.no_vehicles')}
          </h3>
          <p className="text-silver-400 text-sm">
            {searchQuery ? t('catalog.no_results_hint') : t('catalog.check_back')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8 px-4 sm:px-0">
          {cars.map(car => (<CarCard key={car.id} car={car} />))}
        </div>
      )}
    </div>
  );
}
