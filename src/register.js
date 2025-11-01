/**
 * Register slash commands with a local run
 */
import { REST, Routes } from "discord.js";
import { loadEnvFile, env } from "node:process";
import * as commands from "./commands.js";
loadEnvFile();

const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);
const commandsArray = Object.values(commands);

try {
  console.log("Started refreshing application (/) commands.");
  await rest.put(Routes.applicationCommands(env.DISCORD_APPLICATION_ID), { body: commandsArray });

  console.log("Successfully reloaded application (/) commands.");
}
catch (error) {
  console.error(error);
}
