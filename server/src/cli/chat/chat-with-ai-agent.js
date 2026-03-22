import chalk from "chalk";
import boxen from "boxen";
import { text, isCancel, cancel, intro, outro, confirm } from "@clack/prompts";
import { AIService } from "../../services/gemini.service.js";
import { ChatService } from "../../services/chat.service.js";
import { getStoredToken } from "../../lib/token.js";
import prisma from "../../lib/db.js";
import { generateApplication } from "../../config/agent.config.js";

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

