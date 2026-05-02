import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Grid, Search, Loader2 } from 'lucide-react';
import CarCard from '../../components/ui/CarCard';

import api from '../../utils/api';

export default function FavoritesList() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('cars');
  const [favoriteCars, setFavoriteCars] = useState([]);
  const [favoriteParts, setFavoriteParts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await api.get('/interactions/favorites/');
      const data = response.data;
      
      // Filter based on the content_type_model string from the backend
      const cars = data
        .filter(item => item.content_type_model === 'car')
        .map(item => ({ ...item.content_object, favorite_id: item.id }));
        
      const parts = data
        .filter(item => item.content_type_model === 'part')
        .map(item => ({ ...item.content_object, favorite_id: item.id }));

      setFavoriteCars(cars);
      setFavoriteParts(parts);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCar = (carId) => {
    setFavoriteCars(prev => prev.filter(car => car.id !== carId));
  };

  const handleRemovePart = async (partId) => {
    try {
      await api.delete('/interactions/favorites/remove/', {
        data: {
          content_type_model: 'part',
          object_id: partId
        }
      });
      setFavoriteParts(prev => prev.filter(part => part.id !== partId));
    } catch (error) {
      console.error('Error removing part from favorites:', error);
    }
  };

  return (
    <div className="min-h-screen bg-premium-900 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12 border-b border-premium-border pb-8 px-4 sm:px-0">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center gap-3 uppercase tracking-tighter">
              <Heart className="w-8 h-8 text-gold-500 fill-gold-500" /> {t('favorites.title')}
            </h1>
            <p className="text-silver-400 text-sm md:text-lg font-medium">{t('favorites.subtitle')}</p>
          </div>
          
          <div className="flex bg-premium-800 p-1.5 rounded-xl border border-white/5 w-fit">
            <button 
              onClick={() => setActiveTab('cars')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'cars' ? 'bg-gold-500 text-premium-900 shadow-md' : 'text-silver-400 hover:text-white'}`}
            >
              {t('favorites.saved_cars')} ({favoriteCars.length})
            </button>
            <button 
              onClick={() => setActiveTab('parts')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'parts' ? 'bg-gold-500 text-premium-900 shadow-md' : 'text-silver-400 hover:text-white'}`}
            >
              {t('favorites.saved_parts')} ({favoriteParts.length})
            </button>
          </div>
        </div>

        {/* Content Box */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
             <Loader2 className="w-12 h-12 text-gold-500 animate-spin mb-4" />
             <p className="text-silver-400 font-medium animate-pulse">{t('favorites.accessing')}</p>
          </div>
        ) : (
          <>
            {activeTab === 'cars' && (
              <div className="animate-fade-in">
                 {favoriteCars.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                      {favoriteCars.map(car => (
                        <CarCard key={car.id} car={car} onRemove={handleRemoveCar} />
                      ))}
                    </div>
                 ) : (
                   <div className="text-center py-20 bg-premium-800/30 rounded-2xl border border-white/5 border-dashed">
                     <Grid className="w-12 h-12 text-silver-500 mx-auto mb-4" />
                     <h3 className="text-xl font-bold text-white mb-2">{t('favorites.empty_cars')}</h3>
                     <p className="text-silver-400 mb-6">{t('car_details.trust_required')}</p>
                     <button onClick={() => window.location.href='/catalog'} className="luxury-button px-8 py-3">{t('favorites.explore_catalog')}</button>
                   </div>
                 )}
              </div>
            )}

            {activeTab === 'parts' && (
              <div className="animate-fade-in">
                {favoriteParts.length > 0 ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                     {favoriteParts.map(part => (
                       <div key={part.id} className="glass-panel p-4 rounded-2xl relative group">
                         <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-black/40">
                           <img src={part.image} alt={part.name} className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all" />
                         </div>
                         <p className="text-gold-500 text-[10px] uppercase tracking-wider font-bold">{part.brand}</p>
                         <h3 className="text-white font-semibold leading-tight line-clamp-1">{part.name}</h3>
                         <div className="flex items-center justify-between mt-1">
                           <p className="text-silver-300 font-medium">${part.price.toLocaleString()}</p>
                           <button 
                             onClick={() => handleRemovePart(part.id)}
                             className="text-gold-500 hover:text-gold-400 transition-colors p-1"
                             title={t('favorites.remove', { defaultValue: 'Remove from Favorites' })}
                           >
                             <Heart className="w-4 h-4 fill-gold-500" />
                           </button>
                         </div>
                         <button onClick={() => window.location.href=`/store/part/${part.id}`} className="mt-4 w-full py-2 bg-premium-800 hover:bg-gold-500 hover:text-premium-900 border border-premium-border hover:border-gold-500 text-[10px] text-silver-400 uppercase font-black tracking-widest transition-colors rounded-lg">
                           {t('my_purchases.view_details', { defaultValue: 'View Details' })}
                         </button>
                       </div>
                     ))}
                   </div>
                 ) : (
                    <div className="text-center py-20 bg-premium-800/30 rounded-2xl border border-white/5 border-dashed">
                     <Search className="w-12 h-12 text-silver-500 mx-auto mb-4" />
                     <h3 className="text-xl font-bold text-white mb-2">{t('favorites.empty_parts')}</h3>
                     <p className="text-silver-400 mb-6">{t('car_details.trust_required')}</p>
                     <button onClick={() => window.location.href='/store'} className="luxury-button px-8 py-3">{t('favorites.visit_boutique')}</button>
                   </div>
                 )}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
