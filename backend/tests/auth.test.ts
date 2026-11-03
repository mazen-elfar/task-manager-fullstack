import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { User } from '../src/models/User.js';

describe('Authentication API & User Models', () => {
  let mongoServer: MongoMemoryServer;
  const app = createApp();

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({
      binary: { version: '7.0.14' }
    });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/v1/auth/register', () => {
    it('successfully registers a new user with hashed password and sets auth cookie', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'securepassword123'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.name).toBe('Jane Doe');
      expect(res.body.user.email).toBe('jane@example.com');
      // Must not expose password
      expect(res.body.user).not.toHaveProperty('password');
      expect(res.body).toHaveProperty('token');

      // Verify cookie was set
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=/);
      expect(cookies[0]).toMatch(/HttpOnly/i);

      // Verify database stored hashed password
      const dbUser = await User.findOne({ email: 'jane@example.com' });
      expect(dbUser).not.toBeNull();
      expect(dbUser!.password).not.toBe('securepassword123');
      expect(dbUser!.password.startsWith('$2')).toBe(true);
    });

    it('rejects registration with missing or invalid fields', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'J',
          email: 'not-an-email',
          password: 'short'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details.length).toBeGreaterThanOrEqual(3);
    });

    it('rejects duplicate email with 409 Conflict', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Initial User',
          email: 'duplicate@example.com',
          password: 'password123'
        });

      const duplicateRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Second User',
          email: 'DUPLICATE@example.com', // test case normalization
          password: 'password456'
        });

      expect(duplicateRes.status).toBe(409);
      expect(duplicateRes.body.success).toBe(false);
      expect(duplicateRes.body.error.code).toBe('CONFLICT_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Login Tester',
          email: 'tester@example.com',
          password: 'correctpassword123'
        });
    });

    it('successfully logs in with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'tester@example.com',
          password: 'correctpassword123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('tester@example.com');
      expect(res.body.user).not.toHaveProperty('password');
      expect(res.body).toHaveProperty('token');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('rejects login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'tester@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED_ERROR');
    });

    it('rejects login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'unknown@example.com',
          password: 'somepassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED_ERROR');
    });
  });

  describe('Protected Routes & Session Persistence (/api/v1/auth/me)', () => {
    let authToken: string;
    let authCookie: string;

    beforeEach(async () => {
      const reg = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Session User',
          email: 'session@example.com',
          password: 'password12345'
        });
      authToken = reg.body.token;
      authCookie = reg.headers['set-cookie'][0];
    });

    it('rejects /api/v1/auth/me when unauthenticated', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED_ERROR');
    });

    it('retrieves user profile using Bearer token header', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.name).toBe('Session User');
      expect(res.body.user.email).toBe('session@example.com');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('retrieves user profile using HttpOnly cookie', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.name).toBe('Session User');
    });

    it('clears cookie on logout', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=;/);
    });
  });
});
