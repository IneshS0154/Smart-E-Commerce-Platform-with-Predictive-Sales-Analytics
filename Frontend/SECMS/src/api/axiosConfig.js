import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const adminData = localStorage.getItem('admin');
        if (adminData) {
            try {
                const admin = JSON.parse(adminData);
                if (admin.token) {
                    config.headers.Authorization = `Bearer ${admin.token}`;
                }
            } catch (e) {
                const token = localStorage.getItem('customerToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        } else {
            const token = localStorage.getItem('customerToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const requestUrl = error.config?.url || '';
            const currentPath = window.location.pathname || '';
            const isSellerAuthRequest =
                requestUrl.includes('/sellers/login') ||
                requestUrl.includes('/sellers/register') ||
                requestUrl.includes('/sellers/');

            // For supplier auth we want the component to show inline errors,
            // not redirect the user to the customer login page.
            if (isSellerAuthRequest || currentPath.startsWith('/signin') || currentPath.startsWith('/register')) {
                return Promise.reject(error);
            }

            const adminData = localStorage.getItem('admin');
            if (adminData) {
                localStorage.removeItem('admin');
                window.location.href = '/login';
            } else {
                localStorage.removeItem('customerToken');
                localStorage.removeItem('customer');
                localStorage.removeItem('customerUsername');
                localStorage.removeItem('customerEmail');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const authAPI = axios.create({
    baseURL: `${API_BASE_URL}/auth`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
