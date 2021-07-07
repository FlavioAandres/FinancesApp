const mongoose = require('mongoose')
const BankModel = require('./bank.model')
const PaymentModel = require('./payment.model')
const { encrypt } = require('../utils/crypto')

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            index: true,
            required: false,
        },
        verified: {
            type: Boolean,
            default: false,
            required: true
        },
        sub: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        phones: [
            {
                type: String,
                index: true,
                trim: true,
            }
        ],
        categories: [{
            label: String, 
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
            value: String,
            type: {
                type: String,
                index: false,
                required: true,
                trim: true,
                enum: ['INCOME', 'EXPENSE']
            }
        }],
        emails: [
            {
                type: String,
                index: true,
                required: true,
                trim: true,
            }
        ],
        settings: {
            datacredito: {
                user: {
                    iv: {
                        type: String,
                        trim: true
                    },
                    content: {
                        type: String,
                        trim: true
                    }
                },
                password: {
                    iv: {
                        type: String,
                        trim: true
                    },
                    content: {
                        type: String,
                        trim: true
                    }
                },
                secondpass: {
                    iv: {
                        type: String,
                        trim: true
                    },
                    content: {
                        type: String,
                        trim: true
                    }
                }
            },
            email: {
                checkedEvent: { type: Boolean, default: false },
                user: {
                    iv: {
                        type: String,
                        trim: true
                    },
                    content: {
                        type: String,
                        trim: true
                    }
                },
                key: {
                    iv: {
                        type: String,
                        trim: true
                    },
                    content: {
                        type: String,
                        trim: true
                    }
                },
            },
            bots: {
                chats: [
                    {
                        type: {
                            type: String,
                            required: true,
                            trim: true,
                            enum: ['WHATSAPP', 'TELEGRAM']
                        },
                        id: {
                            type: Number,
                            required: true
                        }
                    }
                ]
            }
        },
        banks: [{
            type: mongoose.Types.ObjectId,
            ref: BankModel,
            autopopulate: true
        }]
    },
    {
        timestamps: true
    }
)

/**
 * Plugins
 */

userSchema.plugin(require('mongoose-autopopulate'));

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */

userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
    const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
    return !!user;
};


userSchema.pre('save', async function (next) {
    const user = this;

    // Encrypt Data Credito credentials
    if (user.isModified('setting.datacredito.user')) {
        user.setting.datacredito.user = await encrypt(user.setting.datacredito.user);
    }

    if (user.isModified('setting.datacredito.password')) {
        user.setting.datacredito.password = await encrypt(user.setting.datacredito.password);
    }

    if (user.isModified('setting.datacredito.secondpass')) {
        user.setting.datacredito.secondpass = await encrypt(user.setting.datacredito.secondpass);
    }

    next();
});

/**
 * @typedef User
 */
module.exports = mongoose.model('user', userSchema)