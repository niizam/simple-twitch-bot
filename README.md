# Simple Twitch Bot

A secure and feature-rich Twitch chat bot with translation, AI chatbot capabilities, and various interactive commands.

## ⚠️ Security Notice

This bot has been updated with important security improvements:
- **Safe Calculator**: No longer uses dangerous `eval()` function
- **Input Validation**: All user inputs are properly sanitized
- **Rate Limiting**: AI commands have cooldown to prevent spam
- **Error Handling**: Improved error handling prevents crashes

## 🚀 Features

- **Auto Translation**: Automatically translate chat messages between languages
- **AI Chatbot**: Powered by Groq (free) or OpenAI GPT
- **Interactive Commands**: 8-ball, dice roll, coin flip, calculator, and more
- **Moderation Tools**: Bot toggle, translation toggle, shoutouts (mod-only)
- **Chat History**: Automatically saves all chat to CSV file
- **Raid Support**: Customizable raid messages

## 📋 Requirements

- **Operating System**: Windows 10/11, macOS, or Linux
- **Runtime**: [Node.js](https://nodejs.org/) or [Bun](https://bun.sh/docs/installation)
- **Text Editor**: Notepad, VS Code, etc.
- **Version Control**: [Git](https://git-scm.com/downloads)
- **Twitch OAUTH_TOKEN**: Required for bot authentication
- **OpenAI GPT_API_KEY**: Optional, for AI chatbot (get free from [Groq](https://console.groq.com/keys))

## 🔑 Obtaining Twitch OAUTH_TOKEN

1. Visit [twitchtokengenerator.com](https://twitchtokengenerator.com)
2. Select **Bot Chat Token**
3. Login to your chat bot's Twitch account
4. Complete the verification
5. Copy your OAUTH_TOKEN to the `.env` file

## 💾 Installation Guide

### Windows (PowerShell/Command Prompt)
```cmd
# Install Git (if not installed)
winget install --id Git.Git -e --source winget

# Clone repository
git clone https://github.com/niizam/simple-twitch-bot.git
cd simple-twitch-bot

# Install Bun (recommended)
powershell -c "irm bun.sh/install.ps1|iex"
bun install

# OR use Node.js/npm
npm install
```

### macOS/Linux
```bash
# Clone repository
git clone https://github.com/niizam/simple-twitch-bot.git
cd simple-twitch-bot

# Install dependencies
npm install
# OR if you have bun: bun install
```

## ⚙️ Configuration

1. **Rename configuration file**:
   ```bash
   # Windows
   copy .env.example .env
   
   # macOS/Linux
   cp .env.example .env
   ```

2. **Edit `.env` file** with your information:
   ```env
   OAUTH_TOKEN=oauth:your_token_here
   BOT_USERNAME=your_bot_username
   CHANNEL_NAME=your_channel_name
   OWNER_NAME=your_username
   GPT_API_KEY=your_groq_api_key
   TIMEZONE=America/New_York
   ```

3. **Start the bot**:
   ```bash
   # Double-click start.bat (Windows)
   # OR run manually:
   bun start
   # OR: npm start
   ```

## 🎮 Commands Reference

### 👥 Chat Commands
| Command | Description | Example | Permissions |
|---------|-------------|---------|-------------|
| `!help` | Show available commands | `!help` | Everyone |
| `!dc` or `!discord` | Show Discord server info | `!dc` | Everyone |
| `!calc <expression>` | **Safe** calculator | `!calc 5*100+2/10` | Everyone |
| `!tl <text>` | Translate specific text | `!tl hello world` | Everyone |
| `!lurk` | Enter lurk mode | `!lurk` | Everyone |
| `!unlurk` | Exit lurk mode | `!unlurk` | Everyone |
| `!8ball <question>` | Magic 8-ball | `!8ball Will I win?` | Everyone |
| `!flip` | Flip a coin | `!flip` | Everyone |
| `!roll [sides]` | Roll dice | `!roll` or `!roll 20` | Everyone |
| `!time` | Show current time | `!time` | Everyone |
| `!ai <message>` | Chat with AI | `!ai tell me a joke` | Everyone |
| `!so <username>` | Shoutout user | `!so streamername` | **Mods Only** |

### 🔧 Owner/Mod Commands
| Command | Description | Permissions |
|---------|-------------|-------------|
| `!bot` | Toggle bot on/off | Owner |
| `!tlm` | Toggle translation mode | Owner |
| `!gptm` | Toggle AI chat mode | Owner |

### 💻 Console Commands
| Command | Description |
|---------|-------------|
| `exit`, `quit`, `q` | Stop bot and exit |
| `!say <message>` | Send message as bot |
| `!tlm` | Toggle translation mode |
| `!bot` | Toggle bot on/off |
| `!gptm` | Toggle AI chat mode |

## 📊 Special Features

### 🌐 Auto Translation
When enabled, automatically translates messages between configured languages:
- Detects source language automatically
- Skips translation if already in target language
- Shows translation with language codes

### 🤖 AI Chatbot
Powered by Groq's free API (or OpenAI):
- Responds to chat when AI mode is enabled
- 3-second cooldown to prevent spam
- Maintains conversation context
- Customizable system prompt

### 🎯 Raid Messages
Automatically responds to raids with customizable messages:
- Multiple messages with delays
- Variables: `%username` (raider), `%viewers` (viewer count)

### 📝 Chat History
All chat messages automatically saved to `db/ChatHistory.csv`:
- Format: `timestamp,username,message`
- Useful for moderation and analytics

## 🔧 Environment Variables Reference

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `OAUTH_TOKEN` | Twitch bot token | `oauth:abc123...` | ✅ |
| `BOT_USERNAME` | Bot's Twitch username | `mybot` | ✅ |
| `CHANNEL_NAME` | Target channel | `streamername` | ✅ |
| `OWNER_NAME` | Owner usernames (pipe-separated) | `owner\|mod1\|mod2` | ✅ |
| `GPT_API_KEY` | Groq/OpenAI API key | `gsk_...` | ❌ |
| `TIMEZONE` | Timezone for !time | `America/New_York` | ❌ |
| `SOURCE_LANG` | Translation source | `auto` | ❌ |
| `TARGET_LANG` | Translation target | `en` | ❌ |
| `HELP_MESSAGE` | Custom help message | `Commands: !help...` | ❌ |
| `DISCORD_MESSAGE` | Discord invite message | `Join: discord.gg/...` | ❌ |
| `LURK_MESSAGE` | Lurk response | `Thanks for lurking @%username!` | ❌ |
| `UNLURK_MESSAGE` | Unlurk response | `Welcome back @%username!` | ❌ |
| `RAID_MESSAGES` | Raid responses (pipe-separated) | `Welcome raiders!\|Thanks @%username!` | ❌ |
| `BLACKLISTED_BOTS` | Ignored bots (pipe-separated) | `Nightbot\|StreamElements` | ❌ |

## 🛠️ Troubleshooting

### Bot Won't Connect
1. Verify OAUTH_TOKEN is correct and starts with `oauth:`
2. Check BOT_USERNAME matches the token's account
3. Ensure CHANNEL_NAME is correct (no # symbol)

### Commands Not Working
1. Check if bot is toggled ON (`!bot` command)
2. Verify user has correct permissions
3. Check console for error messages

### Translation Issues
1. Verify internet connection
2. Check SOURCE_LANG and TARGET_LANG codes
3. Translation service may be temporarily down

### AI Not Responding
1. Verify GPT_API_KEY is set correctly
2. Check Groq/OpenAI API quota
3. Ensure AI mode is enabled (`!gptm`)
4. Respect 3-second cooldown between AI calls

### Chat History Not Saving
1. Check if `db` folder exists (created automatically)
2. Verify write permissions in bot directory
3. Check console for file system errors

## 🔒 Security Best Practices

1. **Never share your `.env` file** - contains sensitive tokens
2. **Use a dedicated bot account** - don't use your main Twitch account
3. **Limit bot permissions** - only give necessary channel permissions
4. **Regular updates** - keep dependencies updated
5. **Monitor usage** - watch for unusual bot behavior
6. **Backup settings** - save your configuration safely

## 🚨 Common Security Warnings

- ✅ **SAFE**: Calculator uses secure expression parser
- ✅ **SAFE**: All inputs are validated and sanitized  
- ✅ **SAFE**: Rate limiting prevents API abuse
- ❌ **AVOID**: Never run with admin/root privileges
- ❌ **AVOID**: Don't expose your .env file publicly

## 📜 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/niizam/simple-twitch-bot/issues)
- **Documentation**: This README
- **Community**: Check the repository discussions