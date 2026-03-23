import chalk from "chalk";
import { Command } from "commander";
import prisma from "../../../lib/db.js";
import { requireAuth } from "../../../lib/token.js";

const DEMO_URL = "https://site--orbital--khcfwlpsmtj4.code.run";

// WhoAmI
export async function whoamiAction(opts) {
    const token = await requireAuth();

    if (!token?.access_token) {
        console.log(
            chalk.red.bold("\n✖ Not authenticated.\n") +
            chalk.gray("Run ") +
            chalk.cyan("orbital login") +
            chalk.gray(" to continue.\n")
        );
        process.exit(1);
    }

    const user = await prisma.user.findFirst({
        where: {
            sessions: {
                some: {
                    token: token.access_token,
                },
            },
        },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
        },
    });

    if (!user) {
        console.log(chalk.red("\nUnable to fetch user information.\n"));
        process.exit(1);
    }

    console.log(
        chalk.bold.cyan("\nOrbital Account\n") +
        chalk.gray("────────────────────────────\n") +
        chalk.white("Name   ") + chalk.gray("→ ") + chalk.greenBright(user.name) + "\n" +
        chalk.white("Email  ") + chalk.gray("→ ") + chalk.yellow(user.email) + "\n" +
        chalk.white("UserID ") + chalk.gray("→ ") + chalk.magenta(user.id) + "\n"
    );
}

export const whoami = new Command("whoami")
    .description("Show current authenticated user")
    .option("--server-url <url>", "The Better Auth server URL", DEMO_URL)
    .action(whoamiAction);
