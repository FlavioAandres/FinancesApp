const mongodb = require('../../../../../shared/database/mongo')
const PaymentModel = require('../../../../../shared/models/payment.model')
const userRepo = require('../../../../../shared/database/repos/user.repo')
const moment = require('moment')

module.exports = {
    updateCategory: async (request) => {

        let { From, To, Body } = request
        if (!From || !To, !Body) return "Internal Error :trollface:"

        // This function open the mongo connection
        const user = await userRepo.getUser({ phones: From.replace('whatsapp:', '') })

        if (Object.entries(user).length == 0) {
            return "Error this phone number is not accepted."
        }


        let [task, auxTask, categoryFrom, categoryTo] = Body.split("+")

        console.log(task, auxTask, categoryFrom, categoryTo);

        if (!categoryFrom || !categoryTo)
            return "CategoryFrom or categoryTo wasn't sent"


        let query = {
            user: user._id,
            category: categoryFrom,
        }

        let update = {
            category: categoryTo
        }

        try {
            let result = await PaymentModel.update(query, update)
        } catch (error) {
            console.log(error)
            return "Something saving in database"
        }
        return "Ok, i've update all purchases"
    },
    addRecord: async (request) => {

        let { From, To, Body } = request
        if (!From || !To, !Body) return "Ey! Some params are missing"

        const user = await userRepo.getUser({ phones: From.replace('whatsapp:', '') })

        if (Object.entries(user).length == 0) {
            return "Error this phone number is not accepted."
        }

        let [task, category, amount, ...description] = Body.split("+")
        description = description.join(" ")

        console.log(task, category, amount, description);

        if (!category || !amount) return "Capa 8 \nYou should send: Cash <Category> <Amount> <Description?> "

        category = category ? category.split("/") : []


        let object = {
            user: user._id,
            secondCategory: category[1],
            category: category[0],
            amount,
            description,
            text: description,
            type: 'EXPENSE',
            isAccepted: true,
            isHidden: true,
            createdBy: 'WHATSAPP_BOT'
        }

        try {
            await PaymentModel.create(object)
            await mongodb.destroy()
        } catch (error) {
            console.log(error)
            return "Something saving in database"
        }
        return "Ok, i've saved this purchase"
    },
    listCategory: async (request) => {

        let { From, To, Body } = request
        if (!From || !To, !Body) return "Ey! Some params are missing"

        // This function open the mongo connection
        const user = await userRepo.getUser({ phones: From.replace('whatsapp:', '') })

        if (Object.entries(user).length == 0) {
            return "Error this phone number is not accepted."
        }

        let [task, category, timeNumber, long] = Body.split("+")

        console.log(task, category, timeNumber, long);

        if (category == 'help')
            return "Run this command using: \n ``` Cash <Category> <#> <Days|weeks|month> ```"

        if (!timeNumber || !long || !category)
            return "Timming ago fails"

        const fromAux = category

        if (category.indexOf('/') >= 0)
            category = category.split('/').map(cat => new RegExp(cat, 'i'))
        else if (category === '*')
            category = []
        else
            category = [new RegExp(category, 'i')]

        let date = moment().subtract(timeNumber.toLowerCase(), long.toLowerCase())


        let query = {
            user: user._id,
            isAccepted: true,
            createdAt: {
                $gte: new Date(date)
            }
        }

        if (category.length)
            query.category = { $in: category }
        else
            query.category = { $nin: [null, undefined] }


        try {
            let result = await PaymentModel.find(query, { description: 1, amount: 1, category: 1 })

            if (!result || !result.length)
                return "⚠ No encontré datos 🙅‍♀️"

            let data = "👽 Resumen de " + fromAux + "\n"
            data += result.reduce((prev, current, idx) => {
                prev += `${idx + 1}-${current.description}: $${current.amount}\n`
                return prev
            }, "")

            data += "*Total:* $" + result.reduce((prev, current, index) => {
                prev += current.amount
                return prev
            }, 0)
            await mongodb.destroy()

            return data
        } catch (error) {
            console.log(error)
            return "Something fails with mongo"
        }
    },
    sumCategories: async (request) => {

        let { From, To, Body } = request
        if (!From || !To, !Body) return "Ey! Some params are missing"

        // This function open the mongo connection
        const user = await userRepo.getUser({ phones: From.replace('whatsapp:', '') })

        if (Object.entries(user).length == 0) {
            return "Error this phone number is not accepted."
        }

        let [task, subtask, category, timeNumber, long] = Body.split("+")
        console.log(task, subtask, category, timeNumber, long);

        if (!timeNumber || !long || !category)
            return "Timming ago fails"

        if (category == 'help')
            return "Run this command using: \n ``` Total Sum <Category/Category/...> <#> <Days|weeks|month> ```"

        const fromAux = category
        if (category.indexOf('/') >= 0)
            category = category.split('/').map(cat => new RegExp(cat, 'i'))
        else
            category = [new RegExp(category, 'i')]

        let date = moment().subtract(timeNumber.toLowerCase(), long.toLowerCase())

        let query = {
            user: user._id,
            isAccepted: true,
            category: { $in: category },
            createdAt: {
                $gte: new Date(date)
            }
        }

        try {
            // return JSON.stringify(query)
            let result = await PaymentModel.find(query, { description: 1, amount: 1, category: 1 })
            if (!result || !result.length)
                return "⚠ No encontré datos 🙅‍♀️"

            let data = `👽 Suma Total de ${fromAux} +\n`
            data += "*Total:* $" + result.reduce((prev, current, index) => {
                prev += current.amount
                return prev
            }, 0)

            return data
        } catch (error) {
            console.log(error)
            return "Something fails with mongo"
        }
    },
    substractCategories: async (request) => {
        let { From, To, Body } = request
        if (!From || !To, !Body) return "Ey! Some params are missing"

        // This function open the mongo connection
        const user = await userRepo.getUser({ phones: From.replace('whatsapp:', '') })

        if (Object.entries(user).length == 0) {
            return "Error this phone number is not accepted."
        }

        let [task, subtask, toCategory, fromCategory, timeNumber, long] = Body.split("+")
        console.log(task, subtask, fromCategory, toCategory, timeNumber, long);

        if (!timeNumber || !long || !fromCategory || !toCategory)
            return "Run this command using: \n ``` Total less <toCategory> <fromCategory/fromCategory/...> <#> <Days|weeks|month> ```"

        const fromAux = fromCategory
        const toAux = toCategory
        if (fromCategory.indexOf('/') >= 0)
            fromCategory = [...fromCategory.split('/').map(cat => new RegExp(cat, 'i')), new RegExp(toCategory, 'i')]
        else
            fromCategory = [new RegExp(fromCategory, 'i'), new RegExp(toCategory, 'i')]

        let date = moment().subtract(timeNumber.toLowerCase(), long.toLowerCase())


        let query = {
            user: user._id,
            isAccepted: true,
            category: { $in: fromCategory },
            createdAt: {
                $gte: new Date(date)
            }
        }

        try {
            let result = await PaymentModel.find(query, { description: 1, amount: 1, category: 1 })
            if (!result || !result.length)
                return "⚠ No encontré datos 🙅‍♀️"

            let data = `👽 Diferencia de ${toAux} & ${fromAux} +\n`

            toCategory = result.filter(item => item.category.toLowerCase() == toCategory.toLowerCase())

            if (!toCategory.length) return "Some categories were not found"

            let fromCategory = result.reduce((prev, current) => {
                console.log(current.category);

                if (current.category !== toAux)
                    prev += current.amount
                return prev
            }, 0)

            const toCategoryTotal = toCategory.reduce((prev, current) => {
                prev += current.amount
                return prev
            }, 0)
            console.log(toCategoryTotal, fromCategory);

            data += "fromAux: $" + toCategoryTotal
            let a = data + "\nResult $" + (parseInt(fromCategory, 10) - parseInt(toCategoryTotal, 10))
            return a
        } catch (error) {
            console.log(error)
            return "Something fails with mongo"
        }
    }
}