const mongoose = require('mongoose')

const ArchiveSchema = mongoose.Schema(
    {
        user: mongoose.Types.ObjectId, 
        categories: [{
            value: String, 
            budget: {
                progress: Number, 
                current: Number, 
                value: Number
            }, 
        }], 
        day: Number, 
        month: Number, 
        year: Number,  
        sub: String, 
        archiveType: {
            type: {
                enum: ['CATEGORY_BUDGETS_HISTORY']
            }
        }
    },
    {
        timestamps: true
    }
)



/**
 * @typedef Income
 */
module.exports = mongoose.model('archive', ArchiveSchema)