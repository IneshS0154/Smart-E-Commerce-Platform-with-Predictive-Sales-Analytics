import api from '../api/axiosConfig';

export const customerAPI = {
    getAllCustomers: async () => {
        const response = await api.get('/customers/all');
        return response.data;
    },

    getCustomerById: async (id) => {
        const response = await api.get(`/customers/${id}`);
        return response.data;
    },

    getCurrentCustomer: async (username) => {
        const response = await api.get(`/customers/me?username=${encodeURIComponent(username)}`);
        return response.data;
    },

    updateCustomer: async (id, data) => {
        const response = await api.put(`/customers/${id}/update`, data);
        return response.data;
    },

    changePassword: async (id, data) => {
        const response = await api.put(`/customers/${id}/change-password`, data);
        return response.data;
    },

    deactivateCustomer: async (id) => {
        const response = await api.put(`/customers/${id}/deactivate`);
        return response.data;
    },

    activateCustomer: async (id) => {
        const response = await api.put(`/customers/${id}/activate`);
        return response.data;
    },

    deleteCustomer: async (id) => {
        const response = await api.delete(`/customers/${id}`);
        return response.data;
    },
};

export default customerAPI;
