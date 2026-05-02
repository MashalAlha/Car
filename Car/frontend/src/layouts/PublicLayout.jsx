import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useLoading } from '../components/ui/LoadingManager';
import PromoBanner from '../components/ui/PromoBanner';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';

export default function PublicLayout() {
  const { stopLoading } = useLoading();
  const location = useLocation();

  useEffect(() => {
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      stopLoading();
    }, 100);
    return () => clearTimeout(timer);
  }, [location.pathname, stopLoading]);

  return (
    <div className="relative min-h-screen flex flex-col bg-premium-900">
      <header className="z-50">
        <PromoBanner />
        <Navbar />
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
