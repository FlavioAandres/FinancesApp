const { amountParser } = require('../utils')

module.exports.paymentsParser = (text) => {
    const TRANSACTION_VALUE = amountParser(text.substring((text.lastIndexOf('$') + 1), text.indexOf(' a')))
    const TRANSACTION_DESTINATION = text.substring((text.indexOf(' a ') + 3), text.indexOf('desde'))
    const TRANSACTION_ACCOUNT = text.substring(text.indexOfRegex(/ \*\d/), (text.indexOfRegex(/ \*\d/)+6))

    return {
        TRANSACTION_VALUE,
        TRANSACTION_DESTINATION,
        TRANSACTION_CARD_TYPE: null,
        TRANSACTION_ACCOUNT
    }
}