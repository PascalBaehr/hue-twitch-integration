//Created by mkafr on 12/17/2017.
'use strict';

const twitch = require('twitch-js');
const hue = require('./hue.js');

let config = require('../config/config.json');
let helper = require('./helper');

let debug = false;

let channel = "#" + config.channel;
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
helper.log(`Listening to Twitch.tv/${config.channel}`);

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

client.on("message", function (channel, userstate, message, self) {
    if (userstate["message-type"] === 'chat'
        && userstate["display-name"].toLowerCase() === config.channel.toLowerCase()
        && message.toLowerCase() === "!huetwitch debug") {
        console.log("Testing Hue Light Event");
        hue.trigger();
    }
});

function resub(username, months) {
    helper.log(`${username} re-subscribed for ${months} months`);
    if (config.months.enabled) {
        switch (parseInt(months)) {
            case 12:
                hue.temporaryColorChange(config.months["12"]).catch(err => helper.logError(err));
                break;
            case 24:
                hue.temporaryColorChange(config.months["24"]).catch(err => helper.logError(err));
                break;
            case 36:
                hue.temporaryColorChange(config.months["36"]).catch(err => helper.logError(err));
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
    if (config.cheerSpecials.enabled) {
        let specials = config.cheerSpecials.specials;

        for (let special in specials) {
            if (parseInt(bits) === parseInt(special)) {
                hue.temporaryColorChange(specials[special]).catch(err => helper.logError(err));
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
        else if (msg[0] === 'exit')helper.cleanExit();
    } else if (msg.length === 2) {
        if (msg[0] === 'sub') {
            let months = Number(msg[1]);
            if(months) resub("testUser", months);
        } else if (msg[0] === 'cheer') {
            let bits = Number(msg[1]);
            if(bits) cheer("testUser", bits);
        } else if (msg[0] === 'debug') {
            debug = helper.parseBool(msg[1]);
            hue.setDebug(debug);
        }
    }
}
