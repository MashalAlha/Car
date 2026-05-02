import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import PremiumLoadingPage from './PremiumLoadingPage';

const LoadingContext = createContext();

export const useLoading = () => useContext(LoadingContext);

/**
 * LoadingManager provides a global context to control the premium transition loader.
 * It automatically starts on route changes and must be dismissed by the target layouts.
 */
export default function LoadingManager({ children }) {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const loadingTimeout = useRef(null);

  // Start loader on path change
  useEffect(() => {
    // We only trigger if navigation happens. 
    // Initial mount is handled by the initial state.
    setLoading(true);

    // Safety timeout: If a page fails to tell us it's done, we clear it after 3s
    if (loadingTimeout.current) clearTimeout(loadingTimeout.current);
    loadingTimeout.current = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => {
      if (loadingTimeout.current) clearTimeout(loadingTimeout.current);
    };
  }, [location.pathname]);

  const stopLoading = () => {
    if (loadingTimeout.current) clearTimeout(loadingTimeout.current);
    setLoading(false);
  };

  return (
    <LoadingContext.Provider value={{ loading, setLoading, stopLoading }}>
      {loading && <PremiumLoadingPage />}
      <div className={loading ? 'opacity-0' : 'opacity-100 transition-opacity duration-700'}>
        {children}
      </div>
    </LoadingContext.Provider>
  );
}
