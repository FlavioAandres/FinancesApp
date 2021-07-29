const PaymentRepo = require("../../../shared/database/repos/payment.repo");
const IncomeRepo = require("../../../shared/database/repos/income.repo");
const { getUser } = require("../../../shared/database/repos/user.repo");
const _ = require('lodash')
const moment = require('moment')

const processMonthlyMetrics = async (userId) => {

  let payments = await PaymentRepo.getByMonth(userId);
  if (!payments || !payments.length) payments = []
  payments = payments.sort((a, b) => {
    if (a.month > b.month) return 1
    if (a.month < b.month) return -1
    return 0
  })

  let incomes = await IncomeRepo.getByMonth(userId);
  if (!incomes || !incomes.length) incomes = []
  incomes = incomes.sort((a, b) => {
    if (a.month > b.month) return 1
    if (a.month < b.month) return -1
    return 0
  })

  return { payments, incomes }
}

const processCategoryMetrics = async (userId, date, groupBy = 'month') => {
  let payments = await PaymentRepo.getByCategories(userId, date);
  let incomesData = await IncomeRepo.getByCategories(userId, date)
  if (!payments || !payments.length) payments = []
  if (!incomesData || !incomesData.length) incomesData = []

  payments = payments.map(item => {
    const {
      category,
      purchases
    } = item
    const group = _.groupBy(purchases, i => {
      if (i.date) {
        const date = `${i.date.toISOString()}`
        const groupByLength = groupBy === 'month'
          ? 7 // by month
          : 10 // by day 
        return date.substring(0, groupByLength)
      }
    })
    const parsed = Object.keys(group).map(month => {
      return {
        month,
        total: group[month].reduce((prev, curr) => prev + curr.amount, 0)
      }
    })
    return {
      category: category.value,
      monthly: parsed.sort((a, b) => {
        if (a.month > b.month) return 1
        if (a.month < b.month) return -1
        return 0
      })
    }
  })

  incomesData = incomesData.map(item => {
    const {
      category,
      incomes
    } = item

    const group = _.groupBy(incomes, i => {
      if (i.date) {
        const date = `${i.date.toISOString()}`
        const groupByLength = groupBy === 'month'
          ? 7 // by month
          : 10 // by day 
        return date.substring(0, groupByLength)
      }
    })
    const parsed = Object.keys(group).map(month => {
      return {
        month,
        total: group[month].reduce((prev, curr) => prev + curr.amount, 0)
      }
    })
    return {
      category: category.value,
      monthly: parsed.sort((a, b) => {
        if (a.month > b.month) return 1
        if (a.month < b.month) return -1
        return 0
      })
    }
  })
  
  return { payments, "incomes": incomesData }
}

const processHomeMetrics = async (userId, date) => {

  let payments = await PaymentRepo.getAllByDate({ userId, date })
  const incomes = await IncomeRepo.getAllByDate({ userId, date });

  let latestPayments = [], expensivePayments = [], totalByCategory = [], acceptedPayments = [], prepayments = [], latestIncomes = []
  //Split types
  payments = payments.filter(payment => payment.isAccepted);

  //Latest payments 
  latestPayments = payments.slice(0, 10)

  //expensivePayments 
  expensivePayments = _.orderBy(payments, 'amount', ['desc']).slice(0, 10)

  // Group by category
  totalByCategory = _.groupBy(payments, (payment) => payment.category.value)

  //Latests Incomes
  latestIncomes = incomes.slice(0, 10);

  return {
    latestPayments,
    expensivePayments,
    totalByCategory,
    latestIncomes
  }
}

const processStatsMetrics = async (userId, date) => {
  const cardTypeStats = await PaymentRepo.percentageByCardTypeStat(userId, date);
  const categoryTypeStats = await PaymentRepo.percentageByCategoryTypeStat(userId, date);

  return { cardTypeStats, categoryTypeStats }
}

module.exports.processHomeMetrics = processHomeMetrics;

//stats endpoint 
module.exports.get = async (event, context, callback) => {
  let results = [];
  const { query: queryParams, cognitoPoolClaims } = event;
  const { sub } = cognitoPoolClaims
  const metricType = queryParams && queryParams.metricType ? queryParams.metricType : 'month';
  const date = queryParams && queryParams.date ? queryParams.date : moment().subtract(1, 'month').toString()
  const groupBy = queryParams && queryParams.groupBy ? queryParams.groupBy : null
  try {
    // This function open the mongo connection
    const user = await getUser({ sub })
    switch (metricType) {
      case 'month':
        results = await processMonthlyMetrics(user._id, date)
        break;
      case 'category':
        results = await processCategoryMetrics(user._id, queryParams.date ? date : undefined, groupBy)
        break;
      case 'stats':
        results = await processStatsMetrics(user._id, date);
        break;
      case 'home':
        results = await processHomeMetrics(user._id, date)
        break;
    }
  } catch (error) {
    console.error(error)
    return {
      statusCode: "500",
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      message: JSON.stringify(error),
    };
  }

  return {
    statusCode: "200",
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(results),
  };
};