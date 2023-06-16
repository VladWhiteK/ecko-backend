import request from 'supertest';
import { eckoServer, server, serverEnabled } from '../server';

describe('Testing Auth Route', () => {
    beforeAll(async () => {
        while (!serverEnabled) {
            await new Promise((resolve) => {
                return setTimeout(resolve, 1000);
            });
        }
    });

    test('route /login should return 400 if request body is empty', async () => {
        const response = await request(server).post('/auth/login').send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    test('route /login should return 401 if user does not exist', async () => {
        const response = await request(server)
            .post('/auth/login')
            .send({ username: 'nonexistent', password: 'password123' });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
    });

    test('route /login should return 401 if password is incorrect', async () => {
        const response = await request(server)
            .post('/auth/login')
            .send({ username: 'existing', password: 'incorrect' });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
    });

    test('route /logout should return 200 if user is logged in', async () => {
        const response = await request(server).post('/auth/logout').send({});

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message');
    });

    test('route /register should return 400 if request body is empty', async () => {
        const response = await request(server).post('/auth/register').send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    test('route /register should return 400 if username and email are both missing', async () => {
        const response = await request(server)
            .post('/auth/register')
            .send({ password: 'password123' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    test('route /register should return 400 if password is missing', async () => {
        const response = await request(server)
            .post('/auth/register')
            .send({ username: 'existing' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    test('route /register should return 400 if username is already taken', async () => {
        const response = await request(server)
            .post('/auth/register')
            .send({ username: 'existing', password: 'password123' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    test('route /register should return 400 if email is already taken', async () => {
        const response = await request(server)
            .post('/auth/register')
            .send({ username: 'existing', password: 'password123' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    afterAll(() => {
        eckoServer.close();
    });
});