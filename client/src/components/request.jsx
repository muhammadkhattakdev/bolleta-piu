import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/signin') {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

const Request = {
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    verify: () => api.get('/auth/verify'),
    requestPasswordReset: (data) => api.post('/auth/request-password-reset', data),
    verifyResetCode: (data) => api.post('/auth/verify-reset-code', data),
    changePassword: (data) => api.post('/auth/change-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data)
  },
  
  profile: {
    update: (data) => api.put('/auth/profile', data)
  },
  
  documents: {
    upload: (formData) => api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    getAll: () => api.get('/documents'),
    getOne: (id) => api.get(`/documents/${id}`),
    download: (id) => api.get(`/documents/${id}/download`, { responseType: 'blob' }),
    delete: (id) => api.delete(`/documents/${id}`)
  },
  
  calculations: {
    create: (data) => api.post('/calculations', data),
    getAll: () => api.get('/calculations'),
    getOne: (id) => api.get(`/calculations/${id}`),
    delete: (id) => api.delete(`/calculations/${id}`),
    exportPDF: (id) => api.get(`/calculations/${id}/export-pdf`, { responseType: 'blob' })
  },
  
  get: (url, config = {}) => api.get(url, config),
  post: (url, data, config = {}) => api.post(url, data, config),
  put: (url, data, config = {}) => api.put(url, data, config),
  patch: (url, data, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config)
};

export default Request;