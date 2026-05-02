import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, User, Car as CarIcon, Calendar, CheckCircle, Search, Clock, CreditCard, XCircle, FileText, RotateCcw } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';
import { useNavigate } from 'react-router-dom';

import api from '../../utils/api';
const ITEMS_PER_PAGE = 5;

export default function PurchaseManagement() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState(null);
  
  // Rejection States
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchPurchases = async () => {
    try {
      const res = await api.get('/cars/all-purchases/');
      setPurchases(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch purchases", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleCancelPurchase = async (purchaseId) => {
    if (!window.confirm(t('admin.purchase_mgmt.cancel_confirm'))) return;
    
    setMessage(null);
    try {
      await api.post(`/cars/all-purchases/${purchaseId}/cancel_purchase/`);
      setMessage({ type: 'success', text: t('admin.purchase_mgmt.cancel_success') });
      fetchPurchases();
    } catch (e) {
      console.error("Cancel purchase error:", e);
      const errDetail = e.response?.data?.detail || t('admin.purchase_mgmt.update_failed');
      setMessage({ type: 'error', text: errDetail });
    }
  };

  const handleReject = async () => {
    if (!rejectReason) return;
    
    setMessage(null);
    try {
      await api.patch(`/cars/all-purchases/${rejectingId}/`, { 
        status: 'rejected',
        rejection_reason: rejectReason
      });
      
      setMessage({ type: 'success', text: t('admin.purchase_mgmt.reject_success', { defaultValue: 'Request rejected successfully' }) });
      setRejectingId(null);
      setRejectReason('');
      fetchPurchases();
    } catch (e) {
      console.error("Reject purchase error:", e);
      setMessage({ type: 'error', text: t('admin.purchase_mgmt.update_failed') });
    }
  };

  const filteredPurchases = purchases.filter(p => {
    const userSearchStr = (p.user?.email || p.user?.username || '').toLowerCase();
    const carSearchStr = (p.car?.make || p.car?.model || '').toLowerCase();
    const matchesSearch = userSearchStr.includes(searchQuery.toLowerCase()) || 
                          carSearchStr.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredPurchases.length / ITEMS_PER_PAGE);
  const paginatedPurchases = filteredPurchases.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen font-sans p-4 lg:p-8 text-white">
      <div className="mb-10">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ShoppingBag className="text-gold-500 w-8 h-8" /> {t('admin.purchase_mgmt.title')}
        </h1>
        <p className="text-silver-400 mt-1">{t('admin.purchase_mgmt.subtitle')}</p>
      </div>

      {message && (
        <div className={`mb-8 p-4 rounded-xl border flex items-center gap-3 animate-fade-in ${
          message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          <CheckCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-bold uppercase tracking-wider">{message.text}</p>
          <button onClick={() => setMessage(null)} className="ms-auto hover:opacity-70">×</button>
        </div>
      )}

      {/* Filters */}
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
            className="bg-premium-900/50 border border-white/10 rounded-lg py-2.5 px-4 text-white focus:border-gold-500 outline-none text-sm font-semibold"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{t('admin.common.filters.all_statuses')}</option>
            <option value="pending">{t('admin.purchase_mgmt.pending_label', { defaultValue: 'Pending' })}</option>
            <option value="approved">{t('admin.purchase_mgmt.approved_label', { defaultValue: 'Approved' })}</option>
            <option value="completed">{t('admin.purchase_mgmt.completed_label', { defaultValue: 'Completed' })}</option>
            <option value="cancelled">{t('admin.purchase_mgmt.filter_cancelled', { defaultValue: 'Cancelled' })}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-silver-400 animate-pulse">{t('admin.common.loading')}</div>
      ) : (
        <div className="flex flex-col gap-6">
          {paginatedPurchases.length === 0 ? (
            <div className="glass-panel p-10 text-center rounded-2xl border border-white/5">
              <p className="text-silver-500 font-mono">{t('admin.purchase_mgmt.no_purchases')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6">
                {paginatedPurchases.map((purchase) => (
                  <div key={purchase.id} className="glass-panel p-6 rounded-2xl border border-premium-border/50 flex flex-col md:flex-row justify-between items-center gap-6 transition-all">
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                      {/* Buyer Info */}
                      <div className="flex items-start gap-4 border-e border-white/5 pe-4">
                        <div className="w-10 h-10 rounded-full bg-premium-900 border border-white/10 flex items-center justify-center text-silver-500 shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-silver-500 uppercase tracking-widest font-bold mb-1">
                            {t('admin.purchase_mgmt.buyer_id')} #{purchase.user?.id || purchase.user}
                          </p>
                          <p className="font-bold text-white text-lg block mb-1">
                            {purchase.user?.email || purchase.user?.username}
                          </p>
                          <div className="flex flex-col gap-1">
                            {purchase.user?.phone && (
                              <p className="text-xs text-silver-400 font-mono italic">
                                {purchase.user.phone}
                              </p>
                            )}
                            <p className="text-[10px] text-gold-500/70 font-mono flex items-center gap-1">
                              <CreditCard className="w-3 h-3" /> {purchase.payment_method}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Vehicle Info */}
                      <div className="flex items-start gap-4 border-e border-white/5 pe-4">
                        <div className="w-10 h-10 rounded-full bg-premium-900 border border-white/10 flex items-center justify-center text-silver-500 shrink-0">
                          <CarIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-silver-500 uppercase tracking-widest font-bold mb-1">{purchase.car?.make}</p>
                          <p className="font-bold text-gold-400 text-lg">{purchase.car?.model || 'Vehicle'}</p>
                          <p className="text-white font-mono text-xs mt-1 font-bold">${Number(purchase.price_paid).toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Status/Delivery Info */}
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-premium-900 border border-white/10 flex items-center justify-center text-silver-500 shrink-0">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-silver-500 uppercase tracking-widest font-bold mb-1">{t('admin.purchase_mgmt.status_delivery_label')}</p>
                          <div className="flex flex-col gap-1">
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase w-fit border ${
                               purchase.status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                               purchase.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                               purchase.status === 'cancelled' ? 'bg-silver-500/20 text-silver-400 border-white/10' :
                               'bg-gold-500/20 text-gold-400 border-gold-500/30'
                             }`}>{t(`admin.purchase_mgmt.${purchase.status}_label`, { defaultValue: purchase.status })}</span>
                             {purchase.delivery_date && (
                               <p className="text-xs text-silver-300 font-mono mt-1 flex items-center gap-1">
                                 <Calendar className="w-3 h-3 text-gold-500" /> {purchase.delivery_date}
                               </p>
                             )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="shrink-0 flex items-center gap-3">
                       {purchase.status === 'pending' ? (
                         <>
                            {rejectingId === purchase.id ? (
                               <div className="flex flex-col gap-2 min-w-[200px]">
                                 <textarea 
                                   placeholder={t('admin.purchase_mgmt.reject_reason_label')}
                                   className="bg-premium-900 border border-red-500/50 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-red-500 outline-none h-20"
                                   value={rejectReason}
                                   onChange={(e) => setRejectReason(e.target.value)}
                                 />
                                 <div className="flex gap-2">
                                   <button 
                                     onClick={handleReject}
                                     className="flex-1 bg-red-500 text-white py-2 rounded text-xs font-bold uppercase hover:bg-red-400 transition-colors"
                                   >
                                     {t('admin.purchase_mgmt.reject_confirm')}
                                   </button>
                                   <button 
                                     onClick={() => setRejectingId(null)}
                                     className="px-3 py-2 rounded border border-white/10 text-silver-400 hover:bg-white/5 transition-colors"
                                   >
                                     ×
                                   </button>
                                 </div>
                               </div>
                            ) : (
                              <>
                                <button 
                                  onClick={() => navigate(`/admin/purchases/contract/${purchase.id}`)}
                                  className="bg-gold-500 text-premium-900 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-gold-500/20 flex items-center gap-2"
                                >
                                  <CheckCircle className="w-4 h-4" /> {t('admin.purchase_mgmt.finalize_btn')}
                                </button>
                                <button 
                                  onClick={() => setRejectingId(purchase.id)}
                                  className="bg-premium-800 text-red-500 border border-red-500/30 hover:bg-red-500/10 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                                >
                                  {t('admin.purchase_mgmt.reject_btn')}
                                </button>
                              </>
                            )}
                         </>
                       ) : purchase.status === 'rejected' ? (
                          <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                            <XCircle className="w-4 h-4" /> {t(`admin.purchase_mgmt.${purchase.status}_label`, { defaultValue: purchase.status })}
                          </div>
                        ) : purchase.status === 'cancelled' ? (
                          <div className="flex items-center gap-2 text-silver-400 font-bold text-sm">
                            <RotateCcw className="w-4 h-4" /> {t('admin.purchase_mgmt.cancelled_label', { defaultValue: purchase.status })}
                          </div>
                        ) : (
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                              <CheckCircle className="w-4 h-4" /> {t('admin.purchase_mgmt.finalized')}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <button 
                                onClick={() => navigate(`/admin/purchases/contract/${purchase.id}`)}
                                className="text-xs text-gold-500 hover:text-gold-400 flex items-center gap-1 font-bold underline"
                              >
                                <FileText className="w-3 h-3" /> {t('admin.purchase_mgmt.view_contract_btn')}
                              </button>
                              
                              {(purchase.status === 'approved' || purchase.status === 'delivered') && (
                                <button 
                                  onClick={() => handleCancelPurchase(purchase.id)}
                                  className="text-[10px] text-red-500 hover:text-red-400 flex items-center gap-1 font-bold uppercase tracking-widest mt-1 opacity-60 hover:opacity-100 transition-opacity"
                                >
                                  <RotateCcw className="w-3 h-3" /> {t('admin.purchase_mgmt.cancel_btn')}
                                </button>
                              )}
                            </div>
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
