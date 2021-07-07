module.exports = help => (bot) => {
    const helpMsg = `The bot just repeats anything you say in the chat.
\n*Command reference:*
    /start - Start bot
    /ping - *Pong!*
    /associate - Link your chat to your finance account.
    /whoami - Tell to you the user associated to this chat.
    /total - Tell to you the sum of the payments for a category in a timeframe.
    /help - Show this help page`;


    bot.help((ctx) => {
        return ctx.replyWithMarkdown(helpMsg);
    });
}