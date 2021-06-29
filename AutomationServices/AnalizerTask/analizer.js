const paymentRepo = require('../../shared/database/repos/payment.repo')
const moment = require('moment')
const config = require('../configs')
const twilio = require('twilio')
const { getUser } = require('../../shared/database/repos/user.repo');
const { processHomeMetrics } = require('../../API/Functions/BoxFlow')
const ACCOUNT_SID = process.env.TWILIO_ACCESS_TOKEN 
const AUTH_TOKEN = process.env.TWILIO_SECTRET_KEY 
/**
 * Sandbox whatsapp number. please change if you have your own number phone
 */
// const NUMBER_FROM = 'whatsapp:+14155238886' 
const NUMBER_FROM = '+17863475105' 

const transformNumber = (number) => Intl.NumberFormat('es-co').format(number)

module.exports.start = async (event) => {
    const {
        ExecutionType = 'MONTHLY'
    } = event || {}
    const user = await getUser({ emails: config.imap.user })
    if (!user)
        throw new Error('Users are not configured yet, please create the user document')
    const phones = user.phones
    

    const date = ExecutionType === 'WEEKLY' 
        ? moment().subtract(1, 'week')
        : moment().subtract(1, 'month')
    const DayCalcualtion = await paymentRepo.getMostSpensiveDay(date)

    if(!DayCalcualtion.length) 
        throw new Error('Analitics Query doesnot response data')
    
    const client = twilio(ACCOUNT_SID, AUTH_TOKEN)

    let BodyToWhatsApp = DayCalcualtion.reduce((prev, curr, idx )=>{
        
        return prev + `👉🏼 ${curr.dayOfWeek} with: $${transformNumber(curr.total)}\n`
    },`🎉 Your ${ExecutionType.toLowerCase()} Report is here! \n\n💥 *Most Expensive Days:*\n`)

    if(ExecutionType === 'MONTHLY'){
        const { totalByCategory } = await processHomeMetrics(user._id, date)
        BodyToWhatsApp = Object.keys(totalByCategory).reduce((prev, curr)=>{
            const total = totalByCategory[curr].reduce((prev,curr)=>prev + curr.amount, 0)
            return prev + `👉🏼 ${curr} with: $${transformNumber(total)}\n`
        }, BodyToWhatsApp + "\n*Top 10 Categories 🔥*\n\n")
    }

    for (const phoneNumber of phones) {
        await client.messages.create({
            body: BodyToWhatsApp,
            from: NUMBER_FROM,
            to: `${phoneNumber}`
        })
    }
    
    return BodyToWhatsApp; 
    /** TODO
     * In Monthly execution, check the average or prediction for category
     */
}