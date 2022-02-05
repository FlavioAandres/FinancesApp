const AWS = require('aws-sdk'); 
const SQS_CONFIGS = {
    region: 'us-east-1',
}
const SQS = new AWS.SQS(SQS_CONFIGS)

const scheduleMessages = (messagesToQueue, sqsToSchedule) => SQS.sendMessageBatch({
    QueueUrl: sqsToSchedule,
    Entries: messagesToQueue,
}).promise()

module.exports = {
    scheduleMessages
}