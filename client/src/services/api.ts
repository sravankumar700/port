import axios from 'axios';

// Create Axios instance. Since Vite config proxies `/api` to localhost:8000, 
// using `/api` as base URL works perfectly for local and adapts to production if proxied/configured.
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login-json', { username, password });
    return response.data; // { access_token, token_type }
  },
};

// Generic CRUD factory helper
const createCrudService = <T, TCreate, TUpdate>(prefix: string) => ({
  getAll: async (params?: Record<string, any>): Promise<T[]> => {
    const response = await api.get(prefix, { params });
    return response.data;
  },
  getById: async (id: number | string): Promise<T> => {
    const response = await api.get(`${prefix}/${id}`);
    return response.data;
  },
  create: async (data: TCreate): Promise<T> => {
    const response = await api.post(prefix, data);
    return response.data;
  },
  update: async (id: number, data: TUpdate): Promise<T> => {
    const response = await api.put(`${prefix}/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`${prefix}/${id}`);
  },
});

export const projectService = createCrudService<any, any, any>('/projects');
export const skillService = createCrudService<any, any, any>('/skills');
export const educationService = createCrudService<any, any, any>('/education');
export const experienceService = createCrudService<any, any, any>('/experience');
export const achievementService = createCrudService<any, any, any>('/achievements');
export const certificationService = createCrudService<any, any, any>('/certifications');
export const blogService = {
  ...createCrudService<any, any, any>('/blogs'),
  getBySlugOrId: async (slugOrId: string): Promise<any> => {
    const response = await api.get(`/blogs/${slugOrId}`);
    return response.data;
  }
};

// Custom services for messages, resume, settings, analytics
export const messageService = {
  submit: async (messageData: any) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/messages');
    return response.data;
  },
  updateStatus: async (id: number, statusData: { read?: boolean; replied?: boolean }) => {
    const response = await api.put(`/messages/${id}`, statusData);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/messages/${id}`);
  },
};

export const resumeService = {
  getLatest: async () => {
    const response = await api.get('/resume');
    return response.data; // { id, version, file_url, last_updated }
  },
  upload: async (version: string, file: File) => {
    const formData = new FormData();
    formData.append('version', version);
    formData.append('file', file);
    const response = await api.post('/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const settingsService = {
  getSiteSettings: async (): Promise<Record<string, string>> => {
    const response = await api.get('/settings/site');
    return response.data;
  },
  updateSiteSetting: async (key: string, value: string) => {
    const response = await api.post('/settings/site', { key, value });
    return response.data;
  },
  getSocialLinks: async () => {
    const response = await api.get('/settings/socials');
    return response.data;
  },
  createSocialLink: async (data: any) => {
    const response = await api.post('/settings/socials', data);
    return response.data;
  },
  updateSocialLink: async (id: number, data: any) => {
    const response = await api.put(`/settings/socials/${id}`, data);
    return response.data;
  },
  deleteSocialLink: async (id: number) => {
    await api.delete(`/settings/socials/${id}`);
  },
};

export const analyticsService = {
  trackVisit: async (pagePath: string) => {
    try {
      await api.post(`/analytics/track?page_path=${encodeURIComponent(pagePath)}`);
    } catch (e) {
      console.warn('Analytics tracking failed', e);
    }
  },
  getStats: async () => {
    const response = await api.get('/analytics/stats');
    return response.data;
  },
};

export default api;
