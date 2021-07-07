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

    bot.telegram.setMyCommands([
        { command: 'start', description: 'Start the bot' },
        { command: 'help', description: 'Get help for the bot' },
        { command: 'associate', description: 'Associate this chat with your account' },
        { command: 'add', description: 'Add a new payment or income' },
        { command: 'whoami', description: 'Return data about the user associated' },
        { command: 'ping', description: 'Test Command' },
        { command: 'total', description: 'Get the total of a category' },
        
    ]);
}