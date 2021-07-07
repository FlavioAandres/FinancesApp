const IncomeRepo = require('../../../../../shared/database/repos/income.repo')

module.exports = SaveIncome = async ({ amount, description, source, category, user }) => {
    return await IncomeRepo.create({ amount, description, source, category, user })
}