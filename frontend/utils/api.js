import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// Attach JWT to every request
API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('np_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('np_token');
      localStorage.removeItem('np_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;

// ── Auth ────────────────────────────────────────────
export const authAPI = {
  signup: (data)  => API.post('/auth/signup', data),
  login:  (data)  => API.post('/auth/login',  data),
};

// ── User ────────────────────────────────────────────
export const userAPI = {
  getProfile:      ()     => API.get('/user/profile'),
  updateProfile:   (data) => API.put('/user/update', data),
  updateWeekly:    (data) => API.put('/user/weekly-hours', data),
};

// ── Path ────────────────────────────────────────────
export const pathAPI = {
  generate:   ()   => API.post('/path/generate'),
  allTopics:  ()   => API.get('/path/topics'),
  getTopic:   (id) => API.get(`/path/topic/${id}`),
};

// ── Progress ─────────────────────────────────────────
export const progressAPI = {
  completeTopic: (topicId) => API.post('/progress/complete-topic', { topicId }),
  logHours:      (data)    => API.post('/progress/log-hours', data),
  getRevisions:  ()        => API.get('/progress/revisions'),
};

// ── Quiz ────────────────────────────────────────────
export const quizAPI = {
  getQuestions: (topicId) => API.get(`/quiz/questions/${topicId}`),
  submit:       (data)    => API.post('/quiz/submit', data),
};
