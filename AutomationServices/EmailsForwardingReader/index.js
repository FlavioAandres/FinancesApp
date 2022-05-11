const AWS = require("aws-sdk");
const S3 = new AWS.S3();
const moment = require("moment");
const { getBanks } = require("../../shared/database/repos/bank.repo");
const { getUser } = require("../../shared/database/repos/user.repo");
const {
  create: createPayment,
  createMultiple: createMultiplesPayments
} = require("../../shared/database/repos/payment.repo");
const utils = require("./utils");

module.exports.process = async (event, context, callback) => {
  try {
    const [{ user, data, email }] = event.Records.map((sqsMessage) => {
      try {
        return JSON.parse(sqsMessage.body);
      } catch (e) {
        console.error(e);
        return {}
      }
    });
    const emailData = {
        html: data.text,
    }

    // TODO
    // Receive date form email
    await processBankEmails([data.bank], user, emailData, Date.now());

  } catch (error) {
    console.log(error);
  }
};


const processBankEmails = async (bank, user, emailData, timestamp) => {
  
  if (Array.isArray(bank) && bank.length == 1) {
    // Get bank information
    const { filters, ignore_phrase, name: bankName } = bank[0];

    for (const filter of filters) {
      const res = utils.search(
        emailData.html,
        filter.phrase,
        filter.parser,
        ignore_phrase,
        bankName
      );

      if (!res) continue;

      const prePaymentObj = {
        bank: bankName,
        source: res.TRANSACTION_SOURCE,
        destination: res.TRANSACTION_DESTINATION,
        amount: res.TRANSACTION_VALUE,
        cardType: res.TRANSACTION_CARD_TYPE
          ? res.TRANSACTION_CARD_TYPE
          : "Manual",
        account: res.TRANSACTION_ACCOUNT,
        category: res.TRANSACTION_TYPE,
        text: res.description,
        type: filter.type,
        createdBy: "AUTO_EMAIL_SERVICE",
        createdAt: moment(timestamp).format(),
        user: user._id,
        description: res.DESCRIPTION,
        isAccepted: res.TRANSACTION_TYPE === "withdrawal" ? true : false,
      };
      
      await createMultiplesPayments([prePaymentObj]);
      break;
    }
  }
};
