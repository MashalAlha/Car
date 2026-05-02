import React, { useState } from 'react';
import { X, ArrowRight, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PromoBanner() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);

  const activePromo = {
    id: 1,
    title: t('promo.title'),
    message: t('promo.message'),
    link: "/store",
    cta_text: t('promo.cta')
  };

  if (!isVisible || !activePromo) return null;

  return (
    <div className="bg-gold-500 text-premium-900 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
        
        {/* Empty space for flex balance */}
        <div className="w-6 hidden sm:block"></div>

        <div className="flex-1 flex items-center justify-center gap-3 text-sm font-bold text-center">
          <Tag className="w-4 h-4 hidden sm:block" />
          <span>{activePromo.title}:</span>
          <span className="font-medium hidden sm:inline">{activePromo.message}</span>
          
          <a href={activePromo.link} className="inline-flex items-center gap-1 bg-premium-900 text-gold-400 px-3 py-1 rounded-full text-xs hover:bg-black transition-colors ml-2">
            {activePromo.cta_text} <ArrowRight className="w-3 h-3" />
          </a>
        </div>

        <button 
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-black/10 rounded-full transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
