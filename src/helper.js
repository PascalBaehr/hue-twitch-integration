//Created by mkafr on 12/18/2017.


exports.sleep = function (milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};

exports.constrain = function (value, min, max) {
    return Math.max(min, Math.min(value, max));
};

exports.log = function (msg) {
    let date = new Date().toLocaleString();
    console.log(`[${date}]: ${msg}`)
};

exports.logDebug = function (msg) {
    let date = new Date().toLocaleString();
    console.error('\x1b[96m%s\x1b[0m', `[${date}] Debug: ${msg}`)
};

exports.logError = function (msg) {
    let date = new Date().toLocaleString();
    console.error('\x1b[91m%s\x1b[0m', `[${date}] ${msg}`)
};

exports.isConfigValid = function () {
    const config = require('../config/config.json');
    const settings = require('../config/settings.json');
    let modes = ['breatheCycle', 'colorLoop', 'flashLights'];

    let months = settings.months["12"] >= 0 && settings.months["12"] <= 65535
        && settings.months["24"] >= 0 && settings.months["24"] <= 65535
        && settings.months["36"] >= 0 && settings.months["36"] <= 65535;

    let specials = true;
    for(let special of settings.cheerSpecials.specials) {
        if(!Number(special.trigger) || special.color < 0 || special.color >= 65535) {
            specials = false;
            break;
        }
    }

    return config.bridgeIP !== "" && config.apiUsername !== "" && settings.channel !== "" && settings.group !== ""
        && modes.includes(settings.mode) && months && specials;
};

exports.parseBool = function (input) {
    return input === "true";
};

exports.cleanExit = function () {
    require('readline')
        .createInterface(process.stdin, process.stdout)
        .question("Press [Enter] to exit...", function () {
            process.exit();
        });
};
