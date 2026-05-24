import { authAPI } from '../api/axiosConfig';

export const authService = {
    register: async (data) => {
        const response = await authAPI.post('/register', data);
        return response.data;
    },

    login: async (data) => {
        const response = await authAPI.post('/login', data);
        return response.data;
    },

    logout: async () => {
        const response = await authAPI.post('/logout');
        return response.data;
    },
};

export default authService;
