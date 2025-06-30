import request from 'supertest';
import { expect } from '@esm-bundle/chai';
import app from '../src/app.js';
import Blog from '../src/models/Blog.js';
import User from '../src/models/User.js';

describe('Blog API', () => {
  let testUser;
  let testBlog;
  let authToken;

  before(async () => {
    // Create test user
    testUser = await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });

    // Create test blog
    testBlog = await Blog.create({
      title: 'Test Blog Post',
      content: 'This is a test blog post content with enough words to meet the minimum requirement.',
      excerpt: 'A test blog post excerpt for testing purposes.',
      category: 'Tutorials',
      tags: ['test', 'javascript'],
      author: testUser._id,
      published: true,
      publishedAt: new Date()
    });
  });

  describe('GET /api/blogs', () => {
    it('should get all published blogs', async () => {
      const res = await request(app)
        .get('/api/blogs')
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      expect(res.body.pagination).to.have.property('page');
      expect(res.body.pagination).to.have.property('total');
    });

    it('should filter blogs by category', async () => {
      const res = await request(app)
        .get('/api/blogs?category=Tutorials')
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      res.body.data.forEach(blog => {
        expect(blog.category).to.equal('Tutorials');
      });
    });
  });

  describe('GET /api/blogs/:slug', () => {
    it('should get blog by slug', async () => {
      const res = await request(app)
        .get(`/api/blogs/${testBlog.slug}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.title).to.equal('Test Blog Post');
      expect(res.body.data.views).to.be.a('number');
    });

    it('should return 404 for non-existent slug', async () => {
      await request(app)
        .get('/api/blogs/non-existent-slug')
        .expect(404);
    });
  });

  describe('GET /api/blogs/categories', () => {
    it('should get all categories', async () => {
      const res = await request(app)
        .get('/api/blogs/categories')
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      expect(res.body.data).to.include('Tutorials');
    });
  });

  describe('GET /api/blogs/featured', () => {
    it('should get featured blogs', async () => {
      const res = await request(app)
        .get('/api/blogs/featured')
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
    });
  });

  describe('POST /api/blogs/:id/like', () => {
    it('should like a blog', async () => {
      const initialLikes = testBlog.likes;
      
      const res = await request(app)
        .post(`/api/blogs/${testBlog._id}/like`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.likes).to.equal(initialLikes + 1);
    });
  });

  describe('Protected routes (Admin only)', () => {
    before(async () => {
      // Login to get auth token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123'
        });

      authToken = loginRes.body.token;
    });

    describe('POST /api/blogs', () => {
      it('should create a new blog (admin only)', async () => {
        const newBlog = {
          title: 'New Test Blog',
          content: 'This is the content of the new test blog with sufficient length to meet requirements.',
          excerpt: 'A new test blog excerpt.',
          category: 'Best Practices',
          tags: ['new', 'test'],
          readTime: 3
        };

        const res = await request(app)
          .post('/api/blogs')
          .set('Authorization', `Bearer ${authToken}`)
          .send(newBlog)
          .expect(201);

        expect(res.body.success).to.be.true;
        expect(res.body.data.title).to.equal('New Test Blog');
        expect(res.body.data.slug).to.exist;
      });

      it('should reject blog creation without auth', async () => {
        const newBlog = {
          title: 'Unauthorized Blog',
          content: 'This should not be created.',
          excerpt: 'Unauthorized excerpt.',
          category: 'Tutorials'
        };

        await request(app)
          .post('/api/blogs')
          .send(newBlog)
          .expect(401);
      });
    });

    describe('PUT /api/blogs/:id', () => {
      it('should update a blog (admin only)', async () => {
        const updateData = {
          title: 'Updated Test Blog',
          excerpt: 'Updated excerpt for the test blog.'
        };

        const res = await request(app)
          .put(`/api/blogs/${testBlog._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(res.body.success).to.be.true;
        expect(res.body.data.title).to.equal('Updated Test Blog');
      });
    });

    describe('PATCH /api/blogs/:id/publish', () => {
      it('should toggle blog publish status (admin only)', async () => {
        const res = await request(app)
          .patch(`/api/blogs/${testBlog._id}/publish`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(res.body.success).to.be.true;
        expect(res.body.data.published).to.be.a('boolean');
      });
    });

    describe('PATCH /api/blogs/:id/feature', () => {
      it('should toggle blog feature status (admin only)', async () => {
        const res = await request(app)
          .patch(`/api/blogs/${testBlog._id}/feature`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(res.body.success).to.be.true;
        expect(res.body.data.featured).to.be.a('boolean');
      });
    });
  });
}); 