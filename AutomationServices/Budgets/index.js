const userRepository = require("./../../shared/database/repos/user.repo");
const constants = require('./../../constants'); 
const ArchiveRepository = require('../../shared/database/repos/archive.repo')

module.exports.clean = async (event, _, callback) => {
    let allUsers; 
    try {
        allUsers = await userRepository.getUsers({
          "categories.budget": { $exists: true },
        }, { 'categories': 1, sub: 1 });
        if(!allUsers) 
            return null; 
    } catch (error) {
        return callback(error)
    }

    //Build Category Objects 
    const allBudgets = []; 
    const allBudgetsByUser = []
    const today = new Date(); 
    const dates = {
        day: today.getDate(),        
        month: today.getMonth() === 0 //(Month is 0-based)
            ? 12 
            : today.getMonth(),   
        year: today.getFullYear(),  
    }
    allUsers.forEach(user=>{
        const categoriesParsed = user.categories
            .filter(item=>item.budget && item.budget.value > 0)
            .map(category=>{
                allBudgets.push({
                    user: user._id, 
                    sub: user.sub, 
                    categoryValue: category.value, 
                    ...category.budget
                })
                return {
                    value: category.value, 
                    budget: category.budget, 
                }
            })
            allBudgetsByUser.push({
                user: user._id, 
                sub: user.sub,
                categories: categoriesParsed,
                type: constants.ARCHIVE_TYPES.CATEGORY_BUDGETS_HISTORY, 
                ...dates
            })
    })

    try {
        //Archiving
        const result = await ArchiveRepository.insertMany(allBudgetsByUser); 
        //Restarting Budget 
        if(result){
            for (const budget of allBudgets) {
                await userRepository.updateBudgetFromVars({
                    sub: budget.sub, 
                    categoryValue: budget.categoryValue
                }, {
                    currentBudgetValue: 0,
                })
            }
        }
    } catch (error) {
        console.error(error)
        callback(error)
    }

    return {
        allBudgetsByUser, 
        allBudgets
    }
};
