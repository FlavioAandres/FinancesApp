const { connect, destroy } = require("../../shared/database/mongo");
const Payments = require("../../shared/models/payment.model");

module.exports.start = async (event, context) => {
    try {
        await connect();
        await Payments.updateMany(
            {
                createdAt: {
                    $lte: new Date(new Date().getTime() - 1000 * 86400 * 30) // less than 30 days
                },
                isAccepted: false,
                isHidden: false
            },
            {
                $set: { isHidden: true } // Set Hidden
            }
        );
    } catch (error) {
        console.error(error);
    } finally {
        await destroy();
    }
}