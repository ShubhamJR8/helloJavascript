import { describe, it } from 'mocha';
import request from 'supertest';
import { expect } from '@esm-bundle/chai';
import app from '../src/app.js';

describe('Basic App Tests', function () {
  it('should respond with a 404 status for the root endpoint', async function () {
    const response = await request(app).get('/');
    expect(response.status).to.equal(404);
  });

  it('should return 404 for an unknown endpoint', async function () {
    const response = await request(app).get('/unknown');
    expect(response.status).to.equal(404);
  });
});