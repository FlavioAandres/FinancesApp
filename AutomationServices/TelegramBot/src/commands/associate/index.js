const associateChat = require('../../controllers/associateChat')
const { Markup } = require('telegraf')

module.exports = associate = (bot) => {
    bot.command('associate', (ctx) => {

        const Options = Markup.keyboard([
            Markup.button.contactRequest('Send my phone number 📱'),
            Markup.button.text('Cancell Association ❌')
        ]).resize(true).oneTime(true)

        ctx.reply('Please send your phone number',Options)
    })

    bot.on('contact', async ctx => {
        const result = await associateChat({ phones: `+${ctx.message.contact.phone_number}` }, { type: 'TELEGRAM', id: ctx.chat.id })
        if (ctx.message.contact.user_id !== ctx.from.id) {
            ctx.reply('Please send your contact.', Markup.removeKeyboard().selective(true))
        }
        if (result) {
            ctx.reply('Account associated.', Markup.removeKeyboard().selective(true))
        } else {
            ctx.reply('We didn\'t found your account, please associate your phone number in the site first.', Markup.removeKeyboard().selective(true))
        }
    })

    bot.hears('Cancell Association ❌', (ctx) => ctx.reply('Cancelado', Markup.removeKeyboard().selective(true)))
}


