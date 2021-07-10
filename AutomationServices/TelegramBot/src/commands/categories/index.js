

const getUserInfo = require('../../controllers/getUserInfo');
const addCategory = require('../../controllers/categories/add')
const { Scenes, session, Markup } = require('telegraf');


module.exports = categories = (bot) => {

    bot.context.action = {
        type: '',
        status: ''
    }

    bot.context.categoriesOptions = []

    // Used for update Category
    bot.context.categoryUpdate = {
        oldLabel: '',
        newLabel: '', // Only for delete method
        value: '',
        label: ''
    }

    // Used for Add a new Category
    bot.context.category = {
        value: '',
        label: '',
        type: '',
    }


    bot.context.userInfo = {}

    // Types
    const CATEGORY_DELETE = 'DELETE_CATEGORY'
    const CATEGORY_ADD = 'ADD_CATEGORY'
    const CATEGORY_UPDATE = 'UPDATE_CATEGORY'
    const CANCEL_OPERATION = 'CANCEL_OPERATION'
    const SAVE_OPERATION = 'SAVE_OPERATION'
    const INCOME = 'INCOME'
    const EXPENSE = 'EXPENSE'

    // Statuses
    const VALUE_ADD = 'VALUE_ADD'
    const SELECT_CATEGORY = 'SELECT_CATEGORY'
    const NEW_CATEGORY_VALUE = 'NEW_CATEGORY_VALUE'

    // Labels
    const AddLabel = 'Add ➕';
    const DeleteLabel = 'Delete 🗑️'
    const UpdateLabel = 'Update 📝'
    const CancelLabel = 'Cancel ❌'
    const SaveLabel = 'Save ✅'
    const IncomeLabel = 'Income 💰'
    const ExpenseLabel = 'Expense 💸'

    const typeOptions = Markup.inlineKeyboard([
        Markup.button.callback(AddLabel, CATEGORY_ADD),
        Markup.button.callback(DeleteLabel, CATEGORY_DELETE),
        Markup.button.callback(UpdateLabel, CATEGORY_UPDATE),
        Markup.button.callback(CancelLabel, CANCEL_OPERATION)
    ], { columns: 3 })

    const menuOptions = Markup.inlineKeyboard([
        Markup.button.callback(SaveLabel, SAVE_OPERATION),
        Markup.button.callback(CancelLabel, CANCEL_OPERATION)
    ])

    const categoryTypeOptions = Markup.inlineKeyboard([
        Markup.button.callback(IncomeLabel, INCOME),
        Markup.button.callback(ExpenseLabel, EXPENSE)
    ])

    const forceReplyQuestion = Markup.forceReply().oneTime().selective(true);

    const addScene = new Scenes.BaseScene('CategoryUpdate')

    addScene.enter((ctx) => ctx.reply('Which type of action you can perform?', typeOptions))
    addScene.leave((ctx) => ctx.reply('Leaving Manipulate Categories section'))

    addScene.on('reply_to_message', (ctx) => {
        if (![undefined, null, ''].includes(ctx.action.type)) {
            let message = ''
            if (ctx.action.status === VALUE_ADD) {
                ctx.category.value = ctx.update.message.text
                ctx.category.label = ctx.update.message.text.toLowerCase().replace(' ', '_').replace('/', '_')

                ctx.reply('Which kind of category is?', categoryTypeOptions)

            } else if (ctx.action.status === NEW_CATEGORY_VALUE) {
                ctx.categoryUpdate.value = ctx.update.message.text
                ctx.categoryUpdate.label = ctx.update.message.text.toLowerCase().replace(' ', '_').replace('/', '_')

                message += `You will Update: *${ctx.categoryUpdate.oldLabel}* for:`
                message += `\n\n*New Value:* ${ctx.categoryUpdate.value}`
                message += '\n\n*What do you want to do?*'
                ctx.replyWithMarkdown(message, menuOptions)
            }
        }
    })

    addScene.action(/^CATEGORY_*/, (ctx) => {
        let message = ''

        switch (ctx.action.type) {
            case CATEGORY_UPDATE:
                ctx.action.status = NEW_CATEGORY_VALUE
                ctx.categoryUpdate.oldLabel = ctx.update.callback_query.data.replace('CATEGORY_', '').toLowerCase()
                ctx.reply('What is the new name?', forceReplyQuestion);
                break;
            case CATEGORY_DELETE:

                if (ctx.action.status === NEW_CATEGORY_VALUE) {
                    ctx.categoryUpdate.newLabel = ctx.update.callback_query.data.replace('CATEGORY_', '').toLowerCase()
                    message += `You will delete *${ctx.categoryUpdate.value}*`
                    message += `\n\nPayments with old category will took: *${ctx.categoryUpdate.newLabel}*`

                    message += '\n\n*What do you want to do?*'
                    ctx.replyWithMarkdown(message, menuOptions)
                } else {
                    ctx.action.status = NEW_CATEGORY_VALUE
                    ctx.categoryUpdate.value = ctx.update.callback_query.data.replace('CATEGORY_', '').toLowerCase()
                    const categoriesOptions = ctx.userInfo.categories.map(category => Markup.button.callback(category.value, `CATEGORY_${category.label.toUpperCase()}`))
                    ctx.reply('Which category will took the payment with this one?', Markup.inlineKeyboard(categoriesOptions, { columns: 3 }))
                }
                break;
            default:
                break;
        }



    })

    addScene.action(INCOME, (ctx) => {
        ctx.category.type = INCOME
        let message = 'You will add:'
        message += `\n*Category:* ${ctx.category.value}`
        message += `\n*Label:* ${ctx.category.label}`
        message += `\n*Type:* ${ctx.category.type}`
        message += '\n\n*What do you want to do?*'
        ctx.replyWithMarkdown(message, menuOptions)
    })

    addScene.action(EXPENSE, (ctx) => {
        ctx.category.type = EXPENSE
        let message = 'You will add:'
        message += `\n*Category:* ${ctx.category.value}`
        message += `\n*Label:* ${ctx.category.label}`
        message += `\n*Type:* ${ctx.category.type}`
        message += '\n\n*What do you want to do?*'
        ctx.replyWithMarkdown(message, menuOptions)
    })

    addScene.action(SAVE_OPERATION, (ctx) => {
        let message = ''
        switch (ctx.action.type) {
            case CATEGORY_UPDATE:
                //Update Category and payments
                ctx.reply(CATEGORY_UPDATE)
                break;
            case CATEGORY_DELETE:
                // Delete Category and update payments
                ctx.reply(CATEGORY_DELETE)
                break;
            case CATEGORY_ADD:
                addCategory({ _id: ctx.userInfo._id }, ctx.category)
                message = `*${ctx.category.value}* Saved ✅`
                break;
            default:
                break;
        }


        Object.assign(ctx.category, {
            value: '',
            label: ''
        })
        Object.assign(ctx.categoryUpdate, {
            oldLabel: '',
            newLabel: '',
            value: '',
            label: ''
        })

        ctx.replyWithMarkdown(message)
        ctx.scene.leave('CategoryUpdate')
    })

    addScene.action(CATEGORY_ADD, (ctx) => {
        ctx.editMessageText('I\'m adding a new category')
        ctx.action.type = CATEGORY_ADD
        ctx.action.status = VALUE_ADD
        ctx.reply('What is the name of the category?', forceReplyQuestion)

    })

    addScene.action(CATEGORY_DELETE, (ctx) => {
        ctx.editMessageText('I\'m deleting a category')
        ctx.action.type = CATEGORY_DELETE
        ctx.action.status = SELECT_CATEGORY
        const categoriesOptions = ctx.userInfo.categories.map(category => Markup.button.callback(category.value, `CATEGORY_${category.label.toUpperCase()}`))
        ctx.reply('What is the category?', Markup.inlineKeyboard(categoriesOptions, { columns: 3 }))
    })

    addScene.action(CATEGORY_UPDATE, (ctx) => {
        ctx.editMessageText('I\'m updating a category')
        ctx.action.type = CATEGORY_UPDATE
        ctx.action.status = SELECT_CATEGORY
        const categoriesOptions = ctx.userInfo.categories.map(category => Markup.button.callback(category.value, `CATEGORY_${category.label.toUpperCase()}`))
        ctx.reply('What is the category?', Markup.inlineKeyboard(categoriesOptions, { columns: 3 }))
    })

    addScene.action(CANCEL_OPERATION, (ctx) => {
        ctx.scene.leave('CategoryUpdate')
    })

    const addStage = new Scenes.Stage([addScene])


    bot.use(session())
    bot.use(addStage.middleware())


    bot.command('categories', async (ctx) => {

        const { categories, name, _id } = await getUserInfo(ctx.from.id)
        Object.assign(ctx.userInfo, { categories, name, _id })

        ctx.scene.enter('CategoryUpdate');
    })




}