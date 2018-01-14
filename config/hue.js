//Created by mkafr on 12/18/2017.

const huejay = require('huejay');
const helper = require('./helper');

exports.connectToBridge = async function(ip, config) {
    let client = new huejay.Client({
        host: ip
    });

    let user = new client.users.User;
    user.deviceType = 'twitch-hue-integration';

    try {
        user = await client.users.create(user);
        helper.cyanPrint(`New user created - Username: ${user.username}`);

        config.bridgeIP = ip;
        config.apiUsername = user.username;
        return true;
    } catch (err) {
        if (err instanceof huejay.Error && parseInt(err.type) === 101) {
            helper.logError(`Link button not pressed. Try again...`);
            return false;
        }
        helper.log(err.stack);
    }
};

exports.findBridge = async function() {
    try {
        let bridges = await huejay.discover();
        if (bridges[0]) return bridges[0].ip;
        else return undefined;
    } catch (err) {
        helper.logError(`An error occurred: ${err.message}`);
    }
};
