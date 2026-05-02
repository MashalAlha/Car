import React from 'react';
import PremiumLoadingPage from './PremiumLoadingPage';

/**
 * LoadingSpinner now serves as the entry point for the global Premium Loading Experience.
 * It is used by React.Suspense to bridge transitions between lazy-loaded routes.
 */
export default function LoadingSpinner() {
  return <PremiumLoadingPage />;
}
