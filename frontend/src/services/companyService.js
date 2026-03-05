import api from './api';

// Get all companies
const getAllCompanies = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  
  const queryString = params.toString();
  const url = queryString ? `/company?${queryString}` : '/company';
  
  const response = await api.get(url);
  return response.data.data;
};

// Get company profile
const getCompanyProfile = async (id) => {
  const response = await api.get(`/company/${id}`);
  return response.data.data;
};

const companyService = {
  getAllCompanies,
  getCompanyProfile,
};

export default companyService;
