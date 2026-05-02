import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Activity, Clock, Wrench, Users, ArrowRight, UserPlus, Search, Building2, Plus, LogOut, Trash2, CreditCard, FileText, Package, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import Pagination from '../../components/ui/Pagination';

const ITEMS_PER_PAGE = 5;

export default function WorkshopDashboard() {
  const { t } = useTranslation();
  const location = useLocation();
  
  // Role Checking
  const userJson = localStorage.getItem('admin_data');
  let user = { role: 'WorkshopManager' };
  try {
    if (userJson) {
      const parsed = JSON.parse(userJson);
      if (parsed) user = parsed;
    }
  } catch (e) {
    console.error("Failed to parse user data", e);
  }
  const isAdmin = user?.role === 'Admin';

  const [activeTab, setActiveTab] = useState('requisitions'); // 'requisitions' | 'facilities' | 'staff'

  // Handle URL tab signaling
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['requisitions', 'facilities', 'staff'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Facilities State for Admins
  const [facilities, setFacilities] = useState([]);
  const [eligibleManagers, setEligibleManagers] = useState([]);
  const [showAddFacility, setShowAddFacility] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [newFacility, setNewFacility] = useState({
    name: '',
    working_days: 'Monday - Friday',
    working_hours: '08:00 AM - 05:00 PM',
    category: 'Polishing_Ceramic',
    service_location_type: 'Both',
    manager: '',
    on_site_fee: 50.00,
    mobile_fee: 100.00
  });

  const resetForm = () => {
    setNewFacility({
      name: '',
      working_days: 'Monday - Friday',
      working_hours: '08:00 AM - 05:00 PM',
      category: 'Polishing_Ceramic',
      service_location_type: 'Both',
      manager: '',
      on_site_fee: 50.00,
      mobile_fee: 100.00
    });
  };

  const handleUpdateFacility = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/workshop/facilities/${editingFacility.id}/`, newFacility);
      setSuccessMessage(t('admin.workshop_dashboard.success_update'));
      setEditingFacility(null);
      resetForm();
      fetchFacilities();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (e) { 
      console.error("Update facility error:", e); 
      alert(e.response?.data?.detail || "Failed to update facility.");
    }
  };

  const handleDeleteFacility = async (id) => {
    if (!confirm(t('admin.workshop_dashboard.delete_facility_confirm'))) return;
    try {
      await api.delete(`/workshop/facilities/${id}/`);
      fetchFacilities();
    } catch (e) { 
      console.error("Delete facility error:", e); 
    }
  };

  // Manager Specific State
  const [myFacility, setMyFacility] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [workerForm, setWorkerForm] = useState({
    name: '',
    specialty: '',
    phone: '',
    is_active: true
  });

  const [idLoading, setIdLoading] = useState(!isAdmin);

  // Work Orders 
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    expected_appointments_today: 0
  });

  // Assignment & Maintenance State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [inventoryParts, setInventoryParts] = useState([]);
  const [partsSearchQuery, setPartsSearchQuery] = useState('');
  const [unforeseenInput, setUnforeseenInput] = useState('');
  const [isSearchingParts, setIsSearchingParts] = useState(false);
  const [showTerminalActionModal, setShowTerminalActionModal] = useState(false);
  const [terminalActionType, setTerminalActionType] = useState(''); // 'reject' | 'cancel'
  const [terminalNotes, setTerminalNotes] = useState('');

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilter]);

  useEffect(() => {
    if (isAdmin) {
      fetchEligibleManagers();
      fetchFacilities();
      setIdLoading(false); // Admins don't fetch "myFacility"
    } else {
      if (user?.id) {
        fetchMyFacility();
      } else {
        setIdLoading(false);
      }
    }
    fetchDashboardOrders();
    fetchDashboardMetrics();
  }, [isAdmin, user?.id]);

  useEffect(() => {
    if (!isAdmin && activeTab === 'staff') {
      fetchWorkers();
    }
  }, [activeTab, isAdmin]);

  const fetchMyFacility = async () => {
    if (!user?.id) {
      setIdLoading(false);
      return;
    }
    try {
      const res = await api.get('/workshop/facilities/');
      const data = res.data;
      const myFac = data.find(f => Number(f.manager) === Number(user.id));
      if (myFac) setMyFacility(myFac);
    } catch (e) {
      console.error("Failed to fetch my facility", e);
    } finally {
      setIdLoading(false);
    }
  };


  const fetchDashboardOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await api.get('/workshop/dashboard/');
      setOrders(response.data);
    } catch (e) {
      console.error("Failed to load dashboard orders:", e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchDashboardMetrics = async () => {
    try {
      const response = await api.get('/workshop/dashboard/metrics/');
      setDashboardMetrics(response.data);
    } catch (e) {
      console.error("Failed to load metrics:", e);
    }
  };

  const fetchWorkers = async () => {
    try {
      const response = await api.get('/workshop/workers/');
      setWorkers(response.data);
    } catch (e) {
      console.error("Failed to load workers:", e);
    }
  };

  const fetchFacilities = async () => {
    try {
      const response = await api.get('/workshop/facilities/');
      setFacilities(response.data);
    } catch (e) {
      console.error("Failed to load facilities:", e);
    }
  };

  const fetchEligibleManagers = async () => {
    try {
      const response = await api.get('/workshop/facilities/eligible_managers/');
      setEligibleManagers(response.data);
    } catch (e) {
      console.error("Failed to load eligible managers:", e);
    }
  };

  const fetchInventoryParts = async (query = '') => {
    setIsSearchingParts(true);
    try {
      const response = await api.get(`/store/inventory/?search=${query}`);
      setInventoryParts(response.data);
    } catch (e) {
      console.error("Failed to load inventory parts:", e);
    } finally {
      setIsSearchingParts(false);
    }
  };

  const handleAssignWorker = async (orderId, workerId) => {
    try {
      const resp = await api.post(`/workshop/dashboard/${orderId}/assign_technician/`, { 
        worker_id: workerId 
      });
      setShowAssignModal(false);
      fetchDashboardOrders();
      fetchDashboardMetrics();
    } catch (e) { 
      console.error("Assignment error:", e); 
    }
  };

  const handleAddPartToOrder = async (orderId, partId) => {
    try {
      const resp = await api.post(`/workshop/dashboard/${orderId}/add_part/`, { 
        part_id: partId, 
        quantity: 1 
      });
      setSelectedOrder(resp.data);
      setSuccessMessage("Part added to requisition");
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchDashboardOrders();
    } catch (e) { 
      console.error("Add part error:", e); 
    }
  };

  const handleRemovePart = async (orderId, partId) => {
    try {
      const resp = await api.post(`/workshop/dashboard/${orderId}/remove_part/`, { 
        part_id: partId 
      });
      setSelectedOrder(resp.data);
      setSuccessMessage("Part removed from requisition");
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchDashboardOrders();
    } catch (e) { 
      console.error("Remove part error:", e); 
    }
  };

  const handleUpdateUnforeseenCosts = async (orderId, amount) => {
    try {
      const resp = await api.post(`/workshop/dashboard/${orderId}/update_unforeseen_costs/`, { 
        unforeseen_costs: amount 
      });
      setSelectedOrder(resp.data);
      setSuccessMessage("Unforeseen costs updated");
      setTimeout(() => setSuccessMessage(''), 3000);
      setUnforeseenInput('');
      fetchDashboardOrders();
    } catch (e) { 
      console.error("Update cost error:", e); 
    }
  };

  const handleFinishMaintenance = async (orderId) => {
    try {
      await api.post(`/workshop/dashboard/${orderId}/request_payment/`);
      setShowMaintenanceModal(false);
      fetchDashboardOrders();
      fetchDashboardMetrics();
    } catch (e) { 
      console.error("Finish error:", e); 
    }
  };

  const handleTerminalAction = async (e) => {
    e.preventDefault();
    const endpoint = terminalActionType === 'reject' ? 'reject_order' : 'cancel_order';
    try {
      await api.post(`/workshop/dashboard/${selectedOrder.id}/${endpoint}/`, { 
        manager_notes: terminalNotes 
      });
      setShowTerminalActionModal(false);
      setShowMaintenanceModal(false);
      setTerminalNotes('');
      fetchDashboardOrders();
      fetchDashboardMetrics();
    } catch (e) { 
      console.error("Terminal action error:", e);
      alert(e.response?.data?.error || "Action failed");
    }
  };

  const filteredOrders = (orders || []).filter(o => {
    const orderId = `#WO-${o.id}`;
    const customerName = o.appointment_details?.customer_name || t('admin.common.anonymous');
    const serviceName = o.appointment_details?.service_details?.name || t('admin.workshop_dashboard.generic_service');
    
    const matchesSearch = orderId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || o?.status === statusFilter;
    const matchesType = typeFilter === 'all' || (o.appointment_details?.is_home_service ? 'Home Service' : 'Workshop') === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCreateFacility = async (e) => {
    e.preventDefault();
    try {
      await api.post('/workshop/facilities/', newFacility);
      setSuccessMessage(t('admin.workshop_dashboard.success_add'));
      setShowAddFacility(false);
      resetForm();
      fetchFacilities();
      fetchEligibleManagers();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (e) {
      console.error("Creation error:", e);
      alert(e.response?.data?.detail || "Failed to create facility.");
    }
  };

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    try {
      await api.post('/workshop/workers/', workerForm);
      setSuccessMessage(t('admin.workshop_dashboard.success_worker_added'));
      setShowAddWorker(false);
      resetWorkerForm();
      fetchWorkers();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (e) { 
      console.error("Create worker error:", e);
      alert(JSON.stringify(e.response?.data || "Action failed"));
    }
  };

  const handleUpdateWorker = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/workshop/workers/${editingWorker.id}/`, workerForm);
      setSuccessMessage(t('admin.workshop_dashboard.success_worker_updated'));
      setEditingWorker(null);
      resetWorkerForm();
      fetchWorkers();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (e) { 
      console.error("Update worker error:", e); 
    }
  };

  const handleDeleteWorker = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/workshop/workers/${id}/`);
      fetchWorkers();
    } catch (e) { 
      console.error("Delete worker error:", e); 
    }
  };

  const resetWorkerForm = () => {
    setWorkerForm({ name: '', specialty: '', phone: '', is_active: true });
  };

  return (
    <div className="min-h-screen bg-premium-900 font-sans p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Wrench className="text-gold-500" /> 
            {idLoading ? (
              <span className="animate-pulse text-silver-500 text-lg">{t('admin.common.loading')}...</span>
            ) : (
              isAdmin ? t('admin.workshop_dashboard.title') : (myFacility?.name || t('admin.workshop_dashboard.title'))
            )}
          </h1>
          <p className="text-silver-400 mt-1">
            {idLoading ? "Identifying Facility Context..." : (
               isAdmin ? t('admin.workshop_dashboard.subtitle') : t(`admin.workshop_dashboard.category_${(myFacility?.category || 'maintenance').split('_')[0].toLowerCase()}`)
            )}
          </p>
        </div>
        <div className="bg-premium-800 border border-white/5 py-2 px-4 rounded-lg flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-semibold text-silver-300">{t('admin.workshop_dashboard.live_sync')}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mb-8 bg-premium-800 p-1.5 rounded-xl border border-white/5 inline-flex w-full md:w-auto">
        <button 
          onClick={() => setActiveTab('requisitions')}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'requisitions' ? 'bg-gold-500 text-premium-900 shadow-md' : 'text-silver-400 hover:text-white hover:bg-white/5'}`}
        >
          {t('admin.workshop_dashboard.tab_requisitions')}
        </button>
        {isAdmin ? (
          <button 
            onClick={() => setActiveTab('facilities')}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'facilities' ? 'bg-gold-500 text-premium-900 shadow-md' : 'text-silver-400 hover:text-white hover:bg-white/5'}`}
          >
            {t('admin.workshop_dashboard.tab_facilities')}
          </button>
        ) : (
          <button 
            onClick={() => setActiveTab('staff')}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'staff' ? 'bg-gold-500 text-premium-900 shadow-md' : 'text-silver-400 hover:text-white hover:bg-white/5'}`}
          >
            {t('admin.workshop_dashboard.tab_workers')}
          </button>
        )}
      </div>

      {activeTab === 'requisitions' ? (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border border-premium-border/50">
              <div>
                <p className="text-silver-400 text-xs font-semibold uppercase tracking-wider mb-1">{t('admin.workshop_dashboard.active_orders')}</p>
                <h2 className="text-4xl font-bold text-white">{dashboardMetrics.active_orders}</h2>
              </div>
              <div className="bg-premium-800 p-4 rounded-xl text-gold-500 border border-white/5">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border border-premium-border/50">
              <div>
                <p className="text-silver-400 text-xs font-semibold uppercase tracking-wider mb-1">{t('admin.workshop_dashboard.pending_assign')}</p>
                <h2 className="text-4xl font-bold text-white">{dashboardMetrics.unassigned_appointments}</h2>
              </div>
              <div className="bg-premium-800 p-4 rounded-xl text-gold-500 border border-white/5">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border border-premium-border/50">
              <div>
                <p className="text-silver-400 text-xs font-semibold uppercase tracking-wider mb-1">{t('admin.workshop_dashboard.expected_today') || 'Expected Today'}</p>
                <h2 className="text-4xl font-bold text-white">{dashboardMetrics.expected_appointments_today}</h2>
              </div>
              <div className="bg-premium-800 p-4 rounded-xl text-gold-500 border border-white/5">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-premium-border/50 flex flex-col">
            <div className="p-6 border-b border-premium-border/50 bg-premium-800/30">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <h3 className="text-xl font-bold text-white">{t('admin.workshop_dashboard.requisitions')}</h3>
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                  <div className="relative flex-1 lg:w-64">
                    <Search className="w-4 h-4 absolute inset-y-0 start-3 top-1/2 -translate-y-1/2 text-silver-500" />
                    <input 
                      type="text" 
                      placeholder={t('admin.common.filters.search_placeholder')} 
                      className="w-full bg-premium-900/50 border border-white/10 rounded-lg py-2 ps-9 pe-4 text-white text-sm focus:border-gold-500 outline-none"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select 
                    className="bg-premium-900/50 border border-white/10 rounded-lg py-2 px-3 text-white focus:border-gold-500 outline-none text-xs font-semibold rtl:text-right"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">{t('admin.common.filters.all_statuses')}</option>
                    <option value="Unassigned">{t('admin.workshop_dashboard.status_unassigned')}</option>
                    <option value="In_Progress">{t('admin.workshop_dashboard.status_in_progress')}</option>
                    <option value="Awaiting_Payment">{t('admin.workshop_dashboard.status_awaiting_payment')}</option>
                    <option value="Completed">{t('admin.workshop_dashboard.status_completed')}</option>
                    <option value="Rejected">{t('my_appointments.status.Rejected')}</option>
                    <option value="Cancelled">{t('my_appointments.status.Cancelled')}</option>
                  </select>
                  <select 
                    className="bg-premium-900/50 border border-white/10 rounded-lg py-2 px-3 text-white focus:border-gold-500 outline-none text-xs font-semibold rtl:text-right"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="all">{t('admin.common.filters.all_types')}</option>
                    <option value="Home Service">{t('admin.workshop_dashboard.type_home')}</option>
                    <option value="Workshop">{t('admin.workshop_dashboard.type_workshop')}</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse rtl:text-right">
                <thead>
                  <tr className="bg-premium-900/50 text-silver-500 text-xs uppercase tracking-wider">
                    <th className="p-4 ps-6">{t('admin.workshop_dashboard.col_order')}</th>
                    <th className="p-4">{t('admin.workshop_dashboard.col_customer')}</th>
                    <th className="p-4">{t('admin.workshop_dashboard.col_service')}</th>
                    <th className="p-4">{t('admin.workshop_dashboard.col_staff')}</th>
                    <th className="p-4 pe-6">{t('admin.workshop_dashboard.col_status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-premium-border/30">
                  {loadingOrders ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
                          <p className="text-silver-500 text-xs font-bold uppercase tracking-widest">{t('admin.common.loading')}</p>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedOrders.map((order) => (
                    <tr key={order.id} className="text-sm hover:bg-premium-800/10 transition-colors">
                      <td className="p-4 ps-6">
                        <div>
                          <p className="font-bold text-white">#WO-{order.id}</p>
                          <p className="text-xs text-silver-400 font-medium">{order.appointment_details?.scheduled_date}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-premium-900 flex items-center justify-center text-[10px] font-black text-gold-500 border border-white/5 shrink-0">VIP</div>
                          <div>
                            <p className="font-bold text-white text-sm">{order.appointment_details?.customer_name || t('admin.common.anonymous')}</p>
                            <div className="flex flex-col">
                               <p className="text-[10px] text-silver-500 font-medium truncate max-w-[150px]">{order.appointment_details?.customer_email}</p>
                               {order.appointment_details?.customer_phone && (
                                 <p className="text-[9px] text-gold-500/70 font-mono italic">{order.appointment_details.customer_phone}</p>
                               )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-white font-medium">{order.appointment_details?.service_details?.name || t('admin.workshop_dashboard.generic_service')}</span>
                          <span className="text-[10px] text-silver-500 uppercase tracking-tighter">
                            {order.appointment_details?.is_home_service ? t('admin.workshop_dashboard.type_home') : t('admin.workshop_dashboard.type_workshop')} @ {order.appointment_details?.scheduled_time}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        {order.technician_name ? (
                          <div className="flex items-center gap-2 text-silver-300">
                            <div className="w-6 h-6 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center text-gold-400"><Users className="w-3 h-3" /></div>
                            <span className="text-xs font-semibold">{order.technician_name}</span>
                          </div>
                        ) : isAdmin ? (
                           <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-silver-500 italic">
                             {t('admin.workshop_dashboard.status_unassigned')}
                           </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {order.status === 'Unassigned' && (
                              <button 
                                onClick={() => { setSelectedOrder(order); setShowAssignModal(true); fetchWorkers(); }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold-500/10 border border-gold-500/20 text-xs font-bold text-gold-500 hover:text-white hover:bg-gold-500 transition-all"
                              >
                                <UserPlus className="w-3 h-3" /> {t('admin.workshop_dashboard.assign_tech')}
                              </button>
                            )}
                            {order.status === 'Unassigned' && (
                              <button 
                                onClick={() => { setSelectedOrder(order); setTerminalActionType('reject'); setShowTerminalActionModal(true); }}
                                className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                title={t('admin.workshop_dashboard.reject_request')}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-4 pe-6">
                        <div className="flex items-center gap-3">
                          {isAdmin ? (
                            <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest w-fit ${
                              order.status === 'Unassigned' ? 'bg-red-500/10 text-red-500' : 
                              order.status === 'In_Progress' ? 'bg-blue-500/10 text-blue-400' :
                              order.status === 'Awaiting_Payment' ? 'bg-amber-500/10 text-amber-500' :
                              order.status === 'Rejected' || order.status === 'Cancelled' ? 'bg-silver-500/20 text-silver-400' :
                              'bg-green-500/10 text-green-500'
                            }`}>
                              {t(`my_appointments.status.${order.status}`) || order.status}
                            </div>
                          ) : (
                            <button 
                              onClick={() => { 
                              if (order.status !== 'Unassigned') { 
                                setSelectedOrder(order); 
                                setUnforeseenInput(order.unforeseen_costs || '');
                                setShowMaintenanceModal(true); 
                                fetchInventoryParts(); 
                              } 
                            }}
                              disabled={order.status === 'Unassigned'}
                              className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${
                                order.status === 'Unassigned' ? 'bg-red-500/10 text-red-500 cursor-default' : 
                                order.status === 'In_Progress' ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white' :
                                order.status === 'Awaiting_Payment' ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white' :
                                order.status === 'Rejected' || order.status === 'Cancelled' ? 'bg-silver-500/20 text-silver-400 hover:bg-white hover:text-black' :
                                'bg-green-500/10 text-green-500 cursor-default'
                              }`}
                            >
                              {t(`my_appointments.status.${order.status}`) || order.status}
                              {order.status === 'In_Progress' && <Wrench className="w-2.5 h-2.5 ms-1 inline" />}
                            </button>
                          )}
                          
                          <button 
                            onClick={() => { setSelectedOrder(order); setShowMaintenanceModal(true); }}
                            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-silver-400 hover:text-gold-500 hover:border-gold-500/50 transition-all"
                            title={t('admin.workshop_dashboard.order_details')}
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedOrders.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-silver-500 text-sm">
                        {t('admin.workshop_dashboard.no_orders')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {paginatedOrders.length > 0 && (
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </>
      ) : activeTab === 'facilities' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">{t('admin.workshop_dashboard.tab_facilities')}</h2>
            <button 
              onClick={() => setShowAddFacility(!showAddFacility)}
              className="luxury-button px-4 py-2 flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" /> {t('admin.workshop_dashboard.add_facility')}
            </button>
          </div>

          {successMessage && (
            <div className="glass-panel border border-green-500/50 bg-green-500/10 p-4 rounded-xl flex items-center gap-3 animate-fade-in-up">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-green-400 font-bold text-sm tracking-wide">{successMessage}</span>
            </div>
          )}

          {showAddFacility && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
              <div className="glass-panel w-full max-w-[95%] md:max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 rounded-3xl border border-gold-500/30 shadow-[0_0_50px_rgba(212,175,55,0.1)] relative animate-fade-in-up">
                <button 
                  onClick={() => { setShowAddFacility(false); resetForm(); }}
                  className="absolute top-6 right-6 text-silver-400 hover:text-white transition-colors"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>

                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Plus className="text-gold-500" /> {editingFacility ? t('admin.workshop_dashboard.edit_facility') : t('admin.workshop_dashboard.add_facility')}
                </h2>

                <form onSubmit={editingFacility ? handleUpdateFacility : handleCreateFacility} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-silver-400 uppercase tracking-wider mb-2">{t('admin.workshop_dashboard.facility_name')}</label>
                    <input required type="text" className="luxury-input w-full" value={newFacility.name} onChange={e => setNewFacility({...newFacility, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-silver-400 uppercase tracking-wider mb-2">{t('admin.workshop_dashboard.assigned_manager')}</label>
                      <select className="luxury-input w-full" value={newFacility.manager} onChange={e => setNewFacility({...newFacility, manager: e.target.value})}>
                        <option value="">{t('admin.workshop_dashboard.select_manager')}</option>
                        {editingFacility && editingFacility.manager && !eligibleManagers.find(m => m.id === editingFacility.manager) && (
                           <option key={editingFacility.manager} value={editingFacility.manager}>{editingFacility.manager_name || 'Current Manager'}</option>
                        )}
                        {Array.isArray(eligibleManagers) && eligibleManagers.map(manager => (
                           <option key={manager?.id} value={manager?.id}>{manager?.username}</option>
                        ))}
                        {(!eligibleManagers || eligibleManagers.length === 0) && (!editingFacility || !editingFacility.manager) && (
                           <option disabled value="none">{t('admin.workshop_dashboard.no_managers')}</option>
                        )}
                      </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-silver-400 uppercase tracking-wider mb-2">{t('admin.workshop_dashboard.category')}</label>
                    <select required className="luxury-input w-full" value={newFacility.category} onChange={e => setNewFacility({...newFacility, category: e.target.value})}>
                      <option value="Polishing_Ceramic">{t('admin.workshop_dashboard.category_polishing')}</option>
                      <option value="Diagnostic_Inspection">{t('admin.workshop_dashboard.category_diagnostic')}</option>
                      <option value="Maintenance_Accessories">{t('admin.workshop_dashboard.category_maintenance')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-silver-400 uppercase tracking-wider mb-2">{t('admin.workshop_dashboard.location_type')}</label>
                    <select required className="luxury-input w-full" value={newFacility.service_location_type} onChange={e => setNewFacility({...newFacility, service_location_type: e.target.value})}>
                      <option value="Internal">{t('admin.workshop_dashboard.type_internal')}</option>
                      <option value="Mobile">{t('admin.workshop_dashboard.type_mobile')}</option>
                      <option value="Both">{t('admin.workshop_dashboard.type_both')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-silver-400 uppercase tracking-wider mb-2">{t('admin.workshop_dashboard.working_days')}</label>
                    <select required className="luxury-input w-full" value={newFacility.working_days} onChange={e => setNewFacility({...newFacility, working_days: e.target.value})}>
                      <option value="Monday - Friday">Monday - Friday</option>
                      <option value="Monday - Saturday">Monday - Saturday</option>
                      <option value="Everyday (Mon-Sun)">Everyday (Mon-Sun)</option>
                      <option value="Weekends Only">Weekends Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-silver-400 uppercase tracking-wider mb-2">{t('admin.workshop_dashboard.working_hours')}</label>
                    <select required className="luxury-input w-full" value={newFacility.working_hours} onChange={e => setNewFacility({...newFacility, working_hours: e.target.value})}>
                      <option value="08:00 AM - 05:00 PM">08:00 AM - 05:00 PM</option>
                      <option value="09:00 AM - 06:00 PM">09:00 AM - 06:00 PM</option>
                      <option value="10:00 AM - 07:00 PM">10:00 AM - 07:00 PM</option>
                      <option value="24 Hours">24 Hours</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-silver-400 uppercase tracking-wider mb-2">
                       {t('booking.at_workshop')} Fee ($)
                    </label>
                    <input required type="number" step="0.01" className="luxury-input w-full" value={newFacility.on_site_fee} onChange={e => setNewFacility({...newFacility, on_site_fee: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-silver-400 uppercase tracking-wider mb-2">
                       {t('booking.mobile_home')} Fee ($)
                    </label>
                    <input required type="number" step="0.01" className="luxury-input w-full" value={newFacility.mobile_fee} onChange={e => setNewFacility({...newFacility, mobile_fee: e.target.value})} />
                  </div>
                  <div className="md:col-span-2 mt-4 flex justify-end">
                    <button type="submit" className="luxury-button px-8 py-2.5 flex items-center gap-2">
                      {t('admin.workshop_dashboard.save_facility')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(facilities) && facilities.map((fac) => (
              <div key={fac?.id || Math.random()} className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-gold-500/20 group relative overflow-hidden transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-premium-800 rounded-xl flex items-center justify-center text-gold-500 border border-white/5">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { 
                        setEditingFacility(fac); 
                        setNewFacility({
                          name: fac.name,
                          working_days: fac.working_days,
                          working_hours: fac.working_hours,
                          category: fac.category,
                          service_location_type: fac.service_location_type,
                          manager: fac.manager || '',
                          on_site_fee: fac.on_site_fee || 50,
                          mobile_fee: fac.mobile_fee || 100
                        });
                        setShowAddFacility(true);
                      }}
                      className="p-2 bg-white/5 hover:bg-gold-500/20 text-silver-400 hover:text-gold-500 rounded-lg transition-colors border border-white/5"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteFacility(fac.id)}
                      className="p-2 bg-white/5 hover:bg-red-500/20 text-silver-400 hover:text-red-500 rounded-lg transition-colors border border-white/5"
                    >
                      <Plus className="w-4 h-4 rotate-45" />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{fac?.name || 'Workshop'}</h3>
                <span className="inline-block px-2 py-1 bg-gold-500/10 text-gold-400 text-[10px] uppercase tracking-wider font-bold rounded mb-4">
                  {t(`admin.workshop_dashboard.type_${(fac?.service_location_type || 'Both').toLowerCase()}`)}
                </span>
                <p className="text-sm text-silver-400 mb-2"><strong>{t('admin.workshop_dashboard.category')}:</strong> {t(`admin.workshop_dashboard.category_${(fac?.category || 'Polishing').split('_')[0].toLowerCase()}`)}</p>
                <p className="text-sm text-silver-400 mb-2"><strong>{t('admin.workshop_dashboard.working_hours')}:</strong> {fac?.working_days} | {fac?.working_hours}</p>
                <div className="flex gap-4 mt-2 pt-2 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-silver-500 uppercase font-bold">{t('booking.at_workshop')}</span>
                    <span className="text-xs text-white font-mono">${fac?.on_site_fee || 0}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-silver-500 uppercase font-bold">{t('booking.mobile_home')}</span>
                    <span className="text-xs text-white font-mono">${fac?.mobile_fee || 0}</span>
                  </div>
                </div>
              </div>
            ))}
            {facilities.length === 0 && !showAddFacility && (
              <div className="col-span-full text-center p-12 glass-panel border-dashed border-white/10 rounded-2xl">
                <Building2 className="w-12 h-12 text-silver-600 mx-auto mb-4" />
                <p className="text-silver-400">{t('admin.workshop_dashboard.no_facilities')}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <div>
              <h2 className="text-2xl font-bold text-white">{t('admin.workshop_dashboard.tab_workers')}</h2>
              <p className="text-silver-500 text-sm mt-1">{t('admin.workshop_dashboard.registry_for', { name: myFacility?.name || t('admin.workshop_dashboard.this_facility') })}</p>
            </div>
            <button 
              onClick={() => { resetWorkerForm(); setShowAddWorker(true); }}
              className="luxury-button px-4 py-2 flex items-center gap-2 text-sm"
            >
              <UserPlus className="w-4 h-4" /> {t('admin.workshop_dashboard.add_worker')}
            </button>
          </div>

          {successMessage && (
            <div className="glass-panel border border-green-500/50 bg-green-500/10 p-4 rounded-xl flex items-center gap-3 animate-fade-in-up">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-green-400 font-bold text-sm tracking-wide">{successMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((worker) => (
              <div key={worker.id} className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-gold-500/20 group relative overflow-hidden transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-premium-800 rounded-xl flex items-center justify-center text-gold-500 border border-white/5">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditingWorker(worker); setWorkerForm(worker); }}
                      className="p-2 bg-white/5 hover:bg-gold-500/20 text-silver-400 hover:text-gold-500 rounded-lg transition-colors border border-white/5"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteWorker(worker.id)}
                      className="p-2 bg-white/5 hover:bg-red-500/20 text-silver-400 hover:text-red-500 rounded-lg transition-colors border border-white/5"
                    >
                      <Plus className="w-4 h-4 rotate-45" />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{worker.name}</h3>
                <p className="text-gold-500/80 text-xs font-mono tracking-widest uppercase mb-4">{worker.specialty}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-silver-400 text-sm">
                    <LogOut className="w-4 h-4 rotate-180" /> {worker.phone || 'No phone registered'}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${worker.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className={worker.is_active ? 'text-green-500' : 'text-red-500'}>{worker.is_active ? t('admin.admin_dashboard.active') : t('admin.admin_dashboard.stable')}</span>
                  </div>
                </div>
              </div>
            ))}
            {workers.length === 0 && (
              <div className="col-span-full text-center p-12 glass-panel border-dashed border-white/10 rounded-2xl">
                <Users className="w-12 h-12 text-silver-600 mx-auto mb-4" />
                <p className="text-silver-400">{t('admin.workshop_dashboard.no_workers')}</p>
              </div>
            )}
          </div>

          {/* Worker Modal */}
          {(showAddWorker || editingWorker) && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
              <div className="glass-panel w-full max-w-lg p-8 rounded-3xl border border-gold-500/30 shadow-[0_0_50px_rgba(212,175,55,0.1)] relative">
                <button 
                  onClick={() => { setShowAddWorker(false); setEditingWorker(null); }}
                  className="absolute top-6 right-6 text-silver-400 hover:text-white transition-colors"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>

                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <UserPlus className="text-gold-500" /> {editingWorker ? t('admin.workshop_dashboard.edit_worker') : t('admin.workshop_dashboard.add_worker')}
                </h2>

                <form onSubmit={editingWorker ? handleUpdateWorker : handleCreateWorker} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-silver-400 uppercase tracking-wider mb-2">{t('admin.workshop_dashboard.worker_name')}</label>
                    <input required type="text" className="luxury-input w-full" value={workerForm.name} onChange={e => setWorkerForm({...workerForm, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-silver-400 uppercase tracking-wider mb-2">{t('admin.workshop_dashboard.specialty')}</label>
                    <input required type="text" placeholder={t('admin.workshop_dashboard.specialty_placeholder')} className="luxury-input w-full" value={workerForm.specialty} onChange={e => setWorkerForm({...workerForm, specialty: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-silver-400 uppercase tracking-wider mb-2">{t('admin.workshop_dashboard.phone')}</label>
                    <input type="text" className="luxury-input w-full" value={workerForm.phone} onChange={e => setWorkerForm({...workerForm, phone: e.target.value})} />
                  </div>
                  <div className="flex items-center gap-3 py-2">
                    <input type="checkbox" id="is_active" className="w-4 h-4 rounded border-white/10 bg-premium-900 text-gold-500" checked={workerForm.is_active} onChange={e => setWorkerForm({...workerForm, is_active: e.target.checked})} />
                    <label htmlFor="is_active" className="text-sm font-semibold text-silver-300">{t('admin.workshop_dashboard.worker_active_label')}</label>
                  </div>
                  <button type="submit" className="luxury-button w-full py-4 mt-4 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    {t('admin.workshop_dashboard.save_worker')} <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Assign Technician Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-[95%] md:max-w-lg p-6 md:p-8 rounded-3xl border border-gold-500/30 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-white mb-6 italic tracking-tighter flex items-center gap-3">
              <UserPlus className="text-gold-500" /> {t('admin.workshop_dashboard.assign_tech')}
            </h2>
            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {workers.filter(w => w.is_active).map(worker => (
                <button 
                  key={worker.id}
                  onClick={() => handleAssignWorker(selectedOrder.id, worker.id)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-gold-500/50 hover:bg-white/10 transition-all group"
                >
                  <div className="text-left">
                    <p className="font-bold text-white group-hover:text-gold-500">{worker.name}</p>
                    <p className="text-[10px] uppercase text-silver-500 font-bold tracking-widest">{worker.specialty}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-silver-600 group-hover:text-gold-500 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
              {workers.length === 0 && (
                <div className="text-center py-10 text-silver-500">
                  {t('admin.workshop_dashboard.no_workers')}
                </div>
              )}
            </div>
            <button 
              onClick={() => setShowAssignModal(false)}
              className="w-full mt-6 py-4 rounded-xl border border-white/10 text-silver-400 font-bold uppercase tracking-widest text-[10px] hover:bg-white/5"
            >
              {t('admin.workshop_dashboard.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Maintenance & Parts Console */}
      {showMaintenanceModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[110] flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-[95%] xl:max-w-7xl max-h-[95vh] overflow-y-auto p-6 md:p-8 rounded-[40px] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-fade-in-up flex flex-col lg:flex-row gap-8 relative overflow-x-hidden">
            <div className="flex-1 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                   <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{t('admin.workshop_dashboard.maintenance_console')}</h2>
                   <p className="text-gold-500 text-[10px] font-black tracking-[0.3em] uppercase">{t('admin.workshop_dashboard.order_id', { id: selectedOrder.id })} • {selectedOrder.appointment_details?.service_details?.name}</p>
                </div>
                <button onClick={() => setShowMaintenanceModal(false)} className="lg:hidden p-2 text-silver-500 hover:text-white"><Plus className="w-6 h-6 rotate-45" /></button>
                <button onClick={() => setShowMaintenanceModal(false)} className="hidden lg:block absolute top-8 right-8 p-2 text-silver-500 hover:text-white transition-colors z-20"><Plus className="w-8 h-8 rotate-45" /></button>
              </div>

              {/* Customer & Location Info */}
              <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-silver-400 uppercase tracking-widest">{t('booking.service_location')}</h3>
                  {selectedOrder.appointment_details?.is_home_service ? (
                    <span className="text-[10px] text-amber-500 font-bold uppercase py-0.5 px-2 bg-amber-500/10 rounded-full">{t('admin.workshop_dashboard.type_home')}</span>
                  ) : (
                    <span className="text-[10px] text-blue-500 font-bold uppercase py-0.5 px-2 bg-blue-500/10 rounded-full">{t('admin.workshop_dashboard.type_workshop')}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-white font-medium text-sm">{selectedOrder.appointment_details?.customer_address || t('admin.workshop_dashboard.at_workshop_hq')}</p>
                  {selectedOrder.appointment_details?.coordinates && (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedOrder.appointment_details.coordinates.latitude},${selectedOrder.appointment_details.coordinates.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold-500 text-[10px] font-black uppercase flex items-center gap-1 hover:underline w-fit"
                    >
                       View on Google Maps <ArrowRight className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Termination Reason if applicable */}
              {(selectedOrder.status === 'Rejected' || selectedOrder.status === 'Cancelled') && (
                <div className="glass-panel p-6 rounded-3xl border border-red-500/30 bg-red-500/5 space-y-3">
                  <h3 className="text-xs font-black text-red-500 uppercase tracking-widest">{t('admin.workshop_dashboard.termination_reason')}</h3>
                  <p className="text-silver-300 text-sm italic">"{selectedOrder.manager_notes || 'No reason provided.'}"</p>
                </div>
              )}

              {/* Current Parts List */}
              <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
                <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                   <h3 className="text-xs font-black text-silver-400 uppercase tracking-widest">{t('admin.workshop_dashboard.requisition_parts')}</h3>
                   <span className="bg-gold-500/20 text-gold-500 text-[9px] px-2 py-0.5 rounded-full font-black uppercase italic">{selectedOrder.parts?.length || 0} {t('admin.workshop_dashboard.items_count')}</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-premium-900 z-10">
                      <tr className="text-[8px] uppercase tracking-widest text-silver-600 border-b border-white/5">
                        <th className="p-4">{t('admin.workshop_dashboard.col_part')}</th>
                        <th className="p-4 text-center">{t('admin.workshop_dashboard.col_qty')}</th>
                        <th className="p-4 text-right">{t('admin.workshop_dashboard.col_cost')}</th>
                        <th className="p-4 text-center w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedOrder?.parts?.map(p => (
                        <tr key={p.id} className="text-xs group hover:bg-white/2 transition-colors">
                          <td className="p-4">
                            <p className="text-white font-bold">{p.part_details?.name || 'Unknown Part'}</p>
                            <p className="text-[8px] text-silver-500 font-mono italic uppercase font-bold tracking-tighter">{p.part_details?.sku || 'N/A'}</p>
                          </td>
                          <td className="p-4 text-center font-mono text-silver-400">{p.quantity}</td>
                          <td className="p-4 text-right font-mono font-bold text-silver-300">${( (p.price_at_time || 0) * (p.quantity || 0) ).toLocaleString()}</td>
                          <td className="p-4 text-center">
                            {(selectedOrder.status === 'In_Progress' || selectedOrder.status === 'Awaiting_Payment') && (
                              <button 
                                onClick={() => handleRemovePart(selectedOrder.id, p.part)}
                                className="p-2 text-silver-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                title={t('admin.workshop_dashboard.remove')}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {(!selectedOrder?.parts || selectedOrder?.parts?.length === 0) && (
                        <tr><td colSpan="4" className="p-10 text-center text-silver-600 italic text-xs tracking-widest uppercase">{t('admin.workshop_dashboard.no_parts_added')}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Unforeseen Cost Input */}
              {(selectedOrder.status === 'In_Progress' || selectedOrder.status === 'Awaiting_Payment') && (
                 <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/2 space-y-4">
                   <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-silver-400 uppercase tracking-widest">{t('admin.workshop_dashboard.unforeseen_costs')}</h3>
                      <span className="text-[10px] text-silver-500 italic font-bold">OPTIONAL ADD-ON</span>
                   </div>
                   <div className="flex gap-3">
                      <div className="relative flex-1">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500 font-black text-xs">$</span>
                         <input 
                           type="number" 
                           placeholder={t('admin.workshop_dashboard.unforeseen_placeholder')}
                           className="luxury-input w-full pl-8 py-3 text-xs" 
                           value={unforeseenInput}
                           onChange={(e) => setUnforeseenInput(e.target.value)}
                         />
                      </div>
                      <button 
                        onClick={() => handleUpdateUnforeseenCosts(selectedOrder.id, unforeseenInput)}
                        className="px-6 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-gold-500 text-[10px] font-black uppercase hover:bg-gold-500 hover:text-premium-950 transition-all"
                      >
                        Update
                      </button>
                   </div>
                 </div>
               )}

              {/* Order Summary & Financial Breakdown */}
              <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/2 space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                   <h3 className="text-xs font-black text-silver-400 uppercase tracking-widest flex items-center gap-2">
                     <CreditCard className="w-4 h-4 text-gold-500" /> {t('admin.workshop_dashboard.order_details')}
                   </h3>
                   <div className="text-right">
                     <p className="text-[10px] text-silver-500 font-black uppercase tracking-widest">{t('admin.workshop_dashboard.assigned_tech')}</p>
                     <p className="text-white font-bold text-xs">{selectedOrder.technician_name || t('admin.workshop_dashboard.status_unassigned')}</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-green-500 font-black uppercase tracking-[0.2em]">{t('admin.workshop_dashboard.paid_deposit')}</p>
                      <span className="text-[8px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Settled</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-silver-400">{t('admin.workshop_dashboard.service_base')}</span>
                        <span className="text-white font-mono">${Number(selectedOrder.appointment_details?.service_details?.base_price || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-silver-400">{t('admin.workshop_dashboard.fees')}</span>
                        <span className="text-white font-mono">
                          ${(Number(selectedOrder.appointment_details?.total_amount || 0) - 
                             Number(selectedOrder.additional_parts_cost || 0) - 
                             Number(selectedOrder.unforeseen_costs || 0) - 
                             Number(selectedOrder.appointment_details?.service_details?.base_price || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] text-gold-500 font-black uppercase tracking-[0.2em]">{t('admin.workshop_dashboard.balance_due')}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-silver-400">{t('admin.workshop_dashboard.total_parts')}</span>
                        <span className="text-white font-mono">${Number(selectedOrder.additional_parts_cost || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-silver-400">{t('admin.workshop_dashboard.unforeseen_costs')}</span>
                        <span className="text-white font-mono">${Number(selectedOrder.unforeseen_costs || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-2">
                   <div className="flex justify-between items-center opacity-50">
                      <p className="text-[10px] text-silver-500 font-black uppercase tracking-widest">{t('admin.workshop_dashboard.total_order_value')}</p>
                      <p className="text-sm font-bold text-white font-mono">${Number(selectedOrder.appointment_details?.total_amount || 0).toLocaleString()}</p>
                   </div>
                   <div className="flex justify-between items-center">
                      <p className="text-xs font-black text-gold-500 uppercase tracking-widest">{t('admin.workshop_dashboard.balance_due')}</p>
                      <p className="text-xl font-black text-gold-500 font-mono italic">${(Number(selectedOrder.additional_parts_cost || 0) + Number(selectedOrder.unforeseen_costs || 0)).toLocaleString()}</p>
                   </div>
                </div>
              </div>

              {/* Action Area */}
               <div className="glass-panel p-6 rounded-3xl border border-gold-500/20 bg-gold-500/5 flex items-center justify-center">
                 <div className="flex flex-wrap gap-3">
                    {selectedOrder.status === 'In_Progress' && (
                      <button 
                        onClick={() => handleFinishMaintenance(selectedOrder.id)}
                        className="luxury-button px-8 py-2.5 text-xs font-black shadow-gold-500/20 flex-1 md:flex-none"
                      >
                        {t('admin.workshop_dashboard.finish_request')}
                      </button>
                    )}
                 </div>
                 {selectedOrder.status === 'Awaiting_Payment' && (
                   <div className="flex flex-col items-center text-center">
                     <p className="text-amber-500 text-xs font-black uppercase tracking-[0.2em] mb-2">{t('admin.workshop_dashboard.status_awaiting_payment')}</p>
                     <p className="text-silver-500 text-[10px] font-bold tracking-widest italic">{t('admin.workshop_dashboard.awaiting_customer_action')}</p>
                   </div>
                 )}
                 {selectedOrder.status === 'Completed' && (
                   <div className="flex flex-col items-center text-center">
                     <p className="text-green-500 text-xs font-black uppercase tracking-[0.2em]">{t('admin.workshop_dashboard.status_completed')}</p>
                   </div>
                 )}
                 {selectedOrder.status === 'Rejected' && (
                   <div className="flex flex-col items-center text-center">
                     <p className="text-red-500 text-xs font-black uppercase tracking-[0.2em]">{t('admin.workshop_dashboard.status_rejected')}</p>
                   </div>
                 )}
                 {selectedOrder.status === 'Cancelled' && (
                   <div className="flex flex-col items-center text-center">
                     <p className="text-silver-500 text-xs font-black uppercase tracking-[0.2em]">{t('admin.workshop_dashboard.status_cancelled')}</p>
                   </div>
                 )}
               </div>
            </div>

            {/* Warehouse Browser Sidebar - Hidden for Terminates */}
            {(selectedOrder.status === 'In_Progress' || selectedOrder.status === 'Awaiting_Payment') && (
              <div className="w-full lg:w-80 flex flex-col gap-6">
                <div className="glass-panel h-full rounded-[32px] border border-white/5 flex flex-col p-6 overflow-hidden">
                <div className="mb-6 space-y-4">
                  <h3 className="text-gold-500 text-[10px] font-black uppercase tracking-[0.2em] italic flex items-center gap-2"><Search className="w-3.5 h-3.5" /> {t('admin.workshop_dashboard.warehouse_search')}</h3>
                  <input 
                    type="text" 
                    placeholder={t('admin.workshop_dashboard.warehouse_placeholder')} 
                    className="luxury-input w-full py-3 text-xs" 
                    value={partsSearchQuery}
                    onChange={(e) => {
                      setPartsSearchQuery(e.target.value);
                      fetchInventoryParts(e.target.value);
                    }}
                  />
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                  {inventoryParts.map(part => (
                    <div key={part.id} className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3 group hover:border-gold-500/50 transition-all">
                       <div className="flex justify-between items-start gap-2">
                         <div className="min-w-0">
                           <p className="font-bold text-white text-xs truncate group-hover:text-gold-500 transition-colors">{part.name}</p>
                           <p className="text-[8px] text-silver-500 font-bold uppercase tracking-tighter mb-1 truncate">{part.sku}</p>
                           <p className="text-gold-500 text-[10px] font-mono font-bold">${parseFloat(part.price).toLocaleString()}</p>
                         </div>
                         <button 
                           onClick={() => handleAddPartToOrder(selectedOrder.id, part.id)}
                           className="w-7 h-7 rounded-lg bg-gold-500 flex items-center justify-center text-premium-950 shadow-lg shadow-gold-500/20 hover:scale-110 active:scale-95 transition-all"
                         >
                            <Plus className="w-4 h-4" />
                         </button>
                       </div>
                       <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                          <span className={`text-[8px] font-black uppercase tracking-tighter ${part.stock_quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {part.stock_quantity > 0 ? `${part.stock_quantity} ${t('admin.workshop_dashboard.in_stock')}` : t('admin.workshop_dashboard.out_of_stock')}
                          </span>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => setShowMaintenanceModal(false)} className="hidden lg:block w-full py-4 rounded-2xl bg-premium-800 text-silver-500 font-black tracking-widest text-[10px] uppercase hover:text-white transition-all shadow-2xl">
                 {t('admin.workshop_dashboard.close_console')}
              </button>
            </div>
          )}

          <button onClick={() => setShowMaintenanceModal(false)} className="absolute top-8 right-8 hidden lg:block p-2 text-silver-700 hover:text-white group">
               <Plus className="w-8 h-8 rotate-45 transition-transform group-hover:scale-110" />
            </button>
          </div>
        </div>
      )}

      {showTerminalActionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-8 rounded-[32px] border border-red-500/30 animate-scale-in">
             <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tighter flex items-center gap-3">
               <LogOut className="text-red-500" /> 
               {terminalActionType === 'reject' ? t('admin.workshop_dashboard.reject_request') : t('admin.workshop_dashboard.cancel_request')}
             </h3>
             <p className="text-silver-400 text-sm mb-6">{t('admin.workshop_dashboard.termination_reason')}...</p>
             
             <form onSubmit={handleTerminalAction} className="space-y-6">
                <div>
                   <textarea 
                     required
                     className="luxury-input w-full min-h-[120px] py-4"
                     placeholder="e.g. Parts currently unavailable for this vehicle model..."
                     value={terminalNotes}
                     onChange={e => setTerminalNotes(e.target.value)}
                   />
                </div>
                
                <div className="flex gap-4">
                   <button 
                     type="button" 
                     onClick={() => setShowTerminalActionModal(false)}
                     className="flex-1 bg-white/5 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-all text-xs uppercase tracking-widest"
                   >
                     {t('admin.workshop_dashboard.cancel')}
                   </button>
                   <button 
                     type="submit" 
                     className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-500 transition-all text-xs uppercase tracking-widest shadow-lg shadow-red-600/20"
                   >
                     {t('admin.common.confirm')}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
