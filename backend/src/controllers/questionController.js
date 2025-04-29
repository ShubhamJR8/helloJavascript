import Question from "../models/Question.js";

// Create a new question
export const createQuestion = async (req, res) => {
  try {
    const data = req.body;

    if (Array.isArray(data)) {
      // Handle array of questions
      const questions = await Question.insertMany(data);
      res.status(201).json({
        success: true,
        message: "Questions created",
        questions,
      });
    } else {
      // Handle single question
      const question = new Question(data);
      await question.save();
      res.status(201).json({
        success: true,
        message: "Question created",
        question,
      });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all questions (with optional filters)
export const getAllQuestions = async (req, res) => {
  try {
    console.log("Incoming request to getAllQuestions");
    console.log("Query parameters:", req.query);

    const { topic, type, difficulty } = req.query;
    const filter = {};
    if (topic) filter.topic = topic;
    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;

    console.log("Applied filter:", filter);
    console.log("Applied difficulty:", difficulty)

    const questions = await Question.find(filter);

    console.log(`Fetched ${questions.length} questions`);
    res.status(200).json({ success: true, questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


// Get a question by ID
export const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: "Question not found" });

    res.status(200).json({ success: true, question });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update a question
export const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!question) return res.status(404).json({ success: false, message: "Question not found" });

    res.status(200).json({ success: true, message: "Question updated", question });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete a question
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: "Question not found" });

    res.status(200).json({ success: true, message: "Question deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get question count by topic and difficulty
export const getQuestionsCountByTopic = async (req, res) => {
  try {
    const counts = await Question.aggregate([
      {
        $group: {
          _id: {
            topic: "$topic",
            difficulty: "$difficulty"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.topic",
          difficulties: {
            $push: {
              difficulty: "$_id.difficulty",
              count: "$count"
            }
          },
          total: { $sum: "$count" }
        }
      },
      {
        $project: {
          topic: "$_id",
          difficulties: 1,
          total: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: counts
    });
  } catch (error) {
    console.error("Error fetching question counts:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
