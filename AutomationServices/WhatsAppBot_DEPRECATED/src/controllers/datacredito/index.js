const { showScore } = require('./functions/showScore')
const { showDetail } = require('./functions/showDetail')
const userRepo = require('../../../../../shared/database/repos/user.repo')

const monthNames = ['january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december'];

module.exports.dataCreditoHandler = async (request) => {
    const { From, To, Body } = request
    if (!From || !To || !Body) return "Internal Error :trollface:"

    // This function open the mongo connection
    const user = await userRepo.getUser({ phones: From.replace('whatsapp:', '') })

    if (Object.entries(user).length == 0) {
        return "Error this phone number is not accepted."
    }

    let [reservedword, action, month, year] = Body.split("+")
    
    if (!year) {
        year = new Date().getFullYear()
    }

    switch (action.trim()) {
        case "score": {
            console.log('score')
            const result = await showScore(user, getMonth(month), parseInt(year))
            return result
        }
        case "details": {
            console.log('details')
            const result = await showDetail(user, getMonth(month), parseInt(year))
            return result
        }
        default: {
            return `The avaible commands are: \n\n - DataCredito score MONTH YEAR \n - DataCredito details MONTH YEAR \n\n *Arguments:* \n- MONTH: _Required_\n- YEAR: _Optional_`
        }
    }
}

const getMonth = (month) => {
    return monthNames.indexOf(month.toLowerCase()) + 1
}