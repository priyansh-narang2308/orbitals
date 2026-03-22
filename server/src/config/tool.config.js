import { google } from '@ai-sdk/google';
import { tool } from 'ai';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

/*
 CLI logging helpers
*/
const log = {
    info: (msg) => console.log(chalk.blue('ℹ'), msg),
    success: (msg) => console.log(chalk.green('✔'), msg),
    warn: (msg) => console.log(chalk.yellow('⚠'), msg),
    error: (msg) => console.log(chalk.red('✖'), msg),
    subtle: (msg) => console.log(chalk.gray(msg))
};


/*
 Available Google Generative AI tools
*/
export const availableTools = [
    {
        id: 'google_search',
        name: 'Google Search',
        description:
            'Search the web for up-to-date information, news, and real-time data.',
        getTool: () => google.tools.googleSearch({}),
        enabled: false,
    },
    {
        id: 'code_execution',
        name: 'Code Execution',
        description:
            'Run Python code for calculations, analysis, and problem solving.',
        getTool: () => google.tools.codeExecution({}),
        enabled: false,
    },
    {
        id: 'url_context',
        name: 'URL Context',
        description:
            'Fetch and analyze content from URLs provided in the prompt.',
        getTool: () => google.tools.urlContext({}),
        enabled: false,
    },
    {
        id: 'set_env_key',
        name: 'API Key Storer',
        description: 'Set or update an environment variable inside your local .env file in the current workspace directory.',
        getTool: () => tool({
            description: 'Store or update a key/value pair inside a local .env file securely.',
            inputSchema: z.object({
                key: z.string().describe('The name of the variable to set (e.g., SUPABASE_KEY, OPENAI_API_KEY)'),
                value: z.string().describe('The value to save inside the .env file')
            }),
            execute: async ({ key, value }) => {
                try {
                    const envPath = path.join(process.cwd(), '.env');
                    let content = '';
                    try {
                        content = await fs.readFile(envPath, 'utf-8');
                    } catch (e) { /* file doesn't exist yet, start empty */ }

                    const lines = content.split('\n');
                    let found = false;
                    const updatedLines = lines.map(line => {
                        if (line.trim().startsWith(`${key}=`)) {
                            found = true;
                            return `${key}=${value}`; // update it
                        }
                        return line;
                    });

                    if (!found) updatedLines.push(`${key}=${value}`);

                    await fs.writeFile(envPath, updatedLines.join('\n'));
                    return { success: true, message: `Successfully stored ${key} in local .env file.` };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            }
        }),
        enabled: false,
    },
];


/*
 Get enabled tools for AI SDK
*/
export function getEnabledTools() {
    const tools = {};

    try {
        for (const tool of availableTools) {
            if (tool.enabled) {
                tools[tool.id] = tool.getTool();
            }
        }

        const enabled = Object.keys(tools);

        if (enabled.length === 0) {
            log.warn('No tools enabled');
            return undefined;
        }

        log.success(
            `Tools active: ${chalk.cyan(enabled.join(', '))}`
        );

        return tools;

    } catch (error) {
        log.error('Failed to initialize tools');
        log.subtle(error.message);
        log.warn('Make sure @ai-sdk/google v2.0+ is installed');
        log.subtle('Run: npm install @ai-sdk/google@latest');
        return undefined;
    }
}


/*
 Toggle a single tool
*/
export function toggleTool(toolId) {
    const tool = availableTools.find(t => t.id === toolId);

    if (!tool) {
        log.error(`Tool not found: ${toolId}`);
        return false;
    }

    tool.enabled = !tool.enabled;

    if (tool.enabled) {
        log.success(`${tool.name} enabled`);
    } else {
        log.warn(`${tool.name} disabled`);
    }

    return tool.enabled;
}


/*
 Enable specific tools
*/
export function enableTools(toolIds = []) {

    availableTools.forEach(tool => {
        tool.enabled = toolIds.includes(tool.id);
    });

    const enabled = availableTools.filter(t => t.enabled);

    if (enabled.length === 0) {
        log.warn('All tools disabled');
        return;
    }

    log.success(
        `Enabled ${enabled.length} tool(s): ${chalk.cyan(
            enabled.map(t => t.name).join(', ')
        )}`
    );
}


/*
 Get enabled tool names
*/
export function getEnabledToolNames() {
    return availableTools
        .filter(t => t.enabled)
        .map(t => t.name);
}


/*
 Reset all tools
*/
export function resetTools() {
    availableTools.forEach(tool => {
        tool.enabled = false;
    });

    log.info('All tools reset');
}
