const userRepo = require('../../shared/database/repos/user.repo'); 
const paymentRepo = require('../../shared/database/repos/payment.repo')
const AWS = require('aws-sdk'); 

const SQS_CONFIGS = {
    region: 'us-east-1',
}

const SQS = new AWS.SQS(SQS_CONFIGS)

module.exports.start = async ()=>{
    const usersToSchedule = await userRepo.getUsers({ 
        'settings.email.user': { $exists: true }, 
        'settings.email.key': { $exists: true },
    }); 
    if(!usersToSchedule || !usersToSchedule.length)
    throw Error('No users found in schema'); 
    
    const userIds = usersToSchedule.map(user=>user._id); 
    
    const messagesToQueue = usersToSchedule.map(({_id: id, settings})=>({
        MessageBody: JSON.stringify({
            createdAt: (new Date()).toISOString(), 
            data: {
                userId: id,
                checkAllDates: !settings.email.checkedEvent
            }
        }),
        Id: id + '_event'
    }));
    
    const sqsResult = await SQS.sendMessageBatch({
        QueueUrl: process.env.USER_SCHEDULE_SQS_URL,
        Entries: messagesToQueue,
    }).promise()

    try {
        await userRepo.updateUser({
            _id: { $in: userIds },
        }, {
            $set: { 'settings.email.checkedEvent': true }
        });
    } catch (error) {
        console.error(error)
    }

    return sqsResult; 
}