
module.exports.forwardingConfirmation = (text) => {
    const EMAIL_DESTINATION = text.substring(0, text.indexOf(' has requested to')).trim()
    const URL_CONFIRMATION = text.substring((text.indexOf('confirm the request:') + 20), text.indexOf('If you')).trim()

    return {
        EMAIL_DESTINATION,
        URL_CONFIRMATION,
    }
}