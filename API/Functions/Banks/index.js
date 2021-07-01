const bankrepo = require('../../../shared/database/repos/bank.repo');

module.exports.getBanks = async (event, context, callback) => {
    const result = await bankrepo.getBanks({});

    callback(null, {
        statusCode: "200",
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ banks: result }),
    });

}