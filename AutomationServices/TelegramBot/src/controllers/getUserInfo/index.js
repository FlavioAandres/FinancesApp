
const UserRepo = require('../../../../../shared/database/repos/user.repo')


module.exports = associateChat = async (chatId) => {
    return await UserRepo.getUser({ "settings.bots.chats.id": chatId }, {}, { name: 1, _id: 1, categories: 1 })
}

