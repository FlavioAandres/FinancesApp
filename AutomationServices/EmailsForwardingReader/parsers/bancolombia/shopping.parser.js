const { amountParser } = require('../utils')

module.exports.shoppingParser = (text) => {
    const TRANSACTION_VALUE = amountParser(text.substring((text.lastIndexOf('$')+1), text.indexOf(' en')))
    const TRANSACTION_DESTINATION = text.substring((text.indexOf('en ') + 3 ), (text.indexOf(':') - 3))
    const TRANSACTION_CARD_TYPE = text.substring(text.indexOf('t.'),text.indexOfRegex(/ \*\d/))
    const TRANSACTION_ACCOUNT = text.substring(text.indexOfRegex(/ \*\d/), (text.indexOfRegex(/ \*\d/)+6))

    return {
        TRANSACTION_VALUE,
        TRANSACTION_DESTINATION,
        TRANSACTION_CARD_TYPE,
        TRANSACTION_ACCOUNT
    }
}