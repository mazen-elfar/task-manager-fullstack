import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { User } from '../src/models/User.js';
import { Task } from '../src/models/Task.js';

describe('End-to-End User Journey & Security Verification', () => {
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

  it('executes full user lifecycle: Register -> Login -> Create -> Filter -> Edit -> Complete -> Delete -> Logout + Cross-Tenant IDOR Guard', async () => {
    // Clean database
    await Task.deleteMany({});
    await User.deleteMany({});

    // 1. Register User A (Alice)
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Alice Johnson',
        email: 'alice@company.com',
        password: 'Password123!'
      });
    expect(registerRes.status).toBe(201);
    expect(registerRes.body.success).toBe(true);
    expect(registerRes.body.user.name).toBe('Alice Johnson');
    expect(registerRes.body.user).not.toHaveProperty('password');

    // 2. Login User A
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'alice@company.com',
        password: 'Password123!'
      });
    expect(loginRes.status).toBe(200);
    const aliceToken = loginRes.body.token;
    expect(aliceToken).toBeDefined();

    // 3. User A checks session persistence (/auth/me)
    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${aliceToken}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe('alice@company.com');

    // 4. User A creates multiple tasks
    const task1Res = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        title: 'Urgent: Fix production issue',
        description: 'Resolve high memory utilization on worker nodes',
        status: 'pending',
        priority: 'high'
      });
    expect(task1Res.status).toBe(201);
    const task1Id = task1Res.body.task.id;

    const task2Res = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        title: 'Refactor API endpoints',
        description: 'Clean up controllers and add Zod validation',
        status: 'pending',
        priority: 'medium'
      });
    expect(task2Res.status).toBe(201);
    const task2Id = task2Res.body.task.id;

    const task3Res = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        title: 'Write technical documentation',
        description: 'Complete architecture and API docs',
        status: 'completed',
        priority: 'low'
      });
    expect(task3Res.status).toBe(201);

    // 5. User A searches tasks by keyword
    const searchRes = await request(app)
      .get('/api/v1/tasks?search=Fix production')
      .set('Authorization', `Bearer ${aliceToken}`);
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.tasks.length).toBe(1);
    expect(searchRes.body.tasks[0].id).toBe(task1Id);

    // 6. User A filters tasks by status=pending
    const pendingRes = await request(app)
      .get('/api/v1/tasks?status=pending')
      .set('Authorization', `Bearer ${aliceToken}`);
    expect(pendingRes.status).toBe(200);
    expect(pendingRes.body.tasks.length).toBe(2);

    // 7. User A edits Task 2
    const editRes = await request(app)
      .patch(`/api/v1/tasks/${task2Id}`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        title: 'Refactor API routes and middleware',
        priority: 'high'
      });
    expect(editRes.status).toBe(200);
    expect(editRes.body.task.title).toBe('Refactor API routes and middleware');
    expect(editRes.body.task.priority).toBe('high');

    // 8. User A completes Task 1
    const completeRes = await request(app)
      .patch(`/api/v1/tasks/${task1Id}`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ status: 'completed' });
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.task.status).toBe('completed');

    // 9. Register User B (Bob) to test cross-tenant isolation
    const bobReg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Bob Smith',
        email: 'bob@company.com',
        password: 'Password456!'
      });
    const bobToken = bobReg.body.token;

    // 10. Verify Bob sees 0 tasks in his workspace
    const bobTasksRes = await request(app)
      .get('/api/v1/tasks')
      .set('Authorization', `Bearer ${bobToken}`);
    expect(bobTasksRes.status).toBe(200);
    expect(bobTasksRes.body.tasks.length).toBe(0);

    // 11. Verify Bob CANNOT view, update, or delete Alice's tasks (IDOR prevention)
    const bobGetAliceTask = await request(app)
      .get(`/api/v1/tasks/${task1Id}`)
      .set('Authorization', `Bearer ${bobToken}`);
    expect(bobGetAliceTask.status).toBe(404);

    const bobEditAliceTask = await request(app)
      .patch(`/api/v1/tasks/${task1Id}`)
      .set('Authorization', `Bearer ${bobToken}`)
      .send({ title: 'Compromised by Bob' });
    expect(bobEditAliceTask.status).toBe(404);

    const bobDeleteAliceTask = await request(app)
      .delete(`/api/v1/tasks/${task1Id}`)
      .set('Authorization', `Bearer ${bobToken}`);
    expect(bobDeleteAliceTask.status).toBe(404);

    // 12. User A deletes Task 1
    const deleteRes = await request(app)
      .delete(`/api/v1/tasks/${task1Id}`)
      .set('Authorization', `Bearer ${aliceToken}`);
    expect(deleteRes.status).toBe(200);

    // Verify task is removed from User A's list
    const finalTasks = await request(app)
      .get('/api/v1/tasks')
      .set('Authorization', `Bearer ${aliceToken}`);
    expect(finalTasks.body.tasks.length).toBe(2);

    // 13. User A logs out
    const logoutRes = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${aliceToken}`);
    expect(logoutRes.status).toBe(200);
  });
});
