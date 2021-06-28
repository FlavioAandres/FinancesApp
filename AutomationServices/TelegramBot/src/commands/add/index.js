

const getUserInfo = require('../../controllers/getUserInfo');
const Markup = require('telegraf/lib/markup')
const { Scenes, Stage } = require('telegraf')


module.exports = add = (bot) => {

    bot.context.income = {
        amount: 0,
        description: '',
        category: 'INCOME'
    }
    bot.context.userInfo = {}
    bot.context.scene = {}


    const IncomeLabel = 'Income 💰';
    const PaymentLabel = 'Payment 💸'


    const addScene = new Scenes.BaseScene('Add')

    addScene.enter((ctx) => ctx.reply(' Are you adding a new?', typeOptions))
    addScene.leave((ctx) => ctx.reply('Bye'))
    addScene.on('reply_to_message', (ctx) => {
        console.log(ctx)
    })

    addScene.action('CREATE_INCOME', (ctx) => {
        ctx.editMessageText('I\'m adding a new Income')
        ctx.reply('What is the amount', amountQuestion)

    })

    addScene.action('CREATE_PAYMENT', (ctx) => {
        ctx.editMessageText('I\'m adding a new Payment')
    })

    const addStage = new Scenes.Stage([addScene])


    const typeOptions = Markup.inlineKeyboard([
        Markup.button.callback(IncomeLabel, 'CREATE_INCOME'),
        Markup.button.callback(PaymentLabel, 'CREATE_PAYMENT')
    ])

    const amountQuestion = Markup.forceReply().oneTime().selective(true);

    bot.use(addStage.middleware())


    bot.command('add', async (ctx) => {
        // const { categories, name, _id } = await getUserInfo(ctx.from.id)
        // const incomesCategories = categories.filter(category => category.type === 'INCOME')
        // const paymentsCategories = categories.filter(category => category.type === 'INCOME')
        // Object.assign(ctx.userInfo, { incomesCategories, paymentsCategories, name, _id })

        console.log(ctx)
    })

   


}