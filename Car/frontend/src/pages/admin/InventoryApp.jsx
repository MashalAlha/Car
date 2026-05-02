import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Car, Plus, Search, Edit, Trash2, XCircle } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';
import VehicleForm from '../../components/admin/VehicleForm';

import api from '../../utils/api';
const ITEMS_PER_PAGE = 8;

export default function InventoryApp() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchInventory = async () => {
    try {
      const res = await api.get('/cars/inventory/');
      setCars(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch inventory", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleDelete = async (car) => {
    const carName = `${car.year} ${car.make} ${car.model}`;
    if (!window.confirm(t('admin.inventory.confirm_delete', { name: carName }))) return;
    try {
      await api.delete(`/cars/inventory/${car.id}/`);
      fetchInventory();
    } catch (e) {
      console.error("Delete car error:", e);
      alert("Failed to delete car.");
    }
  };


  const filteredCars = cars.filter(c => {
    const matchesSearch = (c.make?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                          (c.model?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'for_sale') matchesStatus = c.is_for_sale;
    else if (statusFilter === 'for_rent') matchesStatus = c.is_for_rent;
    else if (statusFilter === 'unlisted') matchesStatus = !c.is_for_sale && !c.is_for_rent;

    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredCars.length / ITEMS_PER_PAGE);
  const paginatedCars = filteredCars.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen font-sans p-4 lg:p-8 text-white">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Car className="text-gold-500 w-8 h-8" /> {t('admin.inventory.title')}
          </h1>
          <p className="text-silver-400 mt-1">{t('admin.inventory.subtitle')}</p>
        </div>
        <button 
          onClick={() => navigate('/admin/inventory/add')}
          className="bg-gold-500 text-premium-900 px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gold-400 transition-colors"
        >
          <Plus className="w-5 h-5" /> {t('admin.inventory.add_vehicle')}
        </button>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-premium-border/50 mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="w-5 h-5 absolute inset-y-0 start-3 top-1/2 -translate-y-1/2 text-silver-500" />
          <input 
            type="text" 
            placeholder={t('admin.inventory.search_placeholder')} 
            className="w-full bg-premium-900/50 border border-white/10 rounded-lg py-2.5 ps-10 pe-4 text-white focus:border-gold-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-silver-500 uppercase tracking-widest">{t('admin.common.filters.filter_by')}</label>
          <select 
            className="bg-premium-900/50 border border-white/10 rounded-lg py-2.5 px-4 text-white focus:border-gold-500 outline-none text-sm font-semibold rtl:text-right"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{t('admin.common.filters.all_statuses')}</option>
            <option value="for_sale">{t('admin.inventory.for_sale')}</option>
            <option value="for_rent">{t('admin.inventory.for_rent')}</option>
            <option value="unlisted">{t('admin.inventory.unlisted')}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-silver-400 animate-pulse">{t('admin.inventory.loading')}</div>
      ) : (
        <div className="bg-premium-800/30 rounded-2xl border border-premium-border/50 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse rtl:text-right">
              <thead>
                <tr className="bg-premium-900/50 text-silver-500 text-xs uppercase tracking-wider">
                  <th className="p-4 ps-6">{t('admin.inventory.col_vehicle')}</th>
                  <th className="p-4">{t('admin.inventory.col_specs')}</th>
                  <th className="p-4">{t('admin.inventory.col_status')}</th>
                  <th className="p-4">{t('admin.inventory.col_pricing')}</th>
                  <th className="p-4 pe-6 text-end">{t('admin.inventory.col_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-premium-border/30">
                {paginatedCars.map((car) => (
                  <tr key={car.id} className="hover:bg-premium-800/20 transition-colors">
                    <td className="p-4 ps-6">
                      <div className="flex items-center gap-4">
                        {car.image_url ? (
                          <img src={car.image_url} alt={car.make} className="w-16 h-12 rounded object-cover border border-white/10" />
                        ) : (
                          <div className="w-16 h-12 rounded bg-premium-900 border border-white/10 flex items-center justify-center">
                            <Car className="w-5 h-5 text-silver-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold">{car.year} {car.make}</p>
                          <p className="text-xs text-silver-400">{car.model}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-silver-300 font-mono space-y-1">
                        <p>{t('admin.inventory.color')} <span className="text-white">{car.specs?.color || 'N/A'}</span></p>
                        <p>{t('admin.inventory.engine')} <span className="text-white">{car.specs?.engine || 'N/A'}</span></p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {car.is_for_sale && <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider">{t('admin.inventory.for_sale')}</span>}
                        {car.is_for_rent && <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">{t('admin.inventory.for_rent')}</span>}
                        {!car.is_for_sale && !car.is_for_rent && <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider">{t('admin.inventory.unlisted')}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-bold text-gold-400">
                        {car.is_for_sale && <p>{t('admin.inventory.buy')} {car.price}</p>}
                        {car.is_for_rent && <p>{t('admin.inventory.rent')} {car.daily_rent_price}{t('admin.inventory.day')}</p>}
                      </div>
                    </td>
                    <td className="p-4 pe-6 text-end">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/admin/inventory/edit/${car.id}`)}
                          className="p-2 bg-white/5 hover:bg-gold-500 hover:text-premium-900 rounded transition-colors" 
                          title={t('admin.inventory.edit')}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(car)} className="p-2 bg-white/5 hover:bg-red-500 hover:text-white rounded transition-colors" title={t('admin.inventory.delete')}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}


    </div>
  );
}
