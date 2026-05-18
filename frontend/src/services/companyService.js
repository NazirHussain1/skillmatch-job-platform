import api from './api';

const getCompany = async (id) => {
  const response = await api.get(`/company/${id}`);
  return response.data.data;
};

const getCompanies = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  const queryString = params.toString();
  const url = queryString ? `/company?${queryString}` : '/company';
  const response = await api.get(url);
  return response.data.data;
};

const companyService = {
  getCompany,
  getCompanies
};

export default companyService;
