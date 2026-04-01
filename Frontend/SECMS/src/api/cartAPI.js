import api from '../api/axiosConfig';

export const cartAPI = {
    getCart: async () => {
        const response = await api.get('/cart');
        return response.data;
    },

    addToCart: async (productId, size, quantity = 1) => {
        const response = await api.post('/cart/add', {
            productId,
            size,
            quantity
        });
        return response.data;
    },

    updateCartItem: async (cartItemId, quantity) => {
        const response = await api.put(`/cart/update/${cartItemId}?quantity=${quantity}`);
        return response.data;
    },

    updateCartItemSize: async (cartItemId, size) => {
        const response = await api.put(`/cart/update-size/${cartItemId}?size=${size}`);
        return response.data;
    },

    removeCartItem: async (cartItemId) => {
        const response = await api.delete(`/cart/remove/${cartItemId}`);
        return response.data;
    },

    clearCart: async () => {
        const response = await api.delete('/cart/clear');
        return response.data;
    },

    getCartCount: async () => {
        const response = await api.get('/cart/count');
        return response.data;
    },

    getCartTotal: async () => {
        const response = await api.get('/cart/total');
        return response.data;
    }
};

export default cartAPI;
