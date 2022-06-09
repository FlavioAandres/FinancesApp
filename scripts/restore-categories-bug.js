var userId = ObjectId("abc")
var result = db.getCollection('payments').aggregate([
{
 $match: { user: userId  }
},
{
 $group: {
   _id: { category: "$category", user: "$user" },
   total: {$sum: 1}
 }
}, 
{
 $project: {
   user: "$user",
   budget: { value: "0", current: "0", progress: "0" },
   matchWords: [],
   label: "$_id.category",
   value: "$_id.category",  
   total: "$total",
   type: "EXPENSE",
   _id: 0
  }
}
]).toArray()


db.getCollection("users").updateOne({ _id: userId }, {$set: { categories: result }})


