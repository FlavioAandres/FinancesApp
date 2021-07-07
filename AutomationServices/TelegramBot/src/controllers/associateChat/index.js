const UserRepo = require('../../../../../shared/database/repos/user.repo')


module.exports = associateChat = async (userCriteria, chat) => {
    return await UserRepo.addChat(userCriteria, chat)
}