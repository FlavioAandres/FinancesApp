const { amountParser } = require('../utils')

module.exports.productParser = (text) => {
    const TRANSACTION_VALUE = amountParser(text.substring((text.lastIndexOf('$')+1),text.indexOf('desde')))
    const TRANSACTION_DESTINATION = text.substring((text.indexOf('pago de') + 7), text.indexOf(' por')) + text.substring(text.lastIndexOf(' *'), (text.lastIndexOf(' *')+6))
    const TRANSACTION_ACCOUNT = text.substring(text.indexOfRegex(/ \*\d/), (text.indexOfRegex(/ \*\d/)+6))

    return {
        TRANSACTION_VALUE,
        TRANSACTION_DESTINATION,
        TRANSACTION_CARD_TYPE: null,
        TRANSACTION_ACCOUNT
    }
}