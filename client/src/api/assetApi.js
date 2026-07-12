import { axiosClient } from './axiosClient';

export const assetApi = {
  create: (payload) => axiosClient.post('/assets', payload).then((r) => r.data.data.asset),
  list: (params) => axiosClient.get('/assets', { params }).then((r) => ({ items: r.data.data.assets, meta: r.data.meta })),
  get: (id) => axiosClient.get(`/assets/${id}`).then((r) => r.data.data.asset),
  update: (id, payload) => axiosClient.patch(`/assets/${id}`, payload).then((r) => r.data.data.asset),
  retire: (id) => axiosClient.post(`/assets/${id}/retire`).then((r) => r.data.data.asset),
  history: (id) => axiosClient.get(`/assets/${id}/history`).then((r) => r.data.data.history),
  qr: (id) => axiosClient.get(`/assets/${id}/qr`).then((r) => r.data.data),
  // Protected route - fetched as a blob (with the auth header attached by the
  // axios interceptor) rather than a bare <a href>, then downloaded client-side.
  downloadQr: async (id, filename) => {
    const res = await axiosClient.get(`/assets/${id}/qr/download`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'asset-qr.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
  getPublic: (assetCode) =>
    axiosClient.get(`/assets/public/${assetCode}`).then((r) => r.data.data),
};
