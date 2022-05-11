var allUsers = db.getCollection('users').find({}, {categories: 1}).toArray()
for(var user of allUsers) {
    var payments = db.getCollection('payments').find({createdAt: { $gte: ISODate("2022-04-01") }, user: user._id , isAccepted: true}).toArray()
    var categories = {}
    var groupByCategory = payments.forEach(item=>{
       categories[item.category] =  (categories[item.category] || 0) + item.amount 
    })

    var filteredUserCategories = user.categories.filter(item=>item.budget && item.budget.value)
    for(var cat of filteredUserCategories) {
        var categoryName = cat.value 
        var categoryBudgetValue = cat.budget.value
        var categoryBudgetCurrent = categories[categoryName]
        var categoryBudgetPercentage = (categoryBudgetCurrent / ( categoryBudgetValue || 1)) * 100
        if(categoryBudgetCurrent){
           //updating category 
            var newCategory = Object.assign(cat, { budget: { current: categoryBudgetCurrent, progress: categoryBudgetPercentage, value:categoryBudgetValue   }  })
            var resultUpdate = db.getCollection('users').updateOne(
                {_id: user._id,  "categories.value": categoryName }, 
                { $set: {
                    "categories.$": newCategory
                  }  
                }
            )
            print(resultUpdate)
          }
    }
}

