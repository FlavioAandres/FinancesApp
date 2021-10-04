const PaymentRepo = require("../../../shared/database/repos/payment.repo");
const { getUser } = require("../../../shared/database/repos/user.repo");
const { destroy: detroyMongoConnection } = require("../../../shared/database/mongo");

module.exports.get = async (event, context, callback) => {
  let results = {};
  const { cognitoPoolClaims } = event
  const {
    sub
  } = cognitoPoolClaims
  try {
    results = await PaymentRepo.getActive({ sub });
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
    hide = false,
    accepted = true, 
    amount 
  } = bodyString

  const {
    sub
  } = cognitoPoolClaims

  try {
    if (!id || !description || !category) return { statusCode: 400, body: JSON.stringify({ message: 'Bad request' }) }
    const user = await getUser({ sub })
    const data = await PaymentRepo.updatePayment({
      id,
      user: user._id,
      isHidden: hide,
      isAccepted: accepted,
      description: description,
      category: category, 
      amount
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
    if (!description || !category || !amount || !source) return { statusCode: 400, body: JSON.stringify({ message: 'Bad request' }) }
    const user = await getUser({ sub })

    await PaymentRepo.create({
      user: user._id,
      isHidden: false,
      isAccepted: true,
      description: description,
      category: category,
      amount: parseInt(amount),
      source,
      createdBy: 'API',
      text: `${description} by ${amount}`,
      type: 'EXPENSE'
    })

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: 'Payment Created' })
    }
  } catch (error) {
    console.error(error)
    return context.done(error, 'Something goes wrong')
  }
}
