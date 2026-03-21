#!/usr/bin/env node

import dotenv from "dotenv";
import chalk from "chalk";
import figlet from "figlet";
import { Command } from "commander";
import { login } from "./commands/auth/login.js";
import { logout } from "./commands/auth/logout.js";
import { whoami } from "./commands/auth/whoami.js";

dotenv.config();

async function main() {
    const program = new Command("orbital");

    program
        .version("1.0.0")
        .description("Orbit CLI - Device Flow Authentication")

    program.configureHelp({
        styleTitle: (text) => chalk.bold.cyan(text),
        styleUsage: (text) => chalk.white(text),
        styleOptionTerm: (text) => chalk.yellow(text),
        styleSubcommandTerm: (text) => chalk.bold.greenBright(text),
        styleDescriptionText: (text) => chalk.gray(text),
    });

    // program.addCommand(wakeUp);
    program.addCommand(login);
    program.addCommand(logout);
    program.addCommand(whoami);

    program.action(() => {
        console.log(
            chalk.cyan(
                figlet.textSync("Orbital CLI", {
                    font: "Standard",
                    horizontalLayout: "default",
                    verticalLayout: "default",
                    width: 80,
                    whitespaceBreak: false,
                })
            )
        );

        console.log(
            chalk.gray(`
A powerful AI-powered developer assistant built for the terminal.

Orbital CLI helps you interact with AI directly from your command line to:
• generate code and scripts
• explain complex codebases
• debug errors instantly

`) + chalk.gray("Type ") + chalk.cyan("orbital --help") + chalk.gray(" to view all commands.\n")
        );
        program.help();
    });

    program.parse();
}

main().catch((error) => {
    console.error(chalk.red("Error running Orbital CLI. Please try again later."), error);
    process.exit(1);
});