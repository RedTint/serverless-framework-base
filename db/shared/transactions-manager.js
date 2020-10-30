'use strict';

const AWS = require('aws-sdk');
const { v1: uuidv1, v1 } = require('uuid');

// INSTANTIATIONS
const docClient = new AWS.DynamoDB.DocumentClient();

// CONSTANTS
const TRANSACTION_TYPE_SMS = 'SMS';
const TRANSACTION_TYPE_ADD_CREDIT = 'ADD_CREDIT';
const TRANSACTION_TYPE_ADD_TRIAL_CREDIT = 'ADD_TRIAL_CREDIT';
const TRANSACTION_TYPE_TRIAL_CREDIT_EXPIRED = 'TRIAL_CREDIT_EXPIRED';
const TRANSACTION_TYPE_GENERATE_OTP = 'GENERATE_OTP';
const TRANSACTION_TYPE_NEXT_DATE = 'NEXT_DATE';

const TRANSACTION_TYPES = [
    TRANSACTION_TYPE_SMS,
    TRANSACTION_TYPE_ADD_CREDIT,
    TRANSACTION_TYPE_ADD_TRIAL_CREDIT,
    TRANSACTION_TYPE_GENERATE_OTP,
    TRANSACTION_TYPE_NEXT_DATE,
    TRANSACTION_TYPE_TRIAL_CREDIT_EXPIRED,
];

const TRANSACTION_COSTS = {
    [TRANSACTION_TYPE_SMS]: 1,
    [TRANSACTION_TYPE_GENERATE_OTP]: 0.25,
    [TRANSACTION_TYPE_NEXT_DATE]: 0.25
};

const PAYMENT_TYPE_CASH = 'CASH';
const PAYMENT_TYPE_DEBIT = 'DEBIT';
const PAYMENT_TYPE_CREDIT = 'CREDIT';
const PAYMENT_TYPE_PAYPAL = 'PAYPAL';
const PAYMENT_TYPE_TRIAL = 'TRIAL';
const PAYMENT_TYPE_BANK_TRANSFER = 'BANK_TRANSFER';

const PAYMENT_TYPES = [
    PAYMENT_TYPE_CASH,
    PAYMENT_TYPE_DEBIT,
    PAYMENT_TYPE_CREDIT,
    PAYMENT_TYPE_PAYPAL,
    PAYMENT_TYPE_BANK_TRANSFER
];

const TRANSACTION_PREFIX = 'TRANSACTION#';
const MAX_TRIAL_CREDITS = 10;

const TransactionsManager = ({ tableName }) => {
    console.log ('TRANSACTIONS MANAGER - tableName', tableName);

    const createSmsTransactions = ({
        apiCode, creditsUsed, mobileNumbers, message,
        creditsPerMessage, results, senderId
    }) => {
        const params = {
            Item: {
                api_code: TRANSACTION_PREFIX + apiCode,
                transaction_type: TRANSACTION_TYPE_SMS,
                metadata: TRANSACTION_PREFIX + apiCode + '#' + v1(),
                transaction_date: new Date().toISOString(),
                credits_used: creditsUsed,
                mobile_numbers: mobileNumbers,
                message: message,
                credits_per_message: creditsPerMessage,
                results: results,
                sender_id: senderId
            },
            ReturnConsumedCapacity: "TOTAL",
            TableName: tableName,
        };

        return params;
    }

    const createAddCreditTransactions = ({
        apiCode, creditsAdded, paymentAmount, adminEmail
    }) => {
        const params = {
            Item: {
                api_code: TRANSACTION_PREFIX + apiCode,
                metadata: TRANSACTION_PREFIX + apiCode + '#' + v1(),
                transaction_type: TRANSACTION_TYPE_ADD_CREDIT,
                transaction_date: new Date().toISOString(),
                payment_type: PAYMENT_TYPE_CASH,
                credits_added: creditsAdded,
                payment_amount: paymentAmount,
                created_by: adminEmail
            },
            ReturnConsumedCapacity: "TOTAL",
            TableName: tableName,
        };

        return params;
    }

    const createAddTrialCreditTransactions = async ({
        apiCode, creditsAdded
    }) => {
        const params = {
            Item: {
                api_code: TRANSACTION_PREFIX + apiCode,
                metadata: TRANSACTION_PREFIX + apiCode + '#' + v1(),
                transaction_type: TRANSACTION_TYPE_ADD_TRIAL_CREDIT,
                transaction_date: new Date().toISOString(),
                payment_type: PAYMENT_TYPE_TRIAL,
                credits_added: creditsAdded,
                payment_amount: 0.00,
                created_by: 'SYSTEM'
            },
            ReturnConsumedCapacity: "TOTAL",
            TableName: tableName,
        };

        return await docClient.put(params).promise();
    }

    return {
        createSmsTransactions,
        createAddCreditTransactions,
        createAddTrialCreditTransactions,
        MAX_TRIAL_CREDITS,
        TRANSACTION_PREFIX,
        TRANSACTION_COSTS,
        TRANSACTION_TYPES,
        PAYMENT_TYPES
    };
}

module.exports.TransactionsManager = TransactionsManager;
