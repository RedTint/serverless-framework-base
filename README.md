# Serverless Framework Base
This will serve as my reference for future serverless framework projects.

## Kanban Board
Here's a link to the Kanban for this project:
https://trello.com/b/ldjNCKXm/manychat-bots-integrations

## How to Get Started
This contains the list of steps to spin up your local environment
1. Run `export $(cat .env)` to make sure that the environment variables are loaded
2. Run `docker-compose down -v && docker-compose up --build` to spin up all required containers
3. Run `serverless offline start` to test Lambda Functions locally

## Deployment Steps
#### Update Environment Variables
1. Make sure your `.env.{stage}` file is updated.
2. Run `export $(cat .env.{stage})` to update environment variables. The environment variables set in your environment when running `serverless deploy --stage=$stage` gets deployed to AWS lambda using `./config/config.js`.
```
export $(cat .env)
```
3. Make sure you initialize the DynamoDB table and seed data by running:
```
npm run init-db
npm run seed-db
```
4. Once done, you can start deploying your scripts using the next steps.

#### AWS Lambda Deployment
```
# deploy INTEGRATION
serverless deploy --stage=dev

# deploy STAGING
serverless deploy --stage=qa

# deploy PRODUCTION
serverless deploy --stage=prod
```

## Notes
* This uses [Serverless Offline](https://www.npmjs.com/package/serverless-offline) to test locally.
* [Serverless Offline in Docker](https://medium.com/a-man-with-no-server/a-better-development-environment-for-serverless-apps-using-docker-and-docker-compose-67c60c4d3520)


## References
* [AWS Lambda CloudWatch Log Streams Error](https://aws.amazon.com/premiumsupport/knowledge-center/lambda-cloudwatch-log-streams-error/)
* [AWS Lambda with DynamoDb Access](https://aws.amazon.com/blogs/security/how-to-create-an-aws-iam-policy-to-grant-aws-lambda-access-to-an-amazon-dynamodb-table/)
