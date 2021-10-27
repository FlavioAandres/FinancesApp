const mongodb = require('../../../../../../shared/database/mongo')
const DataCreditoModel = require('../../../../../../shared/models/datacredito.model')


module.exports.showScore = async (user, month, year) => {
    let result = []
    if (!([undefined, null].includes(month)) && !([undefined, null].includes(year))) {
        result = await DataCreditoModel.find({ user: user._id, "$expr": { "$eq": [{ "$month": "$createdAt" }, month], "$eq": [{ "$year": "$createdAt" }, parseInt(year)] } })
    } else {
        return "Hey!, could you please send the month to check 🗓"
    }

    if (result.length > 0) {
        return `Hey budy, your score is ${result[0].score} 📈`
    }

    return "Hey!, I'm not able to retrive any data for that month, are you sure that we gatter that information?"

}
