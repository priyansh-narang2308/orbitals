import chalk from "chalk";
import boxen from "boxen";

import { text, isCancel, intro, outro } from "@clack/prompts";
import yoctoSpinner from "yocto-spinner";

import { marked } from "marked";
import { markedTerminal } from "marked-terminal";

import { AIService } from "../../services/gemini.service.js";
import { ChatService } from "../../services/chat.service.js";

import { getStoredToken } from "../../lib/token.js";
import prisma from "../../lib/db.js";
import gradient from "gradient-string";

// Configure marked to use terminal renderer (USED AI 😭)
marked.use(
    markedTerminal({
        code: chalk.cyan,
        blockquote: chalk.gray.italic,
        heading: chalk.green.bold,
        firstHeading: chalk.magenta.underline.bold,
        hr: chalk.reset,
        listitem: chalk.reset,
        list: chalk.reset,
        paragraph: chalk.reset,
        strong: chalk.bold,
        em: chalk.italic,
        codespan: chalk.yellow.bgBlack,
        del: chalk.dim.gray.strikethrough,
        link: chalk.blue.underline,
        href: chalk.blue.underline,
    })
);

//service initiilize
const aiService = new AIService();
const chatService = new ChatService();

async function getUserFromToken() {
    const token = await getStoredToken();
    if (!token?.access_token) {
        throw new Error("Not authenticated. Please run 'orbital login' first.");
    }

    const spinner = yoctoSpinner({ text: "Authenticating..." }).start();

    const user = await prisma.user.findFirst({
        where: {
            sessions: {
                some: { token: token.access_token },
            },
        },
    });

    if (!user) {
        spinner.error("User not found");
        throw new Error("User not found. Please login again.");
    }

    spinner.success(`Welcome back, ${user.name}!`);
    return user;
}

async function initConversation(userId, conversationId = null, mode = "chat") {
    const spinner = yoctoSpinner({ text: "Loading conversation..." }).start();

    const conversation = await chatService.getOrCreateConversation(
        userId,
        conversationId,
        mode
    )

    spinner.success(`Conversation loaded: ${conversation.id}`);

    //diplay conversation info in thebox
    const conversationInfo = boxen(
        `${chalk.bold("Conversation")}: ${conversation.title}\n${chalk.gray("ID: " + conversation.id)}\n${chalk.gray("Mode: " + conversation.mode)}`,
        {
            padding: 1,
            margin: { top: 1, bottom: 1 },
            borderStyle: "round",
            borderColor: "cyan",
            title: "Chat Session",
            titleAlignment: "center",
        }
    );

    console.log(conversationInfo);

    // show exisiting messages
    if (conversation.messages.length > 0) {
        console.log(chalk.blue("\n--- Conversation History ---"));
        displayMessages(conversation.messages);
    }

    return conversation;
}

function displayMessages(messages) {
    messages.forEach((msg) => {
        if (msg.role === "user") {
            const userBox = boxen(chalk.white(msg.content), {
                padding: 1,
                margin: { left: 2, bottom: 1 },
                borderStyle: "round",
                borderColor: "blue",
                title: "You",
                titleAlignment: "left",
            });
            console.log(userBox);
        } else {
            // md for assistant
            const renderedContent = marked.parse(msg.content);
            const assistantBox = boxen(renderedContent.trim(), {
                padding: 1,
                paddingTop: 2,
                margin: { left: 2, bottom: 1 },
                borderStyle: "round",
                borderColor: "green",
                title: "Assistant",
                titleAlignment: "left",
            });
            console.log(assistantBox);
        }
    });
}

async function saveMessage(conversationId, role, content) {
    return await chatService.addMessage(conversationId, role, content);
}

async function getAIResponse(conversationId) {
    const spinner = yoctoSpinner({
        text: "AI is thinking...",
        color: "cyan"
    }).start();

    const dbMessages = await chatService.getMessages(conversationId);
    const aiMessages = chatService.formatMessagesForAI(dbMessages) //format those

    let fullResponse = "";

    try {
        const result = await aiService.sendMessage(aiMessages, (chunk) => {
            fullResponse += chunk;
        });

        spinner.stop();

        // Render AI Answer in boxen to match user input boxen style
        const renderedMarkdown = marked.parse(fullResponse);
        const assistantBox = boxen(renderedMarkdown.trim(), {
            padding: 1,
            margin: { left: 2, top: 1, bottom: 1 },
            borderStyle: "round",
            borderColor: "green",
            title: "Assistant",
            titleAlignment: "left",
        });
        console.log(assistantBox);

        return result.content;
    } catch (error) {
        spinner.error("Failed to get response from AI");
        throw error;
    }
}

async function updateConversationTitle(conversationId, userInput, messageCount) {
    if (messageCount === 1) {
        const title = userInput.slice(0, 50) + (userInput.length > 50 ? "..." : "");
        await chatService.updateTitle(conversationId, title);
    }
}

async function chatLoop(conversation) {
    const helpBox = boxen(
        `${chalk.gray('• Type your message and press Enter')}\n${chalk.gray('• Markdown formatting is supported in responses')}\n${chalk.gray('• Type "exit" to end conversation')}\n${chalk.gray('• Press Ctrl+C to quit anytime')}`,
        {
            padding: 1,
            margin: { bottom: 1 },
            borderStyle: "round",
            borderColor: "gray",
            dimBorder: true,
        }
    );

    console.log(helpBox);

    while (true) {
        const userInput = await text({
            message: chalk.blue("Your message"),
            placeholder: "Type your message...",
            validate(value) {
                if (!value || value.trim().length === 0) {
                    return "Message cannot be empty";
                }
            },
        });

        if (isCancel(userInput)) {
            const exitBox = boxen(chalk.yellow("Chat session ended. See you soon!"), {
                padding: 1,
                margin: 1,
                borderStyle: "round",
                borderColor: "yellow",
            });
            console.log(exitBox);
            process.exit(0);
        }

        if (userInput.toLowerCase() === "exit") {
            const exitBox = boxen(chalk.yellow("Chat session ended. See you soon!"), {
                padding: 1,
                margin: 1,
                borderStyle: "round",
                borderColor: "yellow",
            });
            console.log(exitBox);
            break;
        }

        await saveMessage(conversation.id, "user", userInput);
        const messages = await chatService.getMessages(conversation.id);
        const aiResponse = await getAIResponse(conversation.id);

        // save ai resp
        await saveMessage(conversation.id, "assistant", aiResponse);
        await updateConversationTitle(conversation.id, userInput, messages.length);
    }
}

export async function startChat(mode = "chat", conversationId = null) {

    try {
        // Set cursor to blinking bar (line)
        process.stdout.write("\x1b[5 q");

        const title = gradient.cristal.multiline(`
  Orbital 
`);

        const subtitle = chalk.green("Conversation Mode");

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
        const user = await getUserFromToken()
        const conversation = await initConversation(user.id, conversationId, mode);
        await chatLoop(conversation);

        outro(chalk.green("Thanks for chatting. Have a good day!"));

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