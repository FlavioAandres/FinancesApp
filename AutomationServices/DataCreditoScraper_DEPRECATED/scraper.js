const { getSession } = require('./utils/getSession')
const { getHistory } = require('./utils/getHistory')
const { getUser } = require('../../shared/database/repos/user.repo');
const { updateOrCreate } = require('../../shared/database/repos/datacredito.repo')
const { decrypt } = require('../../shared/utils/crypto')

const {
    EMAIL_USERNAME,
} = process.env

const start = async (event, context) => {
    try {
        console.info('Getting User Config')
        // This function open the mongo connection
        const user = await getUser({ emails: EMAIL_USERNAME })

        const username = decrypt(user.settings.datacredito.user)
        const password = decrypt(user.settings.datacredito.password)
        const secondpass = decrypt(user.settings.datacredito.secondpass)

        console.info('Getting Session Id')
        const sessionid = await getSession(username, password, secondpass)

        console.info('Getting History Data')
        const history = await getHistory(sessionid)

        const date = new Date()

        const historyObject = {
            comportamiento: history.diagnostic.endeudamiento.comportamiento,
            score: history.score.score,
            amountOfProducts: history.diagnostic.estadoPortafolio.numeroProductosAbiertosAlDia,
            arrears30daysLastYear: history.diagnostic.habitoPago.productosConMora30DiasUltimos12Meses,
            arrears60daysLast2Year: history.diagnostic.habitoPago.productosConMora60DiasUltimos48Meses,
            arrearsAmount: history.diagnostic.habitoPago.saldoEnMora,
            date: {
                month: date.getMonth() + 1,
                year: date.getFullYear()
            },
            user: user._id
        }

        console.info('Saving entry')
        await updateOrCreate(historyObject)
    } catch (error) {
        console.error(error)
    }

}

module.exports = {
    start
}