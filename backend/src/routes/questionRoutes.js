import express from "express";
import { 
  createQuestion, 
  getAllQuestions, 
  getQuestionById, 
  updateQuestion, 
  deleteQuestion,
  getQuestionsCountByTopic
} from "../controllers/questionController.js";

const router = express.Router();

router.post("/", createQuestion);
router.get("/", getAllQuestions);
router.get("/count", getQuestionsCountByTopic);
router.get("/:id", getQuestionById);
router.put("/:id", updateQuestion);
router.delete("/:id", deleteQuestion);

export default router;
