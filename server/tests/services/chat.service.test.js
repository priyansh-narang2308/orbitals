import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/lib/db.js', () => {
    return {
        __esModule: true,
        default: {
            conversation: {
                create: jest.fn(),
                findFirst: jest.fn(),
                deleteMany: jest.fn(),
                update: jest.fn(),
                findMany: jest.fn(),
            },
            message: {
                create: jest.fn(),
                findMany: jest.fn(),
            }
        }
    };
});

const { ChatService } = await import('../../src/services/chat.service.js');
const prisma = (await import('../../src/lib/db.js')).default;

describe('ChatService', () => {
    let chatService;

    beforeEach(() => {
        chatService = new ChatService();
        jest.clearAllMocks();
    });

    describe('createConversation', () => {
        it('should call prisma.conversation.create with proper payload data', async () => {
            const mockResult = { id: 123, title: 'New chat Conversation' };
            prisma.conversation.create.mockResolvedValue(mockResult);

            const result = await chatService.createConversation('user_123', 'chat');

            expect(prisma.conversation.create).toHaveBeenCalledWith({
                data: {
                    userId: 'user_123',
                    mode: 'chat',
                    title: 'New chat Conversation'
                }
            });
            expect(result).toEqual(mockResult);
        });
    });

    describe('addMessage', () => {
        it('should serialize object content to JSON string', async () => {
            prisma.message.create.mockResolvedValue({ id: 9, content: '{}' });

            await chatService.addMessage('conv_1', 'assistant', { key: 'value' });

            expect(prisma.message.create).toHaveBeenCalledWith({
                data: {
                    conversationId: 'conv_1',
                    role: 'assistant',
                    content: '{"key":"value"}'
                }
            });
        });
    });

    describe('parseContent', () => {
        it('should return parsed JSON object for valid JSON string', () => {
            const result = chatService.parseContent('{"a":1}');
            expect(result).toEqual({ a: 1 });
        });

        it('should return original string if JSON parsing fails', () => {
            const result = chatService.parseContent('Not JSON content');
            expect(result).toEqual('Not JSON content');
        });
    });
});
