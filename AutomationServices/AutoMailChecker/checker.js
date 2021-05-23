require('dotenv').config()
const imaps = require('imap-simple')
const utils = require('./utils')
const config = require('../configs')
const moment = require('moment')
const { createMultiple: createMultiplesPayments } = require('../../shared/database/repos/payment.repo')
const { getBanks } = require('../../shared/database/repos/bank.repo');
const { getUser } = require('../../shared/database/repos/user.repo');
const crypto = require('../../shared/utils/crypto')
String.prototype.splice = function (idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

const {
    MINUTES_AGO_SEARCH = '30'
} = process.env

const start = async (event, context) => {
    if(process.env.NODE_ENV === 'dev')
        event = { 
            Records:[{ body: JSON.stringify({"createdAt":"2021-05-20T00:59:08.811Z","data":{"userId":"60a725161d8bbb000909c69c","checkAllDates":false}}) }] 
        }
    try {
        console.info('Getting User Config')
        const [{ data }, ...rest] = event.Records.map(sqsMessage => { //Just 1 event per execution
            try {
                return JSON.parse(sqsMessage.body);
            } catch (e) {
                console.error(e);
            }
        });
        // This function open the mongo connection
        const [ user ] = await getUser({ _id: data.userId },  {banks: true})
        if (!user) return "No user found"
        const { settings } = user
        if (!user || !settings || !settings.email || !settings.email.user || !settings.email.key)
            throw new Error('Users and email are not configured yet, please create the user document for user ' + data.userId)

        console.info('Getting Banks Config')
        const banks = user.banks

        if (!banks || !banks.length)
            throw new Error('Banks are not configured yet, please create the bank documents')

        console.info('Connecting to email of user ' + data.userId);

        config.user = crypto.decrypt(settings.email.user);
        config.password = crypto.decrypt(settings.email.key);

        const connection = await imaps.connect(config);

        for (let index = 0; index < banks.length; index++) {
            const bank = banks[index];
            console.info(`Openning ${bank.folder}`)
            await connection.openBox(bank.folder)
            const date = data.checkAllDates
                ? moment().subtract(1.5, 'years').toISOString()
                : moment()
                    .subtract(MINUTES_AGO_SEARCH, 'minutes')
                    .toISOString()
            console.log('=== SEARCHING EMAILS ===', {
                startDate: date,
                now: moment().toISOString()
            })
            const GranularData = []

            const searchValues = [];

            if (!data.checkAllDates) searchValues.push('UNSEEN');
            searchValues.push(
                ['SINCE', date],
                ['SUBJECT', bank.subject]
            );
            const results = await connection.search(searchValues, {
                bodies: ['HEADER', 'TEXT'],
                markSeen: true
            })

            // Close Box
            connection.closeBox()
            if (results.length) {
                const messages = await utils.readRawEmail(results)
                console.log('==== START ' + bank.name + ' with ' + messages.length + ' Messages');
                for (let index = 0; index < bank.filters.length; index++) {
                    const filter = bank.filters[index];
                    console.log('==== START FILTER ' + filter.phrase);
                    for (let index = 0; index < messages.length; index++) {
                        const message = messages[index];

                        const res = utils.search(message.html, filter.phrase, filter.parser, bank.ignore_phrase, bank.name)
                        if (!res) continue;

                        const prePaymentObj = {
                            bank: bank.name,
                            source: res.TRANSACTION_SOURCE,
                            destination: res.TRANSACTION_DESTINATION,
                            amount: res.TRANSACTION_VALUE,
                            cardType: res.TRANSACTION_CARD_TYPE,
                            account: res.TRANSACTION_ACCOUNT,
                            category: res.TRANSACTION_TYPE,
                            text: res.description,
                            type: filter.type,
                            createdBy: 'AUTO_EMAIL_SERVICE',
                            createdAt: moment(message.date).format(),
                            user: user._id,
                            description: res.DESCRIPTION,
                            isAccepted: res.TRANSACTION_TYPE === 'withdrawal' ? true : false
                        }

                        if (GranularData.indexOf(prePaymentObj) === -1) { // Do not enter duplicated values.
                            GranularData.push(prePaymentObj)
                        }
                    }
                    console.log('==== FINISHED FILTER ' + filter.phrase);
                }
            }
            await createMultiplesPayments(GranularData)
            console.log('==== FINISHED ' + bank.name + ' with a total of ' + GranularData.length + ' Messages saved');
        }
    } catch (e) {
        e.event = event
        console.error(e)
    }

    return context.done(null);
}

module.exports = {
    start
}