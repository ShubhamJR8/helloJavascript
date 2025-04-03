import express from "express";
import { registerUser, loginUser, getUserProfile, getUserById, getAllUsers, deleteUser, updateUserProfile } from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// User Authentication Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// User Profile Routes
router
  .route("/profile")
  .get(authMiddleware, getUserProfile);

// Routes for User Operations
router
  .route("/:id")
  .get(authMiddleware, getUserById)
  .put(authMiddleware, updateUserProfile)
  .delete(authMiddleware, deleteUser);

router
  .route("/")
  .get(authMiddleware, getAllUsers);


export default router;
