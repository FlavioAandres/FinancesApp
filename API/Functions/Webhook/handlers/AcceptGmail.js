const { ConfirmationEmailValues } = require("../../../../constants")
const axios = require('axios')


module.exports = async (text)=>{
    const {url} = ConfirmationEmailValues.values.gmail; 
    const textArray = text.split("\n"); 
    const urlToAccept = textArray.find(item=> item === url)
    if(!urlToAccept){
        console.error({type: "unable to accept invitation", "type": "gmail", text})
    }

    try {
        await axios.get(urlToAccept); 
    } catch (error) {
        console.error({
            error: error.message, 
            data: error.data, 
            config: error.config,  
        })
    }

}