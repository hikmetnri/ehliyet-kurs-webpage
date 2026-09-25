import api from '../../../api';
import { readList } from './schoolHelpers';

export function createSchoolAdminRepository(client = api) {
  return {
    async listSchools({ page, city, district, query, sponsored }) {
      const params = { includeInactive: true, page, limit: 50 };
      if (city) params.city = city;
      if (district) params.district = district;
      if (query) params.q = query;
      if (sponsored) params.isSponsored = true;
      const response = await client.get('/driving-schools', { params });
      const pagination = response.data?.pagination || {};
      return {
        items: readList(response),
        total: pagination.total || 0,
        pages: Math.ceil((pagination.total || 0) / (pagination.limit || 50)) || 1,
      };
    },
    async listApplications({ page, status, query }) {
      const params = { page, limit: 20 };
      if (status) params.status = status;
      if (query) params.q = query;
      const response = await client.get('/driving-schools/applications', { params });
      const pagination = response.data?.pagination || {};
      return {
        items: response.data?.data || [],
        total: pagination.total || 0,
        pages: Math.ceil((pagination.total || 0) / (pagination.limit || 20)) || 1,
      };
    },
    async saveSchool(id, payload) {
      return id
        ? client.put(`/driving-schools/${id}`, payload)
        : client.post('/driving-schools', payload);
    },
    deleteSchool(id) { return client.delete(`/driving-schools/${id}`); },
    updateSchool(id, payload) { return client.put(`/driving-schools/${id}`, payload); },
    updateApplication(id, status) {
      return client.put(`/driving-schools/applications/${id}`, { status });
    },
    deleteApplication(id) { return client.delete(`/driving-schools/applications/${id}`); },
  };
}
