const { Telegraf } = require('telegraf');
const initCommands = require('./commands');

const bot = new Telegraf(process.env.BOT_TOKEN);

initCommands(bot)

module.exports = {
    bot
}