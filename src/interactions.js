/**
 * Discord interactions manager
 */
import { API } from "./lib/discord";
import { getFrom } from "./functions.js";
import { InteractionResponseType, InteractionType } from "discord-interactions";
import { $fetch } from "ofetch";

const toDiscordEndpoint = async (endpoint, body, method, authorization) => {
  const endpoint_url = `${API.BASE}${endpoint}`;
  if (!body?.files) {
    return $fetch(endpoint_url, {
      method,
      body,
      headers: authorization ? { Authorization: authorization } : {}
    }).catch(() => null);
  }

  const formData = new FormData();
  const { files } = body;
  for (let i = 0; i < files.length; i++) {
    formData.append(`files[${i}]`, files[i].file, files[i].name);
  }
  delete body.files;
  formData.append("payload_json", JSON.stringify(body));
  return $fetch(endpoint_url, {
    method,
    body: formData,
    headers: authorization ? { Authorization: authorization } : {}
  }).catch(() => null);
};

const pong = () => {
  return {
    type: InteractionResponseType.PONG,
  };
};

// Create an interaction
export const create = (type, options, func) => {
  switch (type) {
    case InteractionType.PING:
      return pong();
    case InteractionType.APPLICATION_COMMAND:
      return func({
        getValue: (name) => getFrom(name, options)
      });
  }
};

// Bot reply interaction
export const reply = (content, options) => {
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: content,
      embeds: options?.embeds,
      components: options?.components,
      flags: options?.flags
    },
  };
};

// Bot defer reply interaction. Loading status for a late response then updating it with deferUpdate.
// (Useful if your command needs more than 3 seconds to respond, otherwise reply() will fail. The user sees a loading state).
export const deferReply = (options) => {
  return {
    type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: options?.flags
    }
  };
};

// Bot defer update interaction. Update the loading state and show the response
export const deferUpdate = async (content, options) => {
  const { token, application_id } = options;
  const followup_endpoint = `/webhooks/${application_id}/${token}`;
  return await toDiscordEndpoint(followup_endpoint, {
    type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
    content: content,
    embeds: options?.embeds,
    components: options?.components,
    files: options?.files
  }, "POST");
};

export const updateMessage = () => {
  return { type: InteractionResponseType.UPDATE_MESSAGE };
};

export const sendToChannel = async (content, options) => {
  const endpoint = (`/channels/${options.channelId}/messages`);
  return await toDiscordEndpoint(endpoint, {
    content: content,
    embeds: options?.embeds,
    components: options?.components,
    files: options?.files
  }, "POST", "Bot " + options?.token);
};

export const addRole = async (options) => {
  const endpoint = (`/guilds/${options.guildId}/members/${options.memberId}/roles/${options.roleId}`);
  return await toDiscordEndpoint(endpoint, null, "PUT", "Bot " + options.token);
};

export const removeRole = async (options) => {
  const endpoint = (`/guilds/${options.guildId}/members/${options.memberId}/roles/${options.roleId}`);
  return await toDiscordEndpoint(endpoint, null, "DELETE", "Bot " + options.token);
};

export const editFollowUpMessage = async (content, options) => {
  const { token, application_id, message_id } = options;
  const endpoint = `/webhooks/${application_id}/${token}/messages/${message_id}`;
  return await toDiscordEndpoint(endpoint, {
    content: content,
    embeds: options?.embeds,
    components: options?.components,
    files: options?.files,
    flags: options?.flags
  }, "PATCH");
};

export const editMessage = async (content, options) => {
  const { token, channel_id, message_id } = options;
  const endpoint = `/channels/${channel_id}/messages/${message_id}`;
  return await toDiscordEndpoint(endpoint, {
    content: content,
    embeds: options?.embeds,
    components: options?.components,
    files: options?.files,
    flags: options?.flags
  }, "PATCH", "Bot " + token);
};