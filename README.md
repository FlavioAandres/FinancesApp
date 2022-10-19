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

![Untitled](https://user-images.githubusercontent.com/42990423/196822867-912fced4-f722-44b2-8a6c-eccb9a81a4ec.png)


1. Add the authentication using API Key or Profiles, I'm gonna use APIKEY, this operation will create new IAM Resources to allow Amplify do stuffs 

![Untitled 1](https://user-images.githubusercontent.com/42990423/196822833-d25181c6-d754-4b93-aeff-aed97302e482.png)

1. Once the environment is initialized, run `cd client/ && amplify add auth`, and continue the wizard according to these settings. 


![Untitled 2](https://user-images.githubusercontent.com/42990423/196822837-fa3f531d-082f-4c10-8c77-7e5f7c84df5a.png)

1. After the previous step, confirm the file `./src/aws-exports.json` is located on the root of `/client`
2. Now, let’s deploy the authentication to AWS running `amplify push` and confirm when the CLI asks for confirmation

![Untitled 3](https://user-images.githubusercontent.com/42990423/196822839-eccf7fff-a39a-4521-854c-4436c44d728d.png)
1. Feel free and happy if you see the following message after deploying: 

![Untitled 4](https://user-images.githubusercontent.com/42990423/196822841-7851d422-f9e9-4d12-b64e-8db1f269bc27.png)

I recommend you go to AWS Console (web dashboard) and check the new Cognito User Pull is successfully deployed as this: 

![Untitled 5](https://user-images.githubusercontent.com/42990423/196822843-c92a57f9-d669-41bf-9b6f-e3c0b266a611.png)

## Initializing the UI in local to connect with the current user pool (testing everything goes properly)

1. run `npm install` ,then `npm run start` you must see no error in the React Client 

![Untitled 6](https://user-images.githubusercontent.com/42990423/196822844-0fda3f62-8f1d-44d2-8281-bb1a59bb412c.png)

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

![Untitled 7](https://user-images.githubusercontent.com/42990423/196822847-d9619ac8-fa90-4654-bff8-2f623ff98f6e.png)

If everything is successfully deployed, you must see something similar to the logs above. 

### Connect API with Cognito

1. Go to your Cognito user Pool → Triggers → Set the function for Post Confirmation hook. 

![Untitled 8](https://user-images.githubusercontent.com/42990423/196822850-ab1e8894-18a8-4679-ba63-0ef8974d77d7.png)

1. Click on “Save”

## Deploying UI - React Client

1. Create an S3 Bucket with the Website property in the AWS Console
2. If you already have a domain name for this, remember to name the Bucket with the domain address, for example for the name: finances.flavioaandres.com. These are the steps to create: 

![Untitled 9](https://user-images.githubusercontent.com/42990423/196822852-05645ca9-82b7-4478-b4f7-01e7e9ea0b6f.png)
![Untitled 10](https://user-images.githubusercontent.com/42990423/196822854-9db85007-a05d-4aa4-88a3-5964613fb1b3.png)

1. After creating the S3 bucket, go to the bucket and Click on **Properties** 
2. Enable the Static Web Hosting feature and add the following settings: 
    1. Index page: index.html 
    2. Error Page: index.html


![Untitled 11](https://user-images.githubusercontent.com/42990423/196822855-652f958c-223c-48be-977d-ad443867c636.png)

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

![Untitled 12](https://user-images.githubusercontent.com/42990423/196822856-092ab97a-55ec-4660-ae9c-621fe57e6162.png)

## MAIL CHIMP

1. Create the Mail-chimp account y das click en Transactional Email, luego Launch App 

![Untitled 13](https://user-images.githubusercontent.com/42990423/196822858-c430ee5e-114d-40c9-90e4-1b0ddc6100bd.png)

1. Agrega tu dominio y sigue el setup de mailchimp 

![Untitled 14](https://user-images.githubusercontent.com/42990423/196822860-3183966f-e4ec-4aa0-a435-13d9e4a1c20e.png)

1. Crea el correo donde vas a reenviar los mensajes del banco, y testea 🙂

![Untitled 15](https://user-images.githubusercontent.com/42990423/196822865-67e9b56c-57ba-4489-b92a-f525c507d3e8.png)