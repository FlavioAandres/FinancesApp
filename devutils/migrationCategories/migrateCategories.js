const { connect, destroy, isConnected } = require('../../shared/database/mongo');
const { getUsers, updateUser } = require('../../shared/database/repos/user.repo')
const { create: createCategory } = require('../../shared/database/repos/category.repo')


/**
 * 
 *  Before Run this scrip take into account this: 
 * 
 *  1. Replace in the UserModel in the categories property from:
 * 
 *      {
            type: mongoose.Types.ObjectId,
            ref: CategoryModel,
            autopopulate: true
        }

  * To: 

        {
            label: String, 
            budget: {
                value: {
                    type: Number,
                    default: 0
                },
                current: {
                    type: Number,
                    default: 0
                },
                progress: {
                    type: Number,
                    default: 0
                }
            }, 
            value: String,
            type: {
                type: String,
                index: false,
                required: true,
                trim: true,
                enum: ['INCOME', 'EXPENSE']
            }
        }
 * After Run, restoner the intial user model
 */


const run = async () => {
    try {
        await connect();
        const users = await getUsers({});

        for (const user of users) {

            if (user.categories && user.categories.length > 0) {
                const newCategories = user.categories.map(category => {
                    return {
                        label: category.label,
                        value: category.value,
                        budget: category.budget,
                        type: category.type,
                        user: user._id
                    }
                })

                await createCategory(newCategories)

                await updateUser({ _id: user._id }, { $set: { categories: [] } })
            }

        }

        console.log(`
        Done
        
        Restore the categories propety in user model to:
        
        {
            type: mongoose.Types.ObjectId,
            ref: CategoryModel,
            autopopulate: true
        }

        Then execute, updateCategories.js
        `)


    } catch (error) {
        console.error(error)

    } finally {
        await destroy();
    }



}

run();