import React, { useState, useEffect } from 'react';
import { getQuizAnalytics } from '../apis/quizApi';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, Typography, Grid, CircularProgress, Alert } from '@mui/material';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await getQuizAnalytics();
        
        if (!response.success) {
          throw new Error(response.message);
        }

        setAnalytics(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setAnalytics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <Alert severity="error" className="mt-2">
        {error}
      </Alert>
    );
  }

  if (!analytics || analytics.length === 0) {
    return (
      <Alert severity="info" className="mt-15">
        No analytics data available yet. Complete some quizzes to see your performance.
      </Alert>
    );
  }

  return (
    <div className="p-5 pt-24">
      <Typography variant="h4" className="mb-4">
        Quiz Analytics
      </Typography>
      
      <Grid container spacing={3}>
        {analytics.map((topic) => (
          <Grid item xs={12} md={6} key={topic._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" className="mb-4">
                  {topic._id}
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[topic]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="averageScore" name="Average Score" fill="#8884d8" />
                    <Bar dataKey="highestScore" name="Highest Score" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
                <Typography variant="body2" className="text-gray-500">
                  Total Attempts: {topic.totalAttempts}
                </Typography>
                <Typography variant="body2" className="text-gray-500">
                  Success Rate: {topic.successRate}%
                </Typography>
                <Typography variant="body2" className="text-gray-500">
                  Average Time per Question: {topic.averageTimePerQuestion} seconds
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default AnalyticsPage;
