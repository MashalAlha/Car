import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Car, Camera, CheckCircle, ArrowLeft, X, Upload, ShieldCheck, AlertCircle, FileText, Settings, CreditCard } from 'lucide-react';
import api from '../../utils/api';

export default function AddVehicle() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
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

  const [images, setImages] = useState([]); // Array of File objects
  const [previews, setPreviews] = useState([]);

  // Validation Logic for Action Center
  const validation = {
    identity: formData.make && formData.model && formData.year,
    specs: formData.specs_color && formData.specs_engine,
    media: images.length > 0,
    commercial: (formData.is_for_sale ? formData.price > 0 : true) && (formData.is_for_rent ? formData.daily_rent_price > 0 : true),
    desc: formData.description.length > 10
  };

  const isFormReady = Object.values(validation).every(v => v);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      alert("You can only upload up to 5 images.");
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormReady) {
      alert("Please complete all required sections before cataloging.");
      return;
    }
    try {
      const data = new FormData();
      
      data.append('make', formData.make);
      data.append('model', formData.model);
      data.append('year', formData.year);
      data.append('description', formData.description);
      if (formData.price) data.append('price', formData.price);
      if (formData.daily_rent_price) data.append('daily_rent_price', formData.daily_rent_price);
      data.append('is_for_sale', formData.is_for_sale);
      data.append('is_for_rent', formData.is_for_rent);

      const specs = {
        color: formData.specs_color,
        engine: formData.specs_engine,
        "0_to_60mph": formData.specs_0_to_60,
        top_speed: formData.specs_top_speed
      };
      data.append('specs', JSON.stringify(specs));

      images.forEach(img => {
        data.append('uploaded_images', img);
      });

      await api.post('/cars/inventory/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert(t('admin.inventory.add_success', { defaultValue: 'Vehicle cataloged successfully.' }));
      navigate('/admin/inventory');
    } catch (err) {
      console.error('Submission Error:', err);
      const errorMsg = err.response?.data?.detail || JSON.stringify(err.response?.data) || err.message;
      alert(`Submission Failed: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-8 max-w-7xl mx-auto bg-premium-950">
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
             <Car className="text-gold-500 w-10 h-10" /> {t('admin.inventory.add_vehicle')}
           </h1>
           <p className="text-silver-400 mt-2">{t('admin.inventory.subtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-3 space-y-8">
          {/* Step 1: Media Selection */}
          <div className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-gold-500 uppercase tracking-widest text-[10px] font-black mb-6 flex items-center gap-2">
                 <Camera className="w-4 h-4" /> {t('admin.inventory.media_desc')}
               </h3>
               
               <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {previews.map((src, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                      <img src={src} alt="preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-4 h-4" />
                      </button>
                      {idx === 0 && <div className="absolute bottom-0 inset-x-0 bg-gold-500/90 text-premium-900 text-[8px] font-black uppercase text-center py-1">Primary Cover</div>}
                    </div>
                  ))}
                  
                  {images.length < 5 && (
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-white/10 hover:border-gold-500/50 hover:bg-white/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-silver-400 group-hover:text-gold-500" />
                      </div>
                      <span className="text-[10px] text-silver-500 font-bold uppercase tracking-widest">Upload Photo</span>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  )}
               </div>
               <p className="text-[10px] text-silver-600 mt-4 italic">High-resolution images recommended. Limit of 5 per listing.</p>
             </div>
             <Camera className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 pointer-events-none" />
          </div>

          {/* Step 2: Core Identity */}
          <div className="glass-panel p-8 rounded-3xl border border-white/5">
            <h3 className="text-gold-500 uppercase tracking-widest text-[10px] font-black mb-6"> {t('admin.inventory.core_identity')} </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-silver-500 font-bold">{t('admin.inventory.make')}</label>
                  <input required type="text" className="luxury-input w-full" placeholder="e.g. Ferrari" value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-silver-500 font-bold">{t('admin.inventory.model')}</label>
                  <input required type="text" className="luxury-input w-full" placeholder="e.g. SF90 Stradale" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
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
                  <input type="text" className="luxury-input w-full font-bold" placeholder="Giallo Modena" value={formData.specs_color} onChange={e => setFormData({...formData, specs_color: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-silver-500 font-bold">{t('admin.inventory.engine')}</label>
                  <input type="text" className="luxury-input w-full font-bold" placeholder="4.0L V8 Twin-Turbo Hybrid" value={formData.specs_engine} onChange={e => setFormData({...formData, specs_engine: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-silver-500 font-bold">{t('admin.inventory.0_to_60')}</label>
                  <input type="text" className="luxury-input w-full font-mono font-bold" placeholder="2.5s" value={formData.specs_0_to_60} onChange={e => setFormData({...formData, specs_0_to_60: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-silver-500 font-bold">{t('admin.inventory.top_speed')}</label>
                  <input type="text" className="luxury-input w-full font-mono font-bold" placeholder="211 mph" value={formData.specs_top_speed} onChange={e => setFormData({...formData, specs_top_speed: e.target.value})} />
               </div>
            </div>
          </div>

          {/* Step 4: Description */}
          <div className="glass-panel p-8 rounded-3xl border border-white/5">
             <label className="block text-[10px] uppercase tracking-widest text-gold-500 font-black mb-4">{t('admin.inventory.desc_label')}</label>
             <textarea rows={6} className="luxury-input w-full resize-none leading-relaxed" placeholder="Describe the soul of this vehicle..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          {/* Step 5: Commercial Config */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="glass-panel p-8 rounded-3xl border border-white/5">
                <label className="flex items-center gap-4 cursor-pointer mb-6 group">
                  <div className={`w-6 h-6 rounded border-2 border-gold-500 flex items-center justify-center transition-colors ${formData.is_for_sale ? 'bg-gold-500' : 'bg-transparent'}`}>
                    {formData.is_for_sale && <CheckCircle className="w-5 h-5 text-premium-900" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.is_for_sale} onChange={e => setFormData({...formData, is_for_sale: e.target.checked})} />
                  <span className="text-xl font-bold text-white group-hover:text-gold-400 transition-colors uppercase tracking-tight">{t('admin.inventory.for_sale')}</span>
                </label>
                {formData.is_for_sale && (
                  <div className="space-y-2 animate-fade-in">
                     <label className="block text-[10px] uppercase tracking-widest text-silver-500 font-bold">{t('admin.inventory.sale_price')}</label>
                     <input required type="number" step="0.01" className="luxury-input w-full font-mono text-xl text-gold-500 font-black" placeholder="0.00" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  </div>
                )}
             </div>

             <div className="glass-panel p-8 rounded-3xl border border-white/5">
                <label className="flex items-center gap-4 cursor-pointer mb-6 group">
                  <div className={`w-6 h-6 rounded border-2 border-gold-500 flex items-center justify-center transition-colors ${formData.is_for_rent ? 'bg-gold-500' : 'bg-transparent'}`}>
                    {formData.is_for_rent && <CheckCircle className="w-4 h-4 text-premium-900" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.is_for_rent} onChange={e => setFormData({...formData, is_for_rent: e.target.checked})} />
                  <span className="text-xl font-bold text-white group-hover:text-gold-400 transition-colors uppercase tracking-tight">{t('admin.inventory.for_rent')}</span>
                </label>
                {formData.is_for_rent && (
                  <div className="space-y-2 animate-fade-in">
                     <label className="block text-[10px] uppercase tracking-widest text-silver-500 font-bold">{t('admin.inventory.daily_rate')}</label>
                     <input required type="number" step="0.01" className="luxury-input w-full font-mono text-xl text-gold-500 font-black" placeholder="0.00" value={formData.daily_rent_price} onChange={e => setFormData({...formData, daily_rent_price: e.target.value})} />
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
               <div className="bg-gold-500/20 text-gold-500 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-gold-500/30">
                 {t('admin.inventory.action_center.draft_mode')}
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
                 disabled={loading || !isFormReady}
                 type="submit"
                 className={`w-full py-5 rounded-2xl font-black tracking-[0.2em] uppercase text-xs flex items-center justify-center gap-3 shadow-2xl transition-all relative overflow-hidden group
                   ${!isFormReady ? 'bg-premium-800 text-silver-600 cursor-not-allowed border border-white/5' : 'bg-gold-500 text-premium-950 hover:bg-gold-400 active:scale-[0.98] shadow-gold-500/20 border-b-4 border-gold-700'}
                 `}
               >
                 {loading ? <div className="w-5 h-5 border-4 border-premium-950/20 border-t-premium-950 rounded-full animate-spin"></div> : <CheckCircle className="w-5 h-5" />}
                 {t('admin.inventory.commit')}
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
