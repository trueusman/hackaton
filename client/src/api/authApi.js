import { axiosClient } from './axiosClient';

export const authApi = {
  register: (payload) => axiosClient.post('/auth/register', payload).then((r) => r.data.data),
  login: (payload) => axiosClient.post('/auth/login', payload).then((r) => r.data.data),
  refresh: () => axiosClient.post('/auth/refresh').then((r) => r.data.data),
  logout: () => axiosClient.post('/auth/logout').then((r) => r.data.data),
  me: () => axiosClient.get('/auth/me').then((r) => r.data.data),
};

export const userApi = {
  createUser: (payload) => axiosClient.post('/users', payload).then((r) => r.data.data),
  listUsers: () => axiosClient.get('/users').then((r) => r.data.data.users),
  listTechnicians: () => axiosClient.get('/users/technicians').then((r) => r.data.data.technicians),
};
