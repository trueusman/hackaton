import { axiosClient } from './axiosClient';

function toFormData(payload) {
  const fd = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === 'evidence' && Array.isArray(value)) {
      value.forEach((file) => fd.append('evidence', file));
    } else if (key === 'parts') {
      fd.append('parts', JSON.stringify(value));
    } else {
      fd.append(key, value);
    }
  });
  return fd;
}

export const maintenanceApi = {
  create: (issueId, payload) =>
    axiosClient
      .post(`/maintenance/issues/${issueId}`, toFormData(payload), {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.data.record),
  listForIssue: (issueId) => axiosClient.get(`/maintenance/issues/${issueId}`).then((r) => r.data.data.records),
  listForAsset: (assetId) => axiosClient.get(`/maintenance/assets/${assetId}`).then((r) => r.data.data.records),
};
