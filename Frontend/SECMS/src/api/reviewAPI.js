import api from '../api/axiosConfig';

export const reviewAPI = {
    // Customer endpoints
    getRecentOrdersForReview: async () => {
        const response = await api.get('/reviews/recent-orders');
        return response.data;
    },

    getMyReviews: async () => {
        const response = await api.get('/reviews/my-reviews');
        return response.data;
    },

    createReview: async (reviewData) => {
        const response = await api.post('/reviews', reviewData);
        return response.data;
    },

    updateReview: async (reviewId, reviewData) => {
        const response = await api.put(`/reviews/${reviewId}`, reviewData);
        return response.data;
    },

    deleteReview: async (reviewId) => {
        const response = await api.delete(`/reviews/${reviewId}`);
        return response.data;
    },

    // Public endpoints
    getProductReviews: async (productId) => {
        const response = await api.get(`/reviews/product/${productId}`);
        return response.data;
    },

    getProductAverageRating: async (productId) => {
        const response = await api.get(`/reviews/product/${productId}/average`);
        return response.data;
    },

    getProductReviewCount: async (productId) => {
        const response = await api.get(`/reviews/product/${productId}/count`);
        return response.data;
    },

    // Admin endpoints
    getAllReviews: async () => {
        const response = await api.get('/reviews/all');
        return response.data;
    },

    deleteReviewAsAdmin: async (reviewId) => {
        const response = await api.delete(`/reviews/${reviewId}`);
        return response.data;
    },

    // Supplier endpoints
    getSellerReviews: async (sellerId) => {
        const response = await api.get(`/reviews/seller/${sellerId}`);
        return response.data;
    },

    getSellerAverageRating: async (sellerId) => {
        const response = await api.get(`/reviews/seller/${sellerId}/average`);
        return response.data;
    }
};

export default reviewAPI;
