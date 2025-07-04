import api from './api.js';

// Get available interviewers for a topic and difficulty
export const getAvailableInterviewers = async (topic, difficulty, date = null) => {
  try {
    const params = new URLSearchParams({ topic, difficulty });
    if (date) params.append('date', date);

    const response = await api.get(`/interviews/interviewers/available?${params}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch available interviewers');
    }

    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch available interviewers',
      error: error.message
    };
  }
};

// Create a new interview booking
export const createInterviewBooking = async (bookingData) => {
  try {
    const response = await api.post('/interviews/bookings', bookingData);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create interview booking');
    }

    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create interview booking',
      error: error.message
    };
  }
};

// Get user's interview bookings
export const getUserBookings = async (status = null, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append('status', status);

    const response = await api.get(`/interviews/bookings?${params}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch bookings');
    }

    return {
      success: true,
      data: response.data.data,
      pagination: response.data.pagination
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch bookings',
      error: error.message
    };
  }
};

// Get booking details
export const getBookingDetails = async (bookingId) => {
  try {
    const response = await api.get(`/interviews/bookings/${bookingId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch booking details');
    }

    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch booking details',
      error: error.message
    };
  }
};

// Cancel interview booking
export const cancelBooking = async (bookingId, reason) => {
  try {
    const response = await api.patch(`/interviews/bookings/${bookingId}/cancel`, { reason });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to cancel booking');
    }

    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to cancel booking',
      error: error.message
    };
  }
};

// Get interviewer's bookings
export const getInterviewerBookings = async (status = null, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append('status', status);

    const response = await api.get(`/interviews/interviewer/bookings?${params}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch interviewer bookings');
    }

    return {
      success: true,
      data: response.data.data,
      pagination: response.data.pagination
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch interviewer bookings',
      error: error.message
    };
  }
};

// Update booking status (for interviewers)
export const updateBookingStatus = async (bookingId, status, meetingLink = null) => {
  try {
    const updateData = { status };
    if (meetingLink) updateData.meetingLink = meetingLink;

    const response = await api.patch(`/interviews/bookings/${bookingId}/status`, updateData);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update booking status');
    }

    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update booking status',
      error: error.message
    };
  }
};

// Submit interview feedback (for interviewers)
export const submitFeedback = async (feedbackData) => {
  try {
    const response = await api.post('/interviews/feedback', feedbackData);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to submit feedback');
    }

    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to submit feedback',
      error: error.message
    };
  }
};

// Get feedback for a specific booking
export const getFeedbackForBooking = async (bookingId) => {
  try {
    const response = await api.get(`/interviews/feedback/booking/${bookingId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch feedback');
    }

    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch feedback',
      error: error.message
    };
  }
};

// Get user's feedback history
export const getUserFeedbackHistory = async (page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams({ page, limit });
    const response = await api.get(`/interviews/feedback/history?${params}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch feedback history');
    }

    return {
      success: true,
      data: response.data.data,
      pagination: response.data.pagination
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch feedback history',
      error: error.message
    };
  }
};

// Get interviewer's feedback submissions
export const getInterviewerFeedbackHistory = async (page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams({ page, limit });
    const response = await api.get(`/interviews/feedback/interviewer/history?${params}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch interviewer feedback history');
    }

    return {
      success: true,
      data: response.data.data,
      pagination: response.data.pagination
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch interviewer feedback history',
      error: error.message
    };
  }
};

// Update feedback (for interviewers)
export const updateFeedback = async (feedbackId, updateData) => {
  try {
    const response = await api.put(`/interviews/feedback/${feedbackId}`, updateData);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update feedback');
    }

    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update feedback',
      error: error.message
    };
  }
};

// Get feedback analytics for user
export const getFeedbackAnalytics = async () => {
  try {
    const response = await api.get('/interviews/feedback/analytics');
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch feedback analytics');
    }

    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch feedback analytics',
      error: error.message
    };
  }
}; 