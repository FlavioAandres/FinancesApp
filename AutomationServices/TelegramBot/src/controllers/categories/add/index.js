const CategoryRepo = require('../../../../../../shared/database/repos/category.repo')
const UserRepo = require('../../../../../../shared/database/repos/user.repo')


module.exports = addCategory = async (category) => {
    const _category = await CategoryRepo.create(category)
    await UserRepo.createCategory({ _id: category.user }, { _id: _category._id })
    return _category
}