const { ConfirmationEmailValues } = require("../../../constants");
const AcceptGmailInvitation = require('./handlers/AcceptGmail')

const AcceptFunctions = {
    gmail: AcceptGmailInvitation
}

const checkInvitationEmail = (emailSubject)=>{
    const hosts = Object.keys(ConfirmationEmailValues.subjects)
    return hosts.find(host=>{
        const hostSubject = ConfirmationEmailValues.subjects[host]; 
        return emailSubject.indexOf(hostSubject) > 0
    })
}

module.exports.run = async (event)=>{
    const { body } = event; 
    if(!body) return {
        statusCode: 400
    }
    try {
        const mandrill_events = JSON.parse(body.mandrill_events)
        if(!mandrill_events || mandrill_events[0]){
            return {statusCode: 400}
        }
        const [{ msg: messageInfo }] = mandrill_events
        if(!msg){
            return {statusCode: 400}
        }
        const {text, headers, raw_email} = messageInfo; 
        const subject = headers.subject; 
        //check if is a invitation email 
        const hostToAccept = checkInvitationEmail(subject)
        
        if(hostToAccept){
            const functionToAccept = AcceptFunctions[hostToAccept]; 
            if(functionToAccept){
                await functionToAccept(text)
            }else{
                console.error({type: "FUNCTION_NOT_FOUND", text, headers})
                return {
                    statusCode:  200
                }
            }
        }else{
            //parse emails of Payments
        }

        if(subject.indexOf(ConfirmationEmailValues.subjects.gmail)){
            // confirm gmail link
        }else{
            //parse emails
        }
        console.log(text)
        
    } catch (error) {
        console.log(body)
    }

    return {
        statusCode: 200, 
    }
}