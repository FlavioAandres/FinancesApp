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
        let { subject, to } = commonHeaders


        // Removing forward subject label
        if (subject.includes('Fwd: ')) {
            subject = subject.replace('Fwd: ', '')
        }

        const emailData = await getEmailData(messageId)
        if (emailData !== 'No Body') {
            if (subject.includes('Gmail Forwarding Confirmation') > 0) {
                await utils.processForwardingConfirmationGmail(emailData.html, 'EN');
            } else if (subject.includes('Confirmación de reenvío') > 0) {
                await utils.processForwardingConfirmationGmail(emailData.html, 'ES');
            } else {
                const source = getEmail(to);
                await processBankEmails(subject, source, emailData, timestamp);
            }
        }

        await deleteEmailData(messageId);

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

const processBankEmails = async (subject, source, emailData, timestamp) => {
    // Search for bank by subject
    const banks = await getBanks({})

    const bank = banks.filter(_bank => subject.includes(_bank.subject));

    if (Array.isArray(bank) && bank.length == 1) {
        // Get bank information
        const { filters, ignore_phrase, name: bankName } = bank[0]


        for (const filter of filters) {

            const res = utils.search(emailData.html, filter.phrase, filter.parser, ignore_phrase, bankName)

            if (!res) continue

            const user = await getUser({ emails: source })

            const prePaymentObj = {
                bank: bankName,
                source: res.TRANSACTION_SOURCE,
                destination: res.TRANSACTION_DESTINATION,
                amount: res.TRANSACTION_VALUE,
                cardType: res.TRANSACTION_CARD_TYPE ? res.TRANSACTION_CARD_TYPE : 'Manual',
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
            await createPayment(prePaymentObj)
            break;
        }



    }
}

const getEmailData = async (messageId) => {
    // Retrieve email information
    const data = await S3.getObject({
        Bucket: process.env.BUCKETNAME,
        Key: messageId
    }).promise();

    if (!([undefined, null].includes(data.Body))) {

        const emailData = data.Body.toString('utf-8')
        return await utils.readRawEmail(emailData)
    }

    return 'No Body';
}

const deleteEmailData = async (messageId) => {
    // Deleting processed Email.
    await S3.deleteObject({
        Bucket: process.env.BUCKETNAME,
        Key: messageId
    }).promise()
}