import chalk from "chalk";
import boxen from "boxen";
import gradient from "gradient-string";
import { text, isCancel, cancel, intro, outro, confirm } from "@clack/prompts";

import { AIService } from "../../services/gemini.service.js";
import { ChatService } from "../../services/chat.service.js";

import { getStoredToken } from "../../lib/token.js";
import { generateApplication } from "../../config/agent.config.js";
import prisma from "../../lib/db.js";


const aiService = new AIService();
const chatService = new ChatService();

async function getUserFromToken() {
    const token = await getStoredToken()

    if (!token?.access_token) {
        throw new Error("Not authenticated. Please run 'orbit login' first.");
    }

    const user = await prisma.user.findFirst({
        where: {
            sessions: {
                some: { token: token.access_token },
            },
        },
    });

    if (!user) {
        throw new Error("User not found. Please login again.");
    }

    console.log(chalk.green(`\nWelcome back, ${user.name}!\n`));
    return user;
}

async function initConversation(userId, conversationId = null) {
    const conversation = await chatService.getOrCreateConversation(
        userId,
        conversationId,
        "agent"
    )

    const conversationInfo = boxen(
        `${chalk.yellow("Conversation")}: ${conversation.title}\n` +
        `${chalk.gray("ID:")} ${conversation.id}\n` +
        `${chalk.gray("Mode:")} ${chalk.magenta("Agent (Code Generator)")}\n` +
        `${chalk.cyan("Working Directory:")} ${process.cwd()}`,
        {
            padding: 1,
            margin: { top: 1, bottom: 1 },
            borderStyle: "round",
            borderColor: "magenta",
            title: "Agent Mode",
            titleAlignment: "center",
        }
    );
    console.log(conversationInfo);

    return conversation;
}

async function saveMessage(conversationId, role, content) {
    return await chatService.addMessage(conversationId, role, content);
}

async function agentLoop(conversation) {
    const helpBox = boxen(
        `${chalk.cyan.bold("What can the agent do?")}\n\n` +
        `${chalk.gray('• Generate complete applications from descriptions')}\n` +
        `${chalk.gray('• Create all necessary files and folders')}\n` +
        `${chalk.gray('• Include setup instructions and commands')}\n` +
        `${chalk.gray('• Generate production-ready code')}\n\n` +
        `${chalk.yellow.bold("Examples:")}\n` +
        `${chalk.white('• "Build a todo app with React and Tailwind"')}\n` +
        `${chalk.white('• "Create a REST API with Express and MongoDB"')}\n` +
        `${chalk.white('• "Make a weather app using OpenWeatherMap API"')}\n\n` +
        `${chalk.gray('Type "exit" to end the session')}`,
        {
            padding: 1,
            margin: { bottom: 1 },
            borderStyle: "round",
            borderColor: "cyan",
            title: "Agent Instructions",
        }
    );

    console.log(helpBox);

    while (true) {
        const userInput = await text({
            message: chalk.magenta("What would you like to build?"),
            placeholder: "Describe your thoughts...",
            validate(value) {
                if (!value || value.trim().length === 0) {
                    return "Description cannot be empty";
                }
                if (value.trim().length < 10) {
                    return "Please provide more details (at least 10 characters)";
                }
            },
        })

        if (isCancel(userInput)) {
            console.log(chalk.yellow("\nAgent session cancelled! See you soon.\n"));
            process.exit(0);
        }

        if (userInput.toLowerCase() === "exit") {
            console.log(chalk.yellow("\nAgent session ended! See you soon.\n"));
            break;
        }

        const userBox = boxen(chalk.white(userInput), {
            padding: 1,
            margin: { top: 1, bottom: 1 },
            borderStyle: "round",
            borderColor: "blue",
            title: "Your Request",
            titleAlignment: "left",
        });
        console.log(userBox);

        // save the user message.
        await saveMessage(conversation.id, "user", userInput);

        try {
            //generate application using structured output
            const result = await generateApplication(
                userInput,
                aiService,
                process.cwd()
            );

            if (result && result.success) {
                //save successful generation details
                const responseMessage = `Generated application: ${result.folderName}\n` +
                    `Files created: ${result.files.length}\n` +
                    `Location: ${result.appDir}\n\n` +
                    `Setup commands:\n${result.commands.join('\n')}`;

                await saveMessage(conversation.id, "assistant", responseMessage);

                //ask if user wants to generate another app
                const continuePrompt = await confirm({
                    message: chalk.cyan("Would you like to generate another application?"),
                    initialValue: false,
                });

                if (isCancel(continuePrompt) || !continuePrompt) {
                    console.log(chalk.yellow("\nGreat! Check your new application.\n"));
                    break;
                }

            } else {
                throw new Error("Generation returned no result. Please try again later.");
            }
        } catch (error) {
            console.log(chalk.red(`\nError: ${error.message}\n`));

            await saveMessage(conversation.id, "assistant", `Error: ${error.message}`);

            const retry = await confirm({
                message: chalk.cyan("Would you like to try again?"),
                initialValue: true,
            });

            if (isCancel(retry) || !retry) {
                break;
            }
        }
    }
}

export async function startAgentChat(conversationId = null) {
    try {
        const title = gradient.cristal.multiline(`
                        Orbital
                        `);

        const subtitle = chalk.green("Agent Mode");

        intro(
            boxen(
                `${title}\n${chalk.gray("────────────────────────")}\n${subtitle}`,
                {
                    padding: { top: 1, bottom: 1, left: 4, right: 4 },
                    margin: 1,
                    borderStyle: "round",
                    borderColor: "green",
                    align: "center"
                }
            )
        );

        const user = await getUserFromToken();

        const shouldContinue = await confirm({
            message: chalk.yellow("The agent will create files and folders in the current directory. Do you want to continue?"),
            initialValue: true,
        });

        if (isCancel(shouldContinue) || !shouldContinue) {
            cancel(chalk.yellow("Agent mode cancelled"));
            process.exit(0);
        }

        const conversation = await initConversation(user.id, conversationId);
        await agentLoop(conversation);

        outro(chalk.green.bold("\nThanks for using Agent Mode! See you next time."));

    } catch (error) {
        const errorBox = boxen(chalk.red(`Error: ${error.message}`), {
            padding: 1,
            margin: 1,
            borderStyle: "round",
            borderColor: "red",
        });
        console.log(errorBox);
        process.exit(1);
    }
}