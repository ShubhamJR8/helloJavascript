import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import BlogCard from './BlogCard';

const TopicOverview = ({ topic, blogs, featuredBlogs, topBlogs, popularTags }) => {
  const topicInfo = {
    javascript: {
      title: "JavaScript",
      description: "Master the fundamentals and advanced concepts of JavaScript. From ES6+ features to modern frameworks, explore everything you need to become a JavaScript expert.",
      icon: "⚡",
      color: "bg-yellow-500",
      gradient: "from-yellow-400 to-orange-500"
    },
    typescript: {
      title: "TypeScript",
      description: "Take your JavaScript skills to the next level with TypeScript. Learn type safety, interfaces, generics, and advanced TypeScript patterns.",
      icon: "🔷",
      color: "bg-blue-500",
      gradient: "from-blue-400 to-indigo-500"
    },
    react: {
      title: "React",
      description: "Build modern user interfaces with React. Master hooks, state management, performance optimization, and React ecosystem tools.",
      icon: "⚛️",
      color: "bg-cyan-500",
      gradient: "from-cyan-400 to-blue-500"
    },
    angular: {
      title: "Angular",
      description: "Create scalable applications with Angular. Learn components, services, dependency injection, and Angular's powerful CLI.",
      icon: "🅰️",
      color: "bg-red-500",
      gradient: "from-red-400 to-pink-500"
    },
    node: {
      title: "Node.js",
      description: "Build server-side applications with Node.js. Master Express.js, REST APIs, authentication, and backend development patterns.",
      icon: "🟢",
      color: "bg-green-500",
      gradient: "from-green-400 to-emerald-500"
    }
  };

  const currentTopic = topicInfo[topic] || {
    title: topic.charAt(0).toUpperCase() + topic.slice(1),
    description: `Explore the latest articles and tutorials about ${topic}.`,
    icon: "📚",
    color: "bg-gray-500",
    gradient: "from-gray-400 to-gray-500"
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Topic Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${currentTopic.color} text-white text-3xl mb-6`}>
            {currentTopic.icon}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {currentTopic.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            {currentTopic.description}
          </p>
          
          {/* Popular Tags */}
          {popularTags && popularTags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {popularTags.slice(0, 8).map((tag, index) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="px-3 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  #{tag}
                </motion.span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Featured Blogs Section */}
        {featuredBlogs && featuredBlogs.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Featured {currentTopic.title} Articles
              </h2>
              <Link
                to={`/blogs/${topic}?featured=true`}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                View all featured →
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
                  <BlogCard blog={blog} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Top Blogs This Month */}
        {topBlogs && topBlogs.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Top {currentTopic.title} Articles This Month
              </h2>
              <Link
                to={`/blogs/${topic}?sort=popular`}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                View all popular →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topBlogs.map((blog, index) => (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <BlogCard blog={blog} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* All Blogs Section */}
        {blogs && blogs.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Latest {currentTopic.title} Articles
              </h2>
              <Link
                to={`/blogs/${topic}?sort=newest`}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                View all articles →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.slice(0, 6).map((blog, index) => (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <BlogCard blog={blog} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Empty State */}
        {(!blogs || blogs.length === 0) && (!featuredBlogs || featuredBlogs.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No {currentTopic.title} articles yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Be the first to write about {currentTopic.title}!
            </p>
            <Link
              to="/admin/blogs"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Write an Article
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TopicOverview; 