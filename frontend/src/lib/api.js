import axios from 'axios';

const item = import.meta.env.VITE_API_URL;
console.log("API URL being used:", item || 'http://127.0.0.1:8000/api/v1 (Fallback)');

const api = axios.create({
    baseURL: item || 'https://amount-collector-backend-rqrx.onrender.com/api/v1',
});


api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
