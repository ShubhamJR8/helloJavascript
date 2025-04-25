import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Blogs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 rounded-xl p-8 shadow-lg"
        >
          <h1 className="text-3xl font-bold text-teal-400 mb-6">JavaScript Blogs</h1>
          
          <div className="space-y-6">
            <div className="bg-gray-700/50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-teal-300 mb-4">Featured Articles</h2>
              <p className="text-gray-300 mb-4">
                Explore our collection of JavaScript articles and tutorials.
                This feature is coming soon.
              </p>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { 
                    title: 'Understanding JavaScript Closures',
                    author: 'John Doe',
                    date: 'Coming soon',
                    category: 'Advanced Concepts'
                  },
                  { 
                    title: 'Modern JavaScript Best Practices',
                    author: 'Jane Smith',
                    date: 'Coming soon',
                    category: 'Best Practices'
                  },
                  { 
                    title: 'Async/Await vs Promises',
                    author: 'Mike Johnson',
                    date: 'Coming soon',
                    category: 'Asynchronous Programming'
                  }
                ].map((blog) => (
                  <div key={blog.title} className="bg-gray-600/50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-teal-200">{blog.title}</h3>
                        <p className="text-gray-400 text-sm mt-1">
                          By {blog.author} • {blog.date}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-teal-500/20 text-teal-400 rounded text-sm">
                        {blog.category}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">Coming soon</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-700/50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-teal-300 mb-4">Categories</h2>
              <div className="flex flex-wrap gap-2">
                {['Advanced Concepts', 'Best Practices', 'Tutorials', 'Tips & Tricks', 'Case Studies'].map((category) => (
                  <span key={category} className="px-3 py-1 bg-gray-600/50 text-gray-300 rounded-full text-sm">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Blogs; 