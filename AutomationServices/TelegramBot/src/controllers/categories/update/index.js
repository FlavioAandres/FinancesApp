const CategoryRepo = require('../../../../../../shared/database/repos/category.repo')


module.exports = updateCategory = async ({ user, _id, value, label }) => {
    return await CategoryRepo.updateCategory({ _id, user: user }, { value, label })
}