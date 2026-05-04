import React, { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';

export default function ReviewSection({ itemId, itemType }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  const isLoggedIn = !!localStorage.getItem('user_access_token');

  const fetchReviews = useCallback(async () => {
    setIsFetching(true);
    try {
      const res = await api.get(`/interactions/reviews/?model=${itemType}&object_id=${itemId}`);
      setReviews(res.data || []);
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setIsFetching(false);
    }
  }, [itemId, itemType]);

  useEffect(() => {
    if (itemId && itemType) {
      fetchReviews();
    }
  }, [fetchReviews, itemId, itemType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(rating === 0) return;
    
    setLoading(true);
    setError(null);
    try {
      await api.post('/interactions/reviews/', {
        content_type_model: itemType,
        object_id: itemId,
        rating: rating,
        comment: comment
      });
      setSubmitted(true);
      fetchReviews(); // Refresh the list
    } catch (err) {
      console.error("Failed to submit review", err);
      setError(t('reviews.error_submit'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="py-8">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-6 h-6 text-gold-500" />
        <h2 className="text-2xl font-bold text-white">{t('reviews.title')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Submit Review Column */}
        <div className="md:col-span-1 glass-panel p-6 rounded-2xl h-fit border border-premium-border/50">
          <h3 className="text-lg font-semibold text-white mb-4">{t('reviews.leave_review')}</h3>
          
          {!isLoggedIn ? (
            <div className="text-center py-6">
              <p className="text-silver-400 text-sm mb-4">{t('reviews.login_required')}</p>
            </div>
          ) : submitted ? (
            <div className="text-center py-8 animate-fade-in">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-white font-bold">{t('reviews.success_title')}</p>
              <p className="text-silver-400 text-sm mt-2">{t('reviews.success_desc')}</p>
              <button 
                onClick={() => { setSubmitted(false); setRating(0); setComment(''); }}
                className="mt-4 text-xs text-gold-500 hover:text-gold-400 transition-colors"
              >
                {t('reviews.submit_another')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <div>
                <label className="block text-xs uppercase tracking-wider text-silver-400 mb-2 font-bold">{t('reviews.rating_label')}</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-6 h-6 ${(hoverRating || rating) >= star ? 'fill-gold-500 text-gold-500' : 'text-silver-600'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-wider text-silver-400 mb-2 font-bold">{t('reviews.feedback_label')}</label>
                <textarea 
                  rows={4}
                  className="luxury-input w-full text-sm resize-none"
                  placeholder={t('reviews.feedback_placeholder')}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                disabled={rating === 0 || loading}
                className="luxury-button py-3 w-full disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  t('reviews.submit_btn')
                )}
              </button>
            </form>
          )}
        </div>

        {/* Existing Reviews List */}
        <div className="md:col-span-2 space-y-4">
          {isFetching ? (
            <div className="text-center py-10 text-silver-500 animate-pulse">{t('reviews.loading')}</div>
          ) : reviews.length === 0 ? (
            <div className="bg-premium-800/50 p-10 rounded-xl border border-white/5 text-center">
              <Star className="w-8 h-8 text-silver-600 mx-auto mb-3 opacity-50" />
              <p className="text-silver-400">{t('reviews.no_reviews')}</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-premium-800 p-6 rounded-xl border border-white/5 relative overflow-hidden group animate-fade-in">
                <div className="absolute top-0 left-0 w-1 h-full bg-gold-500/50 group-hover:bg-gold-500 transition-colors"></div>
                
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-premium-900 border border-white/10 flex items-center justify-center text-xs font-bold text-silver-300 uppercase">
                      {(review.username || '?').substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm">{review.username}</h4>
                      <span className="text-xs text-silver-500">{formatDate(review.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-gold-500 text-gold-500' : 'text-silver-600'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-silver-300 text-sm leading-relaxed ml-11">
                  "{review.comment}"
                </p>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
