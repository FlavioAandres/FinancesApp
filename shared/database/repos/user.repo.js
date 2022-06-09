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

module.exports.getUser = async (searchCriteria, configs = {}, projections = {}) => {
    try {
        await connect();
        if (configs && configs.banks)
            return Users.find({
                ...searchCriteria
            }).populate('bank')

        return Users.findOne(searchCriteria, projections, configs);
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
    if (!category.value || !category.value || !Object.keys(userCriteria).length) return null;

    await connect()
    const result = await userModel.updateOne({ ...userCriteria }, {
        $push: {
            categories: { ...category }
        }
    })
    return result.nModified > 0
}

module.exports.createNewMatchWordCategory = async ({category, userId, word }) =>{
    await connect(); 
    return userModel.updateOne({
        _id: userId, 
        categories: {
            $elemMatch: {
                value: category,
            }
        }
    }, {
        $push: {
            'categories.$.matchWords': word
        }
    })
}

module.exports.deleteMatchWordsCategory = async ({category, userId})=>{
    await connect(); 
    return userModel.updateOne({
        _id: userId, 
        categories: {
            $elemMatch: {
                value: category,
            }
        }
    }, {
        $set: {
            'categories.$.matchWords': []
        }
    })
}

module.exports.addChat = async (userCriteria, chat) => {
    if (!chat.id) return null;

    await connect()
    const result = await userModel.updateOne({ ...userCriteria }, {
        $push: {
            "settings.bots.chats": { ...chat }
        }
    })
}

module.exports.updateCategory = async (searchCriteria, update) => {
    await connect()

    const [{ categories }] = await userModel.find(searchCriteria, { categories: 1 });

    const [category] = categories.filter(category => category.value === searchCriteria['categories.value'])

    if (category && category.budget && category.budget.value !== update.value) {
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

    if (category && category.budget.current !== update.$set.categories.$.budget.current) {

        update['categories.$.budget']['progress'] = (update['categories.$.budget'].current / category.budget.value) * 100
        update['categories.$.budget']['value'] = category.budget.value
    }

    const result = await userModel.updateOne({ ...searchCriteria }, update)
    return result.nModified > 0
}
module.exports.resetBudgetVars = async (searchCriteria) =>{
    const {
        categoryValue, 
        sub: userId, 
        budgetValue
    } = searchCriteria

    const query = {
        sub: userId, 
        categories: {
            $elemMatch: {
                value: categoryValue,
            }
        }
    }
    const updateDoc = {
        $set: {
            'categories.$.budget': {
                value: budgetValue, 
                progress: 0
            }
        }
    }
    if(!isConnected())
        await connect(); 
    return userModel.updateOne(query, updateDoc);
}

/**
 * This function use the current amount paid in the category
 * If there are some payments NOT saved in the budget 
 * they will be ignored.
 */

module.exports.updateBudgetFromVars = async (searchValues, update) => {
    const {
        categoryValue, 
        sub: userId, 
    } = searchValues

    const {
        currentBudgetValue,
        BudgetValue = undefined
    } = update

    const query = {
        sub: userId, 
        categories: {
            $elemMatch: {
                value: categoryValue,
            }
        }
    }

    const updateDoc = {
        $set: {
            'categories.$': {
                budget: {
                    current: 0, 
                    value: 0, 
                }
            }
        }
    }
    if(!isConnected())
        await connect(); 
    const user = await userModel.findOne(query, { 'categories.$': 1 }, {lean: true});
    
    if(!user || !user.categories || !user.categories.length){
        console.log({ userId, categoryValue, currentBudgetValue, error: "No categories found" })
        return null; 
    }

    const category = user.categories[0]
    const maxBudgetValue = (BudgetValue >= 0) 
        ? BudgetValue // came from params - update the limit o max value 
        : category.budget.value //if not, it continue using the current saved value
    
    //check if the budget current amount or max amount were updated 
    //against the saved value
    if(
        category && category.budget && 
        (category.budget.current !== currentBudgetValue || maxBudgetValue !== category.budget.value)
    ){
        updateDoc.$set['categories.$'] = {
            ...category, 
            budget: {
                current: currentBudgetValue, 
                progress: (currentBudgetValue / (maxBudgetValue || 1)) * 100,
                value: maxBudgetValue, 
            }
        }
        const result = await userModel.updateOne(query, updateDoc)
        return result.nModified > 0 
    }
    return null; 
}