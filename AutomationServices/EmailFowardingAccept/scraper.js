const { acceptInvitation } = require('./utils/acceptInvitation')



const start = async (event, context) => {
    try {
        const [{ user, data }] = event.Records.map(sqsMessage => {
            try {
                return sqsMessage.body; //JSON.parse(sqsMessage.body);
            } catch (e) {
                console.error(e);
            }
        })

        console.info('Starting Function')

        console.info('Accepting Invitation', data.email)

        const result = await acceptInvitation(data.url)

        if (result === 'accepted') {
            console.info(`Invitation Acepted for ${data.email}`)
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