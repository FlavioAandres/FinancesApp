const { connect, destroy, isConnected } = require('../../shared/database/mongo');
const { getUsers } = require('../../shared/database/repos/user.repo')
const { getCategories } = require('../../shared/database/repos/category.repo')


const run = async () => {
    try {
        const { connection } = await connect();
        const client = await connection.getClient();
        const database = await client.db('personalFinances')
        const payments = await database.collection('payments')
        const incomes = await database.collection('incomes')
        console.log('Getting users')
        const users = await getUsers({});

        for (const user of users) {
            console.log('Getting Categories user: ' + user._id)
            const categories = await getCategories({ user: user._id })

            console.log('Updating Payments user: ' + user._id)
            for (const category of categories) {
                console.log('Updating Payments for Category ' + category.label)
                await payments.updateMany({ user: user._id, category: category.value }, { $set: { category: category._id } })
                await incomes.updateMany({ user: user._id, category: category.value }, { $set: { category: category._id } })
            }

        }

        console.log(`Done`)


    } catch (error) {
        console.error(error)

    } finally {
        await destroy();
    }



}

run();