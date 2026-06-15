const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
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
};
