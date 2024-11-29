import { Client } from 'tmi.js';
import { config } from 'dotenv'; config();
import { translate } from "googletrans";
import OpenAI from 'openai';
import fs from 'fs';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const blacklisted_bots = process.env.BLACKLISTED_BOTS.split('|');
const owner = process.env.CHANNEL_NAME.split('|');
const raidMessages = process.env.RAID_MESSAGES.split('|');

let gptMode = false;
let translateMode = false;
let toggleBot = true;
let messages = [
    {
        role: 'system',
        content: process.env.GPT_SYSTEM_PROMPT,
    },
];

const client = new Client({
    options: { 
        debug: true 
    },
    connection: {
        reconnect: true,
    },
    identity: {
        username: process.env.BOT_USERNAME,
        password: process.env.OAUTH_TOKEN,
    },
    channels: [
        process.env.CHANNEL_NAME,
    ],
});

const openai = new OpenAI({
    apiKey: process.env.GPT_API_KEY,
    baseURL: process.env.GPT_API_ENDPOINT,
});

async function gpt(messages) {
    // Keep only the latest 10 user messages, plus the system message
    // 1 system message + 10 latest user messages
    messages = messages.slice(-11);

    const chatCompletion = await openai.chat.completions.create({
        model: process.env.GPT_MODEL,
        messages: messages,
        max_tokens: 100,
    });
    return chatCompletion.choices[0].message.content;
}

function store(text, role = 'user') {
    messages.push({
        role: role,
        content: text,
    });
}



client.connect().catch(console.error);

client.on('message', (channel, tags, message, self) => {
    
    config();

    const command = message.trim().toLowerCase();
    const timestamp = new Date().toISOString();
    const history = `${timestamp},${tags.username},${message}`;

    // Save chat history to CSV file
    fs.appendFile('./db/ChatHistory.csv', history + '\n', (err) => {
        if (err) throw err;
    });

    if (toggleBot === false) return;
	if(self) return;

    // Ignore other bots message
    if(blacklisted_bots.includes(tags.username.toLowerCase())) return;

    /*  Toggle translate mode
        Type "!tlm" to turn on/off translate mode */
    if(command === "!tlm" && tags.username.includes(owner)) {
        translateMode = !translateMode;
        client.say(channel, `Translate mode is now ${translateMode ? 'on' : 'off'}`);
    
	}

    // Auto translate mode
    else if (translateMode === true)  {
        const text = message;
        translate(text, { from: process.env.SOURCE_LANG, to: process.env.TARGET_LANG })
            .then(function (result) {
                // If the source language is TARGET_LANG in .env, don't translate
                if (result.src === process.env.TARGET_LANG) return
                client.say(channel, `${tags.username}: ${result.text} (${result.src} -> ${process.env.TARGET_LANG})`);
            })
            .catch(function (error) {
                console.log(error);
            });
        
    }

    // Manual translate command
    else if (command.includes('!tl ')) {
        const text = message.replace('!tl ', '');
        translate(text, { from: process.env.SOURCE_LANG, to: process.env.TARGET_LANG })
            .then(function (result) {
                // If the source language is TARGET_LANG in .env, don't translate
                if (result.src === process.env.TARGET_LANG) return
                client.say(channel, `${tags.username}: ${result.text} (${result.src} -> ${process.env.TARGET_LANG})`);
            })
            .catch(function (error) {
                console.log(error);
            });
        
    }

    // Toggle bot command to turn on/off the bot
    else if (command === '!bot' && tags.username.includes(owner)) {
        toggleBot = !toggleBot;
        client.say(channel, `is now ${toggleBot ? 'on' : 'off'}`);
    }

    // !dc or !discord command
    else if (/!dc\b|!discord\b/gi.test(command)) {
        client.say(channel, process.env.DISCORD_MESSAGE);
    }

    // Calculator command (ex: !calc 5*100+2/10)
    else if (command.includes('!calc')) {
        const expression = message.replace('!calc ', '');
        try {
            const result = eval(expression);
            client.say(channel, result.toString());
        } catch (error) {
            client.say(channel, error.message);
        }
    }

    // Lurk and Unlurk command
    else if (command === '!lurk') {
        client.say(channel, process.env.LURK_MESSAGE.replace('%username', tags.username));
    }
    else if (command === '!unlurk') {
        client.say(channel, process.env.UNLURK_MESSAGE.replace('%username', tags.username));
    }
    // Help command
    else if (/!help\b|!command\b|!commands\b|!cmd\b/gi.test(command)) {
        client.say(channel, pesan.help);
    }

    // Toggle gpt mode
    else if (command === '!gptm' && tags.username.includes(owner)) {
        gptMode = !gptMode;
        client.say(channel, `AI mode is now ${gptMode} ? 'on' : 'off}`);
    }

    // GPT chatbot
    else if (gptMode === true && !command.match(/\b!dc\b|!bot\b|!ai\b|!tl\b|!tlm\b|!gptm\b|!lurk\b|!unlurk\b|!calc\b|!help\b|!cmd\b|!commands\b|!so\b|!command\b|!sr\b|!followage\b/gi)) {
        store(`${tags.username}: ${message}`);
        gpt(messages).then((response) => {
            store(response, 'assistant');
            client.say(channel, response);
        });
    }

    // Manual GPT command
    else if (command.includes('!ai ')) {
        const text = message.replace('!ai ', '');
        store(`${tags.username}: ${text}`);
        gpt(messages).then((response) => {
            store(response, 'assistant');
            client.say(channel, response);
        });
    }
    
});

client.on('raided', (channel, username, viewers) => {
    // for how many message in raidMessages array, client say each message
    for (let i = 0; i < raidMessages.length; i++) {
        client.say(channel, raidMessages[i].replace('%username', username).replace('%viewers', viewers));
        sleep(1000);
    }
});

process.stdin.on('data', data => {
    const cmd = data.toString().trim();
    const command = cmd.toLowerCase();
    if (/exit\b|quit\b|q\b/gi.test(command)) {
        client.disconnect();
        process.exit();
    }
    else if (command.toLowerCase() === '!tlm') {
        translateMode = !translateMode;
        console.log(`Translate mode is now ${translateMode ? 'on' : 'off'}`);
    }
    else if (command === '!bot') {
        toggleBot = !toggleBot;
        console.log(`Bot is now ${toggleBot ? 'on' : 'off'}`);
    }
    else if (cmd.includes('!say ')) {
        const message = command.replace('!say ', '');
        client.say(process.env.CHANNEL_NAME, message);
    }
    else if (command === '!gptm') {
        gptMode = !gptMode;
        console.log(`GPT mode is now ${gptMode ? 'on' : 'off'}`);
    }
    
});

process.on('SIGINT', () => {
    client.disconnect().then(() => {
        console.log('Bot disconnected');
        process.exit();
    });
});