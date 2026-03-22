import { jest } from '@jest/globals';

jest.unstable_mockModule('ai', () => ({
    __esModule: true,
    streamText: jest.fn(),
}));

jest.unstable_mockModule('../../src/config/google.config.js', () => ({
    __esModule: true,
    config: {
        googleApiKey: 'test-api-key',
        model: 'gemini-1.5-pro',
        temperature: 0.7,
        maxTokens: 2000,
    }
}));

const { AIService } = await import('../../src/services/gemini.service.js');
const { streamText } = await import('ai');

describe('AIService', () => {
    let aiService;

    beforeEach(() => {
        aiService = new AIService();
        jest.clearAllMocks();
    });

    describe('sendMessage', () => {
        it('should call streamText with appropriate configuration', async () => {
            const mockStream = {
                textStream: (async function* () {
                    yield 'Hello ';
                    yield 'world!';
                })(),
                steps: []
            };

            streamText.mockReturnValue(mockStream);

            let chunkResult = '';
            const result = await aiService.sendMessage(
                [{ role: 'user', content: 'Hi' }],
                (chunk) => { chunkResult += chunk; }
            );

            expect(streamText).toHaveBeenCalledWith(expect.objectContaining({
                model: expect.anything(),
                messages: [{ role: 'user', content: 'Hi' }],
                temperature: 0.7,
            }));

            expect(chunkResult).toBe('Hello world!');
            expect(result.content).toBe('Hello world!');
        });

        it('should call onToolCall nested iterations if toolCalls are detected', async () => {
            const mockStream = {
                textStream: (async function* () { yield 'Response text'; })(),
                steps: [{
                    toolCalls: [{ toolName: 'test-tool', args: { value: 1 } }],
                    toolResults: [{ toolName: 'test-tool', result: 'success' }]
                }]
            };

            streamText.mockReturnValue(mockStream);

            const toolCalls = [];
            await aiService.sendMessage(
                [{ role: 'user', content: 'Call tool' }],
                null,
                { test: {} },
                (tc) => toolCalls.push(tc)
            );

            expect(toolCalls.length).toBe(1);
            expect(toolCalls[0].toolName).toBe('test-tool');
        });
    });
});
