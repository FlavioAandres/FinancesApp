const moment = require('moment')


module.exports = listCategories = async (request) => {

    let { From, To, Body } = request
    if (!From || !To, !Body) return "Ey! Some params are missing"

    // This function open the mongo connection
    const user = await userRepo.getUser({ phones: From.replace('whatsapp:', '') })

    if (Object.entries(user).length == 0) {
        return "Error this phone number is not accepted."
    }

    let [task, category, timeNumber, long] = Body.split("+")

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
}