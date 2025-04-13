import { useState, useEffect } from 'react';
import { getQuizAnalytics } from '../apis/quizApi';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await getQuizAnalytics();
        if (response.success) {
          setAnalytics(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch analytics');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
          <p className="mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-teal-400 mb-8">Quiz Analytics</h1>
        
        {analytics.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <p className="text-gray-300">No quiz attempts found. Start taking quizzes to see your analytics!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {analytics.map((topicAnalytics) => (
              <div key={topicAnalytics._id} className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-teal-400 mb-4 capitalize">
                  {topicAnalytics._id}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Total Attempts</p>
                    <p className="text-2xl font-bold">{topicAnalytics.totalAttempts}</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Average Score</p>
                    <p className="text-2xl font-bold">
                      {Math.round(topicAnalytics.averageScore)}%
                    </p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Highest Score</p>
                    <p className="text-2xl font-bold">
                      {Math.round(topicAnalytics.highestScore)}%
                    </p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Success Rate</p>
                    <p className="text-2xl font-bold">
                      {Math.round((topicAnalytics.correctAnswers / topicAnalytics.totalQuestions) * 100)}%
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-400">
                    Total Questions: {topicAnalytics.totalQuestions}
                  </p>
                  <p className="text-sm text-gray-400">
                    Correct Answers: {topicAnalytics.correctAnswers}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;