//Created by mkafr on 12/17/2017.

/** This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

// Common Colors: Red = 0, Orange = 5750, Green = 25250, Pink/Purple = 53700, Blue = 46000, Light Blue = 40000
let huejay = require('huejay');

let config = require('../config/config.json');
let settings = require('../config/settings.json');

let helper = require('./helper');
let sleep = helper.sleep;

let debug = false;

let client = new huejay.Client({
    host: config.bridgeIP,
    port: 80,
    username: config.apiUsername,
    timeout: 15000
});

helper.log("Connecting to Hue API...");
flashLights(1)
    .then(function () {
        helper.log("Connection to Hue API Successful\n");
        console.log("Commands (Replace what's inside brackets, and do not type the brackets):\n" +
            "sub\n" +
            "cheer\n" +
            "chatCommands\n" +
            "sub {months}\n" +
            "cheer {bits}\n" +
            "debug {true/false}\n" +
            "exit");
        console.log();
    })
    .catch(function (err) {
        helper.logError("Connection Failed");
        helper.logError(err);
        helper.cleanExit();
    });

let triggersToDo = [];
let lights;

exports.start = async function () {
    while (true) {
        if (triggersToDo.length > 0) {
            await triggersToDo[0].call();
            triggersToDo.shift();
        } else {
            await sleep(10);
        }
    }
};

exports.trigger = function () {
    switch (settings.mode) {
        case "colorLoop":
            triggersToDo.push(async function () {
                await hueLoop(settings.colorLoop.secondsToCompleteLoop, settings.colorLoop.numberOfLoops).catch(err => helper.logError(err));
            });
            break;
        case "flashLights":
            triggersToDo.push(async function () {
                await flashLights(settings.flashLights.secondsOfFlashing).catch(err => helper.logError(err));
            });
            break;
        case "breatheCycle":
            triggersToDo.push(async function () {
                await breatheCycle(settings.breatheCycle.numberOfCycles).catch(err => helper.logError(err));
            });
            break;
    }
};

async function flashLights(secondsOfFlashing) {
    let group = await getGroup();
    if (group) {
        group.alert = "lselect";
        group = await client.groups.save(group);
        await sleep(secondsOfFlashing * 1000);
        group.alert = "none";
        group = await client.groups.save(group);
        await sleep(50);
    } else {
        return helper.logError("Group not found");
    }
}

async function hueLoop(secondsToCompleteLoop, numberOfLoops) {
    let group = await getGroup();
    if (group) {
        let originalLights = await getOriginalLights();
        let increment = Math.floor(65535 / secondsToCompleteLoop);
        for (let i = 0; i < secondsToCompleteLoop * numberOfLoops; i++) {
            group.incrementHue = increment;
            group.transitionTime = 1;
            group = await client.groups.save(group);
            await sleep(1000);
        }
        for (let i = 0; i < originalLights.length; i++) {
            originalLights[i].transitionTime = 0;
            await client.lights.save(originalLights[i]);
        }
        await sleep(50);
    } else {
        return helper.logError("Group not found");
    }
}

async function breatheCycle(numberOfCycles) {
    let timeFrom0To254 = 1;

    let group = await getGroup();
    let originalLights = await getOriginalLights();

    let brightness = getAverageBrightness(originalLights);
    // Clamping brightness between 0 and 254
    brightness = Math.min(Math.max(brightness, 0), 254);

    if (group) {
        for (let i = 0; i < numberOfCycles; i++) {
            group.transitionTime = timeFrom0To254;
            group.brightness = 0;
            group = await client.groups.save(group);

            await sleep(timeFrom0To254 * 1000);

            group.transitionTime = timeFrom0To254;
            group.brightness = brightness;
            group = await client.groups.save(group);

            await sleep(timeFrom0To254 * 1000);
        }
        for (let i = 0; i < originalLights.length; i++) {
            originalLights[i].transitionTime = 0;
            await client.lights.save(originalLights[i]);
        }
        await sleep(50);
    } else {
        return helper.logError("Group not found");
    }
}

exports.temporaryColorChange = async function (hue, saturation) {
    let func = async function () {
        let group = await getGroup();
        let originalLights = await getOriginalLights();

        group.hue = hue;
        group.saturation = saturation;
        group = await client.groups.save(group);
        await sleep(3000);

        for (let i = 0; i < originalLights.length; i++) {
            originalLights[i].transitionTime = 0.5;
            await client.lights.save(originalLights[i]);
        }
        await sleep(550);
    };
    triggersToDo.push(func);
};

async function getGroup() {
    let groupsFromApi = await client.groups.getAll();
    if (debug) console.log(JSON.stringify(groupsFromApi));
    for (let group of groupsFromApi) {
        if (group.name === settings.group) {
            lights = group.lightIds;
            return group;
        }
    }
}

async function getOriginalLights() {
    // Have to set light attributes to themselves in order to signal huejay light object to save those attributes
    let originalLights = [];
    for (let i = 0; i < lights.length; i++) {
        let light = await client.lights.getById(lights[i]);
        let colorMode = light.colorMode;
        if (colorMode === 'hs') {
            light.hue = light.hue;
            light.saturation = light.saturation;
        } else {
            light.xy = light.xy;
        }
        light.brightness = light.brightness;
        originalLights.push(light);
    }
    return originalLights;
}

function getAverageBrightness(lights) {
    let ret = 0;
    for (let i = 0; i < lights.length; i++) {
        ret += lights[i].brightness;
    }
    return ret / lights.length;
}

exports.setDebug = function (bool) {
    debug = bool;
};
