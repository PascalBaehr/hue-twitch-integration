//Created by mkafr on 12/18/2017.

const path = require('path');
global._base = path.join(__dirname, '..');

const fs = require('fs');
const read = require('readline-sync');

const helper = require('./helper');
const hue = require('./hue');

helper.cyanPrint("------------------------------------------------------------------------------------------");
helper.log("Welcome to the configuration process for the Phillips Hue Twitch Integration Application");
helper.cyanPrint("------------------------------------------------------------------------------------------");
helper.log("The following prompts will configure the program, and help establish a link with your Phillips Hue Bridge\n");

prompts().catch(err => helper.logError(err));

async function prompts() {
    let config = {};

    let ans = read.question("Do you know the IP address of your Hue Bridge? (Y/[N]) ", {defaultInput: "N"}).toUpperCase();
    if (ans === "Y") {
        ans = read.question("What is the IP address of your Hue Bridge? ");
    } else {
        ans = await hue.findBridge();
    }
    if (ans === undefined) {
        helper.logError("Could not find a Hue Bridge on your network");
        ans = read.question("What is the IP address of your Hue Bridge? ");
    }

    read.question("Please press the link button on your Phillips Hue Bridge, then hit Enter to continue");
    let success = await hue.connectToBridge(ans, config);
    while (success === false) {
        read.question("Please press the link button on your Phillips Hue Bridge, then hit Enter to continue");
        success = await hue.connectToBridge(ans, config);
    }

    fs.writeFileSync(path.join(_base, '/config/config.json'), JSON.stringify(config, null, 2));
}
