// API Configuration
// IMPORTANT: Replace with your computer's local IP address
// To find your IP: 
// Windows: Run 'ipconfig' in cmd, look for IPv4 Address
// Mac/Linux: Run 'ifconfig' in terminal, look for inet

export const API_URL = 'http://192.168.11.123:3000/api'; // Change to YOUR IP!

// API helper functions
export const api = {
  // Authentication
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  // Jobs
  getJobs: async () => {
    const response = await fetch(`${API_URL}/jobs`);
    return response.json();
  },

  getJob: async (id) => {
    const response = await fetch(`${API_URL}/jobs/${id}`);
    return response.json();
  },

  getCompanyJobs: async (companyId) => {
    const response = await fetch(`${API_URL}/jobs/company/${companyId}`);
    return response.json();
  },

  createJob: async (jobData) => {
    const response = await fetch(`${API_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    });
    return response.json();
  },

  updateJob: async (id, jobData) => {
    const response = await fetch(`${API_URL}/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    });
    return response.json();
  },

  deleteJob: async (id) => {
    const response = await fetch(`${API_URL}/jobs/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  applyToJob: async (jobId, studentId) => {
    const response = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId })
    });
    return response.json();
  },

  // Users
  getUser: async (id) => {
    const response = await fetch(`${API_URL}/users/${id}`);
    return response.json();
  },

  updateUser: async (id, userData) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  getUserApplications: async (id) => {
    const response = await fetch(`${API_URL}/users/${id}/applications`);
    return response.json();
  },

  // Notifications
  getNotifications: async (userId) => {
    const response = await fetch(`${API_URL}/notifications/${userId}`);
    return response.json();
  },

  getUnreadCount: async (userId) => {
    const response = await fetch(`${API_URL}/notifications/${userId}/unread-count`);
    return response.json();
  },

  markAsRead: async (id) => {
    const response = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PUT'
    });
    return response.json();
  },

  markAllAsRead: async (userId) => {
    const response = await fetch(`${API_URL}/notifications/user/${userId}/read-all`, {
      method: 'PUT'
    });
    return response.json();
  }
};