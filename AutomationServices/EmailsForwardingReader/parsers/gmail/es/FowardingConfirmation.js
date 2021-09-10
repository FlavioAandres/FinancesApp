
module.exports.forwardingConfirmation = (text) => {
    const EMAIL_DESTINATION = text.substring(0, text.indexOf(' ha solicitado reenviar')).trim()
    const URL_CONFIRMATION = text.substring((text.indexOf('confirmar la solicitud:') + 23), text.indexOf('Si haces clic')).trim()

    return {
        EMAIL_DESTINATION,
        URL_CONFIRMATION,
    }
}