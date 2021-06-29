const mongoose = require('mongoose')

const BankSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            index: true,
        },
        filters: [
            {
                phrase: { type: String },
                type: { type: String },
                parser: { type: String }
            },
        ],
        folder: {
            type: String
        },
        subject: {
            type: String
        },
        ignore_phrase: { type: String, default: null },
        index_value: { type: Number },
    },
    {
        timestamps: true,
    }
);


/**
 * @typedef Bank
 */
const Bank = mongoose.model('bank', BankSchema);

module.exports = Bank;