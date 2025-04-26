import React, { useState, useEffect } from 'react';
import { getQuizAnalytics } from '../apis/quizApi';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import RadialProgress from '../components/RadialProgress';

const DIFFICULTY_COLORS = {
  easy: '#3ec6e0',
  medium: '#ffb547',
  hard: '#ff4c4c',
};

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await getQuizAnalytics();
        if (response.success) {
          setAnalytics(response.data);
        } else {
          setError(response.message || "Failed to fetch analytics");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
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

  if (!analytics || analytics.length === 0) {
    return (
      <div className="mt-24 flex justify-center">
        <div className="bg-gray-800 text-white px-6 py-4 rounded-lg shadow-lg text-lg">
          No analytics data available yet. Complete some quizzes to see your performance.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-10 min-h-screen bg-gray-900 pt-24 pb-10">
      {analytics.map((topic) => {
        const totalSolved = topic.correctAnswers || 0;
        const totalQuestions = topic.totalQuestions || 0;
        const totalAttempts = topic.totalAttempts || 0;
        const attempting = (topic.totalAttempts - topic.completedAttempts) || 0;
        const topicName = topic._id.charAt(0).toUpperCase() + topic._id.slice(1);

        // Difficulty breakdown
        const difficultyStats = [
          { label: 'Easy', key: 'easy', color: DIFFICULTY_COLORS.easy },
          { label: 'Med.', key: 'medium', color: DIFFICULTY_COLORS.medium },
          { label: 'Hard', key: 'hard', color: DIFFICULTY_COLORS.hard },
        ].map(diff => {
          const found = (topic.difficulties || []).find(d => d.difficulty === diff.key) || {};
          return {
            ...diff,
            solved: found.correctAnswers || 0,
            total: found.totalQuestions || 0,
          };
        });

        return (
          <div key={topic._id} className="flex flex-col md:flex-row items-center bg-[#23272f] rounded-2xl shadow-xl p-8 min-w-[320px] gap-8 relative">
            {/* Donut Progress */}
            <div className="relative flex flex-col items-center justify-center">
              <RadialProgress value={totalSolved} max={totalQuestions} color="#3ec6e0" size={160} centerText={totalAttempts} />
              <div className="absolute left-1/2 top-[72%] -translate-x-1/2 text-gray-400 text-md font-semibold whitespace-nowrap">
                <span className="text-teal-400">{attempting}</span> Attempting
              </div>
            </div>
            {/* Difficulty Breakdown */}
            <div className="flex flex-col gap-4 min-w-[180px]">
              <div className="text-xl font-bold text-white mb-2 text-center md:text-left">{topicName}</div>
              {difficultyStats.map(diff => (
                <div key={diff.key} className="flex items-center justify-between bg-[#23272f] rounded-xl px-6 py-3 shadow-lg">
                  <span className="font-bold text-lg" style={{ color: diff.color }}>{diff.label}</span>
                  <span className="font-mono text-white text-lg">
                    {diff.solved}<span className="text-gray-400">/{diff.total}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnalyticsPage;
