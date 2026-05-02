import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingBag, Settings2, ShieldCheck, Package, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import api from '../../utils/api';

export default function StoreFront() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'accessories', 'parts'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab === 'accessories') params.append('is_accessory', 'true');
      if (activeTab === 'parts') params.append('is_accessory', 'false');
      
      const res = await api.get(`/store/inventory/?${params.toString()}`);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleFavorite = async (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    if (!localStorage.getItem('user_access_token')) {
      alert("Please login to save favorites.");
      return;
    }

    const isRemoving = item.is_favorited;
    
    // Optimistic UI Update
    setItems(prev => prev.map(i => 
      i.id === item.id ? { ...i, is_favorited: !isRemoving } : i
    ));

    try {
      if (!isRemoving) {
        await api.post('/interactions/favorites/', {
          content_type_model: 'part',
          object_id: item.id
        });
      } else {
        await api.delete('/interactions/favorites/remove/', {
          data: {
            content_type_model: 'part',
            object_id: item.id
          }
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Rollback
      setItems(prev => prev.map(i => 
        i.id === item.id ? { ...i, is_favorited: isRemoving } : i
      ));
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-premium-950">
      {/* Cinematic Banner */}
      <div className="relative h-[60vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-premium-900 z-10 opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-premium-950 via-transparent to-premium-950/20 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80" 
          alt="Luxury Auto Parts" 
          className="absolute w-full h-full object-cover scale-105"
        />
        
        <div className="relative z-20 text-center max-w-4xl mx-auto px-6 animate-slide-up">
          <span className="text-gold-500 font-black tracking-[0.3em] uppercase text-[10px] mb-4 block drop-shadow-2xl opacity-80">
            {t('brand')} Store Management
          </span>
          <h1 className="text-4xl md:text-8xl font-black text-white mb-6 md:mb-8 italic tracking-tighter leading-none">
            {t('store.heading')}
          </h1>
          <p className="text-silver-300 text-sm md:text-xl max-w-2xl mx-auto font-medium leading-relaxed opacity-90">
            {t('store.subtitle_curated')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-30">
        
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8 md:mb-12 px-4">
           <div className="glass-panel p-1.5 rounded-2xl border border-white/5 flex gap-1 w-full md:w-auto overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActiveTab('all')}
                className={`flex-1 md:flex-none whitespace-nowrap px-6 md:px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-gold-500 text-premium-900 shadow-xl' : 'text-silver-400 hover:text-white hover:bg-white/5'}`}
              >
                {t('store.all_collections')}
              </button>
              <button 
                onClick={() => setActiveTab('accessories')}
                className={`flex-1 md:flex-none whitespace-nowrap px-6 md:px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'accessories' ? 'bg-gold-500 text-premium-900 shadow-xl' : 'text-silver-400 hover:text-white hover:bg-white/5'}`}
              >
                {t('store.accessories')}
              </button>
              <button 
                onClick={() => setActiveTab('parts')}
                className={`flex-1 md:flex-none whitespace-nowrap px-6 md:px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'parts' ? 'bg-gold-500 text-premium-900 shadow-xl' : 'text-silver-400 hover:text-white hover:bg-white/5'}`}
              >
                {t('store.parts')}
              </button>
           </div>
        </div>

        {/* Search & Compatibility HUD */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
           <div className="lg:col-span-3">
              <div className="glass-panel p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                 <Search className="text-silver-500 w-6 h-6 ml-2" />
                 <input 
                    type="text" 
                    placeholder="Search by brand, part name or type..." 
                    className="luxury-input w-full bg-transparent border-none focus:ring-0 text-lg"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                 />
              </div>
           </div>
           <div className="lg:col-span-1">
              <button className="glass-panel w-full h-full p-4 rounded-2xl border border-white/5 flex items-center justify-center gap-3 text-silver-400 font-bold uppercase text-[10px] tracking-widest hover:border-gold-500/30 transition-all">
                 <Settings2 className="w-5 h-5 text-gold-500" /> {t('store.compatibility_search')}
              </button>
           </div>
        </div>

        {/* Inventory Grid */}
        {loading ? (
          <div className="py-40 text-center">
             <div className="w-16 h-16 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin mx-auto mb-6" />
             <p className="text-silver-500 font-black uppercase tracking-[0.2em] text-xs">Synchronizing Inventory...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {filteredItems.map(item => (
              <Link 
                key={item.id} 
                to={`/store/part/${item.id}`} 
                className="group flex flex-col h-full"
              >
                <div className="aspect-[4/5] relative rounded-3xl overflow-hidden bg-premium-900 border border-white/5 group-hover:border-gold-500/30 transition-all duration-700 shadow-2xl">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover mix-blend-luminosity grayscale group-hover:mix-blend-normal group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-5">
                       <Package className="w-24 h-24" />
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-6 left-6">
                    <span className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black text-white uppercase tracking-widest border border-white/10">
                      {item.is_accessory ? 'Aesthetic Accessory' : 'Precision Entry'}
                    </span>
                  </div>

                  {/* Favorite Button */}
                  <div className="absolute top-6 right-6 z-20">
                    <button 
                      onClick={(e) => toggleFavorite(e, item)}
                      className="p-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-black/60 transition-all group/fav"
                    >
                      <Heart 
                        className={`w-4 h-4 transition-all ${item.is_favorited ? 'fill-gold-500 text-gold-500 scale-110' : 'text-white group-hover/fav:text-gold-500'}`} 
                      />
                    </button>
                  </div>

                  {/* Pricing Overlay */}
                  <div className="absolute bottom-6 right-6">
                    <div className="bg-gold-500 text-premium-950 px-4 py-2 rounded-xl text-lg font-black tracking-tighter italic shadow-2xl">
                       ${item.price ? parseFloat(item.price).toLocaleString() : '0.00'}
                    </div>
                  </div>

                  {/* Compatibility Hint */}
                  {item.car_make && (
                    <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                       <span className="flex items-center gap-1.5 text-[10px] font-black text-white uppercase bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                          <ShieldCheck className="w-3.5 h-3.5 text-gold-500" /> Fits {item.car_make} {item.car_model}
                       </span>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-2 pl-2">
                   <p className="text-gold-500 text-[10px] font-black uppercase tracking-[0.2em]">{item.brand || 'Bespoke Collection'}</p>
                   <h3 className="text-2xl font-black text-white tracking-tighter italic group-hover:text-gold-500 transition-colors">
                     {item.name}
                   </h3>
                   <p className="text-silver-400 text-sm line-clamp-2 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                     {item.description || 'Exclusive automotive refinement.'}
                   </p>
                </div>
              </Link>
            ))}

            {filteredItems.length === 0 && (
              <div className="col-span-full py-40 glass-panel rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-6">
                 <Package className="w-20 h-20 text-white/5" />
                 <div className="text-center">
                    <h3 className="text-2xl font-black text-silver-400 mb-2">{t('store.empty_title')}</h3>
                    <p className="text-silver-600 font-bold uppercase text-xs tracking-widest">{t('store.empty_subtitle')}</p>
                 </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
