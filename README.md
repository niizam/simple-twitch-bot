# Simple Twitch Bot

## Requirements
- Windows 10/11
- Text editor (Notepad, Notepad++, Visual Studio Code, etc)
- [git](https://git-scm.com/downloads/win)
- [bun](https://bun.sh/docs/installation)
- Twitch OAUTH_TOKEN
- OpenAI GPT_API_KEY for AI chatbot | Get it from Groq for free [here](https://console.groq.com/keys)

### Obtain Twitch OAUTH_TOKEN:
You can obtain your OAUTH token by visiting [twitchtokengenerator.com](twitchtokengenerator.com) and following these steps:
1. Visit [twitchtokengenerator.com](twitchtokengenerator.com)
2. When prompted, select Bot Chat Token
3. Login to your chat bot Twitch account
4. Verify you’re not a robot
5. Copy and paste your OAUTH_TOKEN to the `.env` file using a text editor

## Installation Guide for Windows
(For other OS, install the requirements from the links above)

1. Open `Command Prompt` or press `Win+R`, type `cmd`, then press enter
2. Download and install git:
   - Using Command Prompt:
     ```cmd
     winget install --id Git.Git -e --source winget 
     ```
   - Or manually download and install from [here](https://git-scm.com/downloads/win)
3. Clone the repository:
   ```bash
   git clone https://github.com/niizam/simple-twitch-bot.git
   ```
4. Install the dependencies:
   ```cmd
   cd simple-twitch-bot
   powershell -c "irm bun.sh/install.ps1|iex"
   bun install
   ```
5. Rename the `.env.example` file to `.env` in the `simple-twitch-bot` folder
6. Fill `OAUTH_TOKEN`, `BOT_USERNAME`, `CHANNEL_NAME`, `OWNER_NAME`, `GPT_API_KEY` in the `.env` file using a text editor
7. Start the bot:
   - Double-click the `start.bat` file
   - Or run this from the command prompt:
     ```cmd
     bun start
     ```

## Features and Commands

### Chat Commands
| Command | Description | Example |
|---------|-------------|--------|
| `!tlm` | Toggle translation mode (owner only) | `!tlm` |
| `!tl <text>` | Translate specific text | `!tl hello world` |
| `!bot` | Toggle bot on/off (owner only) | `!bot` |
| `!dc` or `!discord` | Show Discord server info | `!dc` or `!discord` |
| `!calc <expression>` | Calculate mathematical expressions | `!calc 5*100+2/10` |
| `!lurk` | Announce going into lurk mode | `!lurk` |
| `!unlurk` | Announce returning from lurk | `!unlurk` |
| `!help` or `!cmd` or `!commands` | Show available commands | `!help` |
| `!gptm` | Toggle AI chat mode (owner only) | `!gptm` |
| `!ai <message>` | Send a specific message to AI chatbot | `!ai tell me a joke` |

### Console Commands
| Command | Description | Usage |
|---------|-------------|--------|
| `exit` or `quit` or `q` | Disconnect bot and exit | Type in console |
| `!tlm` | Toggle translation mode | Type in console |
| `!bot` | Toggle bot on/off | Type in console |
| `!say <message>` | Send message as bot | `!say Hello chat!` |
| `!gptm` | Toggle AI chat mode | Type in console |

### Special Features
- **Auto Translation**: When translation mode is on, automatically translates messages between configured languages
- **AI Chatbot**: When GPT mode is on, bot responds to chat messages using AI
- **Raid Messages**: Automatically responds to channel raids with configurable messages
- **Chat History**: Saves all chat messages to CSV file with timestamp
```
