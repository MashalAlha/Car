import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, ShieldAlert, CheckCircle, Search, Plus, Edit2, Trash2 } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';

import api from '../../utils/api';
const ITEMS_PER_PAGE = 10;

export default function ClientRelations() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/admin-users/', { useAdminToken: true });
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  const handleOpenAddPage = () => {
    navigate('/admin/users/add');
  };

  const handleOpenEditPage = (user) => {
    navigate(`/admin/users/edit/${user.id}`);
  };

  const handleDeleteUser = async (userId) => {
    const currentUser = JSON.parse(localStorage.getItem('admin_data'));
    if (currentUser?.id === userId) {
      alert(t('admin.client_relations.cant_demote_self'));
      return;
    }

    if (!window.confirm(t('admin.client_relations.delete_confirm'))) return;

    try {
      await api.delete(`/users/admin-users/${userId}/`, { useAdminToken: true });
      alert(t('admin.client_relations.success_delete'));
      fetchUsers();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete user.");
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.username?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                          (u.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen font-sans p-4 lg:p-8 text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="text-gold-500 w-8 h-8" /> {t('admin.client_relations.title')}
          </h1>
          <p className="text-silver-400 mt-1">{t('admin.client_relations.subtitle')}</p>
        </div>
        <button 
          onClick={handleOpenAddPage}
          className="luxury-button px-6 py-2.5 flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> {t('admin.client_relations.add_user')}
        </button>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-premium-border/50 mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="w-5 h-5 absolute inset-y-0 start-3 top-1/2 -translate-y-1/2 text-silver-500" />
          <input 
            type="text" 
            placeholder={t('admin.common.filters.search_placeholder')} 
            className="w-full bg-premium-900/50 border border-white/10 rounded-lg py-2.5 ps-10 pe-4 text-white focus:border-gold-500 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-silver-500 uppercase tracking-widest">{t('admin.common.filters.filter_by')}</label>
          <select 
            className="bg-premium-900/50 border border-white/10 rounded-lg py-2.5 px-4 text-white focus:border-gold-500 outline-none text-sm font-semibold rtl:text-right cursor-pointer"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">{t('admin.common.filters.all_roles')}</option>
            <option value="Admin">{t('admin.common.roles.admin')}</option>
            <option value="WorkshopManager">{t('admin.common.roles.manager')}</option>
            <option value="Customer">{t('admin.common.roles.customer')}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
           <div className="w-10 h-10 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
           <p className="text-silver-500 text-xs font-black uppercase tracking-widest animate-pulse">{t('admin.client_relations.loading')}</p>
        </div>
      ) : (
        <div className="bg-premium-800/30 rounded-2xl border border-premium-border/50 overflow-hidden flex flex-col shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse rtl:text-right">
              <thead>
                <tr className="bg-premium-900/50 text-silver-500 text-[10px] uppercase font-black tracking-widest">
                  <th className="p-4 ps-6 uppercase tracking-[0.2em]">{t('admin.client_relations.col_identifier')}</th>
                  <th className="p-4 uppercase tracking-[0.2em]">{t('admin.client_relations.col_contact')}</th>
                  <th className="p-4 uppercase tracking-[0.2em]">{t('admin.client_relations.col_security')}</th>
                  <th className="p-4 pe-6 text-center uppercase tracking-[0.2em] w-32">{t('admin.common.actions') || 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-premium-border/30">
                {paginatedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4 ps-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-lg
                          ${u.role === 'Admin' ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 
                            u.role === 'WorkshopManager' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
                            'bg-premium-900 border border-white/10 text-silver-500'}`}
                        >
                          {u.username?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{u.username}</p>
                          <p className="text-[10px] text-silver-600 font-mono tracking-tighter truncate max-w-[120px]">{t('admin.client_relations.uid')} {u.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-xs text-silver-300 font-medium">{u.email}</p>
                        {u.phone ? (
                           <p className="text-[10px] text-gold-500/70 font-mono tracking-tight">{u.phone}</p>
                        ) : (
                           <p className="text-[10px] text-silver-600 font-mono italic">{t('admin.client_relations.no_phone')}</p>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col gap-2 items-start">
                        <span className={`px-2 py-0.5 flex items-center gap-1.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                          u.role === 'Admin' ? 'bg-gold-500/10 text-gold-500 border-gold-500/20' : 
                          u.role === 'WorkshopManager' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 
                          'bg-silver-500/10 text-silver-400 border-white/5'
                        }`}>
                          {u.role === 'Admin' && <ShieldAlert className="w-3 h-3" />}
                          {u.role === 'WorkshopManager' && <Shield className="w-3 h-3" />}
                          {t(`admin.common.roles.${u.role}`)}
                        </span>
                        {u.is_verified ? (
                           <span className="flex items-center gap-1 text-[9px] text-green-500 font-black uppercase tracking-tighter"><CheckCircle className="w-3 h-3"/> {t('admin.client_relations.verified')}</span>
                        ) : (
                           <span className="text-[9px] text-red-500 font-black uppercase tracking-tighter">{t('admin.client_relations.unverified')}</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 pe-6">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleOpenEditPage(u)}
                          className="p-2 rounded-lg bg-white/5 border border-white/10 text-silver-400 hover:text-gold-500 hover:border-gold-500/30 transition-all shadow-sm"
                          title={t('admin.client_relations.edit_user')}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 rounded-lg bg-red-500/5 border border-red-500/10 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-all shadow-sm"
                          title={t('admin.client_relations.delete_user')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
