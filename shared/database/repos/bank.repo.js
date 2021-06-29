const bankSchema = require('../../models/bank.model');
const { connect, destroy, isConnected } = require("../mongo");


module.exports.create = async (bankBody) => {
    try {
        await connect();
        await bankSchema.create(bankBody);
    } catch (error) {
        console.error(error)
    } finally {
        await destroy();
    }
}

module.exports.getBanks = async (searchCriteria = {}) => {
    await connect();
    const banks = await bankSchema.find(searchCriteria)
    return banks;
}
