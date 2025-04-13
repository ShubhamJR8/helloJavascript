import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getQuizAttemptDetails } from "../apis/quizApi";

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { attemptId: urlAttemptId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        setError(null);

        // First try to get data from location state
        if (location.state) {
          setResult(location.state);
          setLoading(false);
          return;
        }

        // If no state, fetch from API using URL attemptId
        if (urlAttemptId) {
          const response = await getQuizAttemptDetails(urlAttemptId);
          if (response.success) {
            setResult({
              totalScore: response.data.totalScore,
              correctAnswers: response.data.correctAnswers,
              attemptId: response.data._id,
              topic: response.data.topic,
              difficulty: response.data.difficulty,
              timeTaken: response.data.timeTaken,
              questions: response.data.questions
            });
          } else {
            throw new Error(response.message || "Failed to fetch result");
          }
        } else {
          throw new Error("No attempt ID found");
        }
      } catch (error) {
        console.error("Error fetching result:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [location.state, urlAttemptId]);

  const handleRetryQuiz = () => {
    if (result?.topic && result?.difficulty) {
      navigate(`/quiz/${result.topic}/${result.difficulty}`);
    }
  };

  const handleViewAnalytics = () => {
    navigate('/analytics');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4">Loading result...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
          <p className="mb-4">{error || "Invalid result"}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold text-teal-400 mb-4">Quiz Completed!</h1>
      
      <div className="bg-gray-800 p-6 rounded-xl shadow-md text-center w-full max-w-md mb-6">
        <p className="text-xl font-semibold mb-2">Total Score: {result.totalScore}%</p>
        <p className="text-lg mb-2">Correct Answers: {result.correctAnswers}</p>
        {result.timeTaken && (
          <p className="text-lg mb-2">Time Taken: {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s</p>
        )}
        <p className="text-sm text-gray-400 mb-4">
          Topic: {result.topic} | Difficulty: {result.difficulty}
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <button
          onClick={handleRetryQuiz}
          className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
        >
          Retry Quiz
        </button>
        <button
          onClick={handleViewAnalytics}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          View Analytics
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default ResultPage;
