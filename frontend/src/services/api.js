import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Panelist
export const createPanelistAvailability = (data) => API.post('/panelists/availability', data);
export const getPanelistAvailability = (params) => API.get('/panelists/availability', { params });

// Candidate
export const createCandidateAvailability = (data) => API.post('/candidates/availability', data);
export const getCandidateAvailability = (params) => API.get('/candidates/availability', { params });

// Matches
export const getMatches = (params) => API.get('/matches', { params });

// Interviews
export const scheduleInterview = (data) => API.post('/interviews', data);
export const updateInterviewStatus = (id, status) => API.put(`/interviews/${id}/status`, { status });
export const getUpcomingInterviews = (params) => API.get('/interviews/upcoming', { params });
export const getAllInterviews = () => API.get('/interviews');

export default API;