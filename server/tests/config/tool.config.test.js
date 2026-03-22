import { jest } from '@jest/globals';

jest.unstable_mockModule('@ai-sdk/google', () => ({
    __esModule: true,
    google: {
        tools: {
            googleSearch: jest.fn(() => ({ type: 'search' }))
        }
    }
}));

const { availableTools, toggleTool, enableTools, resetTools, getEnabledToolNames } = await import('../../src/config/tool.config.js');

describe('tool.config.js', () => {
    beforeEach(() => {
        resetTools();
    });

    describe('enableTools', () => {
        it('should enable list of tools matching ids', () => {
            enableTools(['google_search']);

            const enabled = getEnabledToolNames();
            expect(enabled).toContain('Google Search');
        });

        it('should leave others disabled if not matching', () => {
            enableTools(['google_search']);

            const tool = availableTools.find(t => t.id === 'code_execution');
            expect(tool.enabled).toBe(false);
        });
    });

    describe('toggleTool', () => {
        it('should flip the enabled state flag correctly', () => {
            toggleTool('code_execution'); // Enable it
            const tool = availableTools.find(t => t.id === 'code_execution');
            expect(tool.enabled).toBe(true);

            toggleTool('code_execution'); // Disable it
            expect(tool.enabled).toBe(false);
        });

        it('should return false if toolId is invalid', () => {
            const res = toggleTool('invalid_id');
            expect(res).toBe(false);
        });
    });

    describe('resetTools', () => {
        it('should reset all tool states to disabled', () => {
            toggleTool('google_search');
            toggleTool('code_execution');

            resetTools();

            availableTools.forEach(t => {
                expect(t.enabled).toBe(false);
            });
        });
    });
});
