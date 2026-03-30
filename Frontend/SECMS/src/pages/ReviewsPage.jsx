import React, { useState, useEffect } from 'react';
import { Plus, X, Star, Sparkles, MessageSquare, Filter, Send } from 'lucide-react';
import { reviewService, productService } from '../services/reviewService';
import { getAuthToken, getCurrentUser } from '../services/api';
import ReviewCard from '../components/ReviewCard';
import { ReviewCardSkeleton } from '../components/Skeleton';

function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');
  const [editingReview, setEditingReview] = useState(null);
  
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === 'ADMIN';
  const isAuthenticated = !!getAuthToken();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      fetchReviews();
    } else {
      setLoading(false);
    }
  }, [products]);

  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const allReviews = [];
      for (const product of products) {
        try {
          const data = await reviewService.getReviewsByProduct(product.id);
          allReviews.push(...data);
        } catch (e) {
          // Continue fetching other products
        }
      }
      setReviews(allReviews);
    } catch (err) {
      setError(err.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const allReviews = [];
      if (products.length > 0) {
        for (const product of products) {
          try {
            const data = await reviewService.getReviewsByProduct(product.id);
            allReviews.push(...data);
          } catch (e) {
            // Continue
          }
        }
      }
      setReviews(allReviews);
    } catch (err) {
      setError(err.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await productService.getActiveProducts();
      if (data && data.length > 0) {
        setProducts(data);
        setSelectedProduct(data[0].id.toString());
      } else {
        setProducts(DEMO_PRODUCTS);
        setSelectedProduct(DEMO_PRODUCTS[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts(DEMO_PRODUCTS);
      setSelectedProduct(DEMO_PRODUCTS[0].id.toString());
    } finally {
      setLoadingProducts(false);
    }
  };

  const DEMO_PRODUCTS = [
    { id: 1, name: 'ULTRABOOST 22', price: '189.99' },
    { id: 2, name: 'NMD_R1', price: '149.99' },
    { id: 3, name: 'STAN SMITH', price: '109.99' },
    { id: 4, name: 'SUPERNOVA', price: '129.99' },
    { id: 5, name: 'FORUM LOW', price: '119.99' },
    { id: 6, name: 'GAZELLE', price: '99.99' },
  ];

  useEffect(() => {
    if (products.length > 0) {
      fetchReviews();
    }
  }, [products]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !comment.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      const reviewData = {
        productId: parseInt(selectedProduct),
        rating,
        comment,
      };

      if (editingReview) {
        await reviewService.updateReview(editingReview.id, reviewData);
      } else {
        await reviewService.createReview(reviewData);
      }

      setShowForm(false);
      setEditingReview(null);
      setSelectedProduct(products[0]?.id?.toString() || '');
      setRating(5);
      setComment('');
      fetchReviews();
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setSelectedProduct(review.productId.toString());
    setRating(review.rating);
    setComment(review.comment);
    setShowForm(true);
  };

  const handleDelete = async (reviewId) => {
    try {
      await reviewService.deleteReview(reviewId);
      fetchReviews();
    } catch (err) {
      setError(err.message || 'Failed to delete review');
    }
  };

  const handleFlag = async (reviewId, reason) => {
    try {
      await reviewService.flagReview(reviewId, reason);
      fetchReviews();
    } catch (err) {
      setError(err.message || 'Failed to flag review');
    }
  };

  const handleApprove = async (reviewId) => {
    try {
      await reviewService.approveReview(reviewId);
      fetchReviews();
    } catch (err) {
      setError(err.message || 'Failed to approve review');
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      await reviewService.markReviewHelpful(reviewId);
      fetchReviews();
    } catch (err) {
      // Silently fail
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !review.approved;
    if (filter === 'flagged') return review.flagged;
    return true;
  });

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-black text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="animate-fade-in-up">
              <h1 className="font-heading text-5xl md:text-6xl tracking-widest mb-4">CUSTOMER REVIEWS</h1>
              <p className="text-gray-400 text-lg font-medium tracking-wide">Real Experiences From Real Customers</p>
            </div>
            
            <div className="flex items-center gap-8 animate-fade-in-up stagger-1">
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center mb-1">
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  <span className="text-4xl font-bold">{averageRating}</span>
                </div>
                <p className="text-gray-400 text-xs uppercase tracking-widest">Avg Rating</p>
              </div>
              <div className="w-px h-12 bg-gray-700"></div>
              <div className="text-center">
                <div className="text-4xl font-bold">{reviews.length}</div>
                <p className="text-gray-400 text-xs uppercase tracking-widest">Reviews</p>
              </div>
              <div className="w-px h-12 bg-gray-700"></div>
              <div className="text-center">
                <div className="text-4xl font-bold">{products.length}</div>
                <p className="text-gray-400 text-xs uppercase tracking-widest">Products</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'flagged'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                  filter === f 
                    ? 'bg-black text-white shadow-lg transform -translate-y-0.5' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'All Reviews' : f === 'pending' ? 'Pending' : 'Flagged'}
              </button>
            ))}
          </div>
          
          {isAuthenticated && (
            <button
              onClick={() => {
                setEditingReview(null);
                setSelectedProduct(products[0]?.id?.toString() || '');
                setRating(5);
                setComment('');
                setShowForm(!showForm);
              }}
              className="flex items-center gap-3 bg-black text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-gray-900 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {showForm ? 'Cancel' : 'Write Review'}
            </button>
          )}
        </div>

        {showForm && (
          <div className="mb-10 bg-gradient-to-br from-gray-50 to-white border-0 p-8 shadow-2xl animate-fade-in-up" style={{ borderRadius: '24px' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-heading text-2xl tracking-wider">
                {editingReview ? 'EDIT YOUR REVIEW' : 'SHARE YOUR EXPERIENCE'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    Select Product
                  </label>
                  {loadingProducts ? (
                    <div className="h-14 bg-gray-200 animate-pulse rounded-lg"></div>
                  ) : products.length === 0 ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm">
                      No products available. Please try again later.
                    </div>
                  ) : (
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full px-5 py-4 border-2 border-gray-100 focus:border-black focus:outline-none bg-white text-lg"
                      required
                    >
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - ${product.price}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    Your Rating
                  </label>
                  <div className="flex gap-2 items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transform transition-transform duration-200 hover:scale-110 p-1"
                      >
                        <Star
                          className={`w-10 h-10 transition-colors duration-200 ${
                            star <= rating ? 'fill-black text-black' : 'fill-gray-200 text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-3 text-lg font-bold text-gray-700">{rating}/5</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  Your Review
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-5 py-4 border-2 border-gray-100 focus:border-black focus:outline-none resize-none text-lg bg-white"
                  placeholder="Tell us about your experience with this product..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting || products.length === 0}
                className="bg-black text-white px-10 py-4 font-bold uppercase tracking-widest hover:bg-gray-900 transition-all duration-300 disabled:opacity-50 flex items-center gap-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>{editingReview ? 'Update Review' : 'Submit Review'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {error && (
          <div className="mb-6 p-5 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ReviewCardSkeleton />
            <ReviewCardSkeleton />
            <ReviewCardSkeleton />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <MessageSquare className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="font-heading text-2xl mb-3 tracking-wider">NO REVIEWS YET</h3>
            <p className="text-gray-500 text-lg">Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredReviews.map((review, index) => (
              <div 
                key={review.id} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <ReviewCard
                  review={review}
                  currentUserId={currentUser?.id}
                  isAdmin={isAdmin}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onFlag={handleFlag}
                  onApprove={handleApprove}
                  onMarkHelpful={handleMarkHelpful}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewsPage;
