import { motion } from 'framer-motion';

const UnderDevelopment = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[60vh] flex items-center justify-center p-4"
    >
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 text-center border border-gray-700/50">
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-teal-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Feature Under Development</h2>
        <p className="text-gray-300 mb-6">
          We're working hard to bring you this feature. It will be available soon!
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            In the meantime, feel free to explore our other completed features.
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="/"
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Return Home
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UnderDevelopment; 