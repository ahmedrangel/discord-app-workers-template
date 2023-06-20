# Discord Bot Slash Commands Template Using Clourflare Workers
When setting up a Bot on Discord, you have the option to receive standard events from the client through webhooks. Discord will make a request to a pre-defined HTTPS endpoint and provide event details within a JSON payload.

- Uses the [Discord Interactions API](https://discord.com/developers/docs/interactions/receiving-and-responding)
- Uses [Cloudflare Workers](https://workers.cloudflare.com/) for hosting

## Setting up a Discord Bot

- Visit the [Discord Developer Portal](https://discord.com/developers/applications) and log in to your account

#### Click `New Application`, and choose a name
- If you want it now, copy the `APPLICATION ID` and `PUBLIC KEY`. We'll be storing it in the secrets later with [dotenv](https://www.npmjs.com/package/dotenv) and/or worker environment variables.

![image](https://github.com/ahmedrangel/discord-bot-worker-template/assets/50090595/764ff275-6ea5-490a-9353-ea1f69afafab)


#### Click on the `Bot` tab, and create your bot.
- Grab the token for your bot, and keep it somewhere safe locally or in the secrets.
- Enable all the privileged gateway intents.


#### Click on the `OAuth2` tab, and choose the `URL Generator`. 
- Select `bot` and `applications.commands` scopes.
- Select all text permissions or select the permissions that you consider necessary for your bot.

![image](https://github.com/ahmedrangel/discord-bot-worker-template/assets/50090595/65e42503-511a-4dd0-b1eb-3c28bea1146a)
![image](https://github.com/ahmedrangel/discord-bot-worker-template/assets/50090595/9301ca2d-d951-4367-9ccb-0091b9fbcded)

- Copy the generated URL, and paste it into the browser and select the server where you'd like to develop your bot.

![image](https://github.com/ahmedrangel/discord-bot-worker-template/assets/50090595/a1905a30-ab49-40c1-8b4b-1afc8836e110)


## Creating a Cloudflare Worker Application

- Make sure to [install the Wrangler CLI](https://developers.cloudflare.com/workers/cli-wrangler/install-update/).
- To install **Wrangler**, ensure you have [Node.js](https://nodejs.org/en/), [npm](https://docs.npmjs.com/getting-started) and/or [pnpm](https://pnpm.io/installation) installed.
- I'm using pnpm so I'll run `$ pnpm i -g wrangler`.
- Move to your preferred directory and then run `$ pnpm create cloudflare` to create a new cloudflare application (it will create a directory for your application). *You will probably need to authorize your cloudflare account before continue*.
- Set a name for your application and select "Hello World" script.

![image](https://github.com/ahmedrangel/discord-bot-worker-template/assets/50090595/1f1ff7c6-c95b-4c2f-b451-3f5899c356c2)

- It will ask you if you want to use typescript, I selected **no**. Then, your worker is created, select **yes** to deploy.

![image](https://github.com/ahmedrangel/discord-bot-worker-template/assets/50090595/a87ec548-5dfa-41a5-b7d4-a7c89a972bff)
- Select your cloudflare account to deploy.
- When it's succesful deployed, visit the [Cloudflare Dashboard](https://dash.cloudflare.com/)
- Click on the `Workers & Pages` tab.
- Click on your worker.
- You will see your worker route.

![image](https://github.com/ahmedrangel/discord-bot-worker-template/assets/50090595/2b9e29bd-0362-4645-a907-7cdaa6c8b573)

- If you access your worker route it will show a **"Hello World"** message. That means the worker script is deployed.

![image](https://github.com/ahmedrangel/discord-bot-worker-template/assets/50090595/d3b99a5d-e449-4897-b4a4-86d043818d95)

- Now go back and open your application folder on your code editor. There you have the "Hello World" worker script.

![image](https://github.com/ahmedrangel/discord-bot-worker-template/assets/50090595/aecaebb3-d4ad-4410-9c76-c6167e9e5ea3)

- We don't need these files so we will remove them and add the templates files to your application folder.
- Make sure to set the correct name and main worker router path to `src/bot.js` on your `wrangler.toml`.

![image](https://github.com/ahmedrangel/discord-bot-worker-template/assets/50090595/306763c2-2425-4f89-b195-fbb6a64dedd7)

- Make sure to perform a `$ pnpm install` to install all dependencies.


## Storing secrets / environment variables
### Using dotenv
- You'll need to store your discord bot secrets: `APPLICATION ID`, `PUBLIC KEY` and `TOKEN` in your `.env` file.
- Dotenv is a critical requirement for the script responsible for registering bot commands when executing locally `register.js`.

![image](https://github.com/ahmedrangel/discord-bot-worker-template/assets/50090595/582fbdd4-9098-4184-997c-6d9ae6985559)

### Using Cloudflare Worker Environment Variables
- This is optional because those secrets can only be used by the main worker router `bot.js`. If you want, you can use your dotenv secrets instead.
- Visit the [Cloudflare Dashboard](https://dash.cloudflare.com/) and go to your worker.
- Click on the Settings -> Variables tab, add your secrets and save.

![image](https://github.com/ahmedrangel/discord-bot-worker-template/assets/50090595/a33a6918-c848-48d5-b938-d8b1ce1a3bd2)

> BTW: This template is using Cloudflare Worker Environment Variables.

## Next Steps
### Register commands
Now that we have our template and secrets added we can register our commands by running locally `register.js`.

The code responsible for registering our commands can be found in the file ```register.js```. These commands can be registered either globally, enabling their availability across all servers where the bot is installed, or they can be specifically registered for a single server. For the purpose of this example, our emphasis will be placed on global commands.
```js
/**
 * Register slash commands with a local run
 */
import { REST, Routes } from "discord.js";
import * as commands from "./commands.js";
import * as dotenv from "dotenv";
dotenv.config();

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
const commandsArray = Object.values(commands);

try {
  console.log("Started refreshing application (/) commands.");
  await rest.put(Routes.applicationCommands(process.env.DISCORD_APPLICATION_ID), { body: commandsArray });

  console.log("Successfully reloaded application (/) commands.");
} catch (error) {
  console.error(error);
}
```
To register your commands run:
```
$ pnpm discord:register
```
If everything is ok, it should print that the commands have been reloaded successfully.

![image](https://github.com/ahmedrangel/discord-bot-workers-template/assets/50090595/b55cfe99-73f3-4b58-aca6-e59431f172f0)


### Set Interactions Endpoint URL on your Discord Application
Now, to make the commands work you have to set an INTERACTIONS ENDPOINT URL. This will be the url of your worker.

By setting your worker url and saving it, discord will send a **PING** interaction to verify your webhook.

![image](https://github.com/ahmedrangel/discord-bot-workers-template/assets/50090595/19cfca11-655b-466b-a8f8-71c159f0b18d)


All the API calls from Discord will be sent via a POST request to the root path ("/"). Subsequently, we will utilize the discord-interactions npm module to effectively interpret the event and transmit the outcomes. As shown in the `bot.js` code.
```js
router.post("/", async (req, env, context) => {
  const request_data = await req.json();
  if (request_data.type === InteractionType.PING) {
    /**
     * The `PING` message is used during the initial webhook handshake, and is
       required to configure the webhook in the developer portal.
     */
    console.log('Handling Ping request');
    return create(request_data.type);
  } else {
    // ... command interactions
  }
});
```
If everything is ok, your interactions endpoint url will be saved and your bot will respond to commands on the server it is in.

## Features
- Interactions Responses
  - Basic Interactions Responses
  - Deferred Interaction Responses
  - Update Deferred Interaction Responses
- Messages contents & options:
    - Embeds
    - Components
    - Attach Files

    and many more...

## Basic Command Examples
### /string
`bot.js`
```js
router.post("/", async (req, env, context) => {
  const request_data = await req.json();
  if (request_data.type === InteractionType.PING) {
    // ... PING ...
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

        // ... Other cases

        default:
          return error("Unknown Type", 400);
      }
    });
  }
});
```
`commands.js`
```js
export const STRING_COMMAND_EXAMPLE = {
  name: "string",
  description: "command description.",
  options: [  // Use options if you need the user to make any input with your commands
    {
      "name": "text",
      "description": "field description.",
      "type": CommandType.STRING,
      "required": true
    }
  ]
};

// ... Other commands
```
`Discord server`

![image](https://github.com/ahmedrangel/discord-bot-workers-template/assets/50090595/1006476a-1eaa-46a7-92b7-b2be8a385d35)
##
### /number
`bot.js`
```js
router.post("/", async (req, env, context) => {
  const request_data = await req.json();
  if (request_data.type === InteractionType.PING) {
    // ... PING ...
  } else {
    const { type, data, member, guild_id, channel_id, token } = request_data;
    const { name, options, resolved } = data;
    return create(type, options, async ({ getValue = (name) => name }) => {
      // Bot command cases
      switch (name) {

        // ... Other cases

        // Reply /number command (Bot will reply with a random number between 1 and 100) (example command)
        case C.NUMBER.name: {
          const userId = member.user.id; // user who triggered command
          const randomNumber = getRandom({min: 0, max: 100});
          return reply(`<@${userId}>'s random number: ${randomNumber}`);
        }

        // ... Other cases

        default:
          return error("Unknown Type", 400);
      }
    });
  }
});
```
`commands.js`
```js
export const NUMBER = {
    name: "number",
    description: "Get a random number between 0 and 100.",
    options: []
};

// ... Other commands
```
`Discord server`

![image](https://github.com/ahmedrangel/discord-bot-workers-template/assets/50090595/e620efec-db68-4acb-b3c7-21a32429fabc)
##
### /embed
`bot.js`
```js
router.post("/", async (req, env, context) => {
  const request_data = await req.json();
  if (request_data.type === InteractionType.PING) {
    // ... PING ...
  } else {
    const { type, data, member, guild_id, channel_id, token } = request_data;
    const { name, options, resolved } = data;
    return create(type, options, async ({ getValue = (name) => name }) => {
      // Bot command cases
      switch (name) {

        // ... Other cases

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

        // ... Other cases

        default:
          return error("Unknown Type", 400);
      }
    });
  }
});
```
`commands.js`
```js
export const EMBED_EXAMPLE = {
  name: "embed",
  description: "command description.",
  options: []
};

// ... Other commands
```
`Discord server`

![image](https://github.com/ahmedrangel/discord-bot-workers-template/assets/50090595/66ed8a62-9d8b-4d18-8d2b-15bf77bc86b1)
##
### /button
`bot.js`
```js
router.post("/", async (req, env, context) => {
  const request_data = await req.json();
  if (request_data.type === InteractionType.PING) {
    // ... PING ...
  } else {
    const { type, data, member, guild_id, channel_id, token } = request_data;
    const { name, options, resolved } = data;
    return create(type, options, async ({ getValue = (name) => name }) => {
      // Bot command cases
      switch (name) {

        // ... Other cases

        // Reply /button command (Bot will reply with a button component example message)
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

        // ... Other cases

        default:
          return error("Unknown Type", 400);
      }
    });
  }
});
```
`commands.js`
```js
export const BUTTON_EXAMPLE = {
  name: "button",
  description: "command description.",
  options: []
};

// ... Other commands
```
`Discord server`

![image](https://github.com/ahmedrangel/discord-bot-workers-template/assets/50090595/1e751ec6-1a75-4f43-966e-3c58c7138367)
##
### /files
`bot.js`
```js
router.post("/", async (req, env, context) => {
  const request_data = await req.json();
  if (request_data.type === InteractionType.PING) {
    // ... PING ...
  } else {
    const { type, data, member, guild_id, channel_id, token } = request_data;
    const { name, options, resolved } = data;
    return create(type, options, async ({ getValue = (name) => name }) => {
      // Bot command cases
      switch (name) {

        // ... Other cases

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
          }
          context.waitUntil(followUpRequest()); // function to followup, wait for request and update response
          return deferReply(); //
        }

        // ... Other cases

        default:
          return error("Unknown Type", 400);
      }
    });
  }
});
```
`commands.js`
```js
export const UPLOAD_FILE_EXAMPLE = {
  name: "files",
  description: "command description.",
  options: []
};

// ... Other commands
```
`Discord server`

![image](https://github.com/ahmedrangel/discord-bot-workers-template/assets/50090595/21417534-2733-498f-8c95-3019c81c6a4b)
