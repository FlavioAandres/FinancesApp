const { ConfirmationEmailValues } = require("../../../constants");
const { getUser } = require("../../../shared/database/repos/user.repo");
const { scheduleMessages } = require("../../../shared/utils/sqs");
const AcceptGmailInvitation = require('./handlers/AcceptGmail')

const UrlExtractFunctions = {
    gmail: AcceptGmailInvitation
}

const checkInvitationEmail = (emailSubject)=>{
    emailSubject = emailSubject.toLowerCase(); 
    const hosts = Object.keys(ConfirmationEmailValues.subjects)
    return hosts.find(host=>{
        const hostSubject = ConfirmationEmailValues.subjects[host].toLowerCase(); 
        return emailSubject.indexOf(hostSubject) >= 0
    })
}

const parseEmailInfo = (headers) => headers['X-Forwarded-For'] 
    ? headers['X-Forwarded-For'].split(" ")[0]
    : "" ; 

module.exports.run = async (event)=>{
    const { body } = event; 
    if(!body) {
        console.error('no body sent')
        return {
            statusCode: 400
        }
    }
    const mandrill_events = JSON.parse(body.mandrill_events)
    if(!mandrill_events || !mandrill_events[0]){
        console.log('no madrill received', body)
        return {statusCode: 400}
    }
    const [{ msg: messageInfo }] = mandrill_events
    if(!messageInfo){
        console.log('no msg received', body)
        return { statusCode: 400 }
    }
    const {text, headers, raw_email} = messageInfo; 
    if(process.env.DEBUG){
        console.info({
            text, headers, raw_email
        })
    }
    const subject = headers.Subject; 
    //check if is a invitation email 
    const hostToAccept = checkInvitationEmail(subject)
    const queueEvent = {}

    try {
        //getting User
        if(hostToAccept){
            const {urlToAccept, ownerEmail: email} = UrlExtractFunctions[hostToAccept](text); 
            queueEvent.type = "EMAIL_ACCEPT_INVITATION"; 
            queueEvent.email = email; 
            queueEvent.data = {
                host: hostToAccept,  
                url: urlToAccept, 
                text, 
            } 
        }else{                                                                                                                                                                                                                                                                                                                                                                              
            queueEvent.email = parseEmailInfo(headers)
            queueEvent.type = "USER_PAYMENT_EVENT"; 
            queueEvent.email = email; 
            queueEvent.data = {
                host: hostToAccept,  
                url: urlToAccept, 
                text, 
            } 
        }
        console.log(queueEvent)
        const [user] = await getUser({
            email: queueEvent.email
        }, { banks: true }); 

        if(!user){
            console.log({ type: "NO_USER_FOUND", text, headers })
            return {
                statusCode: 200,
            }
        }

        queueEvent.user = {...user}; 
        queueEvent.user.banks = undefined; 
        

        
        await scheduleMessages([{MessageBody: JSON.stringify(queueEvent), Id: Date.now().toString() }], process.env.POST_INCOMING_WEBHOOK_QUEUE); 
        
    } catch (error) {
        console.error(error)
        console.log(body)
    }

    return {
        statusCode: 200, 
    }
}