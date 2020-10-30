# DynamoDb Setup and Migration Scripts
This folder contains scripts to set up our DynamoDB Tables

### Rules to follow for each script
1. Always check for the tables existence before creating them.
2. Always define `aws_user_profile` and `region` when creating tables
3. All passwords use MD5
4. All `DEFAULT AGENTS` will be assigned to an account or, we can put all `DEFAULT AGENTS` in the code only. :thinking:. Decision: Let's go with in the code only.

### Useful AWS CLI Commands
1. `aws dynamodb list-tables --profile personal_account --region=us-east-1`

Returns the available table names:
```
{
    "TableNames": [
        "BotAmplifierDev"
    ]
}
```
