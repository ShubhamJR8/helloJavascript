import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  getUserById,
  getAllUsers,
  deleteUser,
  updateUserProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

// Routes for User Operations
router
  .route("/:id")
  .get(protect, getUserById)
  .delete(protect, deleteUser);

router
  .route("/")
  .get(protect, getAllUsers);

export default router;
