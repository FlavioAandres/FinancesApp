const CategoryRepo = require('../../../../../../shared/database/repos/category.repo')
const UserRepo = require('../../../../../../shared/database/repos/user.repo')
const PaymentRepo = require('../../../../../../shared/database/repos/payment.repo')
const IncomesRepo= require('../../../../../../shared/database/repos/income.repo')


module.exports = deleteCategory = async ({ user, _idCategoryOld, _idCategoryNew }) => {
    await UserRepo.deleteCategory({ _id: user }, { _id: _idCategoryOld })
    await PaymentRepo.udpateCategoryMultiple(_idCategoryOld, _idCategoryNew);
    await IncomesRepo.udpateCategoryMultiple(_idCategoryOld, _idCategoryNew);
    return await CategoryRepo.delete({ _id: _idCategoryOld, user: user })
}