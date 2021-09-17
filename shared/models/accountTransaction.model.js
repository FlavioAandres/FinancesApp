const mongoose = require('mongoose');

const AccountTransactionSchema = mongoose.Schema(
    {
        value: {
            type: Number,
            required: true,
            index: true,
        },
        sub: {
            type: String,
            required: true,
            index: true
        },
        description: {
            type: String,
            required: false
        },
        type: {
            type: String,
            index: true,
            required: true,
            trim: true,
            enum: ['ADDITION', 'SUBTRACTION', 'NEUTRAL']
        },
        difference: {
            type: Number,
            required: true
        },
        account: {
            type: mongoose.Types.ObjectId,
            required: true
        }
    },
    {
        timestamps: true,
    }
);


/**
 * @typedef AccountTransaction
 */
const AccountTransaction = mongoose.model('AccountTransaction', AccountTransactionSchema);

module.exports = AccountTransaction;