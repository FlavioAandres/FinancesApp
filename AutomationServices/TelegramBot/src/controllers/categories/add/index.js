const UserRepo = require('../../../../../../shared/database/repos/user.repo')


module.exports = associateChat = async (userCriteria, category) => {
    return await UserRepo.createCategory(userCriteria, category)
}