import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Eye, Clock, User } from 'lucide-react';

const BlogCard = ({ blog, onLike, showActions = true }) => {
  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLike) {
      await onLike(blog._id);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group"
    >
      {blog.coverImage && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {blog.featured && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Featured
            </div>
          )}
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
            {blog.category}
          </span>
          {!blog.published && (
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
              Draft
            </span>
          )}
        </div>

        <Link to={`/blog/${blog.slug}`} className="block">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
            {blog.title}
          </h3>
        </Link>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {blog.excerpt}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User size={14} />
              <span>{blog.author?.name || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{blog.readTime} min read</span>
            </div>
          </div>
          <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
        </div>

        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {blog.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
              >
                #{tag}
              </span>
            ))}
            {blog.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                +{blog.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                <Heart size={16} />
                <span>{blog.likes || 0}</span>
              </button>
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <Eye size={16} />
                <span>{blog.views || 0}</span>
              </div>
            </div>
            <Link
              to={`/blog/${blog.slug}`}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm transition-colors"
            >
              Read More →
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BlogCard; 