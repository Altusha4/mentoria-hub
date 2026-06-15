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
    console.log('🌐 [API] Sending register request to', `${API_BASE_URL}/auth/register`);
    console.log('🌐 [API] Payload:', data);

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include', // Send cookies
      body: JSON.stringify(data),
    });

    console.log('🌐 [API] Register response status:', response.status);
    console.log('🌐 [API] Register response ok:', response.ok);

    const responseData = await response.json();
    console.log('🌐 [API] Register response body:', responseData);

    if (!response.ok) {
      console.error('❌ [API] Register failed:', responseData);
      throw new Error(responseData.detail || 'Registration failed');
    }

    console.log('✅ [API] Register successful');
    return responseData;
  },

  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include', // Send cookies
      body: JSON.stringify({ email, password }),
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
    console.log('📤 [API] Updating student', id);
    console.log('📤 [API] Full payload:', JSON.stringify(data, null, 2));

    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    console.log('📥 [API] Update response status:', response.status);
    const result = await response.json();
    console.log('📥 [API] Update response body:', JSON.stringify(result, null, 2));

    if (!response.ok) {
      console.error('❌ [API] Update failed:', result);
      throw new Error(result.detail || 'Update failed');
    }

    return result;
  },

  getStudentByEmail: async (email) => {
    const response = await fetch(`${API_BASE_URL}/students/email/${email}`);
    return response.json();
  },

  // Recommendations (ML-powered with bio)
  getRecommendedOpportunities: async (studentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations/student/${studentId}?top_k=10`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      const posts = await response.json();
      // Convert posts to opportunity format for display
      return posts.slice(0, 10).map(post => ({
        id: post.post_id,
        title: post.title,
        category: post.category,
        score: post.score
      }));
    } catch (error) {
      console.warn('⚠️  Recommendations failed, returning empty', error);
      return [];
    }
  },

  getRecommendedCourses: async (studentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/`);
      if (!response.ok) throw new Error('Failed to fetch courses');
      const courses = await response.json();
      // Return first 3 courses as recommendations
      return courses.slice(0, 3);
    } catch (error) {
      console.warn('⚠️  Failed to fetch courses', error);
      return [];
    }
  },

  // Search
  searchOpportunities: async (query) => {
    const response = await fetch(`${API_BASE_URL}/opportunities/?category=${query}`);
    return response.json();
  },

  searchCourses: async (query) => {
    const response = await fetch(`${API_BASE_URL}/courses/`);
    const allCourses = await response.json();
    return allCourses.filter(course =>
      course.title.toLowerCase().includes(query.toLowerCase()) ||
      course.description.toLowerCase().includes(query.toLowerCase())
    );
  },

  // Leaderboard
  getLeaderboard: async () => {
    const response = await fetch(`${API_BASE_URL}/students/leaderboard/top?limit=100`);
    return response.json();
  },

  // Telegram Posts
  getTelegramPosts: async (limit = 5, category = null) => {
    const params = new URLSearchParams({ limit });
    if (category && category !== "all") {
      params.append("category", category);
    }
    const response = await fetch(`${API_BASE_URL}/telegram/posts?${params}`);
    return response.json();
  },

  getTelegramCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/telegram/categories`);
    return response.json();
  },

  updateTelegramPostCategory: async (postId, category) => {
    const response = await fetch(`${API_BASE_URL}/telegram/posts/${postId}/category`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category }),
    });
    return response.json();
  },
};
