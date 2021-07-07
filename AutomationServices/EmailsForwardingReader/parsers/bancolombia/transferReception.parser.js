const { amountParser } = require('../utils')
module.exports.transferReceptionParser = (text) => {
    const TRANSACTION_SOURCE = text.substring((text.indexOf('transferencia de ') + 17), (text.indexOf(' por')))
    const TRANSACTION_VALUE = amountParser(text.substring((text.lastIndexOf('$') + 1), text.includes('en la') ? text.indexOf('en la') : text.indexOf('enla')))
    const TRANSACTION_DESTINATION = text.substring(text.indexOf(' *'), (text.indexOf(' *') + 6))
    const TRANSACTION_CARD_TYPE = null
    const TRANSACTION_ACCOUNT = text.substring(text.indexOfRegex(/ \*\d/), (text.indexOfRegex(/ \*\d/)+6))

    return {
        TRANSACTION_SOURCE,
        TRANSACTION_VALUE,
        TRANSACTION_DESTINATION,
        TRANSACTION_CARD_TYPE,
        TRANSACTION_ACCOUNT
    }
}