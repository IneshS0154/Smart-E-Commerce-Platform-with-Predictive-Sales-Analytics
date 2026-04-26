import api from '../api/axiosConfig';

export const sellerAPI = {
    getAllSellers: async () => {
        const response = await api.get('/sellers/all');
        return response.data;
    },

    registerSeller: async (data) => {
        const response = await api.post('/sellers/register', data);
        return response.data;
    },

    updateSeller: async (id, data) => {
        const response = await api.put(`/sellers/${id}/update`, data);
        return response.data;
    },

    approveSeller: async (id) => {
        const response = await api.put(`/sellers/${id}/approve`);
        return response.data;
    },

    rejectSeller: async (id) => {
        const response = await api.put(`/sellers/${id}/reject`);
        return response.data;
    },

    deactivateSeller: async (id) => {
        const response = await api.put(`/sellers/${id}/deactivate`);
        return response.data;
    },

    activateSeller: async (id) => {
        const response = await api.put(`/sellers/${id}/activate`);
        return response.data;
    },

    deleteSeller: async (id) => {
        const response = await api.delete(`/sellers/${id}/delete`);
        return response.data;
    },
};

export default sellerAPI;
