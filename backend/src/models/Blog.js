import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a blog title"],
      trim: true,
      maxlength: [200, "Title cannot be more than 200 characters"]
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    content: {
      type: String,
      required: [true, "Please provide blog content"],
      minlength: [50, "Content must be at least 50 characters long"]
    },
    excerpt: {
      type: String,
      required: [true, "Please provide a blog excerpt"],
      maxlength: [300, "Excerpt cannot be more than 300 characters"]
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide an author"]
    },
    topic: {
      type: String,
      enum: ["javascript", "typescript", "react", "angular", "node"],
      required: [true, "Please provide a topic"]
    },
    category: {
      type: String,
      enum: ["Advanced Concepts", "Best Practices", "Tutorials", "Tips & Tricks", "Case Studies"],
      required: [true, "Please provide a category"]
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    featured: {
      type: Boolean,
      default: false
    },
    published: {
      type: Boolean,
      default: false
    },
    publishedAt: {
      type: Date
    },
    readTime: {
      type: Number,
      default: 5,
      min: [1, "Read time must be at least 1 minute"]
    },
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    coverImage: {
      type: String,
      trim: true
    },
    seoTitle: {
      type: String,
      maxlength: [60, "SEO title cannot be more than 60 characters"]
    },
    seoDescription: {
      type: String,
      maxlength: [160, "SEO description cannot be more than 160 characters"]
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create slug from title before saving
BlogSchema.pre("save", function(next) {
  // Only generate slug if it doesn't exist or title has changed
  if (!this.slug || this.isModified("title")) {
    // Generate slug from title
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-");
  }
  
  // Set publishedAt when publishing
  if (this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Auto-generate SEO fields if not provided
  if (!this.seoTitle) {
    this.seoTitle = this.title;
  }
  
  if (!this.seoDescription) {
    this.seoDescription = this.excerpt;
  }
  
  next();
});

// Virtual for formatted date
BlogSchema.virtual("formattedDate").get(function() {
  return this.publishedAt ? this.publishedAt.toLocaleDateString() : "Draft";
});

// Virtual for reading time text
BlogSchema.virtual("readTimeText").get(function() {
  return `${this.readTime} min read`;
});

// Index for better search performance
BlogSchema.index({ title: "text", content: "text", tags: "text" });
BlogSchema.index({ published: 1, publishedAt: -1 });
BlogSchema.index({ topic: 1, published: 1 });
BlogSchema.index({ category: 1, published: 1 });
BlogSchema.index({ featured: 1, published: 1 });

const Blog = mongoose.model("Blog", BlogSchema);
export default Blog; 