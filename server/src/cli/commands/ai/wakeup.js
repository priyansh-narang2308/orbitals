import yoctoSpinner from "yocto-spinner";
import { getStoredToken } from "../../../lib/token.js";
import { getCachedUser } from "../../../lib/redis.js";
import { select } from "@clack/prompts";
import { Command } from "commander";
import chalk from "chalk";


const wakeupAction = async () => {
    const token = await getStoredToken();

    if (!token?.access_token) {
        console.log(chalk.red("Not authenticated. Please login via 'orbital login'."));
        return;
    }

    const spinner = yoctoSpinner({ text: "Fetching User Profile..." })
    spinner.start()

    try {
        const user = await getCachedUser(token.access_token);

        spinner.stop()

        if (!user) {
            console.log(chalk.red("User not found. Please login again."));
            return;
        }

        console.log(chalk.green(`\nWelcome back, ${user.name}!\n`));

        const choice = await select({
            message: "Choose your Orbital experience",
            options: [
                {
                    value: "chat",
                    label: "Conversational Chat",
                    hint: "Talk with Orbit for questions, ideas, and assistance"
                },
                {
                    value: "tool",
                    label: "Tool-Enhanced Chat",
                    hint: "Orbit can use tools like Google Search and code execution"
                },
                {
                    value: "agent",
                    label: "Autonomous Agent",
                    hint: "Let Orbit plan, reason, and execute tasks (coming soon)"
                },
            ]
        });

        switch (choice) {
            case "chat":
                await startChat("chat");
                break;
            // case "tool":
            //     await startToolChat();
            //     break;
            // case "agent":
            //     await startAgentChat();
            //     break;
            default:
                console.log(chalk.red("Invalid choice."));
                break;
        }
    } catch (error) {
        spinner.stop()
        console.log(chalk.red("Failed to fetch user profile."));
    }
}

export const wakeup = new Command("wakeup")
    .description("Wake up Orbit AI")
    .action(wakeupAction)