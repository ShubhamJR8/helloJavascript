import { describe, it } from 'mocha';
import request from 'supertest';
import { expect } from '@esm-bundle/chai';
import app from '../src/app.js';

describe('Basic App Tests', function () {
  it('should respond with a 200 status for the health endpoint', async function () {
    const response = await request(app).get('/health');
    expect(response.status).to.equal(200);
  });

  it('should return 403 for an unknown endpoint', async function () {
    const response = await request(app).get('/unknown');
    expect(response.status).to.equal(403);
  });



});