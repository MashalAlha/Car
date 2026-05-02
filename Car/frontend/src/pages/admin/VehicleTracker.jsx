import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Navigation, 
  Power, 
  Map as MapIcon, 
  AlertTriangle, 
  Shield, 
  ChevronLeft,
  Activity,
  Compass
} from 'lucide-react';

import api from '../../utils/api';
const SHOWROOM_LAT = 25.1972;
const SHOWROOM_LNG = 55.2744;

export default function VehicleTracker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simLocation, setSimLocation] = useState({ lat: SHOWROOM_LAT, lng: SHOWROOM_LNG });
  const [distance, setDistance] = useState(0);
  const [alert, setAlert] = useState(null);

  const fetchTelematics = useCallback(async () => {
    try {
      const res = await api.get(`/cars/rentals/${id}/telematics/`);
      const data = res.data;
      setRental(data);
      if (data.last_lat && data.last_lng) {
        setSimLocation({ lat: data.last_lat, lng: data.last_lng });
      }
    } catch (err) {
      console.error("Failed to fetch telematics", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const updateTelematics = async (updates) => {
    try {
      const res = await api.patch(`/cars/rentals/${id}/telematics/`, updates);
      setRental(prev => ({ ...prev, ...res.data }));
    } catch (err) {
      console.error("Failed to update telematics", err);
    }
  };

  useEffect(() => {
    fetchTelematics();
  }, [fetchTelematics]);

  // SIMULATION ENGINE: Movement path
  useEffect(() => {
    if (!rental || !rental.engine_status) return;

    const interval = setInterval(() => {
      setSimLocation(prev => {
        // Random "driving" movement (approx 50-100m per tick)
        const jitterLat = (Math.random() - 0.45) * 0.005; 
        const jitterLng = (Math.random() - 0.45) * 0.005;
        return { 
          lat: prev.lat + jitterLat, 
          lng: prev.lng + jitterLng 
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [rental?.engine_status]);

  // LOGIC: Calculate distance and handle geofence
  useEffect(() => {
    // Simple Euclidean distance for mock (multiply by ~111 to get approx km)
    const latDiff = simLocation.lat - SHOWROOM_LAT;
    const lngDiff = simLocation.lng - SHOWROOM_LNG;
    const d = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111;
    setDistance(parseFloat(d.toFixed(2)));

    // CHECK GEOFENCE
    if (rental && rental.engine_status && d > rental.geofence_radius) {
      setAlert(t('admin.rental_dispatch.engine_cut_alert'));
      updateTelematics({ engine_status: false, last_lat: simLocation.lat, last_lng: simLocation.lng });
    }
  }, [simLocation, rental?.geofence_radius, rental?.engine_status, t]);

  if (loading) return <div className="p-20 text-center text-silver-500 animate-pulse">Initializing Neural Uplink...</div>;
  if (!rental) return <div className="p-20 text-center text-red-500">Telemetry connection lost.</div>;

  return (
    <div className="min-h-screen p-4 lg:p-8 text-white font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <button 
            onClick={() => navigate('/admin/rentals')}
            className="flex items-center gap-2 text-silver-500 hover:text-white transition-colors mb-2 text-sm uppercase tracking-widest font-bold"
          >
            <ChevronLeft className="w-4 h-4" /> {t('admin.common.back')}
          </button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="text-gold-500 w-8 h-8" /> {t('admin.rental_dispatch.telemetry')}
          </h1>
          <p className="text-silver-400">{rental.car?.year} {rental.car?.make} {rental.car?.model} — {rental.user?.email}</p>
        </div>

        <div className={`px-4 py-2 rounded-lg border flex items-center gap-3 ${
          rental.engine_status ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          <Power className="w-5 h-5" />
          <span className="font-black uppercase tracking-widest text-sm">
            {rental.engine_status ? t('admin.rental_dispatch.engine_on') : t('admin.rental_dispatch.engine_off')}
          </span>
        </div>
      </div>

      {/* ALERT BANNER */}
      {alert && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl flex items-center gap-4 animate-bounce">
          <AlertTriangle className="w-6 h-6" />
          <p className="font-bold uppercase text-sm tracking-wider">{alert}</p>
          <button onClick={() => setAlert(null)} className="ms-auto">×</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: MAP SIMULATION */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel rounded-3xl border border-premium-border/50 relative overflow-hidden aspect-video bg-premium-900/50">
            {/* GRID OVERLAY */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            
            {/* VIRTUAL MAP UI */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Showroom Marker */}
              <div className="absolute flex flex-col items-center">
                <div className="w-4 h-4 bg-gold-500 rounded-full animate-ping absolute" />
                <div className="w-4 h-4 bg-gold-500 rounded-full border-2 border-white relative" />
                <span className="text-[10px] font-black uppercase tracking-tighter mt-1 bg-premium-900 px-1">Showroom</span>
              </div>

              {/* Vehicle Marker */}
              <div 
                className="absolute transition-all duration-3000 ease-linear flex flex-col items-center"
                style={{ 
                  transform: `translate(${(simLocation.lng - SHOWROOM_LNG) * 500}px, ${(SHOWROOM_LAT - simLocation.lat) * 500}px)` 
                }}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 ${
                  rental.engine_status ? 'bg-blue-600 border-white shadow-[0_0_20px_rgba(37,99,235,0.8)]' : 'bg-silver-700 border-silver-500 shadow-none grayscale'
                }`}>
                  <Navigation className={`w-5 h-5 text-white ${rental.engine_status ? 'animate-pulse' : ''}`} />
                </div>
                <div className="h-10 w-[1px] bg-white/20 mt-1" />
                <div className="bg-premium-900/90 border border-white/10 px-2 py-1 rounded text-[10px] whitespace-nowrap">
                  <span className="font-bold text-blue-400">LAT:</span> {simLocation.lat.toFixed(4)} <br/>
                  <span className="font-bold text-blue-400">LNG:</span> {simLocation.lng.toFixed(4)}
                </div>
              </div>

              {/* Geofence Visualization */}
              <div 
                className="absolute border-2 border-dashed border-silver-500/30 rounded-full pointer-events-none transition-all duration-500"
                style={{ 
                  width: `${rental.geofence_radius * 15}px`, 
                  height: `${rental.geofence_radius * 15}px` 
                }}
              />
            </div>

            {/* MAP OVERLAYS */}
            <div className="absolute bottom-6 left-6 p-4 glass-panel border border-white/5 rounded-2xl hidden md:flex items-center gap-6 scale-75 lg:scale-100 origin-bottom-left">
               <div className="text-center">
                  <p className="text-[10px] text-silver-500 uppercase font-bold tracking-widest mb-1">Elevation</p>
                  <p className="font-mono text-white">42m</p>
               </div>
               <div className="w-[1px] h-8 bg-white/5" />
               <div className="text-center">
                  <p className="text-[10px] text-silver-500 uppercase font-bold tracking-widest mb-1">Compass</p>
                  <Compass className="w-5 h-5 mx-auto text-gold-500" />
               </div>
               <div className="w-[1px] h-8 bg-white/5" />
               <div className="text-center">
                  <p className="text-[10px] text-silver-500 uppercase font-bold tracking-widest mb-1">Coverage</p>
                  <p className="font-mono text-green-400">EXCELLENT</p>
               </div>
            </div>

            <div className="absolute top-6 right-6 p-3 glass-panel border border-white/5 rounded-xl bg-premium-900/80">
                <MapIcon className="w-6 h-6 text-silver-400 cursor-pointer hover:text-white transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-premium-border/50">
               <p className="text-xs text-silver-500 uppercase tracking-widest font-extrabold mb-2">{t('admin.rental_dispatch.distance_from_origin')}</p>
               <h3 className="text-3xl font-mono flex items-baseline gap-2">
                 {distance} <span className="text-sm text-silver-500 uppercase">KM</span>
               </h3>
               <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
                 <div className="bg-gold-500 h-full transition-all duration-1000" style={{ width: `${Math.min(100, (distance / rental.geofence_radius) * 100)}%` }} />
               </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-premium-border/50">
               <p className="text-xs text-silver-500 uppercase tracking-widest font-extrabold mb-2">Simulated Speed</p>
               <h3 className="text-3xl font-mono flex items-baseline gap-2">
                 {rental.engine_status ? Math.floor(Math.random() * 40) + 60 : 0} <span className="text-sm text-silver-500 uppercase">KM/H</span>
               </h3>
               <p className="text-[10px] text-green-400 mt-2 flex items-center gap-1"><Activity className="w-3 h-3"/> {rental.engine_status ? 'LIVE FEED ACTIVE' : 'ENGINE COLD'}</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-premium-border/50">
               <p className="text-xs text-silver-500 uppercase tracking-widest font-extrabold mb-2">Battery Levels</p>
               <h3 className="text-3xl font-mono text-gold-500">92%</h3>
               <div className="flex gap-1 mt-4">
                  {[1,2,3,4,5,6,7,8].map(i => <div key={i} className={`h-2 flex-1 rounded ${i < 7 ? 'bg-gold-500' : 'bg-white/10'}`} />)}
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CONTROLS */}
        <div className="space-y-8">
          <div className="glass-panel p-8 rounded-3xl border border-premium-border/50">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Power className="text-gold-500 w-5 h-5" /> {t('admin.rental_dispatch.engine_status')}
            </h3>
            
            <button 
              onClick={() => updateTelematics({ engine_status: !rental.engine_status })}
              className={`w-full py-6 rounded-2xl border-4 flex flex-col items-center justify-center gap-4 transition-all duration-500 group ${
                rental.engine_status 
                ? 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20' 
                : 'bg-green-500/10 border-green-500/30 text-green-500 hover:bg-green-500/20'
              }`}
            >
              <div className={`p-4 rounded-full border-2 transition-transform duration-500 group-hover:scale-110 ${
                rental.engine_status ? 'border-red-500 bg-red-500 text-white' : 'border-green-500 bg-green-500 text-white'
              }`}>
                <Power className="w-10 h-10" />
              </div>
              <span className="font-black text-xl tracking-tighter uppercase">
                {rental.engine_status ? t('admin.rental_dispatch.kill_engine') : t('admin.rental_dispatch.restore_engine')}
              </span>
            </button>

            <p className="text-silver-500 text-center mt-6 text-xs italic">
              {rental.engine_status ? 'Vehicle is currently operational.' : 'Vehicle immobilized manually or via geofence.'}
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-premium-border/50">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Shield className="text-gold-500 w-5 h-5" /> {t('admin.rental_dispatch.geofence_range')}
            </h3>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-silver-400 text-sm font-bold uppercase tracking-widest">Radius</span>
                <span className="text-gold-400 font-mono text-xl">{rental.geofence_radius} KM</span>
              </div>
              
              <input 
                type="range" 
                min="10" 
                max="500" 
                step="5"
                value={rental.geofence_radius}
                onChange={(e) => updateTelematics({ geofence_radius: parseFloat(e.target.value) })}
                className="w-full accent-gold-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />

              <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex gap-3 items-start">
                 <AlertTriangle className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
                 <p className="text-xs text-silver-400 leading-relaxed">
                   {t('admin.rental_dispatch.geofence_info', { radius: rental.geofence_radius })}
                 </p>
              </div>

              <div className="flex items-center gap-3 py-2">
                 <div className="w-10 h-5 bg-gold-500 rounded-full relative">
                    <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full" />
                 </div>
                 <span className="text-xs uppercase font-bold tracking-widest text-silver-300">
                    {t('admin.rental_dispatch.auto_disable_active')}
                 </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
