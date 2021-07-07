

const getUserInfo = require('../../controllers/getUserInfo');
const saveIncome = require('../../controllers/saveIncome');
const savePayment = require('../../controllers/savePayment');
const Markup = require('telegraf/lib/markup')
const { Scenes, Stage, session } = require('telegraf')


module.exports = add = (bot) => {

    bot.context.income = {
        amount: 0,
        description: '',
        source: '',
        category: 'INCOME'
    }

    bot.context.payment = {
        amount: 0,
        description: '',
        category: ''
    }

    bot.context.action = {
        type: '',
        status: ''
    }

    bot.context.userInfo = {}

    // Statuses
    const DESCRIPTION_ADD = 'DESCRIPTION_ADD'
    const CATEGORY_ADD = 'CATEGORY_ADD'
    const SOURCE_ADD = 'SOURCE_ADD'
    const AMOUNT_ADD = 'AMOUNT_ADD'


    // Labels
    const IncomeLabel = 'Income 💰';
    const PaymentLabel = 'Payment 💸'
    const CancelLabel = 'Cancel ❌'
    const SaveLabel = 'Save ✅'

    const typeOptions = Markup.inlineKeyboard([
        Markup.button.callback(IncomeLabel, 'CREATE_INCOME'),
        Markup.button.callback(PaymentLabel, 'CREATE_PAYMENT'),
        Markup.button.callback(CancelLabel, 'CANCEL_ADD')
    ])

    const menuOptions = Markup.inlineKeyboard([
        Markup.button.callback(SaveLabel, 'SAVE_OPERATION'),
        Markup.button.callback(CancelLabel, 'CANCEL_ADD')
    ])


    const forceReplyQuestion = Markup.forceReply().oneTime().selective(true);

    const addScene = new Scenes.BaseScene('Add')

    addScene.enter((ctx) => ctx.reply(' Are you adding a new?', typeOptions))
    addScene.leave((ctx) => ctx.reply('Leaving add section'))

    addScene.on('reply_to_message', (ctx) => {

        switch (ctx.action.status) {
            case AMOUNT_ADD:
                if (ctx.action.type === 'INCOME') {
                    ctx.income.amount = parseInt(ctx.update.message.text, 10)
                } else {
                    ctx.payment.amount = parseInt(ctx.update.message.text, 10)
                }
                ctx.action.status = SOURCE_ADD
                ctx.reply('What is the Source?', forceReplyQuestion)
                break;
            case SOURCE_ADD:
                if (ctx.action.type === 'INCOME') {
                    ctx.income.source = ctx.update.message.text
                } else {
                    ctx.payment.source = ctx.update.message.text
                }
                ctx.action.status = DESCRIPTION_ADD
                ctx.reply('What is the description?', forceReplyQuestion)
                break;
            case DESCRIPTION_ADD:
                let categoriesOptions = []
                if (ctx.action.type === 'INCOME') {
                    ctx.income.description = ctx.update.message.text
                    categoriesOptions = ctx.userInfo.incomesCategories.map(category => Markup.button.callback(category.value, `CATEGORY_${category.label.toUpperCase()}`));
                } else {
                    ctx.payment.description = ctx.update.message.text
                    categoriesOptions = ctx.userInfo.paymentsCategories.map(category => Markup.button.callback(category.value, `CATEGORY_${category.label.toUpperCase()}`));
                }
                ctx.action.status = CATEGORY_ADD
                const incomeCategoryOptions = Markup.inlineKeyboard([...categoriesOptions], { columns: 3 })
                ctx.reply('What is the category?', incomeCategoryOptions)
                break;
            default:
                break;
        }
    })

    addScene.action(/CATEGORY_*/, (ctx) => {
        let message = 'Here is your information:'
        if (ctx.action.status === CATEGORY_ADD) {
            switch (ctx.action.type) {
                case 'INCOME':
                    ctx.income.category = ctx.update.callback_query.data.replace('CATEGORY_', '').toLowerCase()
                    message += `\n\n*Amount:* ${ctx.income.amount}`
                    message += `\n*Description:* ${ctx.income.description}`
                    message += `\n*Source:* ${ctx.income.source}`
                    message += `\n*Category:* ${ctx.income.category}`
                    break;
                case 'PAYMENT':
                    ctx.payment.category = ctx.update.callback_query.data.replace('CATEGORY_', '').toLowerCase()
                    message += `\n\n*Amount:* ${ctx.payment.amount}`
                    message += `\n*Description:* ${ctx.payment.description}`
                    message += `\n*Source:* ${ctx.payment.source}`
                    message += `\n*Category:* ${ctx.payment.category}`
                    break;
                default:
                    break;
            }
        }

        message += '\n\n*What do you want to do?*'
        ctx.replyWithMarkdown(message, menuOptions)
    })

    addScene.action('SAVE_OPERATION', (ctx) => {
        switch (ctx.action.type) {
            case 'INCOME':
                saveIncome({ ...ctx.income, user: ctx.userInfo._id })
                Object.assign(ctx.income, {
                    amount: 0,
                    description: '',
                    source: '',
                    category: 'INCOME'
                })
                break;
            case 'PAYMENT':
                savePayment({ ...ctx.payment, user: ctx.userInfo._id })
                Object.assign(ctx.payment, {
                    amount: 0,
                    description: '',
                    category: ''
                })
                break;
            default:
                break;
        }
        ctx.replyWithMarkdown(`${ctx.action.type} Saved ✅`)
        ctx.scene.leave('Add')
    })

    addScene.action('CREATE_INCOME', (ctx) => {
        ctx.editMessageText('I\'m adding a new Income')
        ctx.action.type = 'INCOME'
        ctx.action.status = AMOUNT_ADD
        ctx.reply('What is the amount?', forceReplyQuestion)

    })

    addScene.action('CREATE_PAYMENT', (ctx) => {
        ctx.editMessageText('I\'m adding a new Payment')
        ctx.action.type = 'PAYMENT'
        ctx.action.status = AMOUNT_ADD
        ctx.reply('What is the amount?', forceReplyQuestion)
    })

    addScene.action('CANCEL_ADD', (ctx) => {
        ctx.scene.leave('Add')
    })

    const addStage = new Scenes.Stage([addScene])


    bot.use(session())
    bot.use(addStage.middleware())


    bot.command('add', async (ctx) => {
        const { categories, name, _id } = await getUserInfo(ctx.from.id)
        const incomesCategories = categories.filter(category => category.type === 'INCOME')
        const paymentsCategories = categories.filter(category => category.type === 'EXPENSE')
        Object.assign(ctx.userInfo, { incomesCategories, paymentsCategories, name, _id })

        ctx.scene.enter('Add');
    })




}