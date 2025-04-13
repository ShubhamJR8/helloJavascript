import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "employer", "admin"],
      default: "user"
    },
    company: {
      type: String,
      trim: true
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  console.log("=== Password Pre-save Hook ===");
  console.log("Is password modified?", this.isModified("password"));
  
  if (!this.isModified("password")) {
    console.log("Password not modified, skipping hash");
    return next();
  }

  try {
    console.log("Generating salt...");
    const salt = await bcrypt.genSalt(10);
    console.log("Salt generated:", salt);
    
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(this.password, salt);
    console.log("Password hashed successfully");
    console.log("Hashed password length:", hashedPassword.length);
    
    this.password = hashedPassword;
    next();
  } catch (error) {
    console.error("Error in password pre-save hook:", error);
    next(error);
  }
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Compare entered password with stored hash
UserSchema.methods.matchPassword = async function (enteredPassword) {
  console.log("=== Password Comparison ===");
  console.log("Entered password length:", enteredPassword ? enteredPassword.length : 0);
  console.log("Stored password exists:", !!this.password);
  console.log("Stored password length:", this.password ? this.password.length : 0);
  
  if (!enteredPassword || !this.password) {
    console.log("Error: Missing password data");
    return false;
  }

  try {
    console.log("Comparing passwords...");
    console.log("Stored password first 10 chars:", this.password.substring(0, 10));
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log("Password match result:", isMatch);
    return isMatch;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
};

const User = mongoose.model("User", UserSchema);
export default User;
