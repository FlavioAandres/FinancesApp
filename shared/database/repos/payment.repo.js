const Payments = require("../../models/payment.model");
const { getUser } = require("../repos/user.repo");
const { connect, destroy } = require("../mongo");

module.exports.createMultiple = async (PaymentBodies = []) => {
  try {
    await connect();
    for (const payment of PaymentBodies) {
      await Payments.create(payment);
    }
    await destroy();
  } catch (error) {
    console.log(error);
  }
};

module.exports.getAllByDate = async ({ userId, date }) => {
  if (!userId) return [];
  await connect()
  const result = await Payments.find(
    {
      createdAt: { $gte: new Date(date) },
      user: userId,
      type: "EXPENSE",
    },
    { amount: 1, description: 1, createdAt: 1, category: 1, isAccepted: 1 }
  ).sort({ createdAt: -1 });
  return result;
};

//get all prepayments without category
module.exports.getActive = async (criteria) => {
  try {
    await connect()
    // This function open the mongo connection
    const user = await getUser(criteria);
    if (!user) return [];
    const result = await Payments.find({
      user: user._id,
      isAccepted: { $in: [false, null] },
      isHidden: { $in: [undefined, false] },
    });
    return result.reverse();
  } catch (e) {
    console.error(e);
    return [];
  }
};
module.exports.updatePayment = async (Payment) => {
  if (!Payment.id) throw new Error("PaymentsRepo::missing id for Payment");
  await connect()
  const result = await Payments.updateOne(
    { _id: Payment.id, user: Payment.user },
    {
      isAccepted: Payment.isAccepted,
      isHidden: Payment.isHidden,
      description: Payment.description,
      category: Payment.category,
    }
  );
  await destroy()
};

module.exports.getByCategories = async (userId) => {
  await connect()
  const result = await Payments.aggregate([
    {
      $match: {
        user: userId,
        type: "EXPENSE",
        isAccepted: true,
      },
    },
    {
      $group: {
        _id: { $toLower: "$category" },
        purchases: { $addToSet: { amount: "$amount", date: "$createdAt" } },
      },
    },
    {
      $project: {
        purchases: "$purchases",
        category: "$_id",
        _id: false,
      },
    },
  ]);
  return result
};

module.exports.getByMonth = async (userId) => {
  await connect()
  const result = await Payments.aggregate([
    {
      $match: {
        user: userId,
        type: "EXPENSE",
        isAccepted: true,
      },
    },
    {
      $group: {
        _id: { $substr: ["$createdAt", 0, 7] },
        total: { $sum: "$amount" },
      },
    },
    {
      $project: {
        total: "$total",
        month: "$_id",
        _id: false,
      },
    },
  ]);
  return result;
};

module.exports.getMostSpensiveDay = async (date) => {
  if (!date) throw new Error('Date is mandatory')
  await connect()

  const result = await Payments.aggregate([{
    $match: {
      createdAt: {
        $gte: date.toDate()
      },
      isAccepted: true
    }
  }, {
    $group: {
      _id: {
        dayOfWeek: { $dayOfWeek: "$createdAt" },
      },
      total: { $sum: "$amount" }
    }
  }, {
    $project: {
      dayOfWeek: "$_id.dayOfWeek",
      _id: 0,
      total: 1
    }
  }, {
    $project: {
      "dayOfWeek": {
        $switch: {
          branches: [
            { case: { $eq: ["$dayOfWeek", 1] }, then: "Monday" },
            { case: { $eq: ["$dayOfWeek", 2] }, then: "Tuesday" },
            { case: { $eq: ["$dayOfWeek", 3] }, then: "Wednesday" },
            { case: { $eq: ["$dayOfWeek", 4] }, then: "Thursday" },
            { case: { $eq: ["$dayOfWeek", 5] }, then: "Friday" },
            { case: { $eq: ["$dayOfWeek", 6] }, then: "Saturday" },
            { case: { $eq: ["$dayOfWeek", 7] }, then: "Sunday" },
          ],
          default: "Weird day"
        },
      },
      total: 1
    }
  }, {
    $sort: { "total": -1 }
  }])
  return result
}

module.exports.usersHavePayments = async (userList = []) => {
  await connect()
  const aggregation = [{
    $match: { user: { $in: userList } }
  }, {
    $group: { _id: '$user', count: { $sum: 1 } }
  }, {
    $project: { 
      id: '$_id', 
      hasPayments: {
        $cond: {
          if: { $gte: ["$count", 1] },
          then: true,
          else: false
        }
      }
    }
  }]; 
  const result = await Payments.aggregate(aggregation)
  await destroy()
  return result
}