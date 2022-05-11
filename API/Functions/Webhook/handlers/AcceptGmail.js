const { ConfirmationEmailValues } = require("../../../../constants")
const axios = require('axios')

function extractEmails ( text ){
    return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)[0];
}

module.exports =  (text)=>{
    const { url, domain } = ConfirmationEmailValues.values.gmail; 
    const textArray = text.split("\n"); 
    const urlToAccept = textArray.find(item=> item.indexOf(url) >= 0)
    let ownerEmail = textArray.find(item => item.indexOf(domain) >= 0)
    ownerEmail = extractEmails(ownerEmail)
    if(!urlToAccept){
        console.error({type: "unable to accept invitation", "host": "gmail", text, ownerEmail})
        return { urlToAccept: null, ownerEmail: ownerEmail }; 
    }

    return {urlToAccept, ownerEmail}; 
}