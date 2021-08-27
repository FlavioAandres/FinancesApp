const { connect, destroy, isConnected } = require('../../shared/database/mongo');
const { getUsers, updateUser } = require('../../shared/database/repos/user.repo')
const { getCategories } = require('../../shared/database/repos/category.repo')


const run = async () => {
    try {
        await connect();
        console.log('Getting users')
        const users = await getUsers({});

        for (const user of users) {
            console.log('Getting Categories user: ' + user._id)
            const categories = await getCategories({ user: user._id })

            const userCategories = categories.map(category => category._id)

            console.log('Saving Categories user: ' + user._id)
            await updateUser({ _id: user._id }, { $set: { categories: [...userCategories] } })

        }

        console.log(`Done,
        
        Update The Payemnts model category property for:

        {
            type: mongoose.Types.ObjectId,
            ref: CategoryModel,
            autopopulate: true
        }

        Then

        run node udaptePaymentCategories.js`)


    } catch (error) {
        console.error(error)

    } finally {
        await destroy();
    }



}

run();