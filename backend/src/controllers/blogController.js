import Blog from "../models/Blog.js";
import User from "../models/User.js";
import { logger } from "../utils/logger.js";

// @desc    Get all published blogs with pagination and filtering
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const topic = req.query.topic;
    const search = req.query.search;
    const featured = req.query.featured === 'true';

    const skip = (page - 1) * limit;
    
    // Build query
    let query = { published: true };
    
    if (category) {
      query.category = category;
    }
    
    if (topic) {
      query.topic = topic;
    }
    
    if (featured) {
      query.featured = true;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-content'); // Don't send full content in list

    const total = await Blog.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    logger.error('Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching blogs'
    });
  }
};

// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const blog = await Blog.findOne({ slug, published: true })
      .populate('author', 'name email');

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    // Increment view count
    blog.views += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    logger.error('Error fetching blog by slug:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching blog'
    });
  }
};

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private (Admin only)
export const createBlog = async (req, res) => {
  try {
    const { title, content, excerpt, topic, category, tags, coverImage, seoTitle, seoDescription, readTime } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      });
    }

    // Generate initial slug
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-");

    // Check if slug already exists and make it unique
    let counter = 1;
    let uniqueSlug = slug;
    while (true) {
      const existingBlog = await Blog.findOne({ slug: uniqueSlug });
      if (!existingBlog) {
        break;
      }
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const blog = await Blog.create({
      title,
      slug: uniqueSlug,
      content,
      excerpt,
      topic,
      category,
      tags,
      coverImage,
      seoTitle,
      seoDescription,
      readTime,
      author: req.user.id
    });

    await blog.populate('author', 'name');

    res.status(201).json({
      success: true,
      data: blog
    });
  } catch (error) {
    logger.error('Error creating blog:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'A blog with this title already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error creating blog'
    });
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private (Admin only)
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    // Update blog
    Object.keys(updateData).forEach(key => {
      blog[key] = updateData[key];
    });

    await blog.save();
    await blog.populate('author', 'name');

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    logger.error('Error updating blog:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating blog'
    });
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private (Admin only)
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    await Blog.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting blog:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting blog'
    });
  }
};

// @desc    Publish/Unpublish blog
// @route   PATCH /api/blogs/:id/publish
// @access  Private (Admin only)
export const togglePublish = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    blog.published = !blog.published;
    
    if (blog.published && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }

    await blog.save();
    await blog.populate('author', 'name');

    res.status(200).json({
      success: true,
      data: blog,
      message: `Blog ${blog.published ? 'published' : 'unpublished'} successfully`
    });
  } catch (error) {
    logger.error('Error toggling blog publish status:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating blog status'
    });
  }
};

// @desc    Feature/Unfeature blog
// @route   PATCH /api/blogs/:id/feature
// @access  Private (Admin only)
export const toggleFeature = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    blog.featured = !blog.featured;
    await blog.save();
    await blog.populate('author', 'name');

    res.status(200).json({
      success: true,
      data: blog,
      message: `Blog ${blog.featured ? 'featured' : 'unfeatured'} successfully`
    });
  } catch (error) {
    logger.error('Error toggling blog feature status:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating blog feature status'
    });
  }
};

// @desc    Like a blog
// @route   POST /api/blogs/:id/like
// @access  Public
export const likeBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    blog.likes += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      data: { likes: blog.likes },
      message: 'Blog liked successfully'
    });
  } catch (error) {
    logger.error('Error liking blog:', error);
    res.status(500).json({
      success: false,
      error: 'Error liking blog'
    });
  }
};

// @desc    Get all categories
// @route   GET /api/blogs/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = [
      "Advanced Concepts",
      "Best Practices", 
      "Tutorials",
      "Tips & Tricks",
      "Case Studies"
    ];

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching categories'
    });
  }
};

// @desc    Get featured blogs
// @route   GET /api/blogs/featured
// @access  Public
export const getFeaturedBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const blogs = await Blog.find({ 
      published: true, 
      featured: true 
    })
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .limit(limit)
      .select('-content');

    res.status(200).json({
      success: true,
      data: blogs
    });
  } catch (error) {
    logger.error('Error fetching featured blogs:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching featured blogs'
    });
  }
};

// @desc    Search blogs
// @route   GET /api/blogs/search
// @access  Public
export const searchBlogs = async (req, res) => {
  try {
    const { q: searchQuery, category, limit = 10 } = req.query;

    if (!searchQuery || searchQuery.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Search term must be at least 3 characters long',
        code: 'INVALID_SEARCH_LENGTH'
      });
    }

    // Ensure a text index exists on Blog collection for title/content/excerpt
    // db.blogs.createIndex({ title: "text", content: "text", excerpt: "text" })

    let query = {
      published: true,
      $text: { $search: searchQuery }
    };
    if (category) {
      query.category = category;
    }

    let blogs = await Blog.find(query)
      .populate('author', 'name')
      .sort({ score: { $meta: "textScore" } })
      .limit(parseInt(limit))
      .select('-content');

    // Fallback: If no results, try regex on title
    if (blogs.length === 0) {
      let regexQuery = {
        published: true,
        title: { $regex: searchQuery, $options: 'i' }
      };
      if (category) {
        regexQuery.category = category;
      }
      blogs = await Blog.find(regexQuery)
        .populate('author', 'name')
        .sort({ publishedAt: -1 })
        .limit(parseInt(limit))
        .select('-content');
    }

    res.status(200).json({
      success: true,
      data: blogs
    });
  } catch (error) {
    logger.error('Error searching blogs:', error);
    res.status(500).json({
      success: false,
      error: 'Error searching blogs'
    });
  }
};

// @desc    Get blogs organized by topic
// @route   GET /api/blogs/organized
// @access  Public
export const getBlogsOrganizedByTopic = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6; // Number of blogs per topic
    
    // Get all published blogs grouped by topic
    const blogsByTopic = await Blog.aggregate([
      { $match: { published: true, topic: { $ne: null } } },
      { $sort: { publishedAt: -1 } },
      {
        $group: {
          _id: '$topic',
          blogs: { $push: '$$ROOT' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          topic: '$_id',
          blogs: { $slice: ['$blogs', limit] },
          totalCount: '$count'
        }
      },
      { $sort: { topic: 1 } }
    ]);

    // Populate author information for each blog
    const populatedBlogsByTopic = await Promise.all(
      blogsByTopic.map(async (topicGroup) => {
        const populatedBlogs = await Blog.populate(topicGroup.blogs, {
          path: 'author',
          select: 'name'
        });
        
        return {
          ...topicGroup,
          blogs: populatedBlogs.map(blog => ({
            _id: blog._id,
            title: blog.title,
            slug: blog.slug,
            excerpt: blog.excerpt,
            author: blog.author,
            topic: blog.topic,
            category: blog.category,
            tags: blog.tags,
            featured: blog.featured,
            publishedAt: blog.publishedAt,
            readTime: blog.readTime,
            views: blog.views,
            likes: blog.likes,
            coverImage: blog.coverImage
          }))
        };
      })
    );

    res.status(200).json({
      success: true,
      data: populatedBlogsByTopic
    });
  } catch (error) {
    logger.error('Error fetching blogs organized by topic:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching blogs'
    });
  }
}; 