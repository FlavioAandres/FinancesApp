const mailparser = require('mailparser').simpleParser
const _ = require('lodash')
const cheerio = require('cheerio');
const { htmlToText } = require('html-to-text');
const { paymentsParser: paymentsDaviviendaParser } = require('./parsers/davivienda/payments.parser')
const { paymentsParser: paymentsPSEParser } = require('./parsers/pse/payments.parser')
const { paymentsParser: paymentsBancolombiaParser } = require('./parsers/bancolombia/payments.parser')
const { shoppingParser } = require('./parsers/bancolombia/shopping.parser')
const { productParser } = require('./parsers/bancolombia/productPayments.parser')
const { transfersParser } = require('./parsers/bancolombia/transfers.parser')
const { transferReceptionParser } = require('./parsers/bancolombia/transferReception.parser')
const { debitWithdrawalParser } = require('./parsers/bancolombia/debitWithdrawal.parser')
const { creditCardWithdrawalParser } = require('./parsers/bancolombia/creditCardWithdrawal.parser')


function isBase64(str) {
    return Buffer.from(str, 'base64').toString('base64') === str
}

module.exports.readRawEmail = async (emails = []) => {
    const parsed = []
    for (const mail of emails) {
        let all = _.find(mail.parts, { "which": "TEXT" })
        const subject = mail.parts.filter(part => part.which === 'HEADER')[0].body.subject[0]
        let textAsHtml = null;

        if (all.body !== null && isBase64(all.body.replace(/\r?\n|\r/g, ""))) {
            all.body = Buffer.from(all.body.replace(/\r?\n|\r/g, ""), 'base64').toString()
            textAsHtml = '<p>' + htmlToText(all.body).replace(/\r?\n|\r|\t/g, " ") + '</p>'
        } else {
            const result = await mailparser(all.body);
            textAsHtml = result.textAsHtml
        }


        parsed.push({
            date: mail.attributes.date,
            subject: subject,
            html: textAsHtml
        })

    }
    return parsed
}

module.exports.search = (html, filter, parser, skipped_phrase = 'Bancolombia le informa que su factura inscrita', bank_name = "BANCOLOMBIA") => {
    if ([null, undefined].includes(parser)) return undefined; //If we don't have a parser, just return null to continue with the next message
    const $ = cheerio.load(html)
    const res = $('p')
    const value = res.text().trim().toLowerCase().replace(/=/g, '')
    filter = filter.toLocaleLowerCase()
    if (value.includes(filter)) {
        if (skipped_phrase === null || skipped_phrase === undefined || !value.includes(skipped_phrase.toLocaleLowerCase())) { // If the phrase do not includes the skipped phrase
            let description, parserResult;

            // The fisrt coincidence for the filter phrase
            const first = value.indexOf(filter)


            switch (bank_name) {
                case "BANCOLOMBIA": {
                    const end = value.indexOf('018000931987', first + 1) + 12
                    description = value.substring(first, end)

                    switch (parser) {
                        case 'payments': {
                            parserResult = paymentsBancolombiaParser(description)
                            break;
                        }
                        case 'shopping': {
                            parserResult = shoppingParser(description)
                            break;
                        }
                        case 'product': {
                            parserResult = productParser(description)
                            break;
                        }
                        case 'transfer': {
                            parserResult = transfersParser(description)
                            break;
                        }
                        case 'transferReception': {
                            parserResult = transferReceptionParser(description)
                            break;
                        }
                        case 'debitWithdrawal': {
                            parserResult = debitWithdrawalParser(description)
                            break;
                        }
                        case 'creditCardWithdrawal': {
                            parserResult = creditCardWithdrawalParser(description)
                            break;
                        }
                    }
                    break;
                }
                case "PSE": {
                    /**
                     * I want to keep on the description the company name where the payment was made
                     * This value is before the value of the transaction, but some transaction at the first match value
                     * has a CUS (like a uuid) of the transaction, that's why I need to look for the value 'Valor de la Transacción'
                     */
                    const end = value.indexOf('[http://www.jlnsoftware.com.br', first + 1)
                    description = value.substring(first, end)

                    parserResult = paymentsPSEParser(description)
                    break;
                }
                case "DAVIVIENDA": {
                    description = value.substring(first)
                    switch (parser) {
                        case 'payments': {
                            parserResult = paymentsDaviviendaParser(description)
                            break;
                        }
                    }
                }
            }

            return {
                description,
                ...parserResult
            }
        }
    }
    return undefined
}