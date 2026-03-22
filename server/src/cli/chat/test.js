import { tool } from 'ai';
import { z } from 'zod';

const myTool = tool({
    description: 'Store or update a key/value pair.',
    parameters: z.object({
        key: z.string().describe('The name of the variable to set'),
        value: z.string().describe('The value to save'),
    }),
    execute: async () => {}
});

console.log("Tool parameters:", JSON.stringify(myTool.parameters, null, 2));
console.log("Full tool:", myTool);
