const accountRepo = require('../../../shared/database/repos/account.repo');
const accountTransactionRepo = require('../../../shared/database/repos/accountTransaction.repo');
const { preciseMinus, preciseAdd } = require('../../utils/preciseMath')

module.exports.getAccounts = async (event, context, callback) => {
    const { cognitoPoolClaims } = event;
    const { sub } = cognitoPoolClaims;

    const result = await accountRepo.getAccounts({ sub });

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accounts: result }),
    }
}

module.exports.getAccount = async (event, context, callback) => {
    const { cognitoPoolClaims, path } = event;
    const { sub } = cognitoPoolClaims;
    const { account } = path

    const result = await accountRepo.getAccount({ sub, _id: account });

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ account: result }),
    }

}

module.exports.getTransactions = async (event, context, callback) => {
    const { cognitoPoolClaims, path } = event;
    const { sub } = cognitoPoolClaims;
    const { account } = path


    const result = await accountTransactionRepo.getTransactions({ sub, account });

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transactions: result }),
    }

}

module.exports.createAccount = async (event, context, callback) => {
    const { body: bodyString, cognitoPoolClaims } = event

    const {
        name,
        value,
        number,
        type, 
        goal
    } = bodyString

    const {
        sub
    } = cognitoPoolClaims

    try {
        if (!name || !value || !number || !type) return { statusCode: 400, body: JSON.stringify({ message: 'Bad request' }) }

        const data = await accountRepo.create({
            sub,
            name,
            value,
            number,
            type,
            goal
        })

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ account: data })
        }
    } catch (error) {
        console.error(error)
        return context.done(error, 'Something goes wrong')
    }
}

module.exports.addTransaction = async (event, context, callback) => {
    const { body: bodyString, cognitoPoolClaims, path } = event

    const {
        sub
    } = cognitoPoolClaims

    const { account } = path

    const {
        value,
        description
    } = bodyString



    try {
        if (!value) return { statusCode: 400, body: JSON.stringify({ message: 'Bad request' }) }
        const _account = await accountRepo.getAccount({ _id: account, sub });

        let type = ''
        const difference = preciseMinus(parseFloat(value), _account.value);

        switch (Math.sign(difference)) {
            case -1: {
                type = 'SUBTRACTION';
                break;
            }

            case 1: {
                type = 'ADDITION';
                break;
            }

            default:
                type = 'NEUTRAL';
                break;
        }

        await accountTransactionRepo.create({
            sub,
            account,
            description,
            value,
            difference,
            type
        })

        await accountRepo.updateAccount({ _id: account, sub }, { value: preciseAdd(_account.value, difference) })


        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ account: _account }),
        }

    } catch (error) {
        console.error(error)
        return context.done(error, 'Something goes wrong')
    }
}