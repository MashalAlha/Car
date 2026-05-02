import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight, Car, ShoppingBag, Wrench, Shield, Star, 
  ChevronRight, Clock, MapPin, Phone, Zap, Award, Users 
} from 'lucide-react';
import api from '../utils/api';
import WhatSuitsYou from '../components/home/WhatSuitsYou';

export default function HomePage() {
  const { t } = useTranslation();
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(true);

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        const response = await api.get('/cars/inventory/featured/');
        const carsData = response.data;
        
        const formattedCars = carsData.slice(0, 4).map(car => ({
          id: car.id,
          name: `${car.make} ${car.model}`,
          price: car.is_for_sale ? `$${Number(car.price).toLocaleString()}` : `$${Number(car.daily_rent_price).toLocaleString()}/day`,
          type: car.is_for_sale ? 'Buy' : 'Rent',
          image: car.image_url || 'https://images.unsplash.com/photo-1503376710356-65bf6e210100?auto=format&fit=crop&q=80&w=800',
          tag: car.is_for_sale ? t('featured.new_arrival') : t('featured.rental')
        }));
        
        setFeaturedCars(formattedCars);
      } catch (error) {
        console.error("Error fetching featured cars:", error);
      } finally {
        setLoadingCars(false);
      }
    };

    fetchFeaturedCars();

    // Handle hash scroll on mount (e.g. for /#contact)
    if (window.location.hash) {
      setTimeout(() => {
        const id = window.location.hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500); // Small delay to ensure content is rendered
    }
  }, [t]);

  const stats = [
    { value: '500+', label: t('stats.vehicles_sold'), icon: <Car className="w-5 h-5" /> },
    { value: '98%', label: t('stats.satisfaction'), icon: <Star className="w-5 h-5" /> },
    { value: '24/7', label: t('stats.support'), icon: <Clock className="w-5 h-5" /> },
    { value: '15+', label: t('stats.years'), icon: <Award className="w-5 h-5" /> },
  ];

  const services = [
    { title: t('services.sales_title'), desc: t('services.sales_desc'), icon: <Car className="w-6 h-6" />, link: '/catalog' },
    { title: t('services.rentals_title'), desc: t('services.rentals_desc'), icon: <Zap className="w-6 h-6" />, link: '/catalog' },
    { title: t('services.workshop_title'), desc: t('services.workshop_desc'), icon: <Wrench className="w-6 h-6" />, link: '/workshop/book' },
    { title: t('services.parts_title'), desc: t('services.parts_desc'), icon: <ShoppingBag className="w-6 h-6" />, link: '/store' },
  ];

  return (
    <div className="min-h-screen">
      
      {/*  ═══════════════════════════  HERO SECTION  ═══════════════════════════  */}
      <section className="relative h-screen w-full flex items-center overflow-hidden">
        {/* Background Layers */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=2000" 
            alt="Luxury Car" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-premium-900 via-premium-900/80 to-premium-900/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-premium-900 via-transparent to-premium-900/30"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <span className="inline-block text-gold-500 text-xs font-bold uppercase tracking-[0.3em] mb-6 border border-gold-500/30 px-4 py-1.5 rounded-full bg-gold-500/5">
              {t('hero.badge')}
            </span>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6">
              {t('hero.title_1')} <br />
              <span className="luxury-gradient-text">{t('hero.title_2')}</span>
            </h1>
            <p className="text-silver-300 text-lg sm:text-xl leading-relaxed mb-10 max-w-lg">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/catalog" className="luxury-button px-8 py-4 text-sm font-bold tracking-wide flex items-center justify-center gap-2 group">
                {t('hero.cta_showroom')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </Link>
              <Link to="/register" className="border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-lg text-sm font-medium transition-all hover:bg-white/5 flex items-center justify-center gap-2">
                {t('hero.cta_register')}
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-silver-500 text-[10px] uppercase tracking-widest font-bold">{t('hero.scroll')}</span>
          <div className="w-px h-8 bg-gradient-to-b from-gold-500 to-transparent"></div>
        </div>
      </section>

      {/*  ═══════════════════════════  STATS BAR  ═══════════════════════════  */}
      <section className="relative z-20 -mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="glass-panel p-6 rounded-2xl text-center border-t border-t-gold-500/20 hover:border-t-gold-500 transition-all duration-300 group">
                <div className="text-gold-500 flex justify-center mb-3 group-hover:scale-110 transition-transform">{stat.icon}</div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-silver-400 text-xs uppercase tracking-wider font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* What Suits You - Recommendations */}
      <WhatSuitsYou />

      {/*  ═══════════════════════════  SERVICES GRID  ═══════════════════════════  */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16 px-4">
            <span className="text-gold-500 text-xs font-bold uppercase tracking-[0.3em]">{t('services.heading_sub')}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-4">{t('services.heading')}</h2>
            <p className="text-silver-400 max-w-2xl mx-auto text-sm md:text-base">{t('services.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, idx) => (
              <Link key={idx} to={service.link} className="glass-panel p-8 rounded-2xl group hover:border-gold-500/30 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500 mb-6 group-hover:bg-gold-500 group-hover:text-premium-900 transition-all duration-300">
                    {service.icon}
                  </div>
                  <h3 className="text-white font-bold text-lg mb-3">{service.title}</h3>
                  <p className="text-silver-400 text-sm leading-relaxed mb-6">{service.desc}</p>
                  <span className="text-gold-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all">
                    {t('services.learn_more')} <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/*  ═══════════════════════════  FEATURED VEHICLES  ═══════════════════════════  */}
      <section className="py-16 md:py-24 bg-premium-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-12 gap-4 px-4 sm:px-0">
            <div>
              <span className="text-gold-500 text-xs font-bold uppercase tracking-[0.3em]">{t('featured.heading_sub')}</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">{t('featured.heading')}</h2>
            </div>
            <Link to="/catalog" className="text-gold-500 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all self-start md:self-auto">
              {t('featured.view_all')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingCars ? (
              // Skeleton loading state
              Array(4).fill(0).map((_, idx) => (
                <div key={idx} className="animate-pulse">
                  <div className="aspect-[4/3] rounded-2xl bg-white/5 mb-4"></div>
                  <div className="h-4 bg-white/5 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-white/5 rounded w-1/2"></div>
                </div>
              ))
            ) : featuredCars.length > 0 ? (
              featuredCars.map((car) => (
                <Link key={car.id} to={`/cars/${car.id}`} className="group cursor-pointer">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-premium-800 border border-white/5 group-hover:border-gold-500/30 transition-all">
                    <img 
                      src={car.image} 
                      alt={car.name}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute top-3 start-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${car.type === 'Rent' ? 'bg-blue-500/80 text-white' : 'bg-gold-500/90 text-premium-900'}`}>
                        {car.tag}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-premium-900/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 start-4 end-4">
                      <h3 className="text-white font-bold text-lg leading-tight">{car.name}</h3>
                      <p className="text-gold-400 font-bold mt-1">{car.price}</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-silver-500 italic">
                {t('catalog.no_vehicles')}
              </div>
            )}
          </div>
        </div>
      </section>

      {/*  ═══════════════════════════  ABOUT US  ═══════════════════════════  */}
      <section id="about" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Image Side */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-white/5">
                <img 
                  src="/assets/images/about_us.png" 
                  alt="Our Showroom" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating Stats Card */}
              <div className="absolute -bottom-8 -end-4 lg:-end-8 glass-panel p-6 rounded-2xl shadow-2xl border-t-2 border-t-gold-500 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold-500 flex items-center justify-center">
                    <Users className="w-6 h-6 text-premium-900" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">2,400+</p>
                    <p className="text-silver-400 text-xs uppercase tracking-wider font-bold">{t('about.happy_clients')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Side */}
            <div>
              <span className="text-gold-500 text-xs font-bold uppercase tracking-[0.3em]">{t('about.heading_sub')}</span>
              <h2 className="text-4xl font-bold text-white mt-3 mb-6">{t('about.heading')}</h2>
              <p className="text-silver-300 text-lg leading-relaxed mb-6">
                {t('about.p1')}
              </p>
              <p className="text-silver-400 leading-relaxed mb-8">
                {t('about.p2')}
              </p>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gold-500" />
                  <span className="text-white text-sm font-medium">{t('about.certified')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-gold-500" />
                  <span className="text-white text-sm font-medium">{t('about.award')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gold-500" />
                  <span className="text-white text-sm font-medium">{t('about.support_24')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*  ═══════════════════════════  CONTACT US  ═══════════════════════════  */}
      <section id="contact" className="py-16 md:py-24 bg-premium-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16 px-4">
            <span className="text-gold-500 text-xs font-bold uppercase tracking-[0.3em]">{t('contact.heading_sub')}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-4">{t('contact.heading')}</h2>
            <p className="text-silver-400 max-w-2xl mx-auto text-sm md:text-base">{t('contact.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Contact Info Cards */}
            <div className="lg:col-span-2 space-y-4">
              <div className="glass-panel p-6 rounded-2xl flex items-start gap-4 hover:border-gold-500/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500 flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm mb-1">{t('contact.visit_title')}</h4>
                  <p className="text-silver-400 text-sm" style={{whiteSpace:'pre-line'}}>{t('contact.visit_address')}</p>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-2xl flex items-start gap-4 hover:border-gold-500/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500 flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm mb-1">{t('contact.call_title')}</h4>
                  <p className="text-silver-400 text-sm">{t('contact.call_number')}<br />{t('contact.call_available')}</p>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-2xl flex items-start gap-4 hover:border-gold-500/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500 flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm mb-1">{t('contact.hours_title')}</h4>
                  <p className="text-silver-400 text-sm">{t('contact.hours_weekday')}<br />{t('contact.hours_weekend')}</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3 glass-panel p-8 rounded-2xl flex flex-col justify-center">
              {!localStorage.getItem('user_access_token') ? (
                <div className="text-center py-12 px-6">
                  <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-gold-500/20">
                    <Shield className="w-10 h-10 text-gold-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{t('contact.form_title')}</h3>
                  <p className="text-silver-400 mb-8 max-w-sm mx-auto leading-relaxed">
                    {t('contact.login_required_msg')}
                  </p>
                  <Link 
                    to="/login" 
                    className="luxury-button px-10 py-4 text-sm font-bold tracking-widest uppercase inline-flex items-center gap-2 group"
                  >
                    {t('contact.login_cta')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ) : (
                <>
                  <h3 className="text-white font-bold text-lg mb-6">{t('contact.form_title')}</h3>
                  <form 
                    className="space-y-5" 
                    onSubmit={async (e) => { 
                      e.preventDefault(); 
                      const btn = e.currentTarget.querySelector('button[type="submit"]');
                      const originalText = btn.innerHTML;
                      btn.disabled = true;
                      btn.innerHTML = `<div class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> ${t('contact.sending') || 'Sending...'}`;
                      
                      const formData = new FormData(e.currentTarget);
                      const data = {
                        subject: formData.get('subject'),
                        message: formData.get('message')
                      };

                      try {
                        await api.post('/interactions/messages/', data);
                        alert(t('contact.success_msg') || 'Message sent! Our concierge team will contact you shortly.');
                        e.target.reset();
                      } catch (err) {
                        console.error("Message failed", err);
                        alert(t('contact.error_msg') || "Failed to send message. Please try again.");
                      } finally {
                        btn.disabled = false;
                        btn.innerHTML = originalText;
                      }
                    }}
                  >
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-silver-400 mb-2 font-bold">{t('contact.subject')}</label>
                      <div className="relative">
                        <select name="subject" className="luxury-input py-3 w-full text-sm appearance-none cursor-pointer">
                          <option value={t('contact.subject_options.vehicle')}>{t('contact.subject_options.vehicle')}</option>
                          <option value={t('contact.subject_options.test_drive')}>{t('contact.subject_options.test_drive')}</option>
                          <option value={t('contact.subject_options.rental')}>{t('contact.subject_options.rental')}</option>
                          <option value={t('contact.subject_options.workshop')}>{t('contact.subject_options.workshop')}</option>
                          <option value={t('contact.subject_options.general')}>{t('contact.subject_options.general')}</option>
                        </select>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500 rotate-90 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-silver-400 mb-2 font-bold">{t('contact.message')}</label>
                      <textarea name="message" rows={5} className="luxury-input py-4 w-full text-sm resize-none" placeholder="..." required></textarea>
                    </div>
                    <button type="submit" className="luxury-button py-4 px-10 font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 group">
                      {t('contact.send')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
