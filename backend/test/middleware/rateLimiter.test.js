import express from 'express';
import request from 'supertest';
import { expect } from '@esm-bundle/chai';
import limiter from '../../src/middleware/rateLimiter.js';

describe('Rate Limiter Middleware', function () {
  let app;

  beforeEach(() => {
    app = express();
    app.use(limiter);
    app.get('/api/test', (req, res) => res.send('ok'));
  });

  it('should allow requests under the limit', async function () {
    for (let i = 0; i < 5; i++) {
      const res = await request(app).get('/api/test');
      expect(res.status).to.equal(200);
    }
  });

  it('should block requests over the limit', async function () {
    let lastRes;
    for (let i = 0; i < 30; i++) {
      lastRes = await request(app).get('/test');
    }
    expect(lastRes.status).to.equal(429);
    expect(lastRes.body.message).to.match(/too many requests/i);
  });
});