//Created by mkafr on 12/17/2017.
'use strict';

const Table = require('cli-table');
const twitch = require('twitch-js');
const hue = require('./hue.js');

let settings = require('../config/settings.json');
let helper = require('./helper');

let debug = false;

let channel = "#" + settings.channel;
let options = {
    options: {
        debug: false
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: "mkafrin",
        password: "oauth:7ckcczlzeynlw0wpe0lpycsls65t6x"
    },
    channels: [channel]
};

let client = new twitch.client(options);

helper.log("Connecting to Twitch API...");
client.connect();
helper.log("Connection to Twitch API Successful");
helper.log(`Listening to Twitch.tv/${settings.channel}`);

hue.start().catch(err => helper.logError(err));


process.stdin.on('data', function (msg) {
    msg = msg.toString().trim().toLowerCase().split(' ');
    commands(msg);
});


client.on("subscription", function (channel, username, method, message, userstate) {
    helper.log(`${username} subscribed`);
    hue.trigger();
});

client.on("resub", function (channel, username, months, message, userstate, methods) {
    resub(username, months);
});

client.on("subgift", function (channel, username, recipient, method, userstate) {
    helper.log(`${username} gifted a subscription to ${recipient}`);
    hue.trigger();
});

client.on("cheer", function (channel, userstate, message) {
    cheer(userstate["display-name"], userstate["bits"]);
});


let chatCommandCooldowns = {};
client.on("message", function (channel, userstate, message, self) {
    if (userstate["message-type"] === 'chat' && settings.commands.enabled === true) {
        let isOwner = userstate["display-name"].toLowerCase() === settings.channel.toLowerCase();
        let isMod = userstate.mod === true;
        let isSubscriber = userstate.subscriber === true;
        let dateTime = new Date().getTime();
        let commands = settings.commands.commands;
        for (let i = 0; i < commands.length; i++) {
            let command = commands[i];
            if (message === command.command) {
                if (chatCommandCooldowns[command.command]) {
                    let lastUsed = chatCommandCooldowns[command.command].lastUsed;
                    if (dateTime - lastUsed < (command.cooldown * 1000)) return;
                }

                chatCommandCooldowns[command.command] = {lastUsed: dateTime};
                switch (command.permission) {
                    case "Owner":
                        if (isOwner) hue.temporaryColorChange(command.color, 254);
                        break;
                    case "Mod":
                        if (isOwner || isMod) hue.temporaryColorChange(command.color, 254);
                        break;
                    case "Subscriber":
                        if (isOwner || isMod || isSubscriber) hue.temporaryColorChange(command.color, 254);
                        break;
                    case "All":
                        hue.temporaryColorChange(command.color, 254);
                        break;
                }
            }
        }
    }
});

function resub(username, months) {
    helper.log(`${username} re-subscribed for ${months} months`);
    if (settings.months.enabled) {
        switch (parseInt(months)) {
            case 12:
                hue.temporaryColorChange(settings.months["12"], 254).catch(err => helper.logError(err));
                break;
            case 24:
                hue.temporaryColorChange(settings.months["24"], 254).catch(err => helper.logError(err));
                break;
            case 36:
                hue.temporaryColorChange(settings.months["36"], 254).catch(err => helper.logError(err));
                break;
            default:
                hue.trigger();
        }
    } else {
        hue.trigger();
    }
}

function cheer(username, bits) {
    helper.log(`${username} gave ${bits} bits`);
    if (settings.cheerSpecials.enabled) {
        let specials = settings.cheerSpecials.specials;

        for (let i = 0; i < specials.length; i++) {
            let special = specials[i];
            if (parseInt(bits) === parseInt(special.trigger)) {
                hue.temporaryColorChange(special.color, 254).catch(err => helper.logError(err));
            }
        }
    }
}

function commands(msg) {
    if (msg.length === 1) {
        if (msg[0] === 'sub') {
            helper.log(`testUser subscribed`);
            hue.trigger();
        }
        else if (msg[0] === 'cheer') cheer('testUser', 50);
        else if (msg[0] === 'chatcommands') printChatCommands();
        else if (msg[0] === 'exit') helper.cleanExit();
    } else if (msg.length === 2) {
        if (msg[0] === 'sub') {
            let months = Number(msg[1]);
            if (months) resub("testUser", months);
        } else if (msg[0] === 'cheer') {
            let bits = Number(msg[1]);
            if (bits) cheer("testUser", bits);
        } else if (msg[0] === 'debug') {
            debug = helper.parseBool(msg[1]);
            hue.setDebug(debug);
        }
    }
}

function printChatCommands() {
    let table = new Table({
        head: ['Command', 'Permission', 'Color', "Cooldown"],
        style: {
            head: [],
            border: []
        }
    });
    let commands = settings.commands.commands;
    for (let i = 0; i < commands.length; i++) {
        let command = commands[i];
        table.push([command.command, command.permission, command.color, command.cooldown]);
    }
    console.log(table.toString());
}
