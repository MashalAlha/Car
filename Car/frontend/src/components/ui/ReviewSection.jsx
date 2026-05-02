import React, { useState } from 'react';
import { Star, MessageSquare, CheckCircle2 } from 'lucide-react';

export default function ReviewSection({ itemId, itemType }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Mock Reviews based on component type
  const mockReviews = [
    { id: 1, user: "AlexD", rating: 5, date: "2 days ago", comment: "Absolutely incredible experience. Quality is unmatched." },
    { id: 2, user: "MotorEnthusiast99", rating: 4, date: "1 week ago", comment: "Great product, delivery took slightly longer than expected but the installation at the workshop was flawless." },
    { id: 3, user: "VIP_Client_01", rating: 5, date: "3 weeks ago", comment: "Perfect fitment. Worth every penny." }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if(rating === 0) return;
    setSubmitted(true);
    // In production: POST /api/v1/interactions/reviews/
  };

  return (
    <div className="py-8">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-6 h-6 text-gold-500" />
        <h2 className="text-2xl font-bold text-white">Client Testimonials</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Submit Review Column */}
        <div className="md:col-span-1 glass-panel p-6 rounded-2xl h-fit border border-premium-border/50">
          <h3 className="text-lg font-semibold text-white mb-4">Leave a Review</h3>
          
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-white font-bold">Successfully Submitted</p>
              <p className="text-silver-400 text-sm mt-2">Thank you for sharing your experience.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-silver-400 mb-2 font-bold">Your Rating</label>
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
                <label className="block text-xs uppercase tracking-wider text-silver-400 mb-2 font-bold">Feedback</label>
                <textarea 
                  rows={4}
                  className="luxury-input w-full text-sm resize-none"
                  placeholder="Share details of your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                disabled={rating === 0}
                className="luxury-button py-3 w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Review
              </button>
            </form>
          )}
        </div>

        {/* Existing Reviews List */}
        <div className="md:col-span-2 space-y-4">
          {mockReviews.map((review) => (
            <div key={review.id} className="bg-premium-800 p-6 rounded-xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-gold-500/50 group-hover:bg-gold-500 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-premium-900 border border-white/10 flex items-center justify-center text-xs font-bold text-silver-300">
                    {review.user.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">{review.user}</h4>
                    <span className="text-xs text-silver-500">{review.date}</span>
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
          ))}
        </div>

      </div>
    </div>
  );
}
