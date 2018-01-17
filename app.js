//Created by mkafr on 12/17/2017.
'use strict';

const helper = require('./src/helper');

global._base = __dirname;

let twitch;
helper.log("Configuration Validating...");
if(helper.isConfigValid()) {
    helper.log("Configuration Valid");
    twitch = require('./src/twitch');
} else {
    helper.logError("Config is not valid. Please exit and run the configuration again");
    helper.cleanExit();
}
