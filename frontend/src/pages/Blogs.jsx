import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getBlogsOrganizedByTopic, getFeaturedBlogs, getBlogs, likeBlog } from '../apis/blogApi';
import BlogCard from '../components/BlogCard';
import { topics } from '../utils/constants';

const Blogs = () => {
  const [blogsByTopic, setBlogsByTopic] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs to prevent unnecessary API calls
  const isInitialized = useRef(false);

  // Topic information
  const topicInfo = {
    javascript: {
      title: "JavaScript",
      description: "Master the fundamentals and advanced concepts of JavaScript",
      icon: "⚡",
      color: "bg-yellow-500",
      gradient: "from-yellow-400 to-orange-500"
    },
    typescript: {
      title: "TypeScript",
      description: "Take your JavaScript skills to the next level with TypeScript",
      icon: "🔷",
      color: "bg-blue-500",
      gradient: "from-blue-400 to-indigo-500"
    },
    react: {
      title: "React",
      description: "Build modern user interfaces with React",
      icon: "⚛️",
      color: "bg-cyan-500",
      gradient: "from-cyan-400 to-blue-500"
    },
    angular: {
      title: "Angular",
      description: "Create scalable applications with Angular",
      icon: "🅰️",
      color: "bg-red-500",
      gradient: "from-red-400 to-pink-500"
    },
    node: {
      title: "Node.js",
      description: "Build server-side applications with Node.js",
      icon: "🟢",
      color: "bg-green-500",
      gradient: "from-green-400 to-emerald-500"
    }
  };

  // Fetch organized blogs by topic
  const fetchOrganizedBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [organizedRes, latestRes] = await Promise.all([
        getBlogsOrganizedByTopic(6), // 6 blogs per topic
        getBlogs({ limit: 6 }) // Get latest blogs (backend sorts by publishedAt by default)
      ]);
      

      
      setBlogsByTopic(organizedRes.data);
      setFeaturedBlogs(latestRes.data); // Use latest blogs as "featured" for now
    } catch (error) {
      console.error('Error fetching organized blogs:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      if (error.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
        toast.error('Too many requests. Please wait a moment and try again.');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.');
        toast.error('Server error. Please try again later.');
      } else {
        setError(`Failed to load blogs: ${error.message}`);
        toast.error('Failed to load blogs');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch on mount only
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      fetchOrganizedBlogs();
    }
  }, [fetchOrganizedBlogs]);

  const handleLike = useCallback(async (blogId) => {
    try {
      const response = await likeBlog(blogId);
      
      // Update likes in both organized blogs and featured blogs
      setBlogsByTopic(prev => prev.map(topicGroup => ({
        ...topicGroup,
        blogs: topicGroup.blogs.map(blog => 
          blog._id === blogId ? { ...blog, likes: response.data.likes } : blog
        )
      })));
      
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

  const handleRetry = useCallback(() => {
    setError(null);
    fetchOrganizedBlogs();
  }, [fetchOrganizedBlogs]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            JavaScript Blogs
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Explore our collection of JavaScript articles, tutorials, and insights organized by topic. 
            From beginner concepts to advanced techniques, find everything you need to master JavaScript.
          </p>
        </motion.div>

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

        {/* Latest Articles Section */}
        {!loading && !error && featuredBlogs.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Latest Articles
              </h2>
              <Link
                to="/blogs"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                View all articles →
              </Link>
            </div>
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
          </motion.section>
        )}

                {/* Topic-wise Blog Sections */}
        {!loading && !error && blogsByTopic.length > 0 && (
          <div className="space-y-16">
            {blogsByTopic.map((topicGroup, topicIndex) => (
              <motion.section
                key={topicGroup.topic}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + topicIndex * 0.1 }}
                className="topic-section"
              >
                {/* Topic Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${topicInfo[topicGroup.topic]?.color} text-white text-xl`}>
                      {topicInfo[topicGroup.topic]?.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {topicInfo[topicGroup.topic]?.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {topicGroup.totalCount} articles
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/blogs/${topicGroup.topic}`}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    View all {topicInfo[topicGroup.topic]?.title} articles →
                  </Link>
                </div>

                {/* Topic Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-3xl">
                  {topicInfo[topicGroup.topic]?.description}
                </p>

                {/* Blogs Grid */}
                {topicGroup.blogs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topicGroup.blogs.map((blog, blogIndex) => (
                      <motion.div
                        key={blog._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + topicIndex * 0.1 + blogIndex * 0.1 }}
                      >
                        <BlogCard blog={blog} onLike={handleLike} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-4">📝</div>
                    <p className="text-gray-600 dark:text-gray-400">
                      No {topicInfo[topicGroup.topic]?.title} articles yet.
                    </p>
                  </div>
                )}
              </motion.section>
            ))}
          </div>
        )}

        {/* Empty State - No blogs at all */}
        {!loading && !error && blogsByTopic.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No articles available yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Be the first to write an article!
            </p>
            <Link
              to="/admin-blog-manager"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Write an Article
            </Link>
          </motion.div>
        )}

        {/* Topic Cards for Quick Navigation */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Browse by Topic
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic, index) => (
              <motion.div
                key={topic}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <Link
                  to={`/blogs/${topic}`}
                  className="block group"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 h-full">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${topicInfo[topic]?.color} text-white text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                      {topicInfo[topic]?.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {topicInfo[topic]?.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {topicInfo[topic]?.description}
                    </p>
                    <div className="mt-4 text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
                      Explore articles →
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Blogs; 