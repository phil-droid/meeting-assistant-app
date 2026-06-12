import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL
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

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password, fullName) => api.post('/auth/register', { email, password, fullName })
};

export const meetingService = {
  getAll: () => api.get('/meetings'),
  getById: (id) => api.get(`/meetings/${id}`),
  create: (data) => api.post('/meetings', data),
  update: (id, data) => api.put(`/meetings/${id}`, data),
  delete: (id) => api.delete(`/meetings/${id}`)
};

export const recordingService = {
  getAll: () => api.get('/recordings'),
  getById: (id) => api.get(`/recordings/${id}`),
  upload: (formData) => api.post('/recordings/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/recordings/${id}`)
};

export const notesService = {
  getAll: () => api.get('/notes'),
  getById: (id) => api.get(`/notes/${id}`),
  generate: (data) => api.post('/notes/generate', data),
  update: (id, data) => api.put(`/notes/${id}`, data)
};

export const reportService = {
  getAll: () => api.get('/reports'),
  getById: (id) => api.get(`/reports/${id}`),
  generate: (data) => api.post('/reports/generate', data)
};

export const suggestionService = {
  getAll: () => api.get('/suggestions'),
  generate: (data) => api.post('/suggestions/generate', data)
};

export const emailService = {
  getAll: () => api.get('/emails'),
  generateDraft: (data) => api.post('/emails/generate-draft', data),
  send: (id) => api.post(`/emails/${id}/send`)
};

export const chatbotService = {
  getConversations: () => api.get('/chatbot/conversations'),
  startConversation: (data) => api.post('/chatbot/conversations', data),
  sendMessage: (conversationId, message) => api.post(`/chatbot/conversations/${conversationId}/messages`, { message }),
  getHistory: (conversationId) => api.get(`/chatbot/conversations/${conversationId}/messages`),
  deleteConversation: (conversationId) => api.delete(`/chatbot/conversations/${conversationId}`)
};

export default api;
