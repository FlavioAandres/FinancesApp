const { amountParser } = require('../utils')

module.exports.paymentsParser = (text) => {
    const TRANSACTION_VALUE = amountParser(text.substring((text.indexOf('valor transacción: ')), text.indexOf('clase de movimiento:')))
    const TRANSACTION_DESTINATION = text.substring(text.indexOf('lugar de transacción: ') + 22, text.indexOf('banco davivienda'))
    const TRANSACTION_ACCOUNT = text.substring(text.indexOf('***') + 3, (text.indexOf('***') + 8))
    const TRANSACTION_CARD_TYPE = text.substring(text.indexOf('movimiento de su') + 17, (text.indexOf('  terminada'))) == 'tarjetacrédito' ? 't.cred' : 't.debt'
    const TRANSACTION_TYPE = text.substring(text.indexOf('clase de movimiento: ') + 21, (text.indexOf(' .'))) == 'compra' ? 'EXPENSE' : 'INCOME'

    return {
        TRANSACTION_VALUE,
        TRANSACTION_DESTINATION,
        TRANSACTION_CARD_TYPE,
        TRANSACTION_ACCOUNT,
        TRANSACTION_TYPE,
        DESCRIPTION: `Purchase in ${TRANSACTION_DESTINATION}, amount ${Intl.NumberFormat('es-co', { style: 'currency', currency: 'COP' }).format(TRANSACTION_VALUE)}`
    }
}