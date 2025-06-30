import api from './api.js';

// Get all published blogs with pagination and filtering
export const getBlogs = async (params = {}) => {
  try {
    const response = await api.get('/blogs', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get blogs organized by topic
export const getBlogsOrganizedByTopic = async (limit = 6) => {
  try {
    const response = await api.get('/blogs/organized', { params: { limit } });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get single blog by slug
export const getBlogBySlug = async (slug) => {
  try {
    const response = await api.get(`/blogs/${slug}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get blog categories
export const getBlogCategories = async () => {
  try {
    const response = await api.get('/blogs/categories');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get featured blogs (optionally by topic)
export const getFeaturedBlogs = async (limit = 5, topic = null) => {
  try {
    const params = { limit };
    if (topic) params.topic = topic;
    const response = await api.get('/blogs/featured', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get popular blogs by topic
export const getPopularBlogs = async (topic = null, limit = 5) => {
  try {
    const params = { limit, sortBy: 'likes', sortOrder: 'desc' };
    if (topic) params.topic = topic;
    const response = await api.get('/blogs', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get blog analytics
export const getBlogAnalytics = async (topic = null) => {
  try {
    const params = {};
    if (topic) params.topic = topic;
    const response = await api.get('/blogs/analytics', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Search blogs
export const searchBlogs = async (query, category = null, limit = 10) => {
  try {
    const params = { q: query, limit };
    if (category) params.category = category;
    const response = await api.get('/blogs/search', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get blogs by tag
export const getBlogsByTag = async (tag, params = {}) => {
  try {
    const response = await api.get(`/blogs/tag/${tag}`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get blogs by author
export const getBlogsByAuthor = async (authorId, params = {}) => {
  try {
    const response = await api.get(`/blogs/author/${authorId}`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get popular tags
export const getPopularTags = async (topic = null, limit = 10) => {
  try {
    const params = { limit };
    if (topic) params.topic = topic;
    const response = await api.get('/blogs/tags/popular', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Like a blog
export const likeBlog = async (blogId) => {
  try {
    const response = await api.post(`/blogs/${blogId}/like`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Admin functions
export const createBlog = async (blogData) => {
  try {
    const response = await api.post('/blogs', blogData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateBlog = async (blogId, blogData) => {
  try {
    const response = await api.put(`/blogs/${blogId}`, blogData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteBlog = async (blogId) => {
  try {
    const response = await api.delete(`/blogs/${blogId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const togglePublishBlog = async (blogId) => {
  try {
    const response = await api.patch(`/blogs/${blogId}/publish`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const toggleFeatureBlog = async (blogId) => {
  try {
    const response = await api.patch(`/blogs/${blogId}/feature`);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 