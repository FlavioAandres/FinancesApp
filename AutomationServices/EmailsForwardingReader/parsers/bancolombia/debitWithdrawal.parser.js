const { amountParser } = require('../utils')
module.exports.debitWithdrawalParser = (text) => {
    const TRANSACTION_VALUE = amountParser(text.substring((text.lastIndexOf('$') + 1), text.indexOf('en')))
    const TRANSACTION_DESTINATION = text.substring((text.indexOf('en ') + 3), text.indexOf('hora')).trim()
    const TRANSACTION_CARD_TYPE = text.substring(text.indexOf('t.'),text.indexOfRegex(/ \*\d/))
    const TRANSACTION_ACCOUNT = text.substring(text.indexOfRegex(/ \*\d/), (text.indexOfRegex(/ \*\d/)+6))

    return {
        TRANSACTION_VALUE,
        TRANSACTION_DESTINATION,
        TRANSACTION_CARD_TYPE,
        TRANSACTION_ACCOUNT,
        TRANSACTION_TYPE: 'withdrawal',
        DESCRIPTION: `Withdrawal in ${TRANSACTION_DESTINATION}, amount ${Intl.NumberFormat('es-co', { style: 'currency', currency: 'COP' }).format(TRANSACTION_VALUE)}`
    }
}