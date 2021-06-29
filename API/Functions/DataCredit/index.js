const DataCreditRepo = require("../../../shared/database/repos/datacredito.repo");

module.exports.get = async (event, context, callback) => {
    const { cognitoPoolClaims } = event;
    const {
        sub
    } = cognitoPoolClaims
    let results = {};
    const date = new Date()

    try {
        results = await DataCreditRepo.getdataCreditos({ 
            user: { sub }, 
            datacredit: { 
                date: { 
                    month: (date.getMonth() + 1).toString(), 
                    year: date.getFullYear().toString() 
                } 
            } 
        });
    } catch (error) {
        return {
            statusCode: "500",
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            message: JSON.stringify(error),
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