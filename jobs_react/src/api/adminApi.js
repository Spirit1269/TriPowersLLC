import api from './apiClient';

export const getApplicants = ({ page = 1, search = '', pageSize = 10 } = {}) =>
  api.get('Applicants', { params: { page, search, pageSize } });

export const getJobs = () => api.get('jobs');

export const createJob = (payload) => api.post('jobs', payload);

export const updateJob = (id, payload) => api.put(`jobs/${id}`, payload);

export const deleteJob = (id) => api.delete(`jobs/${id}`);