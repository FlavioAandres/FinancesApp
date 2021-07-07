module.exports = ping = (bot) => {
    bot.command('ping', (ctx) => {
        return ctx.replyWithMarkdown('*Pong!*');
    })
}
