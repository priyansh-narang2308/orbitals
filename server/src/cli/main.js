#!/usr/bin/env node

import dotenv from "dotenv";
import chalk from "chalk";
import figlet from "figlet";
import { Command } from "commander";
import { login, logout, whoami } from "./commands/auth/login.js";

dotenv.config();

async function main() {
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
`)
    );

    const program = new Command("orbital");

    program
        .version("0.0.1")
        .description("Orbit CLI - Device Flow Authentication")

    // program.addCommand(wakeUp);
    program.addCommand(login);
    program.addCommand(logout);
    program.addCommand(whoami);

    program.action(() => {
        program.help();
    });

    program.parse();
}

main().catch((error) => {
    console.error(chalk.red("Error running Orbital CLI. Please try again later."), error);
    process.exit(1);
});