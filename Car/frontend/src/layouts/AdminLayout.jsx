import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useLoading } from '../components/ui/LoadingManager';
import { logout } from '../utils/auth';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AdminLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { stopLoading } = useLoading();
  const [isChecking, setIsChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on path change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const userJson = localStorage.getItem('admin_data');
    const token = localStorage.getItem('admin_access_token');
    
    if (!userJson || !token) {
      logout('admin');
      return;
    }

    try {
      const user = JSON.parse(userJson);
      if (user.role === 'Admin' || user.role === 'WorkshopManager') {
        setAuthorized(true);
        
        // Immediate redirection for managers visiting the root admin path
        if (user.role === 'WorkshopManager' && location.pathname === '/admin') {
          navigate('/admin/workshop', { replace: true });
        }
      } else {
        logout('admin');
      }
    } catch (e) {
      logout('admin');
    }
    
    setIsChecking(false);
  }, [location.pathname, navigate]);

  // Handle loader dismissal when checks are done or path change completes
  useEffect(() => {
    if (!isChecking) {
      const timer = setTimeout(() => {
        stopLoading();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isChecking, location.pathname, stopLoading]);

  if (isChecking) {
    return <LoadingSpinner />;
  }

  // If unauthorized (not logged in, or Customer), redirect them away gracefully
  if (!authorized) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-premium-900 font-sans relative">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Mobile Header (Only visible on small screens to toggle sidebar) */}
      <div className="md:hidden fixed top-0 inset-x-0 h-16 bg-premium-900/90 backdrop-blur-md border-b border-white/5 z-40 flex items-center px-4">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-silver-400 hover:text-white bg-white/5 rounded-xl transition-colors shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex-1 text-center pe-9">
          <span className="font-bold text-white text-lg tracking-wider uppercase">{t('brand')}</span>
        </div>
      </div>

      {/* Main Admin Content injected via React Router Outlet */}
      <main className="flex-1 overflow-x-hidden pt-16 md:pt-0">
        <Outlet />
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
