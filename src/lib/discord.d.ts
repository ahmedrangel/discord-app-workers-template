import { InteractionResponseType, InteractionType, verifyKey } from "discord-interactions";

export declare enum CommandType {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP = 2,
  STRING = 3,
  INTEGER = 4,
  BOOLEAN = 5,
  USER = 6,
  CHANNEL = 7,
  ROLE = 8,
  MENTIONABLE = 9,
  NUMBER = 10,
  ATTACHMENT = 11
}

export declare enum API {
  BASE = "https://discord.com/api/v10"
}

export { InteractionResponseType, InteractionType, verifyKey };
