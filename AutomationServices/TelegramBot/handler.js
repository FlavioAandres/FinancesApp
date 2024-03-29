'use strict';

const { bot } = require('./src/bot');

const getResponseHeaders = () => {
  return {
      'Access-Control-Allow-Origin': '*'
  };
}

module.exports.webhook = async event => {
  try {

    const body = JSON.parse(event.body);

    await bot.handleUpdate(body);

    return {
      statusCode: 200,
      headers: getResponseHeaders(),
      body: JSON.stringify(
        {
          message: 'Ok',
        })
    };

  } catch (err) {

    console.log("Error: ", err);
    return {
        statusCode: err.statusCode ? err.statusCode : 500,
        headers: getResponseHeaders(),
        body: JSON.stringify({
          error: err.name ? err.name : "Exception",
          message: err.message ? err.message : "Unknown error"
        })
    };
  }
};

module.exports.setWebhook = async event => {
  try {

      let url = 'https://' + event.headers.Host + '/' + event.requestContext.stage + '/telegram/webhook';

      await bot.telegram.setWebhook(url);

      return {
          statusCode: 200,
          headers: getResponseHeaders(),
          body: JSON.stringify({url: url})
      };

  } catch (err) {
      console.log("Error: ", err);
      return {
          statusCode: err.statusCode ? err.statusCode : 500,
          headers: getResponseHeaders(),
          body: JSON.stringify({
              error: err.name ? err.name : "Exception",
              message: err.message ? err.message : "Unknown error"
          })
      };
  }
}