import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, User, Car, Clock, CheckCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import Pagination from '../../components/ui/Pagination';

import api from '../../utils/api';
const ITEMS_PER_PAGE = 5;

export default function RentalRequests() {
  const { t } = useTranslation();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState(null);

  const fetchRentals = async () => {
    try {
      const res = await api.get('/cars/rentals/', { useAdminToken: true });
      setRentals(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch rentals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleUpdateStatus = async (id, newStatus) => {
    setMessage(null);
    try {
      await api.patch(`/cars/rentals/${id}/`, { status: newStatus }, { useAdminToken: true });
      
      setMessage({ 
        type: 'success', 
        text: t('admin.rental_dispatch.update_success', { status: t(`admin.rental_dispatch.${newStatus}`) }) 
      });
      fetchRentals();
    } catch (e) {
      console.error("Failed to update rental status", e);
      setMessage({ type: 'error', text: t('admin.rental_dispatch.update_failed') });
    }
  };

  const filteredRentals = rentals.filter(r => {
    const userSearchStr = (r.user?.email || r.user?.username || r.user?.toString() || '').toLowerCase();
    const carSearchStr = (r.car?.make || r.car?.model || r.car?.toString() || '').toLowerCase();
    
    const matchesSearch = userSearchStr.includes(searchQuery.toLowerCase()) || 
                          carSearchStr.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredRentals.length / ITEMS_PER_PAGE);
  const paginatedRentals = filteredRentals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen font-sans p-4 lg:p-8 text-white">
      <div className="mb-10">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Calendar className="text-gold-500 w-8 h-8" /> {t('admin.rental_dispatch.title')}
        </h1>
        <p className="text-silver-400 mt-1">{t('admin.rental_dispatch.subtitle')}</p>
      </div>

      {message && (
        <div className={`mb-8 p-4 rounded-xl border flex items-center gap-3 animate-fade-in ${
          message.type === 'success' 
            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          <CheckCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-bold uppercase tracking-wider">{message.text}</p>
          <button onClick={() => setMessage(null)} className="ms-auto hover:opacity-70">×</button>
        </div>
      )}

      <div className="glass-panel p-6 rounded-2xl border border-premium-border/50 mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="w-5 h-5 absolute inset-y-0 start-3 top-1/2 -translate-y-1/2 text-silver-500" />
          <input 
            type="text" 
            placeholder={t('admin.common.filters.search_placeholder')} 
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
            <option value="pending">{t('admin.rental_dispatch.pending')}</option>
            <option value="active">{t('admin.rental_dispatch.active')}</option>
            <option value="completed">{t('admin.rental_dispatch.completed')}</option>
            <option value="rejected">{t('admin.rental_dispatch.rejected')}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-silver-400 animate-pulse">{t('admin.rental_dispatch.loading')}</div>
      ) : (
        <div className="flex flex-col gap-6">
          {paginatedRentals.length === 0 ? (
            <div className="glass-panel p-10 text-center rounded-2xl border border-white/5">
              <p className="text-silver-500 font-mono">{t('admin.rental_dispatch.no_rentals')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6">
                {paginatedRentals.map((rental) => (
                  <div key={rental.id} className={`glass-panel p-6 rounded-2xl border flex flex-col md:flex-row justify-between items-center gap-6 transition-all ${
                    rental.is_overdue ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] bg-red-500/5' : 'border-premium-border/50'
                  }`}>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                      <div className="flex items-start gap-4 border-e border-white/5 pe-4">
                        <div className="w-10 h-10 rounded-full bg-premium-900 border border-white/10 flex items-center justify-center text-silver-500 shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-silver-500 uppercase tracking-widest font-bold mb-1">
                            {t('admin.rental_dispatch.renter_id')} {rental.user?.id || rental.user}
                          </p>
                          <p className="font-bold text-white text-lg block mb-1">
                            {rental.user?.email || rental.user?.username || t('admin.rental_dispatch.vip')}
                          </p>
                          {rental.user?.phone && (
                            <p className="text-xs text-silver-400 font-mono italic">
                              {rental.user.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-4 border-e border-white/5 pe-4">
                         <div className="w-10 h-10 rounded-full bg-premium-900 border border-white/10 flex items-center justify-center text-silver-500 shrink-0">
                          <Car className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-silver-500 uppercase tracking-widest font-bold mb-1">
                            {t('admin.rental_dispatch.vehicle_id')} {rental.car?.id || rental.car}
                          </p>
                          <p className="font-bold text-gold-400 text-lg">
                            {rental.car?.make ? `${rental.car.make} ${rental.car.model}` : `$${rental.total_price}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                         <div className="w-10 h-10 rounded-full bg-premium-900 border border-white/10 flex items-center justify-center text-silver-500 shrink-0">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-silver-500 uppercase tracking-widest font-bold mb-1">{t('admin.rental_dispatch.duration')}</p>
                          <p className="font-mono text-sm text-silver-300">{rental.start_date} <br/>{t('admin.rental_dispatch.to')} {rental.end_date}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        {rental.is_overdue && (
                          <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter rounded bg-red-500 text-white animate-pulse">
                            {t('admin.rental_dispatch.overdue')}
                          </span>
                        )}
                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded border ${
                          rental.status === 'active' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          rental.status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          rental.status === 'completed' ? 'bg-silver-500/20 text-silver-400 border-white/10' :
                          'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {t(`admin.rental_dispatch.${rental.status}`)}
                        </span>
                      </div>

                      {rental.status === 'pending' && (
                        <div className="flex gap-2">
                           <button 
                             onClick={() => handleUpdateStatus(rental.id, 'active')}
                             className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-2 rounded font-bold text-xs transition-colors flex items-center gap-2"
                           >
                             <CheckCircle className="w-3 h-3"/> {t('admin.rental_dispatch.approve')}
                           </button>
                           <button 
                             onClick={() => handleUpdateStatus(rental.id, 'rejected')}
                             className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded font-bold text-xs transition-colors"
                           >
                             {t('admin.rental_dispatch.reject')}
                           </button>
                        </div>
                      )}

                      {rental.status === 'active' && (
                         <div className="flex gap-2">
                           <Link 
                             to={`/admin/rentals/track/${rental.id}`}
                             className="bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 border border-gold-500/30 px-3 py-2 rounded font-bold text-xs transition-colors flex items-center gap-2"
                           >
                             <Search className="w-3 h-3"/> {t('admin.rental_dispatch.track_vehicle')}
                           </Link>
                           <button 
                             onClick={() => handleUpdateStatus(rental.id, 'completed')}
                             className="bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 border border-gold-500/30 px-3 py-2 rounded font-bold text-xs transition-colors"
                           >
                             {t('admin.rental_dispatch.mark_completed')}
                           </button>
                         </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
