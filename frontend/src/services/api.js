import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: '/api',
});

// Add a request interceptor to add the token to requests
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

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error is due to authentication (401)
    if (error.response && error.response.status === 401) {
      // Clear token
      localStorage.removeItem('token');
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Workshop API calls
export const getWorkshops = async (params = {}) => {
  const response = await api.get('/workshops', { params });
  return response.data;
};

export const getWorkshopById = async (id) => {
  const response = await api.get(`/workshops/${id}`);
  return response.data;
};

export const createWorkshop = async (workshopData) => {
  const response = await api.post('/workshops', workshopData);
  return response.data;
};

export const updateWorkshop = async (id, workshopData) => {
  const response = await api.put(`/workshops/${id}`, workshopData);
  return response.data;
};

export const deleteWorkshop = async (id) => {
  const response = await api.delete(`/workshops/${id}`);
  return response.data;
};

// Registration API calls
export const registerForWorkshop = async (registrationData) => {
  const response = await api.post('/registrations', registrationData);
  return response.data;
};

export const getMyRegistrations = async () => {
  const response = await api.get('/registrations/me');
  return response.data;
};

export const getRegistration = async (id) => {
  const response = await api.get(`/registrations/${id}`);
  return response.data;
};

export const updateRegistration = async (id, data) => {
  const response = await api.put(`/registrations/${id}`, data);
  return response.data;
};

export const cancelRegistration = async (id) => {
  const response = await api.delete(`/registrations/${id}`);
  return response.data;
};

// Add password reset functions
export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (resetData) => {
  const response = await api.post('/auth/reset-password', resetData);
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.post('/auth/change-password', passwordData);
  return response.data;
};

// Admin API calls
export const getDashboardStats = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

export const getAllRegistrations = async () => {
  const response = await api.get('/admin/registrations');
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/admin/users/${id}`, userData);
  return response.data;
};

export const exportRegistrations = async (workshopId) => {
  const response = await api.post(`/admin/export/registrations/${workshopId}`);
  return response.data;
};

// User profile API calls
export const updateProfile = async (userData) => {
  const response = await api.put('/users/me', userData);
  return response.data;
};

export default api;