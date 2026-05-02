import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, Wrench, Heart, LifeBuoy, User, LogIn, LogOut, Calendar, Car, Globe, ShoppingCart, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../contexts/CartContext';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  
  const token = localStorage.getItem('user_access_token');
  const isLoggedIn = !!token;
  const { cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    localStorage.setItem('lang', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const handleLogout = () => {
    localStorage.removeItem('user_access_token');
    localStorage.removeItem('user_refresh_token');
    localStorage.removeItem('user_data');
    navigate('/');
    window.location.reload();
  };

  const publicLinks = [
    { name: t('nav.showroom'), href: '/catalog', icon: <Car className="w-4 h-4" /> },
    { name: t('nav.boutique'), href: '/store', icon: <ShoppingBag className="w-4 h-4" /> },
  ];

  const authLinks = [
    { name: t('nav.my_orders'), href: '/my-orders', icon: <Package className="w-4 h-4" /> },
    { name: t('nav.my_rentals'), href: '/my-rentals', icon: <Calendar className="w-4 h-4" /> },
    { name: t('nav.workshop'), href: '/workshop/book', icon: <Wrench className="w-4 h-4" /> },
    { name: t('nav.support'), href: '/profile/messages', icon: <LifeBuoy className="w-4 h-4" /> },
  ];

  const navLinks = isLoggedIn ? [...publicLinks, ...authLinks] : publicLinks;

  return (
    <nav className={`sticky top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-premium-900/95 backdrop-blur-xl shadow-2xl border-b border-white/5' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gold-500 flex items-center justify-center font-black text-premium-900 text-lg transform group-hover:rotate-6 transition-transform">
              EM
            </div>
            <div className="hidden sm:block">
              <h1 className="text-white font-bold text-lg leading-none tracking-tight">{t('brand')}</h1>
              <p className="text-gold-500 text-[10px] font-bold uppercase tracking-[0.25em]">{t('brand_sub')}</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.href} 
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-silver-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth / Profile / Language */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Toggle */}
            <button 
              onClick={toggleLanguage} 
              className="flex items-center gap-1.5 p-2 text-silver-400 hover:text-gold-500 transition-colors rounded-lg hover:bg-white/5"
              title={i18n.language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
            >
              <Globe className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">{i18n.language === 'ar' ? 'EN' : 'ع'}</span>
            </button>

            {isLoggedIn ? (
              <>
                <Link to="/favorites" className="p-2 text-silver-400 hover:text-gold-500 transition-colors" title={t('nav.favorites')}>
                  <Heart className="w-5 h-5" />
                </Link>
                <Link to="/cart" className="relative p-2 text-silver-400 hover:text-gold-500 transition-colors" title={t('nav.cart')}>
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] bg-gold-500 text-premium-900 text-[9px] font-black rounded-full flex items-center justify-center shadow-lg">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link to="/profile" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
                  <User className="w-4 h-4" /> {t('nav.my_account')}
                </Link>
                <button onClick={handleLogout} className="p-2 text-silver-400 hover:text-red-400 transition-colors" title={t('nav.sign_out')}>
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center gap-2 text-silver-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  <LogIn className="w-4 h-4" /> {t('nav.sign_in')}
                </Link>
                <Link to="/register" className="luxury-button px-5 py-2 text-sm font-bold">
                  {t('nav.join')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleLanguage} className="p-2 text-silver-400 hover:text-gold-500">
              <Globe className="w-5 h-5" />
            </button>
            <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 text-silver-300 hover:text-white">
              {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="md:hidden bg-premium-900/98 backdrop-blur-xl border-t border-white/5 animate-fade-in">
          <div className="px-4 py-6 space-y-2">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.href}
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-silver-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                {link.icon} {link.name}
              </Link>
            ))}
            <div className="border-t border-white/10 pt-4 mt-4 flex flex-col gap-2">
              {isLoggedIn ? (
                <>
                  <Link to="/cart" onClick={() => setIsMobileOpen(false)} className="flex items-center justify-center gap-2 py-3 text-silver-300 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium relative">
                    <ShoppingCart className="w-4 h-4" /> {t('nav.cart')}
                    {cartCount > 0 && <span className="bg-gold-500 text-premium-900 text-[9px] font-black px-1.5 py-0.5 rounded-full">{cartCount}</span>}
                  </Link>
                  <Link to="/my-orders" onClick={() => setIsMobileOpen(false)} className="flex items-center justify-center gap-2 py-3 text-silver-300 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium">
                    <Package className="w-4 h-4" /> {t('nav.my_orders')}
                  </Link>
                  <Link to="/profile" onClick={() => setIsMobileOpen(false)} className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 text-white rounded-lg text-sm font-bold">
                    <User className="w-4 h-4" /> {t('nav.my_account')}
                  </Link>
                  <button onClick={() => { setIsMobileOpen(false); handleLogout(); }} className="flex items-center justify-center gap-2 py-3 text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-lg text-sm font-bold">
                    <LogOut className="w-4 h-4" /> {t('nav.sign_out')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMobileOpen(false)} className="text-center py-3 text-silver-300 hover:text-white border border-white/10 rounded-lg text-sm font-medium">{t('nav.sign_in')}</Link>
                  <Link to="/register" onClick={() => setIsMobileOpen(false)} className="luxury-button py-3 text-center text-sm font-bold">{t('nav.join')}</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
