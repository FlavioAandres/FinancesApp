'use strict';
require('dotenv').config()
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('./src/utils/bodyParser')
const cashController = require('./src/controllers/finanzas')
const { dataCreditoHandler } = require('./src/controllers/datacredito')

const handler = async (event, context) => {
  try {
    let object

    if (['test', 'prod'].includes(process.env.NODE_ENV))
      object = bodyParser(event.body)
    else
      object = {
        From: process.env.TEST_PHONE_NUMBER,
        Body: process.env.BODY_REQUEST,
        To: "123"
      }

    let twiml
    if (process.env.NODE_ENV == 'dev')
      twiml = { message: response => console.log(response) }
    else
      twiml = new MessagingResponse();

    let response

    if (object.Body.toLowerCase().includes("reminder")) {
      response = "🍁🍁🍁🍁 \nReminder is not avilable yet, we're working hard with some drugs to give you this soon!! "
    } else if (object.Body.toLowerCase().includes("total+less")) {
      response = await cashController.substractCategories(object)
    } else if (object.Body.toLowerCase().includes("total+sum")) {
      response = await cashController.sumCategories(object)
    } else if (object.Body.toLowerCase().includes("total")) {
      response = await cashController.listCategory(object)
    } else if (object.Body.toLowerCase().includes("cash+update")) {
      response = await cashController.updateCategory(object)
    } else if (object.Body.toLowerCase().includes("cash")) {
      response = await cashController.addRecord(object)
    } else if (object.Body.toLowerCase().includes("datacredito")) {
      response = await dataCreditoHandler(object)
    } else {
      response = `Sorry 🤯, i dont have idea what you want to do. Greetings.`
    }

    twiml.message(response)

    let xml = twiml.toString()

    context.done(null, {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
      body: xml
    });
  } catch (e) {
    console.log(e)
    context.done(null, {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/xml',
      },
      body: "something fails with this shit!"
    });
  }

};

module.exports = {
  handler
}