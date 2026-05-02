import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Package, 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  ChevronLeft,
  Upload,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  FileText
} from 'lucide-react';

import api from '../../utils/api';

export default function ManageStore() {
  const { t } = useTranslation();
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    sku: '',
    price: '',
    stock_quantity: '0',
    car_make: '',
    car_model: '',
    model_year: '',
    description: '',
    is_accessory: false,
    installation_available: false
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/store/admin/inventory/');
      setItems(res.data);
    } catch (err) {
      console.error("Failed to fetch store items", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const token = localStorage.getItem('admin_access_token');
    const data = new FormData();
    
    // Clean up data for submission
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });

    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      const url = editingItem 
        ? `/store/admin/inventory/${editingItem.id}/`
        : `/store/admin/inventory/`;
      
      const res = await api({
        method: editingItem ? 'PATCH' : 'POST',
        url: url,
        data: data,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert(editingItem ? t('admin.store.success_update') : t('admin.store.success_add'));
      closeForm();
      fetchItems();
    } catch (err) {
      console.error("Save error:", err);
      alert(`Failed: ${JSON.stringify(err.response?.data || "Network error")}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      brand: item.brand || '',
      sku: item.sku || '',
      price: item.price || '',
      stock_quantity: item.stock_quantity || '0',
      car_make: item.car_make || '',
      car_model: item.car_model || '',
      model_year: item.model_year || '',
      description: item.description || '',
      is_accessory: item.is_accessory || false,
      installation_available: item.installation_available || false
    });
    setPreview(item.image);
    setShowAddForm(true);
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingItem(null);
    setFormData({
        name: '', brand: '', sku: '', price: '', stock_quantity: '0',
        car_make: '', car_model: '', model_year: '', description: '', 
        is_accessory: false, installation_available: false
    });
    setImageFile(null);
    setPreview(null);
  };

  const deleteItem = async (id) => {
    if (!window.confirm(t('admin.store.delete_confirm'))) return;
    try {
      await api.delete(`/store/admin/inventory/${id}/`);
      fetchItems();
    } catch (err) { 
      console.error("Delete error:", err); 
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (showAddForm) {
    return (
      <div className="min-h-screen p-4 lg:p-8 max-w-7xl mx-auto bg-premium-950">
        <button 
           onClick={closeForm}
           className="flex items-center gap-2 text-silver-400 hover:text-white transition-colors mb-4 group font-bold tracking-widest uppercase text-[10px]"
        >
           <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
           {t('admin.store.back_to_catalog')}
        </button>
        
        <h1 className="text-4xl font-bold flex items-center gap-3 mb-10 text-white italic tracking-tighter">
          <ShoppingBag className="text-gold-500 w-10 h-10" /> 
          {editingItem ? t('admin.store.edit_item') : t('admin.store.catalog_new')}
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <div className="lg:col-span-3 space-y-8">
            
            {/* Identity & Branding */}
            <div className="glass-panel p-8 rounded-3xl border border-white/5">
              <h3 className="text-gold-500 uppercase tracking-widest text-[10px] font-black mb-6 flex items-center gap-2">
                <Package className="w-4 h-4" /> {t('admin.store.core_identity')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-silver-500 font-bold">{t('admin.store.item_name')}</label>
                  <input required className="luxury-input w-full" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Carbon Fiber Wing" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-silver-500 font-bold">{t('admin.store.brand')}</label>
                  <input className="luxury-input w-full" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} placeholder="e.g. Mansory" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-silver-500 font-bold">{t('admin.store.sku')}</label>
                  <input required className="luxury-input w-full font-mono" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="XMS-911-CF-01" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-silver-500 font-bold">{t('admin.store.price')}</label>
                  <input required type="number" className="luxury-input w-full font-mono text-gold-500" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" />
                </div>
              </div>
            </div>

            {/* Compatibility HUD */}
            <div className="glass-panel p-8 rounded-3xl border border-white/5">
              <h3 className="text-gold-500 uppercase tracking-widest text-[10px] font-black mb-6 flex items-center gap-2">
                <Settings className="w-4 h-4" /> {t('admin.store.compatibility')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-silver-500 font-bold">{t('admin.store.target_make')}</label>
                  <input className="luxury-input w-full" value={formData.car_make} onChange={e => setFormData({...formData, car_make: e.target.value})} placeholder="e.g. Porsche" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-silver-500 font-bold">{t('admin.store.target_model')}</label>
                  <input className="luxury-input w-full" value={formData.car_model} onChange={e => setFormData({...formData, car_model: e.target.value})} placeholder="e.g. 911 GT3" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-silver-500 font-bold">{t('admin.store.target_year')}</label>
                  <input type="number" className="luxury-input w-full font-mono" value={formData.model_year} onChange={e => setFormData({...formData, model_year: e.target.value})} placeholder="2024" />
                </div>
              </div>
            </div>

            {/* Media & Details */}
            <div className="glass-panel p-8 rounded-3xl border border-white/5">
                <h3 className="text-gold-500 uppercase tracking-widest text-[10px] font-black mb-6 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> {t('admin.store.media_desc')}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="md:col-span-1">
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-white/10 hover:border-gold-500/50 hover:bg-white/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group bg-premium-900/40 relative overflow-hidden">
                      {preview ? (
                        <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-silver-500 group-hover:text-gold-500 transition-colors" />
                          <span className="text-[10px] text-silver-600 font-bold uppercase tracking-tighter">{t('admin.store.upload_img')}</span>
                        </>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                  <div className="md:col-span-3 space-y-4">
                    <textarea rows={5} className="luxury-input w-full resize-none bg-premium-900/40" placeholder={t('admin.store.description')} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                </div>
            </div>
          </div>

          {/* Action Center Sidebar */}
          <div className="lg:col-span-1 sticky top-24">
            <div className="glass-panel p-6 rounded-3xl border border-gold-500/20 shadow-3xl bg-premium-900/60 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">{t('admin.inventory.action_center.title')}</h2>
              </div>

              <div className="space-y-4 mb-10">
                <h3 className="text-[10px] text-silver-600 font-black uppercase tracking-widest flex items-center gap-2">
                   <ShieldCheck className="w-3.5 h-3.5" /> {t('admin.store.readiness_check')}
                </h3>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-4 cursor-pointer p-3 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-all">
                    <div className={`w-5 h-5 rounded border-2 border-gold-500 flex items-center justify-center transition-colors ${formData.is_accessory ? 'bg-gold-500' : 'bg-transparent'}`}>
                      {formData.is_accessory && <CheckCircle className="w-4 h-4 text-premium-900" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={formData.is_accessory} onChange={e => setFormData({...formData, is_accessory: e.target.checked})} />
                    <span className="text-[11px] font-bold text-white uppercase tracking-tight">{t('admin.store.is_accessory')}</span>
                  </label>

                  <label className="flex items-center gap-4 cursor-pointer p-3 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-all">
                    <div className={`w-5 h-5 rounded border-2 border-gold-500 flex items-center justify-center transition-colors ${formData.installation_available ? 'bg-gold-500' : 'bg-transparent'}`}>
                      {formData.installation_available && <CheckCircle className="w-4 h-4 text-premium-900" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={formData.installation_available} onChange={e => setFormData({...formData, installation_available: e.target.checked})} />
                    <span className="text-[11px] font-bold text-white uppercase tracking-tight">{t('admin.store.installation_available')}</span>
                  </label>
                  
                  <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${imageFile ? 'bg-green-500/5 border-green-500/20' : 'bg-white/2 border-white/5'}`}>
                    <span className="text-[11px] font-bold text-silver-400">{t('admin.store.asset_present')}</span>
                    {imageFile ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-silver-700" />}
                  </div>
                </div>

                <div className="space-y-2 mt-6">
                   <label className="block text-[10px] uppercase tracking-widest text-silver-500 font-bold mb-2">{t('admin.store.inventory_stock')}</label>
                   <input type="number" className="luxury-input w-full font-mono text-center text-xl" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} />
                </div>
              </div>

              <button 
                disabled={saving || !formData.name || !formData.sku || !formData.price}
                type="submit"
                className={`w-full py-5 rounded-2xl font-black tracking-[0.2em] uppercase text-xs flex items-center justify-center gap-3 shadow-2xl transition-all relative overflow-hidden group
                  ${saving || !formData.name ? 'bg-premium-800 text-silver-600 cursor-not-allowed' : 'bg-gold-500 text-premium-950 hover:bg-gold-400 border-b-4 border-gold-700'}
                `}
              >
                {saving ? <div className="w-5 h-5 border-4 border-premium-950/20 border-t-premium-950 rounded-full animate-spin"></div> : <CheckCircle className="w-5 h-5" />}
                {editingItem ? t('admin.store.update_btn') : t('admin.store.commit')}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-4 italic tracking-tighter">
            <ShoppingBag className="text-gold-500 w-10 h-10" /> {t('admin.store.title')}
          </h1>
          <p className="text-silver-400 tracking-wide uppercase text-[10px] font-bold">{t('admin.store.subtitle')}</p>
        </div>
        
        <button 
          onClick={() => setShowAddForm(true)}
          className="luxury-button px-8 py-4 rounded-2xl flex items-center gap-3 text-xs font-black tracking-[0.2em] uppercase shadow-gold-500/10"
        >
          <Plus className="w-5 h-5" /> {t('admin.store.catalog_new')}
        </button>
      </div>

      {/* Filter HUD */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 mb-10 flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="w-5 h-5 absolute inset-y-0 start-3 top-1/2 -translate-y-1/2 text-silver-500" />
          <input 
            type="text" 
            placeholder={t('admin.common.filters.search_placeholder')} 
            className="w-full bg-premium-900/50 border border-white/10 rounded-lg py-3 ps-10 pe-4 text-white focus:border-gold-500 outline-none transition-all"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           <button className="glass-panel px-6 rounded-2xl border-white/5 flex items-center gap-2 text-silver-400 hover:text-white transition-all text-xs font-bold uppercase h-14">
             <Filter className="w-4 h-4" /> {t('admin.common.filters.filter_by')}
           </button>
        </div>
      </div>

      {/* Inventory Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4 text-silver-500">
          <div className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-widest">Accessing Vault...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="glass-panel rounded-3xl border border-white/5 overflow-hidden group hover:border-gold-500/30 transition-all duration-500">
              <div className="aspect-square relative overflow-hidden bg-premium-900 flex items-center justify-center p-8">
                 {item.image ? (
                   <img src={item.image} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                 ) : (
                   <Package className="w-16 h-16 text-white/5" />
                 )}
                 <div className="absolute top-4 left-4">
                   <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.1em] border ${item.is_accessory ? 'bg-gold-500/10 text-gold-500 border-gold-500/20' : 'bg-silver-500/10 text-silver-400 border-silver-500/20'}`}>
                     {item.is_accessory ? t('store.accessories') : t('store.parts')}
                   </span>
                 </div>
              </div>
              
              <div className="p-6 space-y-3">
                 <div className="flex justify-between items-start">
                   <div>
                     <p className="text-gold-500 text-[9px] font-black uppercase tracking-widest mb-1">{item.brand || 'Original'}</p>
                     <h3 className="text-white font-bold leading-tight group-hover:text-gold-500/80 transition-colors uppercase italic">{item.name}</h3>
                   </div>
                   <p className="text-silver-300 font-mono font-bold">${parseFloat(item.price).toLocaleString()}</p>
                 </div>
                 
                 <div className="pt-4 flex items-center justify-between border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase text-silver-600 leading-none mb-1">{t('store.stock_level')}</span>
                      <span className={`text-[10px] font-bold ${item.stock_quantity > 0 ? 'text-green-500' : 'text-red-400'}`}>
                        {item.stock_quantity} in stock
                      </span>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => handleEdit(item)} className="p-2 text-silver-500 hover:text-white transition-colors"><Edit3 className="w-4 h-4" /></button>
                       <button onClick={() => deleteItem(item.id)} className="p-2 text-red-500/50 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                 </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-full py-20 text-center glass-panel rounded-3xl border-dashed border-2 border-white/5">
               <Package className="w-12 h-12 text-white/5 mx-auto mb-4" />
               <p className="text-silver-500 font-bold uppercase text-[10px] tracking-widest">{t('admin.store.no_results')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
