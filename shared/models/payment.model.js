const mongoose = require('mongoose')

const PaymentSchema = mongoose.Schema(
    {
        bank: {
            type: String,
            index: true,
            required: false,
        },
        source: { type: String, required: false, default: null },
        account: { type: String, required: false },
        destination: { type: String, required: false },
        cardType: { type: String, required: true, default: "Manual" },
        type: { type: String, required: true, default: "EXPENSE" },
        createdBy: { type: String, required: true },
        amount: { type: Number, required: true },
        text: { type: String, required: true },
        description: { type: String, require: false },
        isAccepted: { type: Boolean, default: false },
        isHidden: { type: Boolean, default: false },
        createdAt: { type: Date, },
        category: { type: String, default: null },
        secondCategory: { type: String, default: null },
        user: { type: mongoose.Types.ObjectId, required: true }
    },
    {
        timestamps: true
    }
)



/**
 * @typedef Payments
 */
module.exports = mongoose.model('Payments', PaymentSchema)