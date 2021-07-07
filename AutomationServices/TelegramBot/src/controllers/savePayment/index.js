const PaymentRepo = require('../../../../../shared/database/repos/payment.repo')

module.exports = SavePayment = async ({ amount, description, source, category, user }) => {
    return await PaymentRepo.create({
        user,
        isHidden: false,
        isAccepted: true,
        description,
        category,
        amount,
        source,
        createdBy: 'TELEGRAM_BOT',
        text: `${description} by ${amount}`,
        type: 'EXPENSE'
    })
}