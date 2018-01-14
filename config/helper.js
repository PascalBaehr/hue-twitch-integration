//Created by mkafr on 12/18/2017.

exports.log = console.log;
exports.cyanPrint = function (msg) {
    console.log('\x1b[96m%s\x1b[0m', msg)
};
exports.logError = function (msg) {
    console.log('\x1b[91m%s\x1b[0m', msg)
};
exports.caution = function (msg) {
    console.log('\x1b[93m%s\x1b[0m', msg)
};
