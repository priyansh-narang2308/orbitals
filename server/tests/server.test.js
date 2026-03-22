import { jest } from '@jest/globals';
import request from 'supertest';

jest.unstable_mockModule('../src/lib/auth.js', () => ({
    __esModule: true,
    auth: {
        api: {
            getSession: jest.fn(),
        }
    }
}));

jest.unstable_mockModule('../src/lib/db.js', () => ({
    __esModule: true,
    default: {
        conversation: {
            findMany: jest.fn(),
            deleteMany: jest.fn(),
        }
    }
}));

process.env.NODE_ENV = 'test';

const { default: app } = await import('../src/server.js');
const { auth } = await import('../src/lib/auth.js');
const prisma = (await import('../src/lib/db.js')).default;

describe('Express API Endpoints', () => {
    describe('GET /health', () => {
        it('should return server status correctly', async () => {
            const res = await request(app).get('/health');
            expect(res.status).toBe(200);
            expect(res.text).toBe('Server Health OK');
        });
    });

    describe('GET /api/conversations', () => {
        it('should return 401 Unauthorized if session is invalid', async () => {
            auth.api.getSession.mockResolvedValue(null); // Simulate unauth

            const res = await request(app).get('/api/conversations').set('Cookie', 'any');
            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Unauthorized');
        });

        it('should return 200 and data array if user is authenticated', async () => {
            auth.api.getSession.mockResolvedValue({ user: { id: 'u1' } });
            prisma.conversation.findMany.mockResolvedValue([{ id: 'c1', title: 'Test Chat' }]);

            const res = await request(app).get('/api/conversations');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].title).toBe('Test Chat');
        });
    });
});
