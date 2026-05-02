import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Building2, Users, Wrench, Package, 
  Settings, LogOut, LayoutDashboard, Globe, UserCircle, Shield, ShoppingBag, X, MessageSquare
} from 'lucide-react';

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    localStorage.setItem('lang', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };
  // Parse user from localStorage safely
  const userJson = localStorage.getItem('admin_data');
  const user = userJson ? JSON.parse(userJson) : null;

  const handleLogout = () => {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_data');
    navigate('/admin/login');
  };

  if (!user) return null;

  // Determine what links to show based on Role
  const navItems = [];

  if (user.role === 'Admin') {
    navItems.push(
      { label: t('admin.sidebar.exec_overview'), icon: <LayoutDashboard className="w-5 h-5" />, path: '/admin' },
      { label: t('admin.sidebar.inventory_app'), icon: <Package className="w-5 h-5" />, path: '/admin/inventory' },
      { label: t('admin.sidebar.rental_dispatch'), icon: <Package className="w-5 h-5" />, path: '/admin/rentals' },
      { label: t('admin.sidebar.car_acquisitions'), icon: <ShoppingBag className="w-5 h-5" />, path: '/admin/purchases' },
      { label: t('admin.sidebar.manage_store'), icon: <ShoppingBag className="w-5 h-5" />, path: '/admin/store' },
      { label: t('admin.sidebar.product_orders'), icon: <Package className="w-5 h-5" />, path: '/admin/product-orders' },
      { label: t('admin.sidebar.trust_management'), icon: <Shield className="w-5 h-5" />, path: '/admin/trust' },
      { label: t('admin.sidebar.client_relations'), icon: <Users className="w-5 h-5" />, path: '/admin/users' },
      { label: t('admin.sidebar.concierge_hub') || 'Concierge Hub', icon: <MessageSquare className="w-5 h-5" />, path: '/admin/messages' }
    );
  }
  if (user.role === 'Admin' || user.role === 'WorkshopManager') {
    navItems.push(
      { label: t('admin.sidebar.workshop_control'), icon: <Wrench className="w-5 h-5" />, path: '/admin/workshop' },
      { label: t('admin.sidebar.installation_orders'), icon: <Package className="w-5 h-5" />, path: '/admin/installations' }
    );
  }

  if (user.role === 'Admin') {
    navItems.push(
      { label: t('admin.sidebar.settings'), icon: <Settings className="w-5 h-5" />, path: '/admin/settings' }
    );
  }

  // Profile link for all admin/manager users
  navItems.push(
    { label: t('admin.sidebar.admin_profile'), icon: <UserCircle className="w-5 h-5" />, path: '/admin/profile' }
  );

  return (
    <aside className={`
      fixed inset-y-0 start-0 z-50 w-72 bg-premium-800 border-r border-white/5 flex flex-col h-screen transition-transform duration-300 ease-in-out
      md:translate-x-0 md:rtl:translate-x-0 md:sticky md:top-0 md:h-screen
      ${isOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'}
    `}>
      
      {/* Sidebar Header */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gold-500 flex items-center justify-center font-black text-premium-900 text-lg shrink-0">
             EM
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-lg leading-none truncate">{t('brand')}</h1>
            <p className="text-gold-500 text-[10px] font-bold uppercase tracking-[0.2em] truncate">{t('admin.sidebar.management')}</p>
          </div>
          
          <div className="flex items-center shrink-0">
            <button 
              onClick={toggleLanguage} 
              className="flex items-center gap-1 p-2 text-silver-400 hover:text-gold-500 transition-colors rounded-lg hover:bg-white/5"
              title={i18n.language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
            >
              <Globe className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{i18n.language === 'ar' ? 'EN' : 'ع'}</span>
            </button>
            <button 
              onClick={() => setIsOpen?.(false)}
              className="md:hidden flex items-center p-2 text-silver-400 hover:text-white bg-white/5 rounded-lg ms-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* User Card */}
        <div className="bg-premium-900/50 rounded-xl p-4 border border-white/5">
          <p className="text-sm font-bold text-white mb-1">{t('admin.sidebar.welcome')} {user.username}</p>
          <span className="inline-block px-2 py-0.5 bg-gold-500/10 text-gold-400 text-xs rounded border border-gold-500/20 uppercase tracking-wider font-semibold">
            {user.role}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <p className="px-3 text-xs uppercase tracking-widest text-silver-600 font-bold mb-4 mt-2">{t('admin.sidebar.modules')}</p>
        
        {navItems.map((item) => (
          <NavLink 
            key={item.label}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-gold-500 text-premium-900 shadow-[0_4px_20px_rgba(212,175,55,0.15)]' 
                  : 'text-silver-400 hover:text-white hover:bg-premium-900/50'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Utilities */}
      <div className="p-4 border-t border-white/5">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-silver-400 hover:text-white hover:bg-premium-900/50 transition-all mb-2"
        >
          <Building2 className="w-5 h-5" /> {t('admin.sidebar.visit_site')}
        </button>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-5 h-5" /> {t('admin.sidebar.terminate_session')}
        </button>
      </div>

    </aside>
  );
}
