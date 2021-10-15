const userModel = require("../../models/user.model");
const { connect, destroy, isConnected } = require("../mongo");

module.exports.create = async (UserBody = []) => {
    try {
        await connect();
        await userModel.create(UserBody);
        await destroy();
    } catch (error) {
        console.log(error);
    }
};

module.exports.getUser = async (searchCriteria, configs = {}, projections = {}) => {
    try {
        await connect();
        if (configs.banks)
            return userModel.find({
                ...searchCriteria
            }).populate('bank')

        return userModel.findOne(searchCriteria, { ...projections });
    } catch (e) {
        console.error(e);
        return configs.banks ? [] : {};
    }
};

module.exports.getUsers = async (searchCriteria, configs = {}) => {
    try {
        await connect();
        const result = await userModel.find(searchCriteria);
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

module.exports.createCategory = async (userCriteria, { _id }) => {
    await connect()
    const result = await userModel.updateOne({ ...userCriteria }, {
        $push: {
            categories: _id
        }
    })
    return result.nModified > 0
}

module.exports.deleteCategory = async (userCriteria, { _id }) => {
    await connect()
    const result = await userModel.updateOne({ ...userCriteria }, {
        $pull: {
            categories: _id
        }
    })
    return result.nModified > 0
}

module.exports.addChat = async (userCriteria, chat) => {
    if (!chat.id) return null;

    await connect()
    return await userModel.updateOne({ ...userCriteria }, {
        $push: {
            "settings.bots.chats": { ...chat }
        }
    })
}

module.exports.updateCategory = async (searchCriteria, update) => {
    await connect()

    const [{ categories }] = await userModel.find(searchCriteria, { categories: 1 });

    const [category] = categories.filter(category => category.value === searchCriteria['categories.value'])

    if (update.value && category && category.budget && category.budget.value !== update.value) {
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

    const [category] = categories.filter(category => category.value === searchCriteria.categories.$elemMatch.value)

    if (category && category.budget.current !== update['categories.$.budget'].current) {
        update['categories.$.budget']['progress'] = (update['categories.$.budget'].current / category.budget.value) * 100
        update['categories.$.budget']['value'] = category.budget.value
    }

    const result = await userModel.updateOne({ ...searchCriteria }, update)
    return result.nModified > 0
}