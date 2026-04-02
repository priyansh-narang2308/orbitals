import { cancel, confirm, intro, isCancel, outro } from "@clack/prompts";
import { logger } from "better-auth";
import { createAuthClient } from "better-auth/client";
import { deviceAuthorizationClient } from "better-auth/client/plugins";
import chalk from "chalk";
import { Command } from "commander";
import open from "open";
import os from "os";
import path from "path";
import yoctoSpinner from "yocto-spinner";
import * as z from "zod/v4";
import dotenv from "dotenv";
import prisma from "../../../lib/db.js";
import { getStoredToken, isTokenExpired, storeToken } from "../../../lib/token.js";

dotenv.config();

export const DEFAULT_SERVER_URL = process.env.BETTER_AUTH_URL || "http://localhost:3005";
export const DEFAULT_FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
export const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
export const CONFIG_DIR = path.join(os.homedir(), ".orbital");
export const TOKEN_FILE = path.join(CONFIG_DIR, "token.json");


// LOGIN Command
export async function loginAction(opts) {
    const options = z
        .object({
            serverUrl: z.string().optional(),
            clientId: z.string().optional(),
        })
        .parse(opts);

    const serverUrl = options.serverUrl || DEFAULT_SERVER_URL;
    const clientId = options.clientId || CLIENT_ID;

    intro(chalk.italic.blue("Orbital CLI Login"));

    if (!clientId) {
        logger.error("CLIENT_ID is not set in .env file");
        console.log(
            chalk.red("\nPlease set GITHUB_CLIENT_ID in your .env file")
        );
        process.exit(1);
    }

    // already logged in
    const existingToken = await getStoredToken();
    const expired = await isTokenExpired();

    if (existingToken && !expired) {
        const shouldReauth = await confirm({
            message: "You're already logged in. Do you want to log in again?",
            initialValue: false,
        });

        if (isCancel(shouldReauth) || !shouldReauth) {
            cancel("Login cancelled");
            process.exit(0);
        }
    }

    const authClient = createAuthClient({
        baseURL: serverUrl,
        plugins: [deviceAuthorizationClient()],
    });

    const spinner = yoctoSpinner({ text: "Requesting device authorization..." });
    spinner.start();

    try {
        const { data, error } = await authClient.device.code({
            client_id: clientId,
            scope: "openid profile email",
        });

        spinner.stop();

        if (error || !data) {
            logger.error(
                `Failed to request device authorization: ${error?.error_description || error?.message || "Unknown error"
                }`
            );

            if (error?.status === 404) {
                console.log(chalk.red("\nDevice authorization endpoint not found."));
                console.log(chalk.yellow("Make sure your auth server is running."));
            } else if (error?.status === 400) {
                console.log(
                    chalk.red("\nBad request - check your CLIENT_ID configuration.")
                );
            }

            process.exit(1);
        }

        const {
            device_code,
            user_code,
            verification_uri,
            verification_uri_complete,
            interval = 5,
            expires_in,
        } = data;

        const urlToOpen = (verification_uri_complete || verification_uri).replace(serverUrl, DEFAULT_FRONTEND_URL);

        console.log("");
        console.log(chalk.cyan("Device Authorization Required"));
        console.log("");
        console.log(
            `Please visit: ${chalk.underline.blue(urlToOpen)}`
        );
        console.log(`Enter code: ${chalk.yellow.green(user_code)}`);
        console.log("");

        const shouldOpen = await confirm({
            message: "Open browser automatically?",
            initialValue: true,
        });

        if (!isCancel(shouldOpen) && shouldOpen) {
            await open(urlToOpen);
        }

        console.log(
            chalk.gray(
                `Waiting for authorization (expires in ${Math.floor(
                    expires_in / 60
                )} minutes)...`
            )
        );

        const token = await pollForToken(
            authClient,
            device_code,
            clientId,
            interval
        );

        if (token) {
            const saved = await storeToken(token);

            if (!saved) {
                console.log(
                    chalk.yellow("\n⚠️ Warning: Could not save authentication token.")
                );
                console.log(
                    chalk.yellow("You may need to login again on next use.")
                );
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
                    name: true,
                    email: true
                }
            });

            outro(
                chalk.green(
                    `Login successful! Welcome ${user?.name || user?.email || "User"}- Orbital is now at your command.`
                )
            );

            console.log(chalk.gray(`\nToken saved to: ${TOKEN_FILE}`));
            console.log(
                chalk.gray("You can now use AI commands without logging in again.\n")
            );
        }
    } catch (err) {
        spinner.stop();
        console.error(chalk.red("\nLogin failed:"), err.message);
        process.exit(1);
    }
}

async function pollForToken(authClient, deviceCode, clientId, initialInterval) {
    let pollingInterval = initialInterval;
    const spinner = yoctoSpinner({ text: "", color: "cyan" });
    let dots = 0;

    return new Promise((resolve, reject) => {
        const poll = async () => {
            dots = (dots + 1) % 4;
            spinner.text = chalk.gray(
                `Polling for authorization${".".repeat(dots)}${" ".repeat(3 - dots)}`
            );
            if (!spinner.isSpinning) spinner.start();

            try {
                // get that paricular token
                const { data, error } = await authClient.device.token({
                    // taken from better auth docs
                    grant_type: "urn:ietf:params:oauth:grant-type:device_code",
                    device_code: deviceCode,
                    client_id: clientId,
                    fetchOptions: {
                        headers: {
                            "user-agent": `Orbital CLI`,
                        },
                    },
                });

                if (data?.access_token) {
                    console.log(
                        chalk.bold.yellow(`\nYour access token: ${data.access_token}`)
                    );
                    spinner.stop();
                    resolve(data);
                    return;
                } else if (error) {
                    switch (error.error) {
                        case "authorization_pending":
                            break;
                        case "slow_down":
                            pollingInterval += 5;
                            break;
                        case "access_denied":
                            spinner.stop();
                            logger.error("Access was denied by the user");
                            process.exit(1);
                            break;
                        case "expired_token":
                            spinner.stop();
                            logger.error("The device code has expired. Please try again.");
                            process.exit(1);
                            break;
                        default:
                            spinner.stop();
                            logger.error(`Error: ${error.error_description}`);
                            process.exit(1);
                    }
                }
            } catch (err) {
                spinner.stop();
                logger.error(`Network error: ${err.message}`);
                process.exit(1);
            }

            setTimeout(poll, pollingInterval * 1000);
        };

        setTimeout(poll, pollingInterval * 1000);
    });
}

// Commandar
export const login = new Command("login")
    .description("Login to Orbital CLI")
    .option("--server-url <url>", "The Better Auth server URL", DEFAULT_SERVER_URL)
    .option("--client-id <id>", "The OAuth client ID", CLIENT_ID)
    .action(loginAction);