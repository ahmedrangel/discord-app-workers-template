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
- I'm using pnpm so I'll run `pnpm i -g wrangler`.
- Move to your preferred directory and then run `pnpm create cloudflare` to create a new cloudflare application (it will create a directory for your application). *You will probably need to authorize your cloudflare account before continue*.
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
- Make sure to set the correct main worker router path to `src/bot.js` on your `wrangler.toml`. 
![image](https://github.com/ahmedrangel/discord-bot-worker-template/assets/50090595/306763c2-2425-4f89-b195-fbb6a64dedd7)
- Make sure to perform a `pnpm install` to install all dependencies.


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

