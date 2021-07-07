module.exports = start = (bot) => {
    bot.start((ctx) => {
        return ctx.reply(`Welcome to the FinancifiesBot world!. Use /help to view available commands.`);
    });

}