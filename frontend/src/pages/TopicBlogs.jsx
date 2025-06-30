import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { getBlogs, getBlogCategories, getFeaturedBlogs, likeBlog, searchBlogs } from '../apis/blogApi';
import BlogCard from '../components/BlogCard';
import BlogFilters from '../components/BlogFilters';
import { topics } from '../utils/constants';

const TopicBlogs = () => {
  const { topic } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    sortBy: searchParams.get('sort') || 'publishedAt',
    sortOrder: searchParams.get('order') || 'desc',
    tag: searchParams.get('tag') || '',
    author: searchParams.get('author') || '',
    featured: searchParams.get('featured') === 'true'
  });
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    limit: parseInt(searchParams.get('limit')) || 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  // Refs to prevent unnecessary API calls
  const isInitialized = useRef(false);
  const abortController = useRef(null);

  // Validate topic
  const isValidTopic = topics.includes(topic);

  // Topic information
  const topicInfo = {
    javascript: {
      title: "JavaScript",
      icon: "⚡",
      color: "bg-yellow-500"
    },
    typescript: {
      title: "TypeScript",
      icon: "🔷",
      color: "bg-blue-500"
    },
    react: {
      title: "React",
      icon: "⚛️",
      color: "bg-cyan-500"
    },
    angular: {
      title: "Angular",
      icon: "🅰️",
      color: "bg-red-500"
    },
    node: {
      title: "Node.js",
      icon: "🟢",
      color: "bg-green-500"
    }
  };

  const currentTopic = topicInfo[topic] || {
    title: topic?.charAt(0).toUpperCase() + topic?.slice(1) || 'Topic',
    icon: "📚",
    color: "bg-gray-500"
  };

  // Update URL when filters change
  const updateURL = useCallback((newFilters, newPagination) => {
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value);
      }
    });
    
    if (newPagination.page > 1) {
      params.set('page', newPagination.page);
    }
    if (newPagination.limit !== 12) {
      params.set('limit', newPagination.limit);
    }
    
    setSearchParams(params);
  }, [setSearchParams]);

  // Unified fetch handler for blogs and search
  const fetchBlogsUnified = useCallback(async (signal) => {
    if (!isValidTopic) return;
    
    try {
      setLoading(true);
      setError(null);
      const { search, category, sortBy, sortOrder, tag, author, featured } = filters;
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        topic: topic, // Always filter by current topic
        sortBy,
        sortOrder
      };
      
      // Add additional filters
      if (category && category !== topic) params.category = category;
      if (tag) params.tag = tag;
      if (author) params.author = author;
      if (featured) params.featured = true;
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      let response;
      if (search && search.length >= 3) {
        // Use search API with topic filter
        response = await searchBlogs(search, topic, pagination.limit);
        setBlogs(response.data);
        setPagination(prev => ({ 
          ...prev, 
          total: response.data.length, 
          totalPages: 1, 
          hasNext: false, 
          hasPrev: false 
        }));
      } else if (!search || search.length === 0) {
        // Use normal blogs API
        response = await getBlogs({ ...params });
        setBlogs(response.data);
        setPagination(response.pagination);
      } else {
        // If search is 1-2 chars, do not call API, just clear blogs
        setBlogs([]);
        setPagination(prev => ({ 
          ...prev, 
          total: 0, 
          totalPages: 0, 
          hasNext: false, 
          hasPrev: false 
        }));
        return;
      }
    } catch (error) {
      if (signal?.aborted) return;
      console.error('Error fetching blogs:', error);
      if (error.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
        toast.error('Too many requests. Please wait a moment and try again.');
      } else if (error.response?.status === 400 && error.response?.data?.code === 'INVALID_SEARCH_LENGTH') {
        setError('Enter at least 3 characters to search.');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.');
        toast.error('Server error. Please try again later.');
      } else {
        setError('Failed to load blogs. Please try again.');
        toast.error('Failed to load blogs');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [filters, pagination.page, pagination.limit, topic, isValidTopic]);

  // Memoize fetchInitialData
  const fetchInitialData = useCallback(async () => {
    try {
      const [categoriesRes, featuredRes] = await Promise.all([
        getBlogCategories(),
        getFeaturedBlogs(3, topic) // Get featured blogs for this topic
      ]);
      setCategories(categoriesRes.data);
      setFeaturedBlogs(featuredRes.data);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      }
    }
  }, [topic]);

  // Initial data fetch on mount only
  useEffect(() => {
    if (!isInitialized.current && isValidTopic) {
      isInitialized.current = true;
      fetchInitialData();
    }
  }, [fetchInitialData, isValidTopic]);

  // Fetch blogs when filters or page changes, with debouncing and abort controller
  useEffect(() => {
    if (!isValidTopic) return;
    
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();
    const timeoutId = setTimeout(() => {
      fetchBlogsUnified(abortController.current.signal);
    }, 500);
    return () => {
      clearTimeout(timeoutId);
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [fetchBlogsUnified, isValidTopic]);

  // Update URL when filters or pagination change
  useEffect(() => {
    updateURL(filters, pagination);
  }, [filters, pagination, updateURL]);

  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);



  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleLike = useCallback(async (blogId) => {
    try {
      const response = await likeBlog(blogId);
      setBlogs(prev => prev.map(blog => 
        blog._id === blogId ? { ...blog, likes: response.data.likes } : blog
      ));
      setFeaturedBlogs(prev => prev.map(blog => 
        blog._id === blogId ? { ...blog, likes: response.data.likes } : blog
      ));
    } catch (error) {
      console.error('Error liking blog:', error);
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else {
        toast.error('Failed to like blog');
      }
    }
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();
    fetchBlogsUnified(abortController.current.signal);
  }, [fetchBlogsUnified]);

  if (!isValidTopic) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Topic Not Found
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              The topic "{topic}" doesn't exist. Here are the available topics:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {topics.map((t) => (
                <Link
                  key={t}
                  to={`/blogs/${t}`}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="text-2xl mb-2">{topicInfo[t]?.icon || "📚"}</div>
                  <div className="font-medium text-gray-900 dark:text-white capitalize">
                    {topicInfo[t]?.title || t}
                  </div>
                </Link>
              ))}
            </div>
            <Link
              to="/blogs"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Blogs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/blogs')}
              className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              title="Go back to all blogs"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Blogs</span>
            </button>
          </div>

          {/* Main Header Content */}
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${currentTopic.color} text-white text-2xl mb-4`}>
              {currentTopic.icon}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {currentTopic.title} Blogs
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-6">
              Explore the latest articles and tutorials about {currentTopic.title.toLowerCase()}.
            </p>
            
            {/* Breadcrumb */}
            <nav className="flex justify-center items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Link to="/blogs" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Blogs
              </Link>
              <span>/</span>
              <span className="text-gray-900 dark:text-white capitalize">{topic}</span>
            </nav>
          </div>
        </motion.div>

        {/* Featured Blogs Section */}
        {featuredBlogs.length > 0 && !filters.search && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Featured {currentTopic.title} Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBlogs.map((blog, index) => (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <BlogCard blog={blog} onLike={handleLike} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <BlogFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            categories={categories}
            showTopicFilter={false} // Hide topic filter since we're already in a topic
          />
        </motion.div>

        {/* Active Filters Display */}
        {(filters.tag || filters.author || filters.featured) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex flex-wrap gap-2"
          >
            <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
            {filters.tag && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                Tag: {filters.tag}
                <button
                  onClick={() => handleFiltersChange({ ...filters, tag: '' })}
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  ×
                </button>
              </span>
            )}
            {filters.author && (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                Author: {filters.author}
                <button
                  onClick={() => handleFiltersChange({ ...filters, author: '' })}
                  className="ml-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                >
                  ×
                </button>
              </span>
            )}
            {filters.featured && (
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm">
                Featured only
                <button
                  onClick={() => handleFiltersChange({ ...filters, featured: false })}
                  className="ml-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
                >
                  ×
                </button>
              </span>
            )}
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Error Loading Blogs
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Blogs Grid */}
        {!loading && !error && blogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {blogs.map((blog, index) => (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <BlogCard blog={blog} onLike={handleLike} />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && blogs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No {currentTopic.title} articles found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filters.search 
                ? `No articles found for "${filters.search}" in ${currentTopic.title.toLowerCase()}`
                : `No articles available for ${currentTopic.title.toLowerCase()} yet.`
              }
            </p>
            {filters.search && (
              <button
                onClick={() => handleFiltersChange({ ...filters, search: '' })}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-4"
              >
                Clear Search
              </button>
            )}
            <Link
              to="/blogs"
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              View All Blogs
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TopicBlogs; 