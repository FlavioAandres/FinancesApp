const { acceptInvitation } = require('./utils/acceptInvitation')



const start = async (event, context) => {
    try {
        const [{ destination, url }] = event.Records.map(sqsMessage => {
            try {
                return JSON.parse(sqsMessage.body);
            } catch (e) {
                console.error(e);
            }
        })

        console.info('Starting Function')

        console.info('Accepting Invitation', url)

        const result = await acceptInvitation(url)

        if (result === 'accepted') {
            console.info(`Invitation Acepted for ${destination}`)
        } else {
            console.error(result)
        }

    } catch (error) {
        console.error(error)
    }

}

module.exports = {
    start
}