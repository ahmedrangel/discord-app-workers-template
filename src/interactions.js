/**
 * Discord interactions manager
 */
import { InteractionResponseType, InteractionType, RouteBases } from "discord-api-types/v10";
import { $fetch } from "ofetch";
import { getFrom } from "./functions.js";

const API = RouteBases.api;

const callDiscordAPI = (endpoint, options) => {
  const { body, method, headers } = options;
  return $fetch(`${API.BASE}${endpoint}`, {
    body,
    method,
    headers
  });
};

const toDiscordEndpoint = (endpoint, options) => {
  const { body } = options;
  if (!body?.files) {
    return callDiscordAPI(endpoint, options);
  }

  const { files } = body;
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append(`files[${i}]`, files[i].file, files[i].name);
  }
  delete body.files;
  formData.append("payload_json", JSON.stringify(body));
  return callDiscordAPI(endpoint, { body: formData, ...options });
};

const pong = () => {
  return {
    type: InteractionResponseType.Pong
  };
};

// Create an interaction
export const create = (type, options, func) => {
  switch (type) {
    case InteractionType.Ping:
      return pong();
    case InteractionType.ApplicationCommand:
      return func({
        getValue: (name) => getFrom(name, options)
      });
  }
};

// Bot reply interaction
export const reply = (content, options) => {
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: content,
      embeds: options?.embeds,
      components: options?.components,
      flags: options?.flags
    }
  };
};

// Bot defer reply interaction. Loading status for a late response then updating it with deferUpdate.
// (Useful if your command needs more than 3 seconds to respond, otherwise reply() will fail. The user sees a loading state).
export const deferReply = (options) => {
  return {
    type: InteractionResponseType.DeferredChannelMessageWithSource,
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
    method: "POST",
    body: {
      type: InteractionResponseType.DeferredMessageUpdate,
      content: content,
      embeds: options?.embeds,
      components: options?.components,
      files: options?.files
    }
  });
};

export const updateMessage = () => {
  return { type: InteractionResponseType.UpdateMessage };
};

export const sendToChannel = async (content, options) => {
  const endpoint = (`/channels/${options.channelId}/messages`);
  return await toDiscordEndpoint(endpoint, {
    method: "POST",
    headers: { Authorization: "Bot " + options?.token },
    body: {
      content: content,
      embeds: options?.embeds,
      components: options?.components,
      files: options?.files
    }
  });
};

export const addRole = async (options) => {
  const endpoint = (`/guilds/${options.guildId}/members/${options.memberId}/roles/${options.roleId}`);
  return await toDiscordEndpoint(endpoint, {
    method: "PUT",
    headers: { Authorization: "Bot " + options.token }
  });
};

export const removeRole = async (options) => {
  const endpoint = (`/guilds/${options.guildId}/members/${options.memberId}/roles/${options.roleId}`);
  return await toDiscordEndpoint(endpoint, {
    method: "DELETE",
    headers: { Authorization: "Bot " + options.token }
  });
};

export const editFollowUpMessage = async (content, options) => {
  const { token, application_id, message_id } = options;
  const endpoint = `/webhooks/${application_id}/${token}/messages/${message_id}`;
  return await toDiscordEndpoint(endpoint, {
    method: "PATCH",
    body: {
      content: content,
      embeds: options?.embeds,
      components: options?.components,
      files: options?.files
    }
  });
};

export const editMessage = async (content, options) => {
  const { token, channel_id, message_id } = options;
  const endpoint = `/channels/${channel_id}/messages/${message_id}`;
  return await toDiscordEndpoint(endpoint, {
    method: "PATCH",
    body: {
      content: content,
      embeds: options?.embeds,
      components: options?.components,
      files: options?.files,
      flags: options?.flags
    },
    headers: { Authorization: "Bot " + token }
  });
};