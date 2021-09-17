const accountModel = require('../../models/account.model');
const { connect, destroy, isConnected } = require("../mongo");


module.exports.create = async (accountBody) => {
    try {
        await connect();
        return await accountModel.create(accountBody);
    } catch (error) {
        console.error(error)
    } finally {
        await destroy();
    }
}

module.exports.getAccounts = async (searchCriteria = {}) => {
    await connect();
    const accounts = await accountModel.find(searchCriteria)
    return accounts;
}

module.exports.getAccount = async (searchCriteria = {}) => {
    await connect();
    const accounts = await accountModel.findOne(searchCriteria)
    return accounts;
}

module.exports.updateAccount = async (searchCriteria = {}, accountValues) => {
    await connect();
    const result = await accountModel.updateOne(searchCriteria, accountValues)

    return result
}

module.exports.delete = async (searchCriteria) => {
    if (!searchCriteria) throw new Error('Criteria to delete a account is not given')
    await connect();
    return await accountModel.deleteOne(searchCriteria)
}
