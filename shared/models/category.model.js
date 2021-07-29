const mongoose = require('mongoose')

const categorySchema = mongoose.Schema(
    {
        label: {
            type: String,
            index: true,
            required: true,
            trim: true
        },
        value: {
            type: String,
            index: true,
            required: true,
            trim: true
        },
        budget: {
            value: {
                type: Number,
                default: 0
            },
            current: {
                type: Number,
                default: 0
            },
            progress: {
                type: Number,
                default: 0
            }
        },
        type: {
            type: String,
            index: false,
            required: true,
            trim: true,
            enum: ['INCOME', 'EXPENSE']
        },
        user: {
            type: mongoose.Types.ObjectId
        }
    },
    {
        timestamps: true
    }
)

/**
 * Plugins
 */



/**
 * @typedef Category
 */
module.exports = mongoose.model('Category', categorySchema)