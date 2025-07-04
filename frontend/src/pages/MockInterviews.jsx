import { useState, useEffect } from "react";
import { FaCalendarAlt, FaMoneyBillWave, FaVideo, FaComments, FaUser, FaStar, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { getAvailableInterviewers, createInterviewBooking } from "../apis/interviewApi.js";
import { useAuth } from "../contexts/AuthContext.jsx";

const MockInterviews = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    topic: "React",
    difficulty: "Intermediate",
    date: "",
    time: "",
    interviewerId: "",
    specialRequirements: "",
    notes: ""
  });

  const [availableInterviewers, setAvailableInterviewers] = useState([]);
  const [selectedInterviewer, setSelectedInterviewer] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fetch available interviewers when topic or difficulty changes
  useEffect(() => {
    if (formData.topic && formData.difficulty) {
      fetchAvailableInterviewers();
    }
  }, [formData.topic, formData.difficulty]);

  const fetchAvailableInterviewers = async () => {
    setLoading(true);
    setError("");
    
    try {
      const result = await getAvailableInterviewers(formData.topic, formData.difficulty);
      
      if (result.success) {
        setAvailableInterviewers(result.data);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("Failed to fetch available interviewers");
    } finally {
      setLoading(false);
    }
  };

  const handleInterviewerSelect = (interviewer) => {
    setSelectedInterviewer(interviewer);
    setFormData({ ...formData, interviewerId: interviewer._id });
    setCurrentStep(3);
  };

  const handleBooking = async () => {
    if (!formData.interviewerId || !formData.date || !formData.time) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const scheduledDate = new Date(`${formData.date}T${formData.time}`);
      
      const bookingData = {
        interviewerId: formData.interviewerId,
        topic: formData.topic,
        difficulty: formData.difficulty,
        scheduledDate: scheduledDate.toISOString(),
        specialRequirements: formData.specialRequirements,
        notes: formData.notes
      };

      const result = await createInterviewBooking(bookingData);
      
      if (result.success) {
        setSuccess("Interview booked successfully! You will receive a confirmation email shortly.");
        setCurrentStep(4);
        // Reset form
        setFormData({
          topic: "React",
          difficulty: "Intermediate",
          date: "",
          time: "",
          interviewerId: "",
          specialRequirements: "",
          notes: ""
        });
        setSelectedInterviewer(null);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("Failed to book interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="mt-8 p-6 bg-gray-800 rounded-xl shadow-lg w-3/4 text-center">
      <h2 className="text-2xl font-semibold mb-6">Step 1: Choose Your Interview Topic</h2>
      <div className="flex flex-col gap-4">
        <select name="topic" value={formData.topic} onChange={handleChange} className="p-3 rounded-lg bg-gray-700">
          <option value="React">React</option>
          <option value="Node.js">Node.js</option>
          <option value="System Design">System Design</option>
          <option value="JavaScript">JavaScript</option>
          <option value="Python">Python</option>
          <option value="Java">Java</option>
          <option value="Data Structures">Data Structures</option>
          <option value="Algorithms">Algorithms</option>
        </select>

        <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="p-3 rounded-lg bg-gray-700">
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <button 
          onClick={() => setCurrentStep(2)} 
          className="mt-4 px-6 py-3 bg-teal-500 text-white text-lg font-semibold rounded-lg hover:bg-teal-600 transition-colors"
        >
          Find Available Interviewers
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="mt-8 p-6 bg-gray-800 rounded-xl shadow-lg w-3/4">
      <h2 className="text-2xl font-semibold mb-6 text-center">Step 2: Choose Your Interviewer</h2>
      
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4">Finding available interviewers...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-600 text-white p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {!loading && availableInterviewers.length === 0 && !error && (
        <div className="text-center py-8">
          <p className="text-gray-400">No interviewers available for this topic and difficulty level.</p>
          <button 
            onClick={() => setCurrentStep(1)} 
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Try Different Options
          </button>
        </div>
      )}

      {!loading && availableInterviewers.length > 0 && (
        <div className="grid gap-4">
          {availableInterviewers.map((interviewer) => (
            <div key={interviewer._id} className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                    <FaUser className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{interviewer.user.name}</h3>
                    <p className="text-gray-400">{interviewer.profile.currentRole} at {interviewer.profile.company}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1 text-sm">
                        <FaStar className="text-yellow-500" />
                        {interviewer.stats.averageRating.toFixed(1)} ({interviewer.stats.totalReviews} reviews)
                      </span>
                      <span className="flex items-center gap-1 text-sm">
                        <FaClock className="text-blue-500" />
                        {interviewer.stats.totalInterviews} interviews
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-teal-400">
                    ${interviewer.pricing.amount}
                  </div>
                  <div className="text-sm text-gray-400">per hour</div>
                  <button 
                    onClick={() => handleInterviewerSelect(interviewer)}
                    className="mt-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                  >
                    Select
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="mt-8 p-6 bg-gray-800 rounded-xl shadow-lg w-3/4">
      <h2 className="text-2xl font-semibold mb-6 text-center">Step 3: Schedule Your Interview</h2>
      
      {selectedInterviewer && (
        <div className="bg-gray-700 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-lg mb-2">Selected Interviewer</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
              <FaUser className="text-white text-xl" />
            </div>
            <div>
              <p className="font-semibold">{selectedInterviewer.user.name}</p>
              <p className="text-gray-400">{selectedInterviewer.profile.currentRole} at {selectedInterviewer.profile.company}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <input 
            type="date" 
            name="date" 
            value={formData.date} 
            onChange={handleChange} 
            className="p-3 rounded-lg bg-gray-700"
            min={new Date().toISOString().split('T')[0]}
          />
          <input 
            type="time" 
            name="time" 
            value={formData.time} 
            onChange={handleChange} 
            className="p-3 rounded-lg bg-gray-700"
          />
        </div>

        <textarea 
          name="specialRequirements" 
          value={formData.specialRequirements} 
          onChange={handleChange} 
          placeholder="Any special requirements or preferences?"
          className="p-3 rounded-lg bg-gray-700 h-20 resize-none"
        />

        <textarea 
          name="notes" 
          value={formData.notes} 
          onChange={handleChange} 
          placeholder="Additional notes for the interviewer"
          className="p-3 rounded-lg bg-gray-700 h-20 resize-none"
        />

        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button 
            onClick={() => setCurrentStep(2)} 
            className="flex-1 px-6 py-3 bg-gray-600 text-white text-lg font-semibold rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back
          </button>
          <button 
            onClick={handleBooking}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-teal-500 text-white text-lg font-semibold rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Booking..." : `Book Interview - $${selectedInterviewer?.pricing?.amount || 0}`}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="mt-8 p-6 bg-gray-800 rounded-xl shadow-lg w-3/4 text-center">
      <div className="text-green-400 text-6xl mb-4">✓</div>
      <h2 className="text-2xl font-semibold mb-4">Interview Booked Successfully!</h2>
      <p className="text-gray-400 mb-6">{success}</p>
      <button 
        onClick={() => setCurrentStep(1)} 
        className="px-6 py-3 bg-teal-500 text-white text-lg font-semibold rounded-lg hover:bg-teal-600 transition-colors"
      >
        Book Another Interview
      </button>
    </div>
  );

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold text-teal-400 flex items-center gap-2">
        <FaComments /> Mock Interviews & Feedback Report
      </h1>

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}
    </div>
  );
};

export default MockInterviews;
