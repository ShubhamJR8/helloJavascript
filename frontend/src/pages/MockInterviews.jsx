import { useState } from "react";
import { FaCalendarAlt, FaMoneyBillWave, FaVideo, FaComments } from "react-icons/fa";

const MockInterviews = () => {
  const [formData, setFormData] = useState({
    topic: "React",
    difficulty: "Intermediate",
    date: "",
    time: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = () => {
    alert("Redirecting to payment gateway...");
    // Integrate Stripe/Razorpay API here
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold text-teal-400 flex items-center gap-2">
        <FaComments /> Mock Interviews & Feedback Report
      </h1>

      <div className="mt-8 p-6 bg-gray-800 rounded-xl shadow-lg w-3/4 text-center">
        <h2 className="text-2xl font-semibold">Book Your Mock Interview</h2>
        <div className="mt-4 flex flex-col gap-4">
          <select name="topic" value={formData.topic} onChange={handleChange} className="p-3 rounded-lg bg-gray-700">
            <option value="React">React</option>
            <option value="Node.js">Node.js</option>
            <option value="System Design">System Design</option>
          </select>

          <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="p-3 rounded-lg bg-gray-700">
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <input type="date" name="date" value={formData.date} onChange={handleChange} className="p-3 rounded-lg bg-gray-700" />
          <input type="time" name="time" value={formData.time} onChange={handleChange} className="p-3 rounded-lg bg-gray-700" />

          <button onClick={handlePayment} className="mt-4 px-6 py-3 bg-teal-500 text-white text-lg font-semibold rounded-lg hover:bg-teal-600 flex items-center gap-2">
            <FaMoneyBillWave /> Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockInterviews;
