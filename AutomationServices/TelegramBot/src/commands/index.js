const whoami = require('./whoami')
const ping = require('./ping')
const help = require('./help')
const start = require('./start')
const associate = require('./associate')
const total = require('./total')
const add = require('./add')

module.exports = initCommands = (bot) => {
    start(bot);
    help(bot);
    associate(bot);
    whoami(bot);
    ping(bot);
    total(bot);
    add(bot);
}