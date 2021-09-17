const mongoose = require('mongoose');

const AccountSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            index: true,
        },
        number: {
            type: Number,
            required: true,
            index: true,
        },
        value: {
            type: Number,
            required: true
        },
        sub: {
            type: String,
            required: true,
            index: true
        },
        type: {
            type: String,
            index: true,
            required: true,
            trim: true,
            enum: ['FIDUCUENTA', 'CREDIT_ACCOUNT', 'DEBT_ACCOUNT', 'DEBIT_ACCOUNT']
        }
    },
    {
        timestamps: true,
    }
);


/**
 * @typedef Account
 */
const Account = mongoose.model('Account', AccountSchema);

module.exports = Account;