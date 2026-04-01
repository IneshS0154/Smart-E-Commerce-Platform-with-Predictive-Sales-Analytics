import api from '../api/axiosConfig';

export const orderAPI = {
    checkout: async (checkoutData) => {
        const response = await api.post('/orders/checkout', checkoutData);
        return response.data;
    },

    getMyOrders: async () => {
        const response = await api.get('/orders/my-orders');
        return response.data;
    },

    getOrder: async (orderId) => {
        const response = await api.get(`/orders/${orderId}`);
        return response.data;
    },

    getOrderItems: async (orderId) => {
        const response = await api.get(`/orders/${orderId}/items`);
        return response.data;
    },

    getAllOrders: async () => {
        const response = await api.get('/orders/all');
        return response.data;
    },

    getSellerOrders: async (sellerId) => {
        const response = await api.get(`/orders/seller/orders?sellerId=${sellerId}`);
        return response.data;
    }
};

export const couponAPI = {
    validate: async (code) => {
        const response = await api.get(`/coupons/validate?code=${encodeURIComponent(code)}`);
        return response.data;
    },

    create: async (couponData) => {
        const response = await api.post('/coupons/seller', couponData);
        return response.data;
    },

    getSellerCoupons: async (sellerId) => {
        const response = await api.get(`/coupons/seller/${sellerId}`);
        return response.data;
    },

    deactivate: async (id) => {
        const response = await api.put(`/coupons/${id}/deactivate`);
        return response.data;
    },

    deleteCoupon: async (id) => {
        const response = await api.delete(`/coupons/${id}`);
        return response.data;
    }
};

export default orderAPI;
