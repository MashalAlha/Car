import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Clock, CheckCircle, XCircle, FileText, Calendar, Link as LinkIcon, Plus, AlertTriangle } from 'lucide-react';

import api from '../../utils/api';

export default function TrustRequests() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    license_number: '',
    expiry_date: '',
    license_photo: null
  });
  const [isVerified, setIsVerified] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/users/trust-requests/');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile/');
      const data = res.data;
      setIsVerified(data.is_verified);
      localStorage.setItem('user_data', JSON.stringify(data));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchRequests();
  }, []);

  const hasProcessing = requests.some(r => r.status === 'Processing');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const data = new FormData();
      data.append('license_number', formData.license_number);
      data.append('expiry_date', formData.expiry_date);
      if (formData.license_photo) {
        data.append('license_photo', formData.license_photo);
      }

      const res = await api.post('/users/trust-requests/', data);

      if (res.status === 200 || res.status === 201) {
        setMessage({ type: 'success', text: t('trust.success_submit') });
        setFormData({ license_number: '', expiry_date: '', license_photo: null });
        setShowForm(false);
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
      const errorData = err.response?.data;
      let errorMsg = t('trust.error_submit');
      if (errorData?.detail) {
        errorMsg = errorData.detail;
      } else if (errorData && typeof errorData === 'object') {
        const firstKey = Object.keys(errorData)[0];
        if (Array.isArray(errorData[firstKey])) {
          errorMsg = `${firstKey}: ${errorData[firstKey][0]}`;
        }
      }
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Processing': return <Clock className="w-5 h-5 text-gold-500" />;
      case 'Approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return 'bg-gold-500/10 text-gold-500 border-gold-500/20';
      case 'Approved': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-10 px-4 sm:px-0">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3 uppercase tracking-tighter leading-none">
              <Shield className="text-gold-500 w-8 h-8" /> {t('trust.title')}
            </h1>
            <p className="text-silver-400 mt-2 text-sm md:text-base font-medium">{t('trust.subtitle')}</p>
          </div>
          {!isVerified && !hasProcessing && !showForm && (
            <button 
              onClick={() => setShowForm(true)}
              className="luxury-button px-8 py-3 flex items-center gap-2 self-start md:self-auto"
            >
              <Plus className="w-5 h-5" /> {t('trust.new_request')}
            </button>
          )}
        </div>

        {message && (
          <div className={`mb-8 p-4 rounded-xl border flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-green-900/20 border-green-500/30 text-green-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span className="font-medium text-sm">{message.text}</span>
          </div>
        )}

        {isVerified && (
          <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-2xl flex flex-col items-center text-center gap-4 mb-10 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
               <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-white">{t('profile.verified')}</h3>
            <p className="text-silver-400 max-w-sm">{t('car_details.trust_required_desc').split('.')[0]}. {t('trust.status_approved')}.</p>
          </div>
        )}

        {showForm && (
          <div className="glass-panel p-8 rounded-2xl border border-premium-border/50 mb-10 animate-slide-up">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-gold-500" /> {t('trust.new_request')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-silver-500 uppercase tracking-widest mb-2">{t('trust.license_number')}</label>
                  <input 
                    required 
                    type="text" 
                    className="luxury-input w-full py-3" 
                    placeholder="e.g. ABC-1234567"
                    value={formData.license_number}
                    onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-silver-500 uppercase tracking-widest mb-2">{t('trust.license_expiry')}</label>
                  <input 
                    required 
                    type="date" 
                    className="luxury-input w-full py-3" 
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-silver-500 uppercase tracking-widest mb-2">{t('trust.license_photo')}</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/5 border-dashed rounded-xl hover:border-gold-500/50 transition-colors">
                  <div className="space-y-1 text-center">
                    <FileText className="mx-auto h-12 w-12 text-silver-500" />
                    <div className="flex text-sm text-silver-400">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-bold text-gold-500 hover:text-gold-400">
                        <span>Upload a file</span>
                        <input 
                          id="file-upload" 
                          name="file-upload" 
                          type="file" 
                          className="sr-only" 
                          accept="image/*"
                          onChange={(e) => setFormData({...formData, license_photo: e.target.files[0]})}
                          required
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-silver-500">PNG, JPG up to 10MB</p>
                    {formData.license_photo && (
                      <p className="text-xs text-gold-400 font-bold mt-2">Selected: {formData.license_photo.name}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 font-bold text-silver-400 hover:text-white transition-colors"
                >
                  {t('admin.inventory.cancel')}
                </button>
                <button 
                  disabled={submitting}
                  type="submit" 
                  className="bg-gold-500 hover:bg-gold-400 text-premium-900 px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-all"
                >
                  {submitting ? t('profile.saving') : t('trust.submit')}
                </button>
              </div>
            </form>
          </div>
        )}

        {hasProcessing && !showForm && (
          <div className="bg-gold-500/10 border border-gold-500/20 p-6 rounded-2xl flex items-start gap-4 mb-10 animate-pulse">
            <Clock className="w-6 h-6 text-gold-500 shrink-0" />
            <div>
              <h4 className="font-bold text-gold-500 mb-1">{t('trust.processing_alert')}</h4>
              <p className="text-silver-400 text-sm leading-relaxed">{t('trust.subtitle')}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-silver-500 uppercase tracking-widest px-1">{t('trust.history')}</h3>
          {loading ? (
            <div className="text-center py-20 animate-pulse text-silver-500">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl border border-premium-border/50 text-center">
              <Shield className="w-12 h-12 text-silver-600 mx-auto mb-4 opacity-50" />
              <p className="text-silver-400">{t('trust.no_requests')}</p>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="glass-panel p-6 rounded-2xl border border-premium-border/50 hover:border-white/10 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-premium-900 border border-white/5 flex items-center justify-center text-silver-500">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white uppercase tracking-wider">{request.license_number}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getStatusColor(request.status)}`}>
                          {t(`trust.status_${request.status.toLowerCase()}`)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-silver-500 font-mono">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {request.expiry_date}</span>
                        <span className="text-silver-600">•</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(request.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {request.rejection_reason && request.status === 'Rejected' && (
                      <div className="text-red-400 text-xs italic bg-red-500/5 px-4 py-2 rounded-lg border border-red-500/10">
                        {t('trust.rejected_reason')} {request.rejection_reason}
                      </div>
                    )}
                    <a 
                      href={request.license_photo} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-silver-400 transition-colors"
                      title="View License"
                    >
                      <LinkIcon className="w-5 h-5" />
                    </a>
                    {getStatusIcon(request.status)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
