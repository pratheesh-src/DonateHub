import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('API Service Initialized:', { API_URL });

// Create axios instance with detailed configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 second timeout
  withCredentials: true, // Include cookies in requests
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Ignore falsy or literal 'null'/'undefined' strings which can be stored accidentally
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request with token:', config.url);
    } else {
      console.log('Request without token:', config.url);
    }
    
    // Log request details
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    if (config.data) {
      console.log('Request Data:', config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with detailed logging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    console.log('Response Data:', response.data);
    return response.data;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        console.log('Authentication error - clearing tokens');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      // Return the server error response
      return Promise.reject({
        success: false,
        message: data?.message || `Server error: ${status}`,
        status,
        data: data
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
      return Promise.reject({
        success: false,
        message: 'No response from server. Please check your connection.',
        status: 0
      });
    } else {
      // Something else caused the error
      console.error('Request setup error:', error.message);
      return Promise.reject({
        success: false,
        message: error.message || 'Request failed',
        status: null
      });
    }
  }
);

// Test API connection
export const testAPI = {
  health: () => api.get('/health'),
  dbTest: () => api.get('/db-test'),
  testPost: (data) => api.post('/test', data),
  testGet: () => api.get('/test'),
};

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Donation API
export const donationAPI = {
  // Get all donations
  getAllDonations: (params = {}) => {
    console.log('Fetching donations with params:', params);
    return api.get('/donations', { params });
  },
  
  // Get donations by type
  getDonationsByType: (type, params = {}) => {
    console.log(`Fetching ${type} donations:`, params);
    return api.get(`/donations/type/${type}`, { params });
  },
  
  // Get single donation
  getDonation: (id) => {
    console.log(`Fetching donation ${id}`);
    return api.get(`/donations/${id}`);
  },
  
  // Create donation - SIMPLIFIED for testing
  createDonation: (donationData) => {
    console.log('Creating donation:', donationData);
    
    // If there are images, use FormData
    if (donationData.images && donationData.images.length > 0) {
      const formData = new FormData();
      
      Object.keys(donationData).forEach(key => {
        if (key === 'images') {
          donationData.images.forEach((image, index) => {
            if (image instanceof File) {
              formData.append('images', image);
            }
          });
        } else if (typeof donationData[key] === 'object') {
          formData.append(key, JSON.stringify(donationData[key]));
        } else {
          formData.append(key, donationData[key]);
        }
      });
      
      console.log('Using FormData with entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }
      
      return api.post('/donations', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      // No images, use JSON
      console.log('Using JSON payload:', donationData);
      return api.post('/donations', donationData);
    }
  },
  
  // Simple test donation
  createTestDonation: () => {
    const testData = {
      type: 'blood',
      title: 'Test Blood Donation',
      description: 'This is a test donation from frontend',
      quantity: 1,
      location: 'Test Location',
      bloodDetails: {
        bloodType: 'O+',
        eligibleToDonate: true
      }
    };
    console.log('Creating test donation:', testData);
    return api.post('/donations', testData);
  },
  
  // Update donation
  updateDonation: (id, donationData) => {
    return api.put(`/donations/${id}`, donationData);
  },
  
  // Delete donation
  deleteDonation: (id) => api.delete(`/donations/${id}`),
  
  // Request donation
  requestDonation: (id, requestData) => api.post(`/donations/${id}/request`, requestData),
  
  // Get my donations
  getMyDonations: () => api.get('/donations/user/my'),
  
  // Toggle favorite
  toggleFavorite: (id) => api.post(`/donations/${id}/favorite`),
  
  // Simple getAll method
  getAll: (params = {}) => api.get('/donations', { params }),
};

// Item API
export const itemAPI = {
  getAllItems: (params) => api.get('/items', { params }),
  getItem: (id) => api.get(`/items/${id}`),
  createItem: (itemData) => {
    if (itemData.images && itemData.images.length > 0) {
      const formData = new FormData();
      Object.keys(itemData).forEach(key => {
        if (key === 'images') {
          itemData.images.forEach((image, index) => {
            formData.append('images', image);
          });
        } else {
          formData.append(key, itemData[key]);
        }
      });
      return api.post('/items', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      return api.post('/items', itemData);
    }
  },
  updateItem: (id, itemData) => api.put(`/items/${id}`, itemData),
  deleteItem: (id) => api.delete(`/items/${id}`),
  purchaseItem: (id, paymentData) => api.post(`/items/${id}/purchase`, paymentData),
  getMyItems: () => api.get('/items/user/my'),
  toggleFavorite: (id) => api.post(`/items/${id}/favorite`),
};

// User API
export const userAPI = {
  getUserProfile: (id) => api.get(`/users/profile/${id}`),
  updateProfile: (userData) => {
    if (userData.avatar) {
      const formData = new FormData();
      Object.keys(userData).forEach(key => {
        if (key === 'avatar') {
          formData.append('avatar', userData.avatar);
        } else {
          formData.append(key, userData[key]);
        }
      });
      return api.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      return api.put('/users/profile', userData);
    }
  },
  getNotifications: () => api.get('/users/notifications'),
  markNotificationRead: (id) => api.put(`/users/notifications/${id}/read`),
  deleteNotification: (id) => api.delete(`/users/notifications/${id}`),
  getUserStats: () => api.get('/users/stats'),
  getDashboardStats: () => api.get('/users/dashboard/stats'),
};

// Export default and all APIs
export default api;