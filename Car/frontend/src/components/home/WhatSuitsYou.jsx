import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, ChevronRight, Package, Car, Star, ArrowUpRight } from 'lucide-react';
import api from '../../utils/api';

export default function WhatSuitsYou() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const res = await api.get('/interactions/recommendations/feed/');
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch recommendations", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="py-24 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
      <p className="text-silver-500 text-[10px] font-black uppercase tracking-widest animate-pulse">Personalizing Your Experience...</p>
    </div>
  );

  if (!data || (!data.recommended_cars?.length && !data.recommended_accessories?.length)) return null;

  return (
    <section className="py-20 md:py-32 relative overflow-hidden bg-premium-900">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gold-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 px-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gold-500">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('recommendations.based_on')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase">
              {t('recommendations.heading')} <span className="text-gold-500">.</span>
            </h2>
          </div>
          <div className="px-6 py-2 rounded-full border border-gold-500/20 bg-gold-500/5 backdrop-blur-sm">
             <p className="text-gold-500 text-[9px] font-black uppercase tracking-widest italic">{t(data.context_msg) || t('recommendations.based_on')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Vehicles Column */}
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500">
                  <Car className="w-4 h-4" />
                </div>
                {t('recommendations.sub_cars')}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {data.recommended_cars?.map((car) => (
                <Link key={car.id} to={`/cars/${car.id}`} className="group relative block aspect-[4/5] rounded-[32px] overflow-hidden border border-white/5 hover:border-gold-500/30 transition-all duration-500">
                  <img src={car.image_url} alt={car.model} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-premium-900 via-premium-900/40 to-transparent"></div>
                  
                  <div className="absolute top-4 right-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-300">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-gold-500 text-[10px] font-black uppercase tracking-widest mb-1">{car.make}</p>
                    <h4 className="text-white text-xl font-bold tracking-tight mb-2">{car.model}</h4>
                    <div className="flex items-center gap-2">
                       <span className="text-white/60 text-xs font-medium">{car.year}</span>
                       <div className="w-1 h-1 rounded-full bg-white/20"></div>
                       <span className="text-gold-400 font-bold text-sm">${Number(car.price || car.daily_rent_price).toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Accessories Column */}
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500">
                  <Package className="w-4 h-4" />
                </div>
                {t('recommendations.sub_parts')}
              </h3>
            </div>

            <div className="space-y-4">
              {data.recommended_accessories?.map((part) => (
                <Link key={part.id} to={`/store/part/${part.id}`} className="group glass-panel p-4 rounded-3xl border border-white/5 hover:border-gold-500/20 transition-all duration-300 flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-premium-800 border border-white/5 shrink-0">
                    <img src={part.image} alt={part.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gold-500 px-2 py-0.5 rounded bg-gold-500/10">{part.brand}</span>
                    </div>
                    <h4 className="text-white font-bold text-base truncate group-hover:text-gold-500 transition-colors">{part.name}</h4>
                    <p className="text-silver-500 text-xs mt-1 truncate">{part.car_make} {part.car_model} Compatibility</p>
                  </div>
                  <div className="text-right ps-4 border-s border-white/5">
                    <p className="text-white font-black text-lg">${Number(part.price).toLocaleString()}</p>
                    <span className="text-[9px] font-black uppercase tracking-widest text-silver-500 group-hover:text-gold-500 transition-colors">Details →</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* View All CTA */}
            <Link to="/store" className="block w-full py-6 rounded-[32px] bg-gradient-to-r from-gold-500/10 to-transparent border border-gold-500/20 text-center group hover:from-gold-500/20 transition-all">
               <span className="text-gold-500 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                 {t('recommendations.explore_accessories')} <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
               </span>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
