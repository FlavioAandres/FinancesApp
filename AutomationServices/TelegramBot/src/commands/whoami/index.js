const getUserInfo = require('../../controllers/getUserInfo');

module.exports = whoami = (bot) => {
    bot.command('whoami',  async(ctx) => {
        const userInfo = await getUserInfo(ctx.chat.id);
        return ctx.reply(`The user assocaited with this chat is: ${userInfo.name}`);
    })
}