/**
 * Cloudflare worker.
 */
import * as C from "./commands.js";
import { AutoRouter, error, text } from "itty-router";
import { create, reply, deferReply, deferUpdate } from "./interactions.js";
import { getRandom } from "./functions.js";
import { verifyKey, InteractionType, ButtonStyleTypes, MessageComponentTypes } from "discord-interactions";

const router = AutoRouter();

/**
 * A simple :wave: hello page to verify the worker is working.
 */
router.get("/", (req, env) => text(`👋 ${env.DISCORD_APPLICATION_ID}`));

router.post("/", async (req, env, context) => {
  const request_data = await req.json();
  if (request_data.type === InteractionType.PING) {
    /**
     * The `PING` message is used during the initial webhook handshake, and is
       required to configure the webhook in the developer portal.
     */
    console.log("Handling Ping request");
    return create(request_data.type);
  } else {
    const { type, data, member, guild_id, channel_id, token } = request_data;
    const { name, options, resolved } = data;
    return create(type, options, async ({ getValue = (name) => name }) => {
      // Bot command cases
      switch (name) {
      // Reply /string command (Bot will reply with the string the user entered)
      case C.STRING_COMMAND_EXAMPLE.name: {
        const string = getValue("text");
        return reply(`Your string: ${string}`);
      }

      // Reply /number command (Bot will reply with a random number between 0 and 100) (example command)
      case C.NUMBER.name: {
        const userId = member.user.id; // user who triggered command
        const randomNumber = getRandom({min: 0, max: 100});
        return reply(`<@${userId}>'s random number: ${randomNumber}`);
      }

      // Reply /embed command (Bot will reply with an embed example message)
      case C.EMBED_EXAMPLE.name: {
        const message = "Bot message";
        const hexcolor = "FB05EF";
        const embeds = [];
        embeds.push({
          color: Number("0x" + hexcolor),
          author: {
            name: "Author name",
            icon_url: ""
          },
          title: "Title",
          url: "https://example.com",
          description: "Description",
        });
        return reply(message, {
          embeds
        });
      }

      // Reply /button command (Bot will reply with a button example message)
      case C.BUTTON_EXAMPLE.name: {
        const message = "Bot message";
        const button = [];
        button.push({
          type: MessageComponentTypes.BUTTON,
          style: ButtonStyleTypes.LINK,
          label: "Open Browser",
          url: "https://example.com"
        });
        return reply(message, {
          components: [{
            type: MessageComponentTypes.ACTION_ROW,
            components: button
          }]
        });
      }

      /**
         * For uploading files and fetching URLs, from my experience, I recommend using Deferred Messages and Worker's waitUntil()
         * (Useful if your command needs more than 3 seconds to respond, otherwise reply() will fail)
         */

      // Defer Reply and Update /file command (Bot will fetch for a file url and then upload it and defer reply)
      case C.UPLOAD_FILE_EXAMPLE.name: {
        const followUpRequest = async () => {
          const message = "Bot message";
          const files = [];
          const fileFromUrl = await fetch("https://i.kym-cdn.com/photos/images/newsfeed/001/564/945/0cd.png");
          const blob = await fileFromUrl.blob();
          files.push({
            name: "filename.png",
            file: blob
          });
          // Update defer
          return deferUpdate(message, {
            token,
            application_id: env.DISCORD_APPLICATION_ID,
            files
          });
        };
        context.waitUntil(followUpRequest()); // function to followup, wait for request and update response
        return deferReply(); //
      }

      // You can combine all the options (embeds, components, files) according to your creativity and the needs of your command
      // Defer Reply and Update /combined command (Bot will reply a message that contains text content, embeds, components and files)
      case C.COMBINED_OPTIONS_EXAMPLE.name: {
        const followUpRequest = async () => {
          const message = "Bot message";
          const embeds = [];
          const button = [];
          const files = [];
          const fileFromUrl = await fetch("https://i.kym-cdn.com/photos/images/newsfeed/001/564/945/0cd.png");
          const blob = await fileFromUrl.blob();

          const hexcolor = "FB05EF";
          embeds.push({
            color: Number("0x" + hexcolor),
            author: {
              name: "Author name",
              icon_url: ""
            },
            title: "Title",
            url: "https://example.com",
            description: "Description",
          });

          files.push({
            name: "filename.png",
            file: blob
          });

          button.push({
            type: MessageComponentTypes.BUTTON,
            style: ButtonStyleTypes.LINK,
            label: "Open Browser",
            url: "https://example.com"
          });
          // Update defer
          return deferUpdate(message, {
            token,
            application_id: env.DISCORD_APPLICATION_ID,
            embeds,
            components: [{
              type: MessageComponentTypes.ACTION_ROW,
              components: button
            }],
            files
          });
        };
        context.waitUntil(followUpRequest()); // function to followup, wait for request and update response
        return deferReply(); //
      }

      // Extra funny command
      // Reply /ship command: Ship two users together, shows their "love" compatibility percentage and their ship name on an embed.
      case C.SHIP.name: {
        const u1 = getValue("user1"); // First user value
        const u2 = getValue("user2"); // User to ship value
        const message = "";
        const embeds = [];
        const p = getRandom({min: 0, max: 100});
        const { users } = resolved;
        const chars_name1 = users[u1].username.substring(0, 3);
        const chars_name2 = users[u2].username.substring(users[u2].username.length - 2);
        const ship_name = chars_name1 + chars_name2;
        const hexcolor = "FB05EF";
        embeds.push({
          color: Number("0x" + hexcolor),
          description: `❤️ | <@${u1}> & <@${u2}> are **${p}%** compatible.\n❤️ | Ship name: **${ship_name}**.`
        });
        return reply(message, {
          embeds
        });
      }
      default:
        return error(400, "Unknown Type")
      }
    });
  }
});

router.all("*", () => error(404));

export default {
  async fetch(request, env, context) {
    const { method, headers } = request;
    if (method === "POST") {
      const signature = headers.get("x-signature-ed25519");
      const timestamp = headers.get("x-signature-timestamp");
      const body = await request.clone().arrayBuffer();
      const isValidRequest = await verifyKey(
        body,
        signature,
        timestamp,
        env.DISCORD_PUBLIC_KEY
      );
      if (!isValidRequest) {
        return new Response("Bad request signature.", { status: 401 });
      }
    }
    return router.fetch(request, env, context);
  },
};
