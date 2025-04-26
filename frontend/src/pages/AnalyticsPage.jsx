import React, { useState, useEffect } from 'react';
import { getQuizAnalytics } from '../apis/quizApi';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Typography, Card, CardContent, Grid, CircularProgress, Alert, LinearProgress, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { FaChartLine, FaTrophy, FaClock, FaCheckCircle, FaChevronDown } from 'react-icons/fa';

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
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 pt-24">
        <Alert severity="error">{error}</Alert>
      </div>
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
          <Grid item xs={12} key={topic._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" className="mb-4">
                  {topic._id}
                </Typography>
                
                <Box className="mb-4">
                  <Typography variant="body1" className="mb-2">
                    <FaChartLine className="inline mr-2" /> Total Attempts: {topic.totalAttempts}
                  </Typography>
                  <LinearProgress variant="determinate" value={topic.totalAttempts} className="mb-2" />
                </Box>

                <Box className="mb-4">
                  <Typography variant="body1" className="mb-2">
                    <FaTrophy className="inline mr-2" /> Average Score: {topic.averageScore}%
                  </Typography>
                  <LinearProgress variant="determinate" value={topic.averageScore} className="mb-2" />
                </Box>

                <Box className="mb-4">
                  <Typography variant="body1" className="mb-2">
                    <FaTrophy className="inline mr-2" /> Highest Score: {topic.highestScore}%
                  </Typography>
                  <LinearProgress variant="determinate" value={topic.highestScore} className="mb-2" />
                </Box>

                <Box className="mb-4">
                  <Typography variant="body1" className="mb-2">
                    <FaCheckCircle className="inline mr-2" /> Success Rate: {topic.successRate}%
                  </Typography>
                  <LinearProgress variant="determinate" value={topic.successRate} className="mb-2" />
                </Box>

                <Accordion>
                  <AccordionSummary expandIcon={<FaChevronDown />}>
                    <Typography>Difficulty Breakdown</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {(topic.difficulties || []).map((diff) => (
                        <Grid item xs={12} md={4} key={diff.difficulty}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle1" className="mb-2">
                                {diff.difficulty.charAt(0).toUpperCase() + diff.difficulty.slice(1)}
                              </Typography>
                              <Typography variant="body2">
                                Attempts: {diff.totalAttempts}
                              </Typography>
                              <Typography variant="body2">
                                Average Score: {diff.averageScore}%
                              </Typography>
                              <Typography variant="body2">
                                Highest Score: {diff.highestScore}%
                              </Typography>
                              <Typography variant="body2">
                                Success Rate: {diff.successRate}%
                              </Typography>
                              <Typography variant="body2">
                                Avg Time/Question: {diff.averageTimePerQuestion}s
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default AnalyticsPage;
