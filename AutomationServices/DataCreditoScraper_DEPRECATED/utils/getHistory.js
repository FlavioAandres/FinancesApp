const axios = require('axios');

const getHistory = async (sessingid) => {

    return new Promise(async (resolve, reject) => {
        const data = JSON.stringify({ "sessionId": sessingid });

        const config = {
            method: 'post',
            url: 'https://www.midatacredito.com/crdthstry/MiScoreHome/getFullCreditHistory',
            headers: {
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache',
                'Accept': 'application/json, text/plain, */*',
                'DNT': '1',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36',
                'Content-Type': 'application/json',
                'Origin': 'https://www.midatacredito.com',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': 'https://www.midatacredito.com/freepremium',
                'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
                'Cookie': 'b62ad2f33082580a03e65b93143afdf0=5b4aa9ad4c4279e0fc314fc24d0e3b68; visid_incap_1342267=AtL+PZleRYOeAUheiTHI6yfr1l8AAAAAQUIPAAAAAAA1Jrtu4nWlJ9AKisr8+6dY; incap_ses_469_1342267=5rykabQfLnzcLbQURTmCBijr1l8AAAAATXCZ5ugkA0LtB0ZNQMv+MQ==; nlbi_1342267=K2laI/bTc1LR+HvngyQbsAAAAAAJ2nkHnm4uaziV/tkdHTg5'
            },
            data: data
        };

        axios(config)
            .then(function (response) {
                resolve(response.data)
            })
            .catch(function (error) {
                reject(error);
            });
    })

}

module.exports = {
    getHistory
}
