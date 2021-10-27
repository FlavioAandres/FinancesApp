const mongodb = require('../../../../../../shared/database/mongo')
const DataCreditoModel = require('../../../../../../shared/models/datacredito.model')


module.exports.showDetail = async (user, month, year) => {

    let result = []

    if (!([undefined, null].includes(month)) && !([undefined, null].includes(year))) {
        result = await DataCreditoModel.find({ user: user._id, "$expr": { "$eq": [{ "$month": "$createdAt" }, month], "$eq": [{ "$year": "$createdAt" }, year] } })
    } else {
        return "Hey!, could you please send the month to check 🗓"
    }

    if (result.length > 0) {
        return `Hey budy, this is your detail:\n\nScore : ${result[0].score} \nBehavior: ${result[0].comportamiento}\nArrears Amount: ${Intl.NumberFormat('es-co', { style: 'currency', currency: 'COP' }).format(result[0].arrearsAmount)}\nAmount Of Products: ${result[0].amountOfProducts}\n\n* Note: The amount of products is the sum of debt and saving products`
    }

    return "Hey!, I'm not able to retrive any data for that month, are you sure that we gatter that information?"

}