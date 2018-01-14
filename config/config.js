//Created by mkafr on 12/18/2017.

const path = require('path');
global._base = path.join(__dirname, '..');

const fs = require('fs');
const read = require('readline-sync');

let config = require('./config-default.json');
const helper = require('./helper');
const hue = require('./hue');

helper.cyanPrint("------------------------------------------------------------------------------------------");
helper.log("Welcome to the configuration process for the Phillips Hue Twitch Integration Application");
helper.cyanPrint("------------------------------------------------------------------------------------------");
helper.log("The following prompts will configure the program, and help establish a link with your Phillips Hue Bridge\n");

prompts();

async function prompts() {
    helper.log("[1] First Time Setup\n[2] Settings");
    let ans = read.questionInt("Would you like to do a first time setup, or just change settings? ");
    while(ans !== 1 && ans !== 2) {
        helper.logError("Please input one of the options");
        ans = read.questionInt("Would you like to do a first time setup, or just change settings? ");
    }

    if(ans === 1) {
        ans = read.question("Do you know the IP address of your Hue Bridge? (Y/[N]) ", {defaultInput: "N"}).toUpperCase();
        if (ans === "Y") {
            ans = read.question("What is the IP address of your Hue Bridge? ");
        } else {
            ans = await hue.findBridge();
        }
        if(ans === undefined) {
            helper.logError("Could not find a Hue Bridge on your network");
            ans = read.question("What is the IP address of your Hue Bridge? ");
        }

        read.question("Please press the link button on your Phillips Hue Bridge, then hit Enter to continue");
        let success = await hue.connectToBridge(ans, config);
        while(success === false) {
            read.question("Please press the link button on your Phillips Hue Bridge, then hit Enter to continue");
            success = await hue.connectToBridge(ans, config);
        }

        config.channel = read.question("What is the name of your twitch channel? ");
    } else {
        config = require('./config.json');
        let newConfig = require('./config-default.json');
        newConfig.bridgeIP = config.bridgeIP;
        newConfig.apiUsername = config.apiUsername;
        newConfig.channel = config.channel;
        config = newConfig;
    }

    config.group = read.question("What is the name of the Hue light group you want this application to control? ");

    chooseMode();
    monthsPrompt();
    cheerSpecials();

    fs.writeFileSync(path.join(_base, '/config/config.json'), JSON.stringify(config, null, 2));
}

function chooseMode() {
    let modes = [{
        id: "breatheCycle",
        displayText: "breatheCycle: Slowly increases the brightness to full, then to 0, then back to the original value"
    }, {
        id: "colorLoop",
        displayText: "colorLoop: Loops through the whole hue color spectrum"
    }, {
        id: "flashLights",
        displayText: "flashLights: Flashes the lights on and off"
    }];
    for (let i = 0; i < modes.length; i++) {
        let mode = modes[i];
        helper.log(`[${i + 1}] ${mode.displayText}`)
    }
    let index = read.questionInt("Which mode do you want to be enabled? ", {defaultInput: 1});
    while(index < 1 || index > modes.length) {
        helper.caution("Please enter a whole number that equals one of the options above");
        index = read.questionInt("Which mode do you want to be enabled? ", {defaultInput: 1});
    }
    config.mode = modes[index - 1].id;
    configMode(config.mode);
}

function configMode(mode) {
    let ans;
    if(mode === 'breatheCycle') {
        ans = read.questionInt("How many cycles do you want breatheCycle to complete? ", {defaultInput: 1});
        while(ans < 1) {
            helper.caution("Please enter a whole number greater or equal to 1");
            ans = read.questionInt("How many cycles do you want breatheCycle to complete? ", {defaultInput: 1});
        }
        config.breatheCycle.numberOfCycles = ans;
    } else if(mode === 'colorLoop') {
        ans = read.questionInt("How many loops do you want colorLoop to complete? ", {defaultInput: 1});
        while(ans < 1) {
            helper.caution("Please enter a whole number greater or equal to 1");
            ans = read.questionInt("How many loops do you want colorLoop to complete? ", {defaultInput: 1});
        }
        config.colorLoop.numberOfLoops = ans;

        ans = read.questionFloat("How many seconds do you want each loop to last? ", {defaultInput: 5});
        while(ans < 5 || ans > 15) {
            helper.caution("Please enter an amount of seconds between 5 and 15");
            ans = read.questionFloat("How many seconds do you want each loop to last?", {defaultInput: 5});
        }
        config.colorLoop.secondsToCompleteLoop = ans;
    } else if(mode === 'flashLights') {
        ans = read.questionInt("How many seconds do you want the lights to flash for? ", {defaultInput: 3});
        while(ans < 1 || ans > 15) {
            helper.caution("Please enter a whole number between 1 and 15");
            ans = read.questionInt("How many times do you want the lights to flash? ", {defaultInput: 3});
        }
        config.flashLights.secondsOfFlashing = ans;
    }
}

function monthsPrompt() {
    newLine();
    let ans = read.question("Do you want your lights to change to briefly change to a specific color upon sub milestones? (Y/[N]) ", {defaultInput: "N"}).toUpperCase();
    if(ans === "Y") {
        helper.cyanPrint("Common Colors: Red = 0, Orange = 5750, Green = 25250, Pink/Purple = 53700, Blue = 46000, Light Blue = 40000");
        config.months.enabled = true;
        ans = read.questionInt("What color do you want the lights to briefly change to for a 12 month sub? ", {defaultInput: 5750});
        while(ans < 0 || ans > 65535) {
            helper.caution("Please enter a whole number between 0 and 65535");
            ans = read.questionInt("What color do you want the lights to briefly change to for a 12 month sub? ", {defaultInput: 5750});
        }
        config.months["12"] = ans;
        ans = read.questionInt("What color do you want the lights to briefly change to for a 24 month sub? ", {defaultInput: 53700});
        while(ans < 0 || ans > 65535) {
            helper.caution("Please enter a whole number between 0 and 65535");
            ans = read.questionInt("What color do you want the lights to briefly change to for a 24 month sub? ", {defaultInput: 53700});
        }
        config.months["24"] = ans;
        ans = read.questionInt("What color do you want the lights to briefly change to for a 36 month sub? ", {defaultInput: 40000});
        while(ans < 0 || ans > 65535) {
            helper.caution("Please enter a whole number between 0 and 65535");
            ans = read.questionInt("What color do you want the lights to briefly change to for a 36 month sub? ", {defaultInput: 40000});
        }
        config.months["36"] = ans;
    }
}

function cheerSpecials() {
    newLine();
    let ans = read.question("Do you want your lights to briefly change colors upon special cheer amounts? (Y/[N])\n",
        {defaultInput: "N"}).toUpperCase();
    if(ans === "Y") {
        config.cheerSpecials.enabled = true;
        helper.cyanPrint("Common Colors: Red = 0, Orange = 5750, Green = 25250, Pink/Purple = 53700, Blue = 46000, Light Blue = 40000");
        helper.log("You will now be continuously presented with prompts to add new cheer specials until you are done");
        helper.log("In order to signal you are done, press enter without typing in anything");

        while (true) {
            let bits = read.question("Number of bits: ");
            if(bits === "") break;
            let color = read.questionInt("Color: ");
            config.cheerSpecials.specials[bits] = color;
        }
    }
}

function newLine() {
    helper.log();
}
