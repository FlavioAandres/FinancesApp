const accountTransactionModel = require('../../models/accountTransaction.model');
const { connect, destroy, isConnected } = require("../mongo");


module.exports.create = async (accountTransactionBody) => {
    try {
        await connect();
        return await accountTransactionModel.create(accountTransactionBody);
    } catch (error) {
        console.error(error)
    } finally {
        await destroy();
    }
}

module.exports.getTransactions = async (searchCriteria = {}) => {
    await connect();
    const transactions = await accountTransactionModel.find(searchCriteria).sort({'createdAt': 1}).limit(10);
    return transactions;
}

module.exports.updateAccount = async (searchCriteria = {}, accountValues) => {
    await connect();
    const result = await accountTransactionModel.updateOne(searchCriteria, accountValues)

    return result
}

module.exports.delete = async (searchCriteria) => {
    if (!searchCriteria) throw new Error('Criteria to delete a account is not given')
    await connect();
    return await accountTransactionModel.deleteOne(searchCriteria)
}