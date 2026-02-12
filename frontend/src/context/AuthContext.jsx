import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user'); // Store user details too for quick access
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
            // Fetch fresh data in background
            api.get('/users/me')
                .then(res => {
                    setUser(res.data);
                    localStorage.setItem('user', JSON.stringify(res.data));
                })
                .catch(() => {
                    // Token might be invalid
                });
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            const response = await api.post('/auth/login', formData);
            const { access_token, user_id, role, full_name } = response.data;

            localStorage.setItem('token', access_token);
            const userData = { id: user_id, role, full_name, email };
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            setUser(userData);
            return { success: true, role, user_id, full_name };
        } catch (error) {
            console.error("Login failed", error);
            let errorMessage = "Login failed";
            if (error.response) {
                // Server responded with a status code outside the 2xx range
                errorMessage = error.response.data.detail || "Invalid credentials";
            } else if (error.request) {
                // The request was made but no response was received
                errorMessage = "Network Error: Unable to reach the server. Please check if the backend is running.";
            } else {
                // Something happened in setting up the request
                errorMessage = error.message;
            }
            return { success: false, error: errorMessage };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const res = await api.get('/users/me');
            const userData = res.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return userData;
        } catch (error) {
            console.error("Failed to refresh user", error);
            if (error.response && error.response.status === 401) {
                logout();
            }
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, refreshUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
