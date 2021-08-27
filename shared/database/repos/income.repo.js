const Income = require("../../models/income.model");
const { getUser } = require("./user.repo");
const { connect, destroy } = require("../mongo");


module.exports.create = async (incomeBody) => {
  try {
    await connect();
    await Income.create(incomeBody);
  } catch (error) {
    console.error(error)
  } finally {
    await destroy();
  }
}


module.exports.getAllByDate = async ({ userId, date }) => {
  if (!userId) return [];
  await connect()
  const result = await Income.find(
    {
      createdAt: { $gte: new Date(date) },
      user: userId,
    },
    { amount: 1, description: 1, createdAt: 1, category: 1 }
  ).sort({ createdAt: -1 });
  return result;
};

module.exports.updateIncome = async (income) => {
  if (!income.id) throw new Error("IncomeRepo::missing id for income");
  await connect()
  const result = await Income.updateOne(
    { _id: income.id, user: income.user },
    {
      source: income.source,
      amount: income.amount,
      description: income.description,
      category: income.category,
    }
  );
  await destroy();
};


module.exports.udpateCategoryMultiple = async (_idCategoryOld, _idCategoryNew) => {
  await connect()
  const result = await Income.updateMany({ category: _idCategoryOld }, { $set: { category: _idCategoryNew } });
  await destroy()
  return result;
}


module.exports.getByCategories = async (userId) => {
  await connect()
  const result = await Income.aggregate([
    {
      $match: {
        user: userId,
      },
    },
    {
      '$lookup': {
        'from': 'categories',
        'localField': 'category',
        'foreignField': '_id',
        'as': 'category'
      }
    }, {
      '$project': {
        'createdAt': 1,
        'amount': 1,
        'category': {
          '$first': '$category.value'
        }
      }
    },
    {
      $group: {
        _id: { $toLower: "$category" },
        incomes: { $addToSet: { amount: "$amount", date: "$createdAt" } },
      },
    },
    {
      $project: {
        incomes: "$incomes",
        category: "$_id",
        _id: false,
      },
    },
  ]);
  return result
};

module.exports.getAll = async (userId) => {
  await connect()
  const result = await Income.find({ user: userId });
  return result;
}

module.exports.getByMonth = async (userId) => {
  await connect()
  const result = await Income.aggregate([
    {
      $match: {
        user: userId,
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