# Blog API Documentation

## Base URL
```
http://localhost:5000/api/blogs
```

## Authentication
Protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get All Blogs
**GET** `/api/blogs`

Get all published blogs with pagination and filtering.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `category` (string, optional): Filter by category
- `search` (string, optional): Search in title, content, and tags
- `featured` (boolean, optional): Filter featured blogs only

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "blog_id",
      "title": "Blog Title",
      "slug": "blog-title",
      "excerpt": "Blog excerpt...",
      "author": {
        "_id": "user_id",
        "name": "Author Name"
      },
      "category": "Tutorials",
      "tags": ["javascript", "tutorial"],
      "featured": false,
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "readTime": 5,
      "views": 100,
      "likes": 25,
      "coverImage": "https://example.com/image.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 2. Get Blog by Slug
**GET** `/api/blogs/:slug`

Get a single published blog by its slug.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "blog_id",
    "title": "Blog Title",
    "slug": "blog-title",
    "content": "Full blog content...",
    "excerpt": "Blog excerpt...",
    "author": {
      "_id": "user_id",
      "name": "Author Name",
      "email": "author@example.com"
    },
    "category": "Tutorials",
    "tags": ["javascript", "tutorial"],
    "featured": false,
    "published": true,
    "publishedAt": "2024-01-01T00:00:00.000Z",
    "readTime": 5,
    "views": 101,
    "likes": 25,
    "coverImage": "https://example.com/image.jpg",
    "seoTitle": "SEO Title",
    "seoDescription": "SEO Description",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Get Categories
**GET** `/api/blogs/categories`

Get all available blog categories.

**Response:**
```json
{
  "success": true,
  "data": [
    "Advanced Concepts",
    "Best Practices",
    "Tutorials",
    "Tips & Tricks",
    "Case Studies"
  ]
}
```

### 4. Get Featured Blogs
**GET** `/api/blogs/featured`

Get featured blogs.

**Query Parameters:**
- `limit` (number, optional): Number of featured blogs to return (default: 5)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "blog_id",
      "title": "Featured Blog",
      "slug": "featured-blog",
      "excerpt": "Featured blog excerpt...",
      "author": {
        "_id": "user_id",
        "name": "Author Name"
      },
      "category": "Tutorials",
      "featured": true,
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "readTime": 5,
      "views": 500,
      "likes": 100
    }
  ]
}
```

### 5. Search Blogs
**GET** `/api/blogs/search`

Search blogs with advanced filtering.

**Query Parameters:**
- `q` (string, required): Search query
- `category` (string, optional): Filter by category
- `limit` (number, optional): Number of results (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "blog_id",
      "title": "Search Result Blog",
      "slug": "search-result-blog",
      "excerpt": "Blog excerpt...",
      "author": {
        "_id": "user_id",
        "name": "Author Name"
      },
      "category": "Tutorials",
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "readTime": 5,
      "views": 50,
      "likes": 10
    }
  ]
}
```

### 6. Like a Blog
**POST** `/api/blogs/:id/like`

Like a blog (increments like count).

**Response:**
```json
{
  "success": true,
  "data": {
    "likes": 26
  },
  "message": "Blog liked successfully"
}
```

## Admin Only Endpoints

### 7. Create Blog
**POST** `/api/blogs`

Create a new blog (Admin only).

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Request Body:**
```json
{
  "title": "New Blog Title",
  "content": "Blog content with at least 50 characters...",
  "excerpt": "Blog excerpt between 10-300 characters",
  "category": "Tutorials",
  "tags": ["javascript", "tutorial"],
  "coverImage": "https://example.com/image.jpg",
  "seoTitle": "SEO Title (optional)",
  "seoDescription": "SEO Description (optional)",
  "readTime": 5
}
```

### 8. Update Blog
**PUT** `/api/blogs/:id`

Update an existing blog (Admin only).

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

### 9. Delete Blog
**DELETE** `/api/blogs/:id`

Delete a blog (Admin only).

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

### 10. Toggle Publish Status
**PATCH** `/api/blogs/:id/publish`

Toggle blog publish status (Admin only).

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

### 11. Toggle Feature Status
**PATCH** `/api/blogs/:id/feature`

Toggle blog feature status (Admin only).

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

## Blog Categories
- Advanced Concepts
- Best Practices
- Tutorials
- Tips & Tricks
- Case Studies

## Notes
- All timestamps are in ISO 8601 format
- Blog content supports HTML markup
- Slugs are auto-generated from titles
- View counts are incremented on each blog view
- Like counts are simple increments (no user tracking)
- Admin routes require admin role in user account 