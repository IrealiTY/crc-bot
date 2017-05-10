# crc-bot [![Build Status](https://travis-ci.org/IrealiTY/crc-bot.svg?branch=master)](https://travis-ci.org/IrealiTY/crc-bot)

## Discord Bot for Chaos Raiding Central

This is the Discord Bot used for the Chaos Raiding Central (short CRC). The idea is to have a minimal assistance bot for role calling and monitoring and maybe other Final Fantasy XIV related features.

## Installation

1. Install [node.js](https://nodejs.org/en/download/)
2. Clone this repo

        $ git clone https://github.com/IrealiTY/crc-bot.git

3. Download the required node modules from NPM

        $ cd crc-bot
        $ npm install

5. Create the config.js

        $ cp config_template.js config.js

6. Add the app to your discord account [https://discordapp.com/developers/applications/me](https://discordapp.com/developers/applications/me)

7. Create a user for the app and copy the token to `config.discord.token`

8. Using the Client ID found in App Details, 
   create an invite link in the following format 
   
        https://discordapp.com/oauth2/authorize?scope=bot&client_id=CLIENT_ID

9. Start the bot

        node bot.js
        

## Commands

    .iam ROLENAME
    
Gives you (the user) a certain role. Roles are case insensitive. Roles can be defined in `config.js`.


## Functionality

### Welcome Message

Will be read from the a simple text file that can be defined in:

    welcome: {
        message: fs.readFileSync("welcome.sample.txt", "utf8")
    }

Just modify the string to any .txt file. Markdown is supported.
You can use `:NAME:` in the text file to display the name of the current user.

### Purging

You can setup a channel to be wiped via a cron-job.

    purge: {
        "casual_content": "0 4 * * *"
         ┬                 ┬ ┬ ┬ ┬ ┬
         │                 │ │ │ │ |
         │                 │ │ │ │ └ day of week (0 - 7) (0 or 7 is Sun)
         │                 │ │ │ └───── month (1 - 12)
         │                 │ │ └────────── day of month (1 - 31)
         │                 │ └─────────────── hour (0 - 23)
         │                 └──────────────────── minute (0 - 59)
         └──────────────────── name of the channel
    }
    
As with any cron-job, the time is set by your server so check your time settings.


### Monitoring

Can be configured in the `config.js`. `output:` Defines in which channel the log is supposed to be displayed.

    monitor: {
        output: "monitor",
        events: [ 
            "message", "messageDelete", "messageUpdate",
            "guildMemberAdd", "guildMemberRemove"
        ]
    }

====

Credit goes to [GeekyDeaks](https://github.com/GeekyDeaks). Drop him a donation for that ;)
