const categoryModel = require('../../models/category.model');
const { connect, destroy, isConnected } = require("../mongo");


module.exports.create = async (categoryBody) => {
    try {
        await connect();
        return await categoryModel.create(categoryBody);
    } catch (error) {
        console.error(error)
    } finally {
        await destroy();
    }
}

module.exports.getCategories = async (searchCriteria = {}) => {
    await connect();
    const categories = await categoryModel.find(searchCriteria)
    return categories;
}

module.exports.updateCategory = async (searchCriteria = {}, categoryValues) => {
    await connect();
    const result = await categoryModel.updateOne(searchCriteria, categoryValues)

    return result
}

module.exports.delete = async (searchCriteria) => {
    if (!searchCriteria) throw new Error('Criteria to delete a category is not given')
    await connect();
    return await categoryModel.deleteOne(searchCriteria)
}