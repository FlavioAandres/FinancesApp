# Finances Documentation

Pre-requisites: 

- AWS Account
- Mailchimp Account
- Domain to connect Emails
- AWS CLI
- MongoDB Instance (You can use Free tier of MongoAtlas)
- AWS Amplify CLI
- Clone: [https://github.com/FlavioAandres/FinancesApp](https://github.com/FlavioAandres/FinancesApp)

## AWS Amplify - Authentication project

Install with `npm i @aws-amplify/cli -g`

We’re using amplify to deploy our Cognito user pool automatically, also, the frontend (client) is working through the Cognito Authentications using Cognito API and package. 

1. Run `cd client/ && amplify init`
2. Try to get something similar to this in the wizard: 

![Untitled](Finances%20Documentation%20c268470d386f4fe2ae0f4444eaeb686e/Untitled.png)

1. Add the authentication using API Key or Profiles, I'm gonna use APIKEY, this operation will create new IAM Resources to allow Amplify do stuffs 

![Untitled](Finances%20Documentation%20c268470d386f4fe2ae0f4444eaeb686e/Untitled%201.png)

1. Once the environment is initialized, run `cd client/ && amplify add auth`, and continue the wizard according to these settings. 

![Untitled](Finances%20Documentation%20c268470d386f4fe2ae0f4444eaeb686e/Untitled%202.png)

1. After the previous step, confirm the file `./src/aws-exports.json` is located on the root of `/client`
2. Now, let’s deploy the authentication to AWS running `amplify push` and confirm when the CLI asks for confirmation

![Untitled](Finances%20Documentation%20c268470d386f4fe2ae0f4444eaeb686e/Untitled%203.png)

1. Feel free and happy if you see the following message after deploying: 

![Untitled](Finances%20Documentation%20c268470d386f4fe2ae0f4444eaeb686e/Untitled%204.png)

I recommend you go to AWS Console (web dashboard) and check the new Cognito User Pull is successfully deployed as this: 

![Untitled](Finances%20Documentation%20c268470d386f4fe2ae0f4444eaeb686e/Untitled%205.png)

## Initializing the UI in local to connect with the current user pool (testing everything goes properly)

1. run `npm install` ,then `npm run start` you must see no error in the React Client 

![Untitled](Finances%20Documentation%20c268470d386f4fe2ae0f4444eaeb686e/Untitled%206.png)

## Deploy Backend API and Configure with Cognito Pool.

To create an account, for the first time, we need to continue deploying and configuring the API to save the users created by Cognito, so, let’s deploy the API. 

1. **IMPORTANT!!! - Run `aws configure` *and set your credentials.** thanks Oswaldo to deploy everything in the Business account and realized this.* 
2. Go to the root of the Project and create a new filed called: `config/{environment}.json` with the following fields: 

```jsx
-- ./config/test.json
{
    "MONGO_HOST": "YourMongoDB_Host",
    "MONGO_PORT": 27017,
    "MONGO_SECRET": "MongoPass",
    "MONGO_SET": "replica-set-Cluster0-shard-0",
    "MONGO_USER": "MongoUSER",
    "MONGO_DATABASE":"DatabaseName",
    "SRV_CONFIG": false,
    "USER_POOL_ARN": "arn:aws:cognito-idp:us-east-1:9999999999:userpool/us-west-1_632zAiS9C"
}
```

The fields above show all the environment vars needed by the API, basically the MONGO and COGNITO credentials. 

1. run `cd ../` `npm install`
2. run `serverless deploy --stage {environment} --region={same_as_cognito_region}`

![Untitled](Finances%20Documentation%20c268470d386f4fe2ae0f4444eaeb686e/Untitled%207.png)

If everything is successfully deployed, you must see something similar to the logs above. 

### Connect API with Cognito

1. Go to your Cognito user Pool → Triggers → Set the function for Post Confirmation hook. 

![Untitled](Finances%20Documentation%20c268470d386f4fe2ae0f4444eaeb686e/Untitled%208.png)

1. Click on “Save”

## Deploying UI - React Client

1. Create an S3 Bucket with the Website property in the AWS Console
2. If you already have a domain name for this, remember to name the Bucket with the domain address, for example for the name: finances.flavioaandres.com. These are the steps to create: 

![Untitled](Finances%20Documentation%20c268470d386f4fe2ae0f4444eaeb686e/Untitled%209.png)

![Untitled](Finances%20Documentation%20c268470d386f4fe2ae0f4444eaeb686e/Untitled%2010.png)

1. After creating the S3 bucket, go to the bucket and Click on **Properties** 
2. Enable the Static Web Hosting feature and add the following settings: 
    1. Index page: index.html 
    2. Error Page: index.html

![Untitled](Finances%20Documentation%20c268470d386f4fe2ae0f4444eaeb686e/Untitled%2011.png)

1. Go to `./client/package.json` and update the following scripts to point to your S3 bucket name instead of flavioaandres.com 🙂
    1. deploy:test
    2. deploy:prod
    3. example: `"npm run build:test && aws s3 sync build/ s3:**//my-finances-bucket-flavio** --acl public-read",`
2. Check your `.env.{environment}` is created, if you’re going to deploy test stage, check `.env.test` is set up with the right .env vars: 

```jsx
REACT_APP_FINANCES_API_URL="https://api.env.flavioaandres.com"
```

1. Now, run to deploy: `cd client/ && npm run deploy:test`

## FINALLY EVERYTHING IS DEPLOYED;

### If everything is properly set, you must be able to create the new account in your S3 Bucket.

![Untitled](Finances%20Documentation%20c268470d386f4fe2ae0f4444eaeb686e/Untitled%2012.png)

## MAIL CHIMP

1. Create the Mail-chimp account y das click en Transactional Email, luego Launch App 

![Untitled](Finances%20Documentation%20c268470d386f4fe2ae0f4444eaeb686e/Untitled%2013.png)

1. Agrega tu dominio y sigue el setup de mailchimp 

![Untitled](Finances%20Documentation%20c268470d386f4fe2ae0f4444eaeb686e/Untitled%2014.png)

1. Crea el correo donde vas a reenviar los mensajes del banco, y testea 🙂

![Untitled](Finances%20Documentation%20c268470d386f4fe2ae0f4444eaeb686e/Untitled%2015.png)