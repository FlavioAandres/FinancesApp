const { amountParser } = require('../utils')
module.exports.transfersParser = (text) => {
    const TRANSACTION_VALUE = amountParser(text.substring((text.lastIndexOf('$') + 1), text.indexOf(' desde')))
    const TRANSACTION_DESTINATION = text.substring((text.indexOf('a cta') + 5), text.indexOf('/') - 5).trim()
    const TRANSACTION_CARD_TYPE = null
    const TRANSACTION_ACCOUNT = text.substring(text.indexOfRegex(/ \*\d/), (text.indexOfRegex(/ \*\d/)+6))

    return {
        TRANSACTION_VALUE,
        TRANSACTION_DESTINATION,
        TRANSACTION_CARD_TYPE,
        TRANSACTION_ACCOUNT
    }
}