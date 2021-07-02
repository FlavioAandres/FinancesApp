const userModel = require("../../models/user.model");
const Users = require("../../models/user.model");
const { connect, destroy, isConnected } = require("../mongo");

module.exports.create = async (UserBody = []) => {
    try {
        await connect();
        await Users.create(UserBody);
        await destroy();
    } catch (error) {
        console.log(error);
    }
};

module.exports.getUser = async (searchCriteria, configs = {}) => {
    try {
        await connect();
        if (configs.banks)
            return Users.find({
                ...searchCriteria
            }).populate('bank')

        return Users.findOne(searchCriteria);
    } catch (e) {
        console.error(e);
        return configs.banks ? [] : {};
    }
};

module.exports.getUsers = async (searchCriteria, configs = {}) => {
    try {
        await connect();
        const result = await Users.find(searchCriteria);
        return result;
    } catch (e) {
        console.error(e);
        return {};
    }
};

module.exports.updateUser = async (filter, newDocument, single) => {
    await connect()
    const updateType = single ? "updateOne" : "updateMany"
    return userModel[updateType](filter, newDocument);
};

module.exports.createCategory = async (userCriteria, category) => {
    if (!category.value || !category.label || !Object.keys(userCriteria).length) return null;

    await connect()
    const result = await userModel.updateOne({ ...userCriteria }, {
        $push: {
            categories: { ...category }
        }
    })
    return result.nModified > 0
}

module.exports.updateCategory = async (searchCriteria, update) => {
    await connect()

    const [{ categories }] = await userModel.find(searchCriteria, { categories: 1 });

    const [category] = categories.filter(category => category.label === searchCriteria['categories.value'])

    if (category.budget.value !== update.value) {
        const newValue = update['categories.$.budget']['value'];
        update['categories.$.budget']['progress'] = (category.budget.current / newValue) * 100
        update['categories.$.budget']['current'] = category.budget.current
    }

    const result = await userModel.updateOne({ ...searchCriteria }, update)
    await destroy()
    return result.nModified > 0
}

module.exports.updateBudget = async (searchCriteria, update) => {
    await connect()

    const [{ categories }] = await userModel.find(searchCriteria, { categories: 1 });

    const [category] = categories.filter(category => category.label === searchCriteria['categories.value'])

    if (category.budget.current !== update['categories.$.budget'].current) {

        update['categories.$.budget']['progress'] = (update['categories.$.budget'].current / category.budget.value) * 100
        update['categories.$.budget']['value'] = category.budget.value
    }

    const result = await userModel.updateOne({ ...searchCriteria }, update)

    return result.nModified > 0
}