/**
 * 01-init-table.js
 *
 * Script for building the initial DynamoDB for the application.
 */
const AWS = require("aws-sdk");
const configManager = require('../config/config')();

// AWS.config.update({
    //   region: "local",
    //   endpoint: "http://localhost:8000"
    // });

AWS.config.update({
    region: "us-east-1",
});

AWS.config.apiVersions = {
    dynamodb: '2012-08-10'
};

// Table Configurations
const config = configManager.getConfig();
const tableName = config.database.tableName;
const rcu = process.env.NODE_ENV === 'prod' ? 5 : 1;
const wcu = process.env.NODE_ENV === 'prod' ? 5 : 1;
const indexRcu = process.env.NODE_ENV === 'prod' ? 5 : 1;
const indexWcu = process.env.NODE_ENV === 'prod' ? 5 : 1;

var dynamodb = new AWS.DynamoDB();
var tableDefinition = {
    TableName : tableName,
    KeySchema: [
        {
            AttributeName: "api_code",
            KeyType: "HASH"
        },
        {
            AttributeName: "metadata",
            KeyType: "RANGE"
        }
    ],
    AttributeDefinitions: [
        {
            AttributeName: "api_code",
            AttributeType: "S"
        },
        {
            AttributeName: "metadata",
            AttributeType: "S"
        },
        {
            AttributeName: "transaction_date",
            AttributeType: "S"
        },
        // {
        //     AttributeName: "email",
        //     AttributeType: "S"
        // },
        {
            AttributeName: "account_type",
            AttributeType: "S"
        },
        {
            AttributeName: "credits",
            AttributeType: "N"
        },
        // {
        //     AttributeName: "transaction_type",
        //     AttributeType: "S"
        // }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: rcu,
        WriteCapacityUnits: wcu
    },
    GlobalSecondaryIndexes: [
        {
            IndexName: "api_code-transaction_date-index",
            KeySchema: [
                {
                    "AttributeName": "api_code",
                    "KeyType": "HASH"
                },
                {
                    "AttributeName": "transaction_date",
                    "KeyType": "RANGE"
                }
            ],
            "Projection": {
                "ProjectionType": "ALL"
            },
            ProvisionedThroughput: {
                ReadCapacityUnits: indexRcu,
                WriteCapacityUnits: indexWcu
            }
        },
        {
            IndexName: "account_type-credits-index",
            KeySchema: [
                {
                    "AttributeName": "account_type",
                    "KeyType": "HASH"
                },
                {
                    "AttributeName": "credits",
                    "KeyType": "RANGE"
                }
            ],
            "Projection": {
                "ProjectionType": "ALL"
            },
            ProvisionedThroughput: {
                ReadCapacityUnits: indexRcu,
                WriteCapacityUnits: indexWcu
            }
        }
    ],
};

dynamodb.createTable(tableDefinition, function(err, data) {
    if (err) {
        console.error("Error JSON.", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table.", JSON.stringify(data, null, 2));
    }
});
