const AWS = require('aws-sdk')
const S3 = new AWS.S3();
const moment = require('moment')
const { getBanks } = require('../../shared/database/repos/bank.repo');
const { getUser } = require('../../shared/database/repos/user.repo');
const { create: createPayment } = require('../../shared/database/repos/payment.repo')
const utils = require('./utils')

module.exports.process = async (event, context, callback) => {
    try {
        const mailEvent = event.Records[0].ses
        const { messageId, timestamp, commonHeaders } = mailEvent.mail
        let { subject, to, from } = commonHeaders

        const source = getEmail(to);

        // Removing forward subject label
        if (subject.includes('Fwd: ')) {
            subject = subject.replace('Fwd: ', '')
        }

        // Search for bank by subject
        const banks = await getBanks({})

        const bank = banks.filter(bank => subject.includes(bank.subject));

        if (Array.isArray(bank) && bank.length == 1) {
            // Get bank information
            const { filters, ignore_phrase, name: bankName } = bank[0]

            // Retrieve email information
            const data = await S3.getObject({
                Bucket: process.env.BUCKETNAME,
                Key: messageId
            }).promise();

            if (!([undefined, null].includes(data.Body))) {
                const emailData = data.Body.toString('utf-8')
                const result = await utils.readRawEmail(emailData)

                console.log('result', result);

                for (let index = 0; index < filters.length; index++) {
                    const filter = filters[index];

                    const res = utils.search(result.html, filter.phrase, filter.parser, ignore_phrase, bankName)

                    if (!res) continue

                    const user = await getUser({ emails: source })

                    const prePaymentObj = {
                        bank: bankName,
                        source: res.TRANSACTION_SOURCE,
                        destination: res.TRANSACTION_DESTINATION,
                        amount: res.TRANSACTION_VALUE,
                        cardType: res.TRANSACTION_CARD_TYPE,
                        account: res.TRANSACTION_ACCOUNT,
                        category: res.TRANSACTION_TYPE,
                        text: res.description,
                        type: filter.type,
                        createdBy: 'AUTO_EMAIL_SERVICE',
                        createdAt: moment(timestamp).format(),
                        user: user._id,
                        description: res.DESCRIPTION,
                        isAccepted: res.TRANSACTION_TYPE === 'withdrawal' ? true : false
                    }
                    const payment = await createPayment(prePaymentObj)
                    break;
                }

                // Deleting processed Email.
                await S3.deleteObject({
                    Bucket: process.env.BUCKETNAME,
                    Key: messageId
                })

            } else {
                console.log(`No Body`)
            }
        }
    } catch (error) {
        console.log(error)
    }
}


const getEmail = (from) => {
    let source = undefined;
    if (Array.isArray(from) && from.length > 0) {
        source = from[0].match(/\<(.*?)\>/g)
        if (Array.isArray(source) && source.length > 0) {
            source = source[0].replace('<', '').replace('>', '')
        } else {
            source = from[0];
        }
    }
    return source
}
