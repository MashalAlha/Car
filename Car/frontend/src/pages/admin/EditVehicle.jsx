import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Car, Camera, CheckCircle, ArrowLeft, X, Upload, ShieldCheck, AlertCircle, FileText, Settings, CreditCard } from 'lucide-react';
import api from '../../utils/api';

export default function EditVehicle() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    description: '',
    price: '',
    daily_rent_price: '',
    is_for_sale: true,
    is_for_rent: false,
    specs_color: '',
    specs_engine: '',
    specs_0_to_60: '',
    specs_top_speed: ''
  });

  // Existing images from backend
  const [existingImages, setExistingImages] = useState([]);
  const [deleteImageIds, setDeleteImageIds] = useState([]);
  
  // New images being uploaded
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await api.get(`/cars/inventory/${id}/`);
        const data = res.data;
        
        setFormData({
          make: data.make || '',
          model: data.model || '',
          year: data.year || '',
          description: data.description || '',
          price: data.price || '',
          daily_rent_price: data.daily_rent_price || '',
          is_for_sale: data.is_for_sale,
          is_for_rent: data.is_for_rent,
          specs_color: data.specs?.color || '',
          specs_engine: data.specs?.engine || '',
          specs_0_to_60: data.specs?.['0_to_60mph'] || '',
          specs_top_speed: data.specs?.top_speed || ''
        });
        
        setExistingImages(data.images || []);
      } catch (err) {
        console.error("Failed to fetch vehicle", err);
        setError(err.response?.data?.detail || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  // Validation Logic for Action Center
  const validation = {
    identity: formData.make && formData.model && formData.year,
    specs: formData.specs_color && formData.specs_engine,
    media: (existingImages.length - deleteImageIds.length + newImages.length) > 0,
    commercial: (formData.is_for_sale ? formData.price > 0 : true) && (formData.is_for_rent ? formData.daily_rent_price > 0 : true),
    desc: formData.description.length > 10
  };

  const isFormReady = Object.values(validation).every(v => v);

  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files);
    const currentCount = existingImages.length - deleteImageIds.length + newImages.length;
    
    if (currentCount + files.length > 5) {
      alert("You can only have up to 5 images per vehicle.");
      return;
    }

    setNewImages([...newImages, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setNewPreviews([...newPreviews, ...previews]);
  };

  const removeNewImage = (index) => {
    const updated = [...newImages];
    updated.splice(index, 1);
    setNewImages(updated);

    const updatedPreviews = [...newPreviews];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);
    setNewPreviews(updatedPreviews);
  };

  const markForDeletion = (imageId) => {
    if (deleteImageIds.includes(imageId)) {
      setDeleteImageIds(deleteImageIds.filter(i => i !== imageId));
    } else {
      setDeleteImageIds([...deleteImageIds, imageId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormReady) return;
    try {
      const data = new FormData();
      
      // Basic Fields
      data.append('make', formData.make);
      data.append('model', formData.model);
      data.append('year', formData.year);
      data.append('description', formData.description);
      data.append('price', formData.price || '');
      data.append('daily_rent_price', formData.daily_rent_price || '');
      data.append('is_for_sale', formData.is_for_sale);
      data.append('is_for_rent', formData.is_for_rent);

      // Specs
      const specs = {
        color: formData.specs_color,
        engine: formData.specs_engine,
        "0_to_60mph": formData.specs_0_to_60,
        top_speed: formData.specs_top_speed
      };
      data.append('specs', JSON.stringify(specs));

      // Images setup
      newImages.forEach(img => data.append('uploaded_images', img));
      deleteImageIds.forEach(id => data.append('delete_image_ids', id));

      await api.patch(`/cars/inventory/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert(t('admin.inventory.update_success', { defaultValue: 'Vehicle updated successfully.' }));
      navigate('/admin/inventory');
    } catch (err) {
      console.error("Update error:", err);
      const errorMsg = err.response?.data?.detail || JSON.stringify(err.response?.data) || err.message;
      alert(`Failed to update: ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-premium-950">
      <div className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-premium-950 text-white p-6">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Error Loading Vehicle</h2>
      <p className="text-silver-400 mb-6">{error}</p>
      <button onClick={() => navigate('/admin/inventory')} className="luxury-button px-6 py-2">Return to Inventory</button>
    </div>
  );

  return (
    <div className="min-h-screen p-4 lg:p-8 max-w-7xl mx-auto bg-premium-950 text-white">
      <div className="flex justify-between items-center mb-10">
        <div>
           <button 
             onClick={() => navigate('/admin/inventory')}
             className="flex items-center gap-2 text-silver-400 hover:text-white transition-colors mb-4 group font-bold tracking-widest uppercase text-[10px]"
           >
             <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
             {t('admin.inventory.back_to_catalog', { defaultValue: 'Back to Inventory' })}
           </button>
           <h1 className="text-4xl font-bold flex items-center gap-3">
             <Settings className="text-gold-500 w-10 h-10" /> {t('admin.inventory.edit_vehicle', { defaultValue: 'Modify Vehicle' })}
           </h1>
           <p className="text-silver-400 mt-2">{formData.make} {formData.model} ({formData.year})</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Step 1: Media Management */}
          <div className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-gold-500 uppercase tracking-widest text-[10px] font-black mb-6 flex items-center gap-2">
                 <Camera className="w-4 h-4" /> {t('admin.inventory.media_desc')}
               </h3>
               
               <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {/* Existing Images */}
                  {existingImages.map((img) => (
                    <div key={img.id} className={`relative group aspect-square rounded-2xl overflow-hidden border transition-all ${deleteImageIds.includes(img.id) ? 'border-red-500/50 grayscale opacity-50scale-95' : 'border-white/10 shadow-2xl'}`}>
                      <img src={img.image} alt="existing" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => markForDeletion(img.id)} 
                        className={`absolute top-2 right-2 p-1.5 rounded-full transition-all ${deleteImageIds.includes(img.id) ? 'bg-green-500 text-white' : 'bg-red-500 text-white opacity-0 group-hover:opacity-100'}`}
                      >
                        {deleteImageIds.includes(img.id) ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                      {img.is_primary && !deleteImageIds.includes(img.id) && <div className="absolute bottom-0 inset-x-0 bg-gold-500/90 text-premium-900 text-[8px] font-black uppercase text-center py-1">Primary Cover</div>}
                      {deleteImageIds.includes(img.id) && <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center text-[8px] font-black uppercase text-white tracking-widest">Marked for Deletion</div>}
                    </div>
                  ))}

                  {/* New Image Previews */}
                  {newPreviews.map((src, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-gold-500/30 shadow-2xl">
                      <img src={src} alt="new-preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full">
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-blue-500/90 text-white text-[8px] font-black uppercase text-center py-1">New Upload</div>
                    </div>
                  ))}
                  
                  {(existingImages.length - deleteImageIds.length + newImages.length) < 5 && (
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-white/10 hover:border-gold-500/50 hover:bg-white/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-silver-400 group-hover:text-gold-500" />
                      </div>
                      <span className="text-[10px] text-silver-500 font-bold uppercase tracking-widest">Add Photo</span>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleNewImageChange} />
                    </label>
                  )}
               </div>
               <p className="text-[10px] text-silver-600 mt-4 italic">{t('admin.inventory.modify_portfolio_desc')}</p>
             </div>
             <Camera className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 pointer-events-none" />
          </div>

          {/* Step 2: Core Identity */}
          <div className="glass-panel p-8 rounded-3xl border border-white/5">
            <h3 className="text-gold-500 uppercase tracking-widest text-[10px] font-black mb-6"> {t('admin.inventory.core_identity')} </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-silver-500 font-bold">{t('admin.inventory.make')}</label>
                  <input required type="text" className="luxury-input w-full" value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-silver-500 font-bold">{t('admin.inventory.model')}</label>
                  <input required type="text" className="luxury-input w-full" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-silver-500 font-bold">{t('admin.inventory.year')}</label>
                  <input required type="number" className="luxury-input w-full font-mono" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
               </div>
            </div>
          </div>

          {/* Step 3: Technical Specs */}
          <div className="glass-panel p-8 rounded-3xl border border-white/5">
            <h3 className="text-gold-500 uppercase tracking-widest text-[10px] font-black mb-6"> {t('admin.inventory.tech_specs')} </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-silver-500 font-bold">{t('admin.inventory.exterior_color')}</label>
                  <input type="text" className="luxury-input w-full font-bold" value={formData.specs_color} onChange={e => setFormData({...formData, specs_color: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-silver-500 font-bold">{t('admin.inventory.engine')}</label>
                  <input type="text" className="luxury-input w-full font-bold" value={formData.specs_engine} onChange={e => setFormData({...formData, specs_engine: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-silver-500 font-bold">{t('admin.inventory.0_to_60')}</label>
                  <input type="text" className="luxury-input w-full font-mono font-bold" value={formData.specs_0_to_60} onChange={e => setFormData({...formData, specs_0_to_60: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-silver-500 font-bold">{t('admin.inventory.top_speed')}</label>
                  <input type="text" className="luxury-input w-full font-mono font-bold" value={formData.specs_top_speed} onChange={e => setFormData({...formData, specs_top_speed: e.target.value})} />
               </div>
            </div>
          </div>

          {/* Step 4: Description */}
          <div className="glass-panel p-8 rounded-3xl border border-white/5">
             <label className="block text-[10px] uppercase tracking-widest text-gold-500 font-black mb-4">{t('admin.inventory.desc_label')}</label>
             <textarea rows={6} className="luxury-input w-full resize-none leading-relaxed" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          {/* Step 5: Commercial Config */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="glass-panel p-8 rounded-3xl border border-white/5">
                <label className="flex items-center gap-4 cursor-pointer mb-6 group">
                   <div className={`w-6 h-6 rounded border-2 border-gold-500 flex items-center justify-center transition-colors ${formData.is_for_sale ? 'bg-gold-500' : 'bg-transparent'}`}>
                    {formData.is_for_sale && <CheckCircle className="w-5 h-5 text-premium-900" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.is_for_sale} onChange={e => setFormData({...formData, is_for_sale: e.target.checked})} />
                  <span className="text-xl font-bold group-hover:text-gold-400 transition-colors uppercase tracking-tight">{t('admin.inventory.for_sale')}</span>
                </label>
                {formData.is_for_sale && (
                  <div className="space-y-2 animate-fade-in">
                     <label className="block text-[10px] uppercase tracking-widest text-silver-500 font-bold">{t('admin.inventory.sale_price')}</label>
                     <input required type="number" step="0.01" className="luxury-input w-full font-mono text-xl text-gold-500 font-black" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  </div>
                )}
             </div>

             <div className="glass-panel p-8 rounded-3xl border border-white/5">
                <label className="flex items-center gap-4 cursor-pointer mb-6 group">
                  <div className={`w-6 h-6 rounded border-2 border-gold-500 flex items-center justify-center transition-colors ${formData.is_for_rent ? 'bg-gold-500' : 'bg-transparent'}`}>
                    {formData.is_for_rent && <CheckCircle className="w-4 h-4 text-premium-900" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.is_for_rent} onChange={e => setFormData({...formData, is_for_rent: e.target.checked})} />
                  <span className="text-xl font-bold group-hover:text-gold-400 transition-colors uppercase tracking-tight">{t('admin.inventory.for_rent')}</span>
                </label>
                {formData.is_for_rent && (
                  <div className="space-y-2 animate-fade-in">
                     <label className="block text-[10px] uppercase tracking-widest text-silver-500 font-bold">{t('admin.inventory.daily_rate')}</label>
                     <input required type="number" step="0.01" className="luxury-input w-full font-mono text-xl text-gold-500 font-black" value={formData.daily_rent_price} onChange={e => setFormData({...formData, daily_rent_price: e.target.value})} />
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Right Column: Action Center */}
        <div className="lg:col-span-1 sticky top-24">
           <div className="glass-panel p-6 rounded-3xl border border-gold-500/20 shadow-3xl bg-premium-900/60 backdrop-blur-xl">
             <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
               <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">{t('admin.inventory.action_center.title')}</h2>
               <div className="bg-gold-500/10 text-gold-500 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-gold-500/20">
                 {t('admin.inventory.modification_mode')}
               </div>
             </div>

             {/* Validation Checklist */}
             <div className="space-y-4 mb-10">
               <h3 className="text-[10px] text-silver-600 font-black uppercase tracking-widest flex items-center gap-2">
                 <ShieldCheck className="w-3.5 h-3.5" /> {t('admin.inventory.action_center.readiness_score')}
               </h3>
               {[
                 { label: t('admin.inventory.action_center.check_identity'), ready: validation.identity, icon: <Car className="w-4 h-4" /> },
                 { label: t('admin.inventory.action_center.check_specs'), ready: validation.specs, icon: <Settings className="w-4 h-4" /> },
                 { label: t('admin.inventory.action_center.check_media'), ready: validation.media, icon: <Camera className="w-4 h-4" /> },
                 { label: t('admin.inventory.action_center.check_commercial'), ready: validation.commercial, icon: <CreditCard className="w-4 h-4" /> },
                 { label: t('admin.inventory.action_center.check_desc'), ready: validation.desc, icon: <FileText className="w-4 h-4" /> }
               ].map((item, i) => (
                 <div key={i} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${item.ready ? 'bg-green-500/5 border-green-500/20' : 'bg-white/2 border-white/5'}`}>
                    <div className="flex items-center gap-3">
                      <div className={item.ready ? 'text-green-500' : 'text-silver-600'}>{item.icon}</div>
                      <span className={`text-[11px] font-bold ${item.ready ? 'text-white' : 'text-silver-500'}`}>{item.label}</span>
                    </div>
                    {item.ready ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-silver-700" />}
                 </div>
               ))}
             </div>

             {/* Action Buttons */}
             <div className="space-y-4">
               <button 
                 disabled={saving || !isFormReady}
                 type="submit"
                 className={`w-full py-5 rounded-2xl font-black tracking-[0.2em] uppercase text-xs flex items-center justify-center gap-3 shadow-2xl transition-all relative overflow-hidden group
                   ${!isFormReady ? 'bg-premium-800 text-silver-600 cursor-not-allowed border border-white/5' : 'bg-gold-500 text-premium-950 hover:bg-gold-400 active:scale-[0.98] shadow-gold-500/20 border-b-4 border-gold-700'}
                 `}
               >
                 {saving ? <div className="w-5 h-5 border-4 border-premium-950/20 border-t-premium-950 rounded-full animate-spin"></div> : <CheckCircle className="w-5 h-5" />}
                 {t('admin.inventory.update_btn', { defaultValue: 'Save Changes' })}
                 {isFormReady && <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-[45deg]" />}
               </button>

               <button 
                 type="button" 
                 onClick={() => navigate('/admin/inventory')}
                 className="w-full py-4 rounded-2xl border border-white/10 text-silver-500 font-bold hover:text-white hover:bg-white/5 transition-all text-xs uppercase tracking-widest"
               >
                 {t('admin.inventory.cancel')}
               </button>
             </div>
             
             <p className="mt-8 text-[9px] text-silver-700 text-center uppercase tracking-tighter leading-relaxed">
               {t('admin.inventory.action_center.legal_disclaimer')}
             </p>
           </div>
        </div>
      </form>
    </div>
  );
}
