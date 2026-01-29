// API Configuration
export const API_URL = 'http://192.168.11.131:3000/api'; // Change to YOUR IP!

// Custom error class
class APIError extends Error {
  constructor(message, type = 'network') {
    super(message);
    this.type = type; // 'network', 'notfound', 'permission', 'server'
  }
}

// API helper functions
export const api = {
  // Authentication
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new APIError('Invalid email or password', 'permission');
        }
        throw new APIError('Login failed. Please try again.', 'server');
      }

      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Cannot connect to server. Check your internet.', 'network');
    }
  },

  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new APIError('Email already registered', 'permission');
        }
        throw new APIError('Registration failed. Please try again.', 'server');
      }

      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Cannot connect to server. Check your internet.', 'network');
    }
  },
  // bookmarks
  getBookmarks: async (studentId) => {
    try {
      const response = await fetch(`${API_URL}/bookmarks/${studentId}`);

      if (!response.ok) {
        throw new APIError('Failed to load bookmarks. Please try again.', 'server');
      }

      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Cannot connect to server. Check your internet.', 'network');
    }
  },
  addBookmark: async (studentId, jobId) => {
    try {
      const response = await fetch(`${API_URL}/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, job_id: jobId })
      });

      if (!response.ok) {
        throw new APIError('Failed to bookmark job. Please try again.', 'server');
      }

      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Cannot connect to server. Check your internet.', 'network');
    }
  },
  removeBookmark: async (studentId, jobId) => {
    try {
      const response = await fetch(`${API_URL}/bookmarks/${studentId}/${jobId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new APIError('Failed to remove bookmark. Please try again.', 'server');
      }

      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Cannot connect to server. Check your internet.', 'network');
    }
  },

  checkBookmark: async (studentId, jobId) => {
    try {
      const response = await fetch(`${API_URL}/bookmarks/check/${studentId}/${jobId}`);

      if (!response.ok) {
        throw new APIError('Failed to check bookmark. Please try again.', 'server');
      }

      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Cannot connect to server. Check your internet.', 'network');
    }
  },
  // Jobs
  getJobs: async () => {
    try {
      const response = await fetch(`${API_URL}/jobs`);

      if (!response.ok) {
        throw new APIError('Failed to load jobs. Please try again.', 'server');
      }

      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Cannot connect to server. Check your internet.', 'network');
    }
  },

  getJob: async (id) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new APIError('This job is no longer available.', 'notfound');
        }
        throw new APIError('Failed to load job details.', 'server');
      }

      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Cannot connect to server. Check your internet.', 'network');
    }
  },

  getCompanyJobs: async (companyId) => {
    try {
      const response = await fetch(`${API_URL}/jobs/company/${companyId}`);

      if (!response.ok) {
        throw new APIError('Failed to load your jobs.', 'server');
      }

      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Cannot connect to server. Check your internet.', 'network');
    }
  },

  createJob: async (jobData) => {
    try {
      const response = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });

      if (!response.ok) {
        throw new APIError('Failed to create job. Please try again.', 'server');
      }

      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Cannot connect to server. Check your internet.', 'network');
    }
  },

  updateJob: async (id, jobData) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });

      if (!response.ok) {
        throw new APIError('Failed to update job. Please try again.', 'server');
      }

      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Cannot connect to server. Check your internet.', 'network');
    }
  },

  deleteJob: async (id) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new APIError('Failed to delete job. Please try again.', 'server');
      }

      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Cannot connect to server. Check your internet.', 'network');
    }
  },

  applyToJob: async (jobId, studentId) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId })
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.error === 'Already applied to this job') {
          throw new APIError('You have already applied to this job.', 'permission');
        }
        throw new APIError('Failed to submit application.', 'server');
      }

      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Cannot connect to server. Check your internet.', 'network');
    }
  },

  getJobApplicationsScreen: async (jobId) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}/applications`);
      if (!response.ok) throw new Error('Failed to load applications');
      return response.json();
    } catch (error) {
      throw new APIError(error.message, 'network');
    }
  },

  updateApplicationStatus: async (applicationId, status) => {
    try {
      const response = await fetch(`${API_URL}/jobs/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new APIError('Failed to update application.', 'server');
      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Cannot connect to server.', 'network');
    }
  },
  // Users
  getUser: async (id) => {
    try {
      const response = await fetch(`${API_URL}/users/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new APIError('User not found.', 'notfound');
        }
        throw new APIError('Failed to load profile.', 'server');
      }

      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Cannot connect to server. Check your internet.', 'network');
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new APIError('Failed to update profile. Please try again.', 'server');
      }

      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Cannot connect to server. Check your internet.', 'network');
    }
  },

  getUserApplications: async (id) => {
    try {
      const response = await fetch(`${API_URL}/users/${id}/applications`);

      if (!response.ok) {
        throw new APIError('Failed to load applications.', 'server');
      }

      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Cannot connect to server. Check your internet.', 'network');
    }
  },

  // Notifications
  getNotifications: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${userId}`);

      if (!response.ok) {
        throw new APIError('Failed to load notifications.', 'server');
      }

      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Cannot connect to server. Check your internet.', 'network');
    }
  },

  getUnreadCount: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${userId}/unread-count`);

      if (!response.ok) {
        throw new APIError('Failed to load notification count.', 'server');
      }

      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Cannot connect to server. Check your internet.', 'network');
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT'
      });

      if (!response.ok) {
        throw new APIError('Failed to mark as read.', 'server');
      }

      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Cannot connect to server. Check your internet.', 'network');
    }
  },

  markAllAsRead: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/notifications/user/${userId}/read-all`, {
        method: 'PUT'
      });

      if (!response.ok) {
        throw new APIError('Failed to mark all as read.', 'server');
      }

      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Cannot connect to server. Check your internet.', 'network');
    }
  },

  // Conversations & Messages
  getConversations: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/conversations/${userId}`);
      if (!response.ok) {
        throw new APIError('Failed to load conversations.', 'server');
      }
      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Cannot connect to server. Check your internet.', 'network');
    }
  },

  getConversationMessages: async (conversationId) => {
    try {
      const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`);
      if (!response.ok) {
        throw new APIError('Failed to load messages.', 'server');
      }
      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Cannot connect to server. Check your internet.', 'network');
    }
  },

  createConversation: async (studentId, companyId, jobId) => {
    try {
      const response = await fetch(`${API_URL}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, company_id: companyId, job_id: jobId })
      });
      if (!response.ok) {
        const data = await response.json();
        if (response.status === 403) {
          throw new APIError(data.error || 'Cannot create conversation', 'permission');
        }
        throw new APIError('Failed to create conversation.', 'server');
      }
      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Cannot connect to server. Check your internet.', 'network');
    }
  },

  sendMessage: async (conversationId, senderId, message) => {
    try {
      const response = await fetch(`${API_URL}/conversations/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: conversationId, sender_id: senderId, message })
      });
      if (!response.ok) {
        throw new APIError('Failed to send message.', 'server');
      }
      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Cannot connect to server. Check your internet.', 'network');
    }
  },

  markMessagesAsRead: async (conversationId, userId) => {
    try {
      const response = await fetch(`${API_URL}/conversations/${conversationId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (!response.ok) {
        throw new APIError('Failed to mark messages as read.', 'server');
      }
      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Cannot connect to server. Check your internet.', 'network');
    }
  },

  changePassword: async (userId, oldPassword, newPassword) => {
    try {
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, oldPassword, newPassword })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          throw new APIError(data.error || 'Current password is incorrect', 'permission');
        }
        throw new APIError(data.error || 'Failed to change password.', 'server');
      }

      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Cannot connect to server. Check your internet.', 'network');
    }
  }
};

