import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';

export default function CarCard({ car, onRemove }) {
  const { t } = useTranslation();
  const [isFavorite, setIsFavorite] = useState(car.is_favorited || false);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!localStorage.getItem('user_access_token')) {
      alert("Please login to save favorites.");
      return;
    }

    const prevState = isFavorite;
    setIsFavorite(!prevState); // Optimistic Update

    try {
      if (!prevState) {
        // Add to favorites
        await api.post('/interactions/favorites/', {
          content_type_model: 'car',
          object_id: car.id
        });
      } else {
        // Remove from favorites
        await api.delete('/interactions/favorites/remove/', {
          data: {
            content_type_model: 'car',
            object_id: car.id
          }
        });
        if (onRemove) onRemove(car.id);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setIsFavorite(prevState); // Rollback on failure
    }
  };

  return (
    <div className="glass-panel rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-gold-500/30 transition-all duration-300 transform hover:-translate-y-1 relative group">
      <div className="relative aspect-video bg-premium-800">
        <img 
          src={car.image_url || 'https://images.unsplash.com/photo-1555353540-64fd1b6228ac?auto=format&fit=crop&q=80&w=1200'} 
          alt={`${car.make} ${car.model}`}
          className="object-cover w-full h-full opacity-80 hover:opacity-100 transition-opacity duration-500"
        />
        <div className="absolute top-4 right-4 bg-premium-900/80 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-gold-400 border border-gold-400/20 z-20">
          {car.year}
        </div>

        {/* Favorite & Share Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          {localStorage.getItem('user_access_token') && (
            <button 
              onClick={toggleFavorite}
              className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/70 transition-colors"
            >
              <Heart className={`w-4 h-4 transition-all ${isFavorite ? 'fill-gold-500 text-gold-500' : 'text-white'}`} />
            </button>
          )}
          <button className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/70 transition-colors tooltip" aria-label="Share">
             <Share2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
      
      <div className="p-5">
        <p className="text-silver-400 text-xs uppercase tracking-wider font-semibold mb-1">{car.make}</p>
        <h3 className="text-xl font-bold text-white mb-2">{car.model}</h3>
        
        <div className="flex items-center justify-between mt-4">
          <div>
            {car.is_for_sale ? (
              <p className="text-gold-500 font-medium">${parseFloat(car.price).toLocaleString()}</p>
            ) : (
              <p className="text-silver-300 font-medium">${parseFloat(car.daily_rent_price).toLocaleString()} <span className="text-xs text-silver-400 font-normal">/ day</span></p>
            )}
          </div>
          <Link 
            to={`/cars/${car.id}`} 
            className="text-sm border border-silver-400 hover:border-gold-400 text-silver-300 hover:text-gold-400 px-4 py-1.5 rounded-lg transition-colors"
          >
            {t('Explore')}
          </Link>
        </div>
      </div>
    </div>
  );
}
