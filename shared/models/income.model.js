const mongoose = require('mongoose')

const IncomeSchema = mongoose.Schema(
    {
        source: { type: String, required: true, default: '' },
        amount: { type: Number, required: true },
        description: { type: String, require: false },
        category: { type: String, default: 'INCOME' },
        user: { type: mongoose.Types.ObjectId, require: true }
    },
    {
        timestamps: true
    }
)



/**
 * @typedef Income
 */
module.exports = mongoose.model('Income', IncomeSchema)