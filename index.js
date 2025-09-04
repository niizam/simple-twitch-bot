import { Client } from 'tmi.js';
import { config } from 'dotenv'; config();
import { translate } from "googletrans";
import OpenAI from 'openai';
import fs from 'fs';
import { Parser } from 'expr-eval';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const blacklisted_bots = process.env.BLACKLISTED_BOTS.split('|');
const owner = process.env.OWNER_NAME.split('|'); // Fixed: was using CHANNEL_NAME instead of OWNER_NAME
const raidMessages = process.env.RAID_MESSAGES.split('|');

let gptMode = false;
let translateMode = false;
let toggleBot = true;
let lastGptCall = 0; // Rate limiting for GPT calls
const GPT_COOLDOWN = 3000; // 3 seconds cooldown between AI responses
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

// Safe math expression parser
const mathParser = new Parser();

async function gpt(messages) {
    // Keep only the latest 10 user messages, plus the system message
    // 1 system message + 10 latest user messages
    messages = messages.slice(-11);

    try {
        const chatCompletion = await openai.chat.completions.create({
            model: process.env.GPT_MODEL,
            messages: messages,
            max_tokens: 100,
        });
        return chatCompletion.choices[0].message.content;
    } catch (error) {
        console.error('GPT API Error:', error.message);
        return 'Sorry, I\'m having trouble thinking right now. Try again later!';
    }
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
    try {
        // Ensure db directory exists
        if (!fs.existsSync('./db')) {
            fs.mkdirSync('./db', { recursive: true });
        }
        fs.appendFile('./db/ChatHistory.csv', history + '\n', (err) => {
            if (err) console.error('Error saving chat history:', err);
        });
    } catch (error) {
        console.error('Error with chat history:', error);
    }

    if (toggleBot === false) return;
	if(self) return;

    // Ignore other bots message
    if(blacklisted_bots.includes(tags.username.toLowerCase())) return;

    /*  Toggle translate mode
        Type "!tlm" to turn on/off translate mode */
    if(command === "!tlm" && owner.includes(tags.username.toLowerCase())) {
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
                console.error('Translation error:', error.message);
            });
        
    }

    // Manual translate command
    else if (command.includes('!tl ')) {
        const text = message.replace('!tl ', '').trim();
        if (!text) {
            client.say(channel, 'Please provide text to translate. Usage: !tl <text>');
            return;
        }
        translate(text, { from: process.env.SOURCE_LANG, to: process.env.TARGET_LANG })
            .then(function (result) {
                // If the source language is TARGET_LANG in .env, don't translate
                if (result.src === process.env.TARGET_LANG) return
                client.say(channel, `${tags.username}: ${result.text} (${result.src} -> ${process.env.TARGET_LANG})`);
            })
            .catch(function (error) {
                console.error('Translation error:', error.message);
                client.say(channel, 'Sorry, translation is not available right now.');
            });
        
    }

    // Toggle bot command to turn on/off the bot
    else if (command === '!bot' && owner.includes(tags.username.toLowerCase())) {
        toggleBot = !toggleBot;
        client.say(channel, `Bot is now ${toggleBot ? 'on' : 'off'}`);
    }

    // !dc or !discord command
    else if (/!dc\b|!discord\b/gi.test(command)) {
        client.say(channel, process.env.DISCORD_MESSAGE);
    }

    // Calculator command (ex: !calc 5*100+2/10) - SAFE VERSION
    else if (command.includes('!calc')) {
        const expression = message.replace('!calc ', '').trim();
        try {
            // Validate expression contains only allowed characters
            if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
                client.say(channel, 'Invalid characters in expression. Only numbers and basic math operators are allowed.');
                return;
            }
            // Use safe parser instead of eval()
            const result = mathParser.evaluate(expression);
            if (isNaN(result) || !isFinite(result)) {
                client.say(channel, 'Invalid mathematical expression.');
            } else {
                client.say(channel, `${expression} = ${result}`);
            }
        } catch (error) {
            client.say(channel, 'Invalid mathematical expression.');
        }
    }

    // Lurk and Unlurk command
    else if (command === '!lurk') {
        client.say(channel, process.env.LURK_MESSAGE.replace('%username', tags.username));
    }
    else if (command === '!unlurk') {
        client.say(channel, process.env.UNLURK_MESSAGE.replace('%username', tags.username));
    }

    // Magic 8-ball command
    else if (command === '!8ball' || command.includes('!8ball ')) {
        const responses = [
            'It is certain', 'Reply hazy, try again', 'Don\'t count on it', 
            'It is decidedly so', 'Ask again later', 'My reply is no',
            'Without a doubt', 'Better not tell you now', 'My sources say no',
            'Yes definitely', 'Cannot predict now', 'Outlook not so good',
            'You may rely on it', 'Concentrate and ask again', 'Very doubtful',
            'As I see it, yes', 'Most likely', 'Outlook good', 'Yes', 'Signs point to yes'
        ];
        const response = responses[Math.floor(Math.random() * responses.length)];
        client.say(channel, `🎱 ${response}`);
    }

    // Coin flip command
    else if (command === '!flip') {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        client.say(channel, `🪙 ${result}!`);
    }

    // Dice roll command
    else if (command === '!roll' || command.includes('!roll ')) {
        let sides = 6;
        const rollMatch = command.match(/!roll\s+(\d+)/);
        if (rollMatch) {
            sides = Math.min(Math.max(parseInt(rollMatch[1]), 2), 100); // Limit between 2-100
        }
        const result = Math.floor(Math.random() * sides) + 1;
        client.say(channel, `🎲 You rolled a ${result} (1-${sides})`);
    }

    // Shoutout command (mod/owner only)
    else if (command.includes('!so ')) {
        const isMod = tags.mod || owner.includes(tags.username.toLowerCase());
        if (!isMod) {
            client.say(channel, 'Only moderators can use this command.');
            return;
        }
        const username = message.replace('!so ', '').replace('@', '').trim();
        if (username) {
            client.say(channel, `👏 Check out @${username}! Give them a follow at https://twitch.tv/${username}`);
        }
    }

    // Current time command
    else if (command === '!time') {
        const now = new Date();
        const timeString = now.toLocaleString('en-US', { 
            timeZone: process.env.TIMEZONE || 'UTC',
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        });
        client.say(channel, `🕐 Current time: ${timeString}`);
    }
    // Help command
    else if (/!help\b|!command\b|!commands\b|!cmd\b/gi.test(command)) {
        client.say(channel, process.env.HELP_MESSAGE || 'Available commands: !dc, !lurk, !unlurk, !calc, !tl, !help');
    }

    // Toggle gpt mode
    else if (command === '!gptm' && owner.includes(tags.username.toLowerCase())) {
        gptMode = !gptMode;
        client.say(channel, `AI mode is now ${gptMode ? 'on' : 'off'}`);
    }

    // GPT chatbot with rate limiting
    else if (gptMode === true && !command.match(/\b!dc\b|!bot\b|!ai\b|!tl\b|!tlm\b|!gptm\b|!lurk\b|!unlurk\b|!calc\b|!help\b|!cmd\b|!commands\b|!so\b|!command\b|!sr\b|!followage\b/gi)) {
        const now = Date.now();
        if (now - lastGptCall < GPT_COOLDOWN) {
            return; // Skip if within cooldown period
        }
        lastGptCall = now;
        
        store(`${tags.username}: ${message}`);
        gpt(messages).then((response) => {
            store(response, 'assistant');
            client.say(channel, response);
        }).catch((error) => {
            console.error('GPT Error:', error);
        });
    }

    // Manual GPT command with rate limiting
    else if (command.includes('!ai ')) {
        const now = Date.now();
        if (now - lastGptCall < GPT_COOLDOWN) {
            client.say(channel, 'Please wait a moment before using AI again.');
            return;
        }
        lastGptCall = now;
        
        const text = message.replace('!ai ', '');
        store(`${tags.username}: ${text}`);
        gpt(messages).then((response) => {
            store(response, 'assistant');
            client.say(channel, response);
        }).catch((error) => {
            console.error('GPT Error:', error);
            client.say(channel, 'Sorry, I\'m having trouble thinking right now. Try again later!');
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