const { encrypt } = require('../shared/utils/crypto')

const username = "none";
const password = "none";
const secondpass = "secondpass";


console.log('User', JSON.stringify(encrypt(username)))
console.log('Password', JSON.stringify(encrypt(password)))
console.log('secondpass', encrypt(secondpass))

console.log('Update your user entry and put the last information under setting.datacredito')