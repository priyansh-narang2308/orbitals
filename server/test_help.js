import { Command } from "commander";
import chalk from "chalk";

const p = new Command("orbital");
p.command("login").description("login to the system");

p.configureHelp({
    commandUsage: (cmd) => chalk.bold.cyan(cmd.name()) + " " + chalk.gray(cmd.usage() || ""),
    subcommandTerm: (cmd) => chalk.bold.greenBright(cmd.name()),
    commandDescription: (cmd) => chalk.gray(cmd.description() || ""),
    optionTerm: (option) => chalk.yellow(option.flags),
    optionDescription: (option) => chalk.gray(option.description || "")
});

p.help();
