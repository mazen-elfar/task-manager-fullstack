import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { User } from '../src/models/User.js';
import { Task } from '../src/models/Task.js';

describe('Task Management API & Cross-User Authorization', () => {
  let mongoServer: MongoMemoryServer;
  const app = createApp();

  let userAToken: string;
  let userBToken: string;

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
    await Task.deleteMany({});
    await User.deleteMany({});

    // Register User A
    const resA = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'User Alpha',
        email: 'alpha@example.com',
        password: 'password123'
      });
    userAToken = resA.body.token;

    // Register User B
    const resB = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'User Beta',
        email: 'beta@example.com',
        password: 'password456'
      });
    userBToken = resB.body.token;
  });

  describe('Task Creation & Validation', () => {
    it('creates a task with required fields and defaults', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Complete assignment',
          description: 'Build full stack application from scratch'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.task).toHaveProperty('id');
      expect(res.body.task.title).toBe('Complete assignment');
      expect(res.body.task.description).toBe('Build full stack application from scratch');
      expect(res.body.task.status).toBe('pending');
      expect(res.body.task.priority).toBe('medium');
      expect(res.body.task).toHaveProperty('createdAt');
      expect(res.body.task).toHaveProperty('updatedAt');
    });

    it('creates a task with optional priority, status, and dueDate', async () => {
      const dueDate = new Date('2026-12-31T23:59:59.000Z').toISOString();
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Deploy to Cloud',
          description: 'Deploy backend and frontend',
          status: 'completed',
          priority: 'high',
          dueDate
        });

      expect(res.status).toBe(201);
      expect(res.body.task.status).toBe('completed');
      expect(res.body.task.priority).toBe('high');
      expect(new Date(res.body.task.dueDate).toISOString()).toBe(dueDate);
    });

    it('rejects task creation without title with 400 Validation Error', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          description: 'No title provided'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects task creation with invalid status or priority', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Invalid Task',
          status: 'invalid-status',
          priority: 'extreme'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects unauthenticated task creation with 401', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .send({
          title: 'Unauthenticated Task'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Task Retrieval & Filtering', () => {
    beforeEach(async () => {
      // Create 3 tasks for User A
      await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: 'Alpha Task 1: Buy groceries', status: 'pending', priority: 'low' });

      await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: 'Alpha Task 2: Write documentation', status: 'completed', priority: 'high' });

      await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: 'Alpha Task 3: Fix bug in login', status: 'pending', priority: 'medium' });

      // Create 1 task for User B
      await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ title: 'Beta Secret Task', status: 'pending', priority: 'high' });
    });

    it('retrieves only authenticated user tasks', async () => {
      const resA = await request(app)
        .get('/api/v1/tasks')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(resA.status).toBe(200);
      expect(resA.body.tasks.length).toBe(3);
      expect(resA.body.pagination.total).toBe(3);
      // Ensure User B's task is NOT visible to User A
      const titlesA = resA.body.tasks.map((t: { title: string }) => t.title);
      expect(titlesA).not.toContain('Beta Secret Task');

      const resB = await request(app)
        .get('/api/v1/tasks')
        .set('Authorization', `Bearer ${userBToken}`);

      expect(resB.status).toBe(200);
      expect(resB.body.tasks.length).toBe(1);
      expect(resB.body.tasks[0].title).toBe('Beta Secret Task');
    });

    it('filters tasks by status', async () => {
      const pendingRes = await request(app)
        .get('/api/v1/tasks?status=pending')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(pendingRes.status).toBe(200);
      expect(pendingRes.body.tasks.length).toBe(2);
      expect(pendingRes.body.tasks.every((t: { status: string }) => t.status === 'pending')).toBe(true);

      const completedRes = await request(app)
        .get('/api/v1/tasks?status=completed')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(completedRes.status).toBe(200);
      expect(completedRes.body.tasks.length).toBe(1);
      expect(completedRes.body.tasks[0].title).toBe('Alpha Task 2: Write documentation');
    });

    it('filters tasks by search keyword in title', async () => {
      const searchRes = await request(app)
        .get('/api/v1/tasks?search=documentation')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(searchRes.status).toBe(200);
      expect(searchRes.body.tasks.length).toBe(1);
      expect(searchRes.body.tasks[0].title).toContain('Write documentation');
    });

    it('combines search and status filter', async () => {
      // Search for 'Alpha' with status 'completed' -> should return 1
      const res = await request(app)
        .get('/api/v1/tasks?search=Alpha&status=completed')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.tasks.length).toBe(1);
      expect(res.body.tasks[0].title).toBe('Alpha Task 2: Write documentation');
    });

    it('returns empty array when search matches nothing', async () => {
      const res = await request(app)
        .get('/api/v1/tasks?search=NonExistentTaskXYZ')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.tasks.length).toBe(0);
      expect(res.body.pagination.total).toBe(0);
    });
  });

  describe('Task Updates and Status Toggling', () => {
    let taskId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Initial Title',
          description: 'Initial Description',
          status: 'pending'
        });
      taskId = res.body.task.id;
    });

    it('updates task title and description', async () => {
      const res = await request(app)
        .patch(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Updated Title',
          description: 'Updated Description'
        });

      expect(res.status).toBe(200);
      expect(res.body.task.title).toBe('Updated Title');
      expect(res.body.task.description).toBe('Updated Description');
    });

    it('marks a task as completed', async () => {
      const res = await request(app)
        .patch(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ status: 'completed' });

      expect(res.status).toBe(200);
      expect(res.body.task.status).toBe('completed');
    });

    it('reopens a completed task back to pending', async () => {
      // First complete
      await request(app)
        .patch(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ status: 'completed' });

      // Then reopen
      const res = await request(app)
        .patch(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ status: 'pending' });

      expect(res.status).toBe(200);
      expect(res.body.task.status).toBe('pending');
    });
  });

  describe('Task Deletion', () => {
    it('deletes an existing task owned by authenticated user', async () => {
      const createRes = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: 'Task to be deleted' });

      const taskId = createRes.body.task.id;

      const deleteRes = await request(app)
        .delete(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      // Verify task is gone
      const getRes = await request(app)
        .get(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(getRes.status).toBe(404);
    });
  });

  describe('Cross-User Authorization & IDOR Protection', () => {
    let userATaskId: string;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'User A Private Task',
          description: 'Confidential details'
        });
      userATaskId = createRes.body.task.id;
    });

    it('prevents User B from reading User A task (returns 404 to prevent enumeration)', async () => {
      const res = await request(app)
        .get(`/api/v1/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND_ERROR');
    });

    it('prevents User B from updating User A task', async () => {
      const res = await request(app)
        .patch(`/api/v1/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ title: 'Hacked by User B' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);

      // Verify User A task was NOT modified
      const checkRes = await request(app)
        .get(`/api/v1/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(checkRes.body.task.title).toBe('User A Private Task');
    });

    it('prevents User B from deleting User A task', async () => {
      const res = await request(app)
        .delete(`/api/v1/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);

      // Verify User A task still exists
      const checkRes = await request(app)
        .get(`/api/v1/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(checkRes.status).toBe(200);
      expect(checkRes.body.task.id).toBe(userATaskId);
    });
  });

  describe('Error Handling & Invalid Identifiers', () => {
    it('returns 404 for non-existent valid ObjectId', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/api/v1/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND_ERROR');
    });

    it('returns 400 for malformed task ID', async () => {
      const res = await request(app)
        .get('/api/v1/tasks/not-a-valid-object-id')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
