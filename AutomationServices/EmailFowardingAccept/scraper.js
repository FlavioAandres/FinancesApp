const { acceptInvitation } = require('./utils/acceptInvitation')



const start = async (event, context) => {
    try {
        const [{ user, data, email }] = event.Records.map(sqsMessage => {
            try {
                return JSON.parse(sqsMessage.body);
            } catch (e) {
                console.error(e);
            }
        })

        console.info('Starting Function')

        console.info('Accepting Invitation', email)

        const result = await acceptInvitation(data.url)

        if (result === 'accepted') {
            console.info(`Invitation Acepted for ${email}`)
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