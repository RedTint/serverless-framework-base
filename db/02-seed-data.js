/**
 * 02-seed-date.js
 *
 * Script for seeding base data
 */
const AWS = require('aws-sdk');
const configManager = require('../config/config')();
const md5 = require('md5');

AWS.config.update({
    region: "us-east-1",
});

// Table Configurations
const config = configManager.getConfig();
const tableName = config.database.tableName;

// Actual Code Ommitted. SORRY. ^^,

// // Batch Write Accounts
// docClient.batchWrite({
//     RequestItems: {
//         [tableName]: requestItems
//     },
//     ReturnConsumedCapacity: 'TOTAL',
//     ReturnItemCollectionMetrics: 'SIZE'
// }, (err, data) => {
//     if (err) console.log(err); // an error occurred
//     else console.log(data);    // successful response
// });
