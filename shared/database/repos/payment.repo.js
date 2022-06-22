const Payments = require("../../models/payment.model");
const {
  getUser,
  updateBudget,
  updateBudgetFromVars,
} = require("../repos/user.repo");
const { connect, destroy } = require("../mongo");

module.exports.create = async (PaymentBody) => {
  try {
    await connect();
    await Payments.create(PaymentBody);
    const user = await getUser(
      {
        _id: PaymentBody.user,
        categories: {
          $elemMatch: {
            value: PaymentBody.category,
          },
        },
      },
      { lean: true },
      { "categories.$": 1, sub: 1 }
    );
    
    if (!user || !user.categories || !user.categories.length) {
      console.log({ PaymentBody, error: "No categories found" });
      return null;
    }
    const category = user.categories[0];
    let current = category.budget.current + PaymentBody.amount;

    await updateBudgetFromVars(
      {
        categoryValue: category.value,
        sub: user.sub,
      },
      {
        currentBudgetValue: current,
      }
    );
  } catch (error) {
    console.log(error);
  } finally {
    await destroy();
  }
};

module.exports.createMultiple = async (PaymentBodies = []) => {
  try {
    await connect();
    for (const PaymentBody of PaymentBodies) {
      await Payments.create(PaymentBody);
    }
    await destroy();
  } catch (error) {
    console.log(error);
  }
};

// module.exports.create = async (PaymentBody) => {
//   try {
//     await connect();
//     const payment = await Payments.create(PaymentBody);
//     await destroy();
//     return payment
//   } catch (error) {
//     console.log(error);
//   }
// };

module.exports.getAllByDate = async ({ userId, date }) => {
  if (!userId) return [];
  await connect();
  return await Payments.find(
    {
      createdAt: { $gte: new Date(date) },
      user: userId,
      type: "EXPENSE",
    },
    { amount: 1, description: 1, createdAt: 1, category: 1, isAccepted: 1 }
  ).sort({ createdAt: -1 });
};

//get all prepayments without category
module.exports.getActive = async (criteria) => {
  try {
    await connect();
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
  await connect();
  if (Payment.isAccepted) {
    const amount = Payment.amount;

    const user = await getUser(
      {
        _id: Payment.user,
        categories: {
          $elemMatch: {
            value: Payment.category,
          },
        },
      },
      { lean: true },
      { "categories.$": 1, sub: 1 }
    );

    if (!user || !user.categories || !user.categories.length) {
      console.log({
        userId: Payment.user,
        category: Payment.category,
        error: "No categories found",
      });
    } else {
      const category = user.categories[0];
      const current = (+category.budget.current || 0) + +amount;

      await updateBudgetFromVars(
        {
          categoryValue: category.value,
          sub: user.sub,
        },
        {
          currentBudgetValue: +current,
        }
      );
    }
  }

  const result = await Payments.updateOne(
    { _id: Payment.id, user: Payment.user },
    {
      isAccepted: Payment.isAccepted,
      isHidden: Payment.isHidden,
      description: Payment.description,
      category: Payment.category,
      amount: Payment.amount,
    }
  );
  await destroy();
  return result;
};

module.exports.getByCategories = async (userId, date) => {
  await connect();
  const match = {
    user: userId,
    type: "EXPENSE",
    isAccepted: true,
  };
  if (date) match.createdAt = { $gte: new Date(date) };
  const result = await Payments.aggregate([
    { $match: { ...match } },
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
  return result;
};

module.exports.getByMonth = async (userId) => {
  await connect();
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
  if (!date) throw new Error("Date is mandatory");
  await connect();

  const result = await Payments.aggregate([
    {
      $match: {
        createdAt: {
          $gte: date.toDate(),
        },
        isAccepted: true,
      },
    },
    {
      $group: {
        _id: {
          dayOfWeek: { $dayOfWeek: "$createdAt" },
        },
        total: { $sum: "$amount" },
      },
    },
    {
      $project: {
        dayOfWeek: "$_id.dayOfWeek",
        _id: 0,
        total: 1,
      },
    },
    {
      $project: {
        dayOfWeek: {
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
            default: "Weird day",
          },
        },
        total: 1,
      },
    },
    {
      $sort: { total: -1 },
    },
  ]);
  return result;
};

module.exports.usersHavePayments = async (userList = []) => {
  await connect();
  const aggregation = [
    {
      $match: { user: { $in: userList } },
    },
    {
      $group: { _id: "$user", count: { $sum: 1 } },
    },
    {
      $project: {
        id: "$_id",
        hasPayments: {
          $cond: {
            if: { $gte: ["$count", 1] },
            then: true,
            else: false,
          },
        },
      },
    },
  ];
  const result = await Payments.aggregate(aggregation);
  return result;
};

module.exports.percentageByCardTypeStat = async (userId, date) => {
  await connect();

  const aggregation = [
    {
      $match: {
        category: {
          $ne: null,
        },
        user: userId,
        isAccepted: true,
        createdAt: { $gte: new Date(date) },
      },
    },
    {
      $group: {
        _id: {
          $cond: {
            if: {
              $eq: ["$cardType", null],
            },
            then: "Manual",
            else: "$cardType",
          },
        },
        payments: {
          $push: {
            payment: "$$ROOT",
          },
        },
        sum: {
          $sum: "$amount",
        },
      },
    },
    {
      $group: {
        _id: null,
        sum: {
          $sum: "$sum",
        },
        card: {
          $push: {
            cardType: "$_id",
            amount: "$sum",
          },
        },
      },
    },
    {
      $unwind: {
        path: "$card",
      },
    },
    {
      $project: {
        cardType: "$card.cardType",
        amount: "$card.amount",
        sum: "$sum",
        percent: {
          $multiply: [
            {
              $divide: ["$card.amount", "$sum"],
            },
            100,
          ],
        },
      },
    },
  ];

  const result = await Payments.aggregate(aggregation);
  return result;
};

module.exports.percentageByCategoryTypeStat = async (userId, date) => {
  await connect();

  const aggregation = [
    {
      $match: {
        category: {
          $ne: null,
        },
        user: userId,
        isAccepted: true,
        createdAt: { $gte: new Date(date) },
      },
    },
    {
      $group: {
        _id: "$category",
        sum: {
          $sum: "$amount",
        },
      },
    },
    {
      $group: {
        _id: null,
        sum: {
          $sum: "$sum",
        },
        categories: {
          $push: {
            category: "$_id",
            amount: "$sum",
          },
        },
      },
    },
    {
      $unwind: {
        path: "$categories",
      },
    },
    {
      $project: {
        cardType: "$categories.category",
        amount: "$categories.amount",
        sum: "$sum",
        percent: {
          $multiply: [
            {
              $divide: ["$categories.amount", "$sum"],
            },
            100,
          ],
        },
      },
    },
  ];
  const result = await Payments.aggregate(aggregation);
  return result;
};
