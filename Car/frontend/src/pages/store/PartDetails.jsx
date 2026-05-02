import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ShoppingBag, ShieldCheck, Wrench, Package, ArrowRight, Heart, Share2, Lock, AlertCircle, CheckCircle, FileText, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../contexts/CartContext';

import api from '../../utils/api';

export default function PartDetails() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  
  const { addToCart, cartItems } = useCart();
  const isLoggedIn = !!localStorage.getItem('user_access_token');
  const itemInCart = part ? cartItems.find(i => i.id === part?.id) : null;

  const fetchPart = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/store/inventory/${id}/`);
      setPart(res.data);
      setIsFavorite(res.data.is_favorited || false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!isLoggedIn) {
      alert("Please login to save favorites.");
      return;
    }

    const prevState = isFavorite;
    setIsFavorite(!prevState);

    try {
      if (!prevState) {
        await api.post('/interactions/favorites/', {
          content_type_model: 'part',
          object_id: part.id
        });
      } else {
        await api.delete('/interactions/favorites/remove/', {
          data: {
            content_type_model: 'part',
            object_id: part.id
          }
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setIsFavorite(prevState);
    }
  };

  useEffect(() => {
    fetchPart();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-premium-950 px-6">
        <div className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin mb-6" />
        <p className="text-silver-400 font-black uppercase tracking-widest text-xs">Authenticating Store Asset...</p>
      </div>
    );
  }

  if (error || !part) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-premium-950 px-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500/50 mb-6" />
        <h2 className="text-4xl font-black text-white mb-4 italic tracking-tighter uppercase">{t('car_details.not_found')}</h2>
        <p className="text-silver-400 max-w-md mb-10 font-medium">The specific part or accessory you are looking for is currently unavailable in our Store Management catalog.</p>
        <Link to="/store" className="luxury-button px-10 py-4 flex items-center gap-3">
          <ChevronLeft className="w-5 h-5" /> Visit Store Management
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 pt-32 bg-premium-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link to="/store" className="inline-flex items-center gap-3 text-silver-500 hover:text-gold-500 transition-all mb-12 font-black uppercase text-[10px] tracking-widest group">
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> {t('store.back_to_catalog')}
        </Link>
        
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* Visual Showcase */}
          <div className="w-full lg:w-1/2 sticky top-32">
            <div className="aspect-[4/5] rounded-[40px] overflow-hidden bg-premium-900 border border-white/5 shadow-3xl group relative">
              {part.image ? (
                <img 
                  src={part.image} 
                  alt={part.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-5">
                   <Package className="w-32 h-32 text-white" />
                </div>
              )}
              
              <div className="absolute top-8 left-8">
                 <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-2 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest">
                    Store SKU: {part.sku}
                 </div>
              </div>

              {part.is_accessory && (
                <div className="absolute top-8 right-8">
                   <div className="bg-gold-500 text-premium-950 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl">
                      Aesthetic Selection
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* Technical Specifications & Commerce */}
          <div className="w-full lg:w-1/2 space-y-12">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <p className="text-gold-500 font-black tracking-[0.3em] uppercase text-xs">{part.brand || 'Original Equipment'}</p>
                <div className="flex gap-4">
                  <button onClick={toggleFavorite} className="p-3 glass-panel rounded-full border-white/5 hover:border-gold-500/30 transition-all">
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-gold-500 text-gold-500' : 'text-silver-400'}`} />
                  </button>
                  <button className="p-3 glass-panel rounded-full border-white/5 hover:border-gold-500/30 transition-all">
                    <Share2 className="w-5 h-5 text-silver-400" />
                  </button>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter leading-[0.9]">
                {part.name}
              </h1>
              
              <div className="text-5xl text-gold-500 font-black italic tracking-tighter">
                ${part.price ? parseFloat(part.price).toLocaleString() : '0.00'}
              </div>
            </div>

            <div className="space-y-8 py-10 border-y border-white/5">
              <div className="space-y-4">
                <h3 className="text-white font-black uppercase text-xs tracking-widest flex items-center gap-3">
                  <FileText className="w-4 h-4 text-gold-500" /> {t('store.exec_summary')}
                </h3>
                <p className="text-silver-400 text-lg leading-relaxed font-medium">
                  {part.description || t('store.default_description')}
                </p>
              </div>

              {/* Compatibility Module */}
              {(part.car_make || part.car_model) && (
                <div className="glass-panel p-8 rounded-3xl border border-gold-500/20 bg-gold-500/5">
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="w-6 h-6 text-gold-500" />
                    <h4 className="text-white text-sm font-black uppercase tracking-widest">{t('store.compatibility')}</h4>
                  </div>
                  <div className="p-4 bg-premium-950/50 rounded-2xl border border-white/5">
                     <p className="text-white font-bold text-lg italic">
                        {t('store.compatible_with', { 
                          make: part.car_make || t('common.any'), 
                          model: part.car_model || t('common.universal'), 
                          year: part.model_year || t('common.any') 
                        })}
                     </p>
                     <p className="text-silver-500 text-xs mt-2 font-medium">{t('store.verified_by')}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-4 text-silver-300">
                  <div className="p-3 bg-premium-900 rounded-2xl">
                    <Package className="w-5 h-5 text-gold-500" />
                  </div>
                  <div>
                    <span className="block text-[8px] font-black uppercase text-silver-600 leading-none mb-1">{t('store.stock_level')}</span>
                    <span className={`text-xs font-bold ${part.stock_quantity > 0 ? 'text-green-500' : 'text-red-400'}`}>
                      {part.stock_quantity > 0 ? `${part.stock_quantity} ${t('store.units_available')}` : t('store.out_of_stock')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-silver-300">
                  <div className="p-3 bg-premium-900 rounded-2xl">
                    <Wrench className="w-5 h-5 text-gold-500" />
                  </div>
                  <div>
                    <span className="block text-[8px] font-black uppercase text-silver-600 leading-none mb-1">{t('store.service_option')}</span>
                    <span className={`text-xs font-bold ${part.installation_available ? 'text-white' : 'text-silver-500'}`}>
                      {part.installation_available ? t('store.installation_available') : t('store.self_install')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Acquisition Action */}
            <div className="space-y-6">
              {!isLoggedIn ? (
                 <div className="space-y-6">
                   <div className="p-6 bg-premium-900 border border-white/5 rounded-3xl flex items-start gap-4">
                     <Lock className="w-6 h-6 text-gold-500 shrink-0 mt-1" />
                     <p className="text-xs text-silver-400 font-medium leading-relaxed italic">
                       {t('auth.login_required_desc')}
                     </p>
                   </div>
                   <Link 
                     to="/login" 
                     className="w-full luxury-button py-6 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3"
                   >
                     {t('auth.action_login')} <ArrowRight className="w-5 h-5" />
                   </Link>
                 </div>
              ) : (
                <>
                  <button 
                    disabled={part.stock_quantity <= 0}
                    onClick={() => {
                      addToCart(part, 1);
                      setAddedToCart(true);
                      setTimeout(() => setAddedToCart(false), 2000);
                    }}
                    className={`w-full py-6 rounded-3xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-4 transition-all relative overflow-hidden group shadow-3xl
                      ${addedToCart ? 'bg-green-500 text-white' : part.stock_quantity > 0 ? 'bg-gold-500 text-premium-900 hover:bg-gold-400 active:scale-[0.98]' : 'bg-premium-800 text-silver-600 cursor-not-allowed'}
                    `}
                  >
                    {addedToCart ? (
                      <><Check className="w-6 h-6 relative z-10" /><span className="relative z-10">{t('store.added_to_cart')}</span></>
                    ) : (
                      <><ShoppingBag className="w-6 h-6 relative z-10" /><span className="relative z-10">{part.stock_quantity > 0 ? (itemInCart ? t('store.add_more') : t('store.add_to_cart')) : t('store.out_of_stock')}</span></>
                    )}
                  </button>
                  {itemInCart && !addedToCart && (
                    <p className="text-center text-xs text-gold-500 font-bold mt-2">{itemInCart.quantity} {t('store.already_in_cart')}</p>
                  )}
                </>
              )}
              
              <div className="flex items-center justify-center gap-3 text-[10px] text-silver-600 font-bold uppercase tracking-widest">
                 <CheckCircle className="w-3.5 h-3.5 text-gold-500/50" /> {t('store.secure_protocol')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
