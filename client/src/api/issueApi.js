import { axiosClient } from './axiosClient';

function toFormData(payload) {
  const fd = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === 'evidence' && Array.isArray(value)) {
      value.forEach((file) => fd.append('evidence', file));
    } else if (typeof value === 'object') {
      fd.append(key, JSON.stringify(value));
    } else {
      fd.append(key, value);
    }
  });
  return fd;
}

export const issueApi = {
  previewAiTriage: (payload) =>
    axiosClient.post('/issues/ai-triage', payload).then((r) => r.data.data.suggestion),

  getPublicStatus: (issueNumber) =>
    axiosClient.get(`/issues/public/${issueNumber}`).then((r) => r.data.data.issue),

  // Public report - multipart so evidence files can ride along in one request.
  create: (payload) =>
    axiosClient
      .post('/issues', toFormData(payload), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data.data.issue),

  list: (params) => axiosClient.get('/issues', { params }).then((r) => ({ items: r.data.data.issues, meta: r.data.meta })),
  get: (id) => axiosClient.get(`/issues/${id}`).then((r) => r.data.data.issue),
  assign: (id, technicianId) => axiosClient.patch(`/issues/${id}/assign`, { technicianId }).then((r) => r.data.data.issue),
  updateStatus: (id, status) => axiosClient.patch(`/issues/${id}/status`, { status }).then((r) => r.data.data.issue),
  resolve: (id, resolutionSummary) =>
    axiosClient.patch(`/issues/${id}/resolve`, { resolutionSummary }).then((r) => r.data.data.issue),
  close: (id) => axiosClient.patch(`/issues/${id}/close`).then((r) => r.data.data.issue),
  reopen: (id, reason) => axiosClient.patch(`/issues/${id}/reopen`, { reason }).then((r) => r.data.data.issue),
};
