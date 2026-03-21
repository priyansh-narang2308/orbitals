#!/usr/bin/env node

import dotenv from "dotenv";
import chalk from "chalk";
import figlet from "figlet";
import gradient from "gradient-string";
import { Command } from "commander";

import { login } from "./commands/auth/login.js";
import { logout } from "./commands/auth/logout.js";
import { whoami } from "./commands/auth/whoami.js";

dotenv.config();

async function main() {
    const program = new Command("orbital");

    program
        .version("1.0.0", "-v, --version", "Show Orbital CLI version")
        .description("AI-powered developer assistant for your terminal");

    program.configureHelp({
        styleTitle: (text) => chalk.bold.cyan(text),
        styleUsage: (text) => chalk.white(text),
        styleOptionTerm: (text) => chalk.yellow(text),
        styleSubcommandTerm: (text) => chalk.bold.greenBright(text),
        styleDescriptionText: (text) => chalk.gray(text),
        styleCommandDescription: (text) => chalk.gray(text),
    });

    // program.addCommand(wakeup)
    program.addCommand(login);
    program.addCommand(logout);
    program.addCommand(whoami);

    program.action(() => {
        const banner = figlet.textSync("Orbital", {
            font: "ANSI Shadow",
            horizontalLayout: "default",
            verticalLayout: "default",
        });

        console.log(gradient.cristal.multiline(banner));

        console.log(
            chalk.yellow(`
AI-powered developer assistant for the terminal.

    • Generate code and scripts
    • Explain complex codebases
    • Debug errors instantly
`)
        );

        console.log(
            chalk.gray("Run ") +
            chalk.cyan("orbital --help") +
            chalk.gray(" to explore available commands.\n")
        );

        console.log(chalk.gray("────────────────────────────────────────\n"));

        program.help({ error: false });
    });

    program.parse();

}

main().catch((error) => {
    console.error(
        chalk.red.bold("Orbital CLI failed to start."),
        chalk.gray("\nPlease try again or check your configuration.\n")
    );
    console.error(chalk.gray(error));
    process.exit(1);
});
