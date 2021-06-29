const IncomeRepo = require("../../../shared/database/repos/income.repo");
const { getUser } = require("../../../shared/database/repos/user.repo");
const { destroy: detroyMongoConnection } = require("../../../shared/database/mongo");

module.exports.get = async (event, context, callback) => {
  let results = {};
  const { cognitoPoolClaims } = event
  const {
    sub
  } = cognitoPoolClaims
  try {
    const { _id } = await getUser({ sub })
    results = await IncomeRepo.getAll(_id);
  } catch (error) {
    return {
      statusCode: "500",
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(error),
    };
  }
  return context.done(null, {
    statusCode: "200",
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(results),
  });
};

module.exports.put = async (event, context, callback) => {
  const { body: bodyString, cognitoPoolClaims } = event
  const {
    id,
    description,
    category,
    amount,
    source
  } = bodyString

  const {
    sub
  } = cognitoPoolClaims

  try {
    if (!id || !description || !category || !amount || !source) return { statusCode: 400, body: JSON.stringify({ message: 'Bad request' }) }
    const user = await getUser({ sub })
    const data = await IncomeRepo.updateIncome({
      id,
      user: user._id,
      amount,
      description,
      category,
      source
    })
    const statusCode = (data.nModified > 0) ? 204 : 400
    await detroyMongoConnection()
    return {
      statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: statusCode === 204 })
    }
  } catch (error) {
    console.error(error)
    return context.done(error, 'Something goes wrong')
  }
}

module.exports.post = async (event, context, callback) => {
  const { body: bodyString, cognitoPoolClaims } = event

  const {
    description,
    category,
    amount, 
    source
  } = bodyString

  const {
    sub
  } = cognitoPoolClaims

  try {
    if ( !description || !amount || !source ) return { statusCode: 400, body: JSON.stringify({ message: 'Bad request' }) }

    const user = await getUser({ sub })
    const data = await IncomeRepo.create({
      user: user._id,
      amount,
      description,
      category,
      source
    })

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: 'Income Created' })
    }
  } catch (error) {
    console.error(error)
    return context.done(error, 'Something goes wrong')
  }
}
