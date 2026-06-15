const API_BASE_URL = 'http://localhost:8000/api';

// Helper to add Authorization header
const getHeaders = (token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth
  register: async (data) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include', // Send cookies
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  },

  login: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include', // Send cookies
      body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return response.json();
  },

  refreshToken: async (refreshToken) => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!response.ok) throw new Error('Token refresh failed');
    return response.json();
  },

  getCurrentUser: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/me?token=${token}`, {
      headers: getHeaders(token),
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to get user');
    return response.json();
  },
  // Opportunities
  getOpportunities: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const url = params ? `${API_BASE_URL}/opportunities/?${params}` : `${API_BASE_URL}/opportunities/`;
    const response = await fetch(url);
    return response.json();
  },

  getOpportunity: async (id) => {
    const response = await fetch(`${API_BASE_URL}/opportunities/${id}`);
    return response.json();
  },

  saveOpportunity: async (opportunityId, studentId) => {
    const response = await fetch(`${API_BASE_URL}/opportunities/${opportunityId}/save/${studentId}`, {
      method: 'POST',
    });
    return response.json();
  },

  unsaveOpportunity: async (opportunityId, studentId) => {
    const response = await fetch(`${API_BASE_URL}/opportunities/${opportunityId}/unsave/${studentId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  getSavedOpportunities: async (studentId) => {
    const response = await fetch(`${API_BASE_URL}/opportunities/${studentId}/saved`);
    return response.json();
  },

  // Courses
  getCourses: async () => {
    const response = await fetch(`${API_BASE_URL}/courses/`);
    return response.json();
  },

  getCourse: async (id) => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`);
    return response.json();
  },

  enrollCourse: async (courseId, studentId) => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/enroll/${studentId}`, {
      method: 'POST',
    });
    return response.json();
  },

  getEnrolledCourses: async (studentId) => {
    const response = await fetch(`${API_BASE_URL}/courses/${studentId}/enrolled`);
    return response.json();
  },

  completeLesson: async (lessonId, studentId) => {
    const response = await fetch(`${API_BASE_URL}/courses/lesson/${lessonId}/complete/${studentId}`, {
      method: 'POST',
    });
    return response.json();
  },

  getLesson: async (id) => {
    const response = await fetch(`${API_BASE_URL}/courses/lesson/${id}`);
    return response.json();
  },

  // Students
  createStudent: async (data) => {
    const response = await fetch(`${API_BASE_URL}/students/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return response.json();
  },

  getStudent: async (id) => {
    const response = await fetch(`${API_BASE_URL}/students/${id}`);
    return response.json();
  },

  updateStudent: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getStudentByEmail: async (email) => {
    const response = await fetch(`${API_BASE_URL}/students/email/${email}`);
    return response.json();
  },

  // Recommendations
  getRecommendedOpportunities: async (studentId) => {
    const response = await fetch(`${API_BASE_URL}/opportunities/${studentId}/recommended`);
    return response.json();
  },

  getRecommendedCourses: async (studentId) => {
    const response = await fetch(`${API_BASE_URL}/courses/${studentId}/recommended`);
    if (response.status === 404) {
      // Fallback: return all courses if endpoint doesn't exist
      return api.getCourses();
    }
    return response.json();
  },
};
