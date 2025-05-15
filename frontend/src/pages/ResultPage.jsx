import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getQuizAttemptDetails } from "../apis/quizApi";
import toast from "react-hot-toast";

const ResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('ResultPage - Location state:', location.state);
        console.log('ResultPage - Params:', { attemptId });

        // Check if this is a tag-based or category-based quiz result
        if (location.state?.isTagBased || location.state?.isCategoryBased) {
          console.log('ResultPage - Handling tag/category-based quiz result');
          const tagBasedResult = {
            totalScore: location.state.totalScore,
            correctAnswers: location.state.correctAnswers,
            totalQuestions: location.state.totalQuestions,
            tag: location.state.tag || location.state.category,
            isTagBased: location.state.isTagBased,
            isCategoryBased: location.state.isCategoryBased,
            questions: location.state.questions
          };
          console.log('ResultPage - Setting tag/category-based result:', tagBasedResult);
          setResult(tagBasedResult);
          setLoading(false);
          return;
        }

        // Regular quiz result
        if (!attemptId) {
          console.error('ResultPage - No attemptId provided');
          throw new Error("Attempt ID is required");
        }

        console.log('ResultPage - Fetching regular quiz result');
        const response = await getQuizAttemptDetails(attemptId);
        if (!response.success) {
          console.error('ResultPage - Failed to fetch quiz results:', response.message);
          throw new Error(response.message || "Failed to fetch quiz results");
        }

        console.log('ResultPage - Setting regular quiz result:', response.data);
        setResult(response.data);
      } catch (err) {
        console.error("ResultPage - Error fetching result:", err);
        setError(err.message || "Failed to load quiz results");
        toast.error(err.message || "Failed to load quiz results");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId, location.state]);

  const handleRetry = () => {
    if (location.state?.isTagBased || location.state?.isCategoryBased) {
      console.log('ResultPage - Retrying tag/category-based quiz');
      // For tag/category-based quizzes, navigate back to the quiz page
      navigate(`/quiz/${location.state.tag || location.state.category}/mixed`, {
        state: {
          questions: location.state.questions,
          tag: location.state.tag,
          category: location.state.category,
          isTagBased: location.state.isTagBased,
          isCategoryBased: location.state.isCategoryBased
        }
      });
    } else {
      console.log('ResultPage - Retrying regular quiz');
      // For regular quizzes, navigate to the topic selection
      navigate('/');
    }
  };

  const handleViewAnalytics = () => {
    if (location.state?.isTagBased || location.state?.isCategoryBased) {
      console.log('ResultPage - Analytics not available for tag/category-based quiz');
      // For tag/category-based quizzes, show a message that analytics are not available
      toast.error("Analytics are not available for tag/category-based quizzes");
    } else {
      console.log('ResultPage - Navigating to analytics');
      // For regular quizzes, navigate to analytics
      navigate(`/analytics/${attemptId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center text-white">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center text-white">
          <p className="text-gray-400 mb-4">No results found</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 pt-20">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 rounded-xl p-8 shadow-lg"
        >
          <h1 className="text-3xl font-bold text-teal-400 mb-6">Quiz Results</h1>

          <div className="space-y-6">
            <div className="bg-gray-700/50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-teal-300 mb-4">Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-600/50 p-4 rounded-lg">
                  <p className="text-gray-400">Total Score</p>
                  <p className="text-2xl font-bold text-teal-400">{result.totalScore.toFixed(1)}%</p>
                </div>
                <div className="bg-gray-600/50 p-4 rounded-lg">
                  <p className="text-gray-400">Correct Answers</p>
                  <p className="text-2xl font-bold text-teal-400">{result.correctAnswers}/{result.totalQuestions}</p>
                </div>
                <div className="bg-gray-600/50 p-4 rounded-lg">
                  <p className="text-gray-400">Quiz Type</p>
                  <p className="text-2xl font-bold text-teal-400">
                    {location.state?.isTagBased ? 'Tag-based Quiz' : location.state?.isCategoryBased ? 'Category-based Quiz' : 'Regular Quiz'}
                  </p>
                </div>
              </div>
            </div>

            {result.questions && (
              <div className="bg-gray-700/50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-teal-300 mb-4">Question Review</h2>
                <div className="space-y-4">
                  {result.questions.map((question, index) => (
                    <div key={index} className="bg-gray-600/50 p-4 rounded-lg">
                      <p className="text-gray-300 mb-2">{question.question}</p>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Your Answer: {question.userAnswer || 'Not answered'}</p>
                        <p className="text-sm text-gray-400">Correct Answer: {question.correctAnswer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleViewAnalytics}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              View Analytics
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultPage;
