export default {
    testEnvironment: 'node',
    transform: {}, // Disable transforms for pure native ES module supports
    testMatch: [
        '**/tests/**/*.test.js',
        '**/tests/**/*.spec.js',
    ],
    verbose: true,
    injectGlobals: true, // Enables standard describe/it/expect keywords without importing them
};
