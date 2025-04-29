import React, { useState, useEffect } from 'react';
import { getQuizAnalytics, getQuestionsCountByTopic } from '../apis/quizApi';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import RadialProgress from '../components/RadialProgress';
import { topics, difficulties } from '../utils/constants';

const DIFFICULTY_COLORS = {
  easy: '#3ec6e0',
  medium: '#ffb547',
  hard: '#ff4c4c',
};

const TOPIC_COLORS = {
  javascript: '#f7df1e',
  typescript: '#3178c6',
  react: '#61dafb',
  angular: '#dd0031',
  node: '#68a063'
};

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load

    if (!user) {
      navigate('/login');
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const [analyticsResponse, questionsResponse] = await Promise.all([
          getQuizAnalytics(),
          getQuestionsCountByTopic()
        ]);
        
        if (analyticsResponse.success && questionsResponse.success) {
          // Initialize analytics for all topics
          const processedAnalytics = topics.map(topicId => {
            const topicAnalytics = analyticsResponse.data.find(a => a._id === topicId) || {
              _id: topicId,
              difficulties: [],
              totalAttempts: 0,
              totalCorrectAnswers: 0,
              totalQuestions: 0
            };

            const topicQuestions = questionsResponse.data.find(q => q.topic === topicId);
            
            // Get difficulty-wise counts
            const difficultyCounts = {};
            const difficultyCorrectAnswers = {};
            
            // Initialize with 0 for all difficulties
            difficulties.forEach(diff => {
              difficultyCounts[diff] = 0;
              difficultyCorrectAnswers[diff] = 0;
            });
            
            if (topicQuestions) {
              topicQuestions.difficulties.forEach(diff => {
                difficultyCounts[diff.difficulty] = diff.count;
              });
            }

            // Get correct answers from analytics
            if (topicAnalytics.difficulties) {
              topicAnalytics.difficulties.forEach(diff => {
                difficultyCorrectAnswers[diff.difficulty] = diff.correctAnswers || 0;
              });
            }

            return {
              ...topicAnalytics,
              name: topicId.charAt(0).toUpperCase() + topicId.slice(1),
              color: TOPIC_COLORS[topicId],
              difficultyCounts,
              difficultyCorrectAnswers,
              totalQuestions: topicQuestions ? topicQuestions.total : 0
            };
          });

          setAnalytics(processedAnalytics);
        } else {
          setError(analyticsResponse.message || questionsResponse.message || "Failed to fetch analytics");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 pt-24">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 text-center text-red-400 font-bold">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-10 px-4">
      <h1 className="text-3xl font-bold text-white text-center mb-8">Learning Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {analytics.map((topic) => {
          const totalSolved = topic.totalCorrectAnswers || 0;
          const totalQuestions = topic.totalQuestions || 0;
          const totalAttempts = topic.totalAttempts || 0;

          // Difficulty breakdown
          const difficultyStats = difficulties.map(diff => ({
            label: diff.charAt(0).toUpperCase() + diff.slice(1),
            key: diff,
            color: DIFFICULTY_COLORS[diff],
            solved: topic.difficultyCorrectAnswers[diff] || 0,
            total: topic.difficultyCounts[diff] || 0,
          }));

          return (
            <div key={topic._id} className="bg-[#23272f] rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white" style={{ color: topic.color }}>
                  {topic.name}
                </h2>
                <div className="text-gray-400">
                  {totalAttempts} Attempts
                </div>
              </div>
              
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <RadialProgress 
                    value={totalSolved} 
                    max={totalQuestions} 
                    color={topic.color} 
                    size={140} 
                  />
                </div>
              </div>

              <div className="space-y-3">
                {difficultyStats.map(diff => (
                  <div key={diff.key} className="flex items-center justify-between bg-[#23272f] rounded-xl px-4 py-2 shadow-lg border border-gray-700">
                    <span className="font-bold text-sm" style={{ color: diff.color }}>{diff.label}</span>
                    <span className="font-mono text-white text-sm">
                      {diff.solved}<span className="text-gray-400">/{diff.total}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalyticsPage;
