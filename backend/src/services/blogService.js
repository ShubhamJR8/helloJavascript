import Blog from '../models/Blog.js';
import { logger } from '../utils/logger.js';

// Calculate reading time based on content length
export const calculateReadTime = (content) => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// Generate SEO-friendly slug from title
export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim("-");
};

// Ensure unique slug by appending number if needed
export const ensureUniqueSlug = async (slug, excludeId = null) => {
  let uniqueSlug = slug;
  let counter = 1;
  
  while (true) {
    const query = { slug: uniqueSlug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    const existingBlog = await Blog.findOne(query);
    if (!existingBlog) {
      break;
    }
    
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  
  return uniqueSlug;
};

// Process blog content for SEO and analytics
export const processBlogContent = (content) => {
  // Remove HTML tags for word count
  const plainText = content.replace(/<[^>]*>/g, '');
  
  // Extract headings for table of contents
  const headings = content.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/g) || [];
  
  // Extract code blocks
  const codeBlocks = content.match(/<pre[^>]*>.*?<\/pre>/gs) || [];
  
  return {
    plainText,
    headings: headings.map(h => h.replace(/<[^>]*>/g, '')),
    codeBlocks: codeBlocks.length,
    wordCount: plainText.split(/\s+/).length
  };
};

// Get blog analytics
export const getBlogAnalytics = async () => {
  try {
    const totalBlogs = await Blog.countDocuments();
    const publishedBlogs = await Blog.countDocuments({ published: true });
    const featuredBlogs = await Blog.countDocuments({ featured: true, published: true });
    
    const totalViews = await Blog.aggregate([
      { $match: { published: true } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    
    const totalLikes = await Blog.aggregate([
      { $match: { published: true } },
      { $group: { _id: null, totalLikes: { $sum: '$likes' } } }
    ]);
    
    const categoryStats = await Blog.aggregate([
      { $match: { published: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const mostViewedBlogs = await Blog.find({ published: true })
      .sort({ views: -1 })
      .limit(5)
      .select('title views slug');
    
    const mostLikedBlogs = await Blog.find({ published: true })
      .sort({ likes: -1 })
      .limit(5)
      .select('title likes slug');
    
    return {
      totalBlogs,
      publishedBlogs,
      featuredBlogs,
      totalViews: totalViews[0]?.totalViews || 0,
      totalLikes: totalLikes[0]?.totalLikes || 0,
      categoryStats,
      mostViewedBlogs,
      mostLikedBlogs
    };
  } catch (error) {
    logger.error('Error getting blog analytics:', error);
    throw error;
  }
};

// Get related blogs based on tags and category
export const getRelatedBlogs = async (blogId, limit = 3) => {
  try {
    const currentBlog = await Blog.findById(blogId);
    if (!currentBlog) {
      return [];
    }
    
    const query = {
      _id: { $ne: blogId },
      published: true,
      $or: [
        { category: currentBlog.category },
        { tags: { $in: currentBlog.tags } }
      ]
    };
    
    const relatedBlogs = await Blog.find(query)
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .limit(limit)
      .select('title excerpt slug author publishedAt readTime views likes');
    
    return relatedBlogs;
  } catch (error) {
    logger.error('Error getting related blogs:', error);
    return [];
  }
};

// Update blog view count with rate limiting
export const incrementBlogViews = async (blogId, ipAddress) => {
  try {
    // Simple rate limiting: one view per IP per hour
    const cacheKey = `blog_view_${blogId}_${ipAddress}`;
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    // In a real implementation, you'd use Redis or similar
    // For now, we'll just increment the view count
    const blog = await Blog.findById(blogId);
    if (blog) {
      blog.views += 1;
      await blog.save();
    }
    
    return true;
  } catch (error) {
    logger.error('Error incrementing blog views:', error);
    return false;
  }
};

// Search blogs with advanced filtering
export const searchBlogsAdvanced = async (searchParams) => {
  try {
    const {
      query,
      category,
      tags,
      author,
      dateFrom,
      dateTo,
      minReadTime,
      maxReadTime,
      sortBy = 'publishedAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = searchParams;
    
    const skip = (page - 1) * limit;
    
    // Build query
    let searchQuery = { published: true };
    
    if (query) {
      searchQuery.$text = { $search: query };
    }
    
    if (category) {
      searchQuery.category = category;
    }
    
    if (tags && tags.length > 0) {
      searchQuery.tags = { $in: tags };
    }
    
    if (author) {
      searchQuery.author = author;
    }
    
    if (dateFrom || dateTo) {
      searchQuery.publishedAt = {};
      if (dateFrom) searchQuery.publishedAt.$gte = new Date(dateFrom);
      if (dateTo) searchQuery.publishedAt.$lte = new Date(dateTo);
    }
    
    if (minReadTime || maxReadTime) {
      searchQuery.readTime = {};
      if (minReadTime) searchQuery.readTime.$gte = parseInt(minReadTime);
      if (maxReadTime) searchQuery.readTime.$lte = parseInt(maxReadTime);
    }
    
    // Build sort object
    const sortObject = {};
    sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const blogs = await Blog.find(searchQuery)
      .populate('author', 'name')
      .sort(sortObject)
      .skip(skip)
      .limit(limit)
      .select('-content');
    
    const total = await Blog.countDocuments(searchQuery);
    
    return {
      blogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  } catch (error) {
    logger.error('Error in advanced blog search:', error);
    throw error;
  }
}; 