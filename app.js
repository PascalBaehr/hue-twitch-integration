//Created by mkafr on 12/17/2017.

/** This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
