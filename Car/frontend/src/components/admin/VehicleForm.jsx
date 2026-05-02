import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Plus, Edit } from 'lucide-react';

export default function VehicleForm({ initialData, onSubmit, onCancel, mode = 'add' }) {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    make: initialData?.make || '',
    model: initialData?.model || '',
    year: initialData?.year || new Date().getFullYear(),
    description: initialData?.description || '',
    price: initialData?.price || '',
    daily_rent_price: initialData?.daily_rent_price || '',
    image_url: initialData?.image_url || '',
    is_for_sale: initialData?.is_for_sale ?? true,
    is_for_rent: initialData?.is_for_rent ?? false,
    specs_color: initialData?.specs?.color || '',
    specs_engine: initialData?.specs?.engine || '',
    specs_0_to_60: initialData?.specs?.["0_to_60mph"] || '',
    specs_top_speed: initialData?.specs?.top_speed || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Construct the nested JSON payload for specs
    const payload = {
      make: formData.make,
      model: formData.model,
      year: parseInt(formData.year),
      description: formData.description,
      price: formData.price || null,
      daily_rent_price: formData.daily_rent_price || null,
      image_url: formData.image_url,
      is_for_sale: formData.is_for_sale,
      is_for_rent: formData.is_for_rent,
      specs: {
        color: formData.specs_color,
        engine: formData.specs_engine,
        "0_to_60mph": formData.specs_0_to_60,
        top_speed: formData.specs_top_speed
      }
    };

    onSubmit(payload);
  };

  const isEditMode = mode === 'edit';

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-8">
      {/* Core Details */}
      <div>
        <h3 className="text-gold-500 uppercase tracking-widest text-xs font-bold mb-4">
          {t('admin.inventory.core_identity')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-silver-400 mb-2 font-bold">
              {t('admin.inventory.make')}
            </label>
            <input 
              required 
              type="text" 
              className="luxury-input w-full py-2.5" 
              placeholder="e.g. Lamborghini" 
              value={formData.make} 
              onChange={(e) => setFormData({...formData, make: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-silver-400 mb-2 font-bold">
              {t('admin.inventory.model')}
            </label>
            <input 
              required 
              type="text" 
              className="luxury-input w-full py-2.5" 
              placeholder="e.g. Aventador SVJ" 
              value={formData.model} 
              onChange={(e) => setFormData({...formData, model: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-silver-400 mb-2 font-bold">
              {t('admin.inventory.year')}
            </label>
            <input 
              required 
              type="number" 
              className="luxury-input w-full py-2.5 font-mono" 
              value={formData.year} 
              onChange={(e) => setFormData({...formData, year: e.target.value})} 
            />
          </div>
        </div>
      </div>

      {/* Detailed Specs */}
      <div>
        <h3 className="text-gold-500 uppercase tracking-widest text-xs font-bold mb-4">
          {t('admin.inventory.tech_specs')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-silver-400 mb-2 font-bold">
              {t('admin.inventory.exterior_color')}
            </label>
            <input 
              type="text" 
              className="luxury-input w-full py-2.5" 
              placeholder="e.g. Rosso Corsa" 
              value={formData.specs_color} 
              onChange={(e) => setFormData({...formData, specs_color: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-silver-400 mb-2 font-bold">
              {t('admin.inventory.engine')}
            </label>
            <input 
              type="text" 
              className="luxury-input w-full py-2.5" 
              placeholder="e.g. 6.5L V12" 
              value={formData.specs_engine} 
              onChange={(e) => setFormData({...formData, specs_engine: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-silver-400 mb-2 font-bold">
              {t('admin.inventory.0_to_60')}
            </label>
            <input 
              type="text" 
              className="luxury-input w-full py-2.5 font-mono" 
              placeholder="e.g. 2.8s" 
              value={formData.specs_0_to_60} 
              onChange={(e) => setFormData({...formData, specs_0_to_60: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-silver-400 mb-2 font-bold">
              {t('admin.inventory.top_speed')}
            </label>
            <input 
              type="text" 
              className="luxury-input w-full py-2.5 font-mono" 
              placeholder="e.g. 217 mph" 
              value={formData.specs_top_speed} 
              onChange={(e) => setFormData({...formData, specs_top_speed: e.target.value})} 
            />
          </div>
        </div>
      </div>

      {/* Media & Describe */}
      <div>
        <h3 className="text-gold-500 uppercase tracking-widest text-xs font-bold mb-4">
          {t('admin.inventory.media_desc')}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-silver-400 mb-2 font-bold">
              {t('admin.inventory.img_url')}
            </label>
            <input 
              type="url" 
              className="luxury-input w-full py-2.5 font-mono text-sm" 
              placeholder="https://images.unsplash.com/photo-..." 
              value={formData.image_url} 
              onChange={(e) => setFormData({...formData, image_url: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-silver-400 mb-2 font-bold">
              {t('admin.inventory.desc_label')}
            </label>
            <textarea 
              rows={3} 
              className="luxury-input w-full py-2.5 text-sm resize-none" 
              placeholder="Elaborate on the vehicle's history, condition, and options..." 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
            />
          </div>
        </div>
      </div>

      {/* Commercial Data */}
      <div>
        <h3 className="text-gold-500 uppercase tracking-widest text-xs font-bold mb-4">
          {t('admin.inventory.comm_config')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-premium-800/30 p-6 rounded-xl border border-white/5">
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-gold-500" 
                checked={formData.is_for_sale} 
                onChange={(e) => setFormData({...formData, is_for_sale: e.target.checked})} 
              />
              <span className="font-bold">{t('admin.inventory.avail_purchase')}</span>
            </label>
            {formData.is_for_sale && (
              <div>
                <label className="block text-xs uppercase tracking-wider text-silver-400 mb-2 font-bold">
                  {t('admin.inventory.sale_price')}
                </label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="luxury-input w-full py-2.5 font-mono text-gold-400 font-bold" 
                  value={formData.price} 
                  onChange={(e) => setFormData({...formData, price: e.target.value})} 
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-gold-500" 
                checked={formData.is_for_rent} 
                onChange={(e) => setFormData({...formData, is_for_rent: e.target.checked})} 
              />
              <span className="font-bold">{t('admin.inventory.avail_rent')}</span>
            </label>
            {formData.is_for_rent && (
              <div>
                <label className="block text-xs uppercase tracking-wider text-silver-400 mb-2 font-bold">
                  {t('admin.inventory.daily_rate')}
                </label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="luxury-input w-full py-2.5 font-mono text-gold-400 font-bold" 
                  value={formData.daily_rent_price} 
                  onChange={(e) => setFormData({...formData, daily_rent_price: e.target.value})} 
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 flex justify-end gap-4">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-6 py-3 font-bold text-silver-400 hover:text-white transition-colors"
        >
          {t('admin.inventory.cancel')}
        </button>
        <button 
          type="submit" 
          className="bg-gold-500 hover:bg-gold-400 text-premium-900 px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors"
        >
          <CheckCircle className="w-5 h-5" /> 
          {isEditMode ? t('admin.inventory.edit_commit') : t('admin.inventory.commit')}
        </button>
      </div>
    </form>
  );
}
