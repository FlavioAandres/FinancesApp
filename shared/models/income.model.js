const mongoose = require('mongoose')
const CategoryModel = require('./category.model')

const IncomeSchema = mongoose.Schema(
    {
        source: { type: String, required: true, default: '' },
        amount: { type: Number, required: true },
        description: { type: String, require: false },
        category: {
            type: mongoose.Types.ObjectId,
            ref: CategoryModel,
            autopopulate: true
        },
        user: { type: mongoose.Types.ObjectId, require: true }
    },
    {
        timestamps: true
    }
)

/**
 * Plugins
 */

 IncomeSchema.plugin(require('mongoose-autopopulate'));


/**
 * @typedef Income
 */
module.exports = mongoose.model('Income', IncomeSchema)