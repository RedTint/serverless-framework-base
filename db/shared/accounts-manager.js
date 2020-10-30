'use strict';

const AWS = require('aws-sdk');
const { v1: uuidv1, v1 } = require('uuid');
const generator = require('generate-password');
const md5 = require('md5');
const passwordRules = { length: 12, symbols: true };

// INSTANTIATIONS
const docClient = new AWS.DynamoDB.DocumentClient();

// CONSTANTS
const API_CODE_MODIFIER = 'BotAmplifierIsAwesome';

const ACCOUNT_TYPE_ADMIN = 'ADMIN'; // use itexmo to save cost
const ACCOUNT_TYPE_ADMIN_CREDIT = 'ADMIN_CREDIT'; // use semaphore to save cost
const ACCOUNT_TYPE_CREDIT = 'PREPAID'; // use semaphore for credits
const ACCOUNT_TYPE_MONTHLY = 'MONTHLY'; // use itexmo
const ACCOUNT_TYPE_TRIAL = 'TRIAL'; // use itexmo
const ACCOUNT_TYPE_PASSTHROUGH = 'PASSTHROUGH'; // use their own account

const ACCOUNT_STATUS_FOR_VERIFICATION = 'FOR VERIFICATION'; //
const ACCOUNT_STATUS_DISABLED = 'DISABLED';
const ACCOUNT_STATUS_ENABLED = 'ENABLED';
const ACCOUNT_STATUS_EXPIRED = 'EXPIRED'; // monthly subscription over
const ACCOUNT_STATUS_TRIAL_EXPIRED = 'TRIAL_EXPIRED'; // monthly subscription over
const ACCOUNT_STATUS_NO_CREDITS = 'NO_CREDITS'; // credits_left is 0

const ACCOUNT_PREFIX = 'ACCOUNT#';
const METADATA_PREFIX = 'METADATA#';
const AGENT_PREFIX = 'AGENT#';

const TABLE_PREFIXES = {
    ACCOUNT_PREFIX,
    AGENT_PREFIX,
    METADATA_PREFIX
};

const ADMIN_ACCOUNT_TYPES = {
    ACCOUNT_TYPE_ADMIN,
    ACCOUNT_TYPE_ADMIN_CREDIT,
};

const ACCOUNT_TYPES = {
    ACCOUNT_TYPE_ADMIN,
    ACCOUNT_TYPE_ADMIN_CREDIT,
    ACCOUNT_TYPE_CREDIT,
    ACCOUNT_TYPE_MONTHLY,
    ACCOUNT_TYPE_TRIAL,
    ACCOUNT_TYPE_PASSTHROUGH
};

// Account Types Valid for Creation
const VALID_ACCOUNT_TYPES = {
    ACCOUNT_TYPE_CREDIT,
    ACCOUNT_TYPE_MONTHLY,
    ACCOUNT_TYPE_TRIAL,
    ACCOUNT_TYPE_PASSTHROUGH
};

const ACCOUNT_STATUS = {
    ACCOUNT_STATUS_FOR_VERIFICATION,
    ACCOUNT_STATUS_DISABLED,
    ACCOUNT_STATUS_ENABLED,
    ACCOUNT_STATUS_EXPIRED,
    ACCOUNT_STATUS_NO_CREDITS,
    ACCOUNT_STATUS_TRIAL_EXPIRED,
};

const AccountsManager = ({ tableName }) => {

    const createAdminAccount = ({
        apiCode, apiKey, accountType,
        username, password, email, mobileNumber,
        firstName, middleName, lastName, nickname,
        status, senderId,
        dateCreated
    }) => {

        const senderIds = senderId ? [senderId] : [];
        const params = {
            Key: {
                api_code: ACCOUNT_PREFIX + apiCode,
                metadata: METADATA_PREFIX + apiCode
            },
            Item: {
                "email": email,
                "username": username,
                "password": password,
                "mobile_number": mobileNumber,
                "api_code": ACCOUNT_PREFIX + apiCode,
                "metadata": METADATA_PREFIX + apiCode,
                "api_key": apiKey,
                "account_type": accountType,
                "account_status": status,
                "date_created": (new Date(dateCreated)).toISOString(),
                "date_updated": (new Date(dateCreated)).toISOString(),
                "first_name": firstName,
                "middle_name": middleName,
                "last_name": lastName,
                "nickname": nickname,
                "sender_id": ['BOTAMPLIFY', 'Niel Reichl'],
                "credits": 0,
                "last_credit_transaction": null,
            },
            ReturnConsumedCapacity: "TOTAL",
            TableName: tableName,
            ConditionExpression: '#api_code <> :api_code',
            ExpressionAttributeNames: {
                '#api_code': 'api_code'
            },
            ExpressionAttributeValues: {
                ':api_code': ACCOUNT_PREFIX + apiCode
            }
        };

        return params
    }

    /**
     * All values should be valid at this point.
     * @param {} param
     */
    const createAccount = ({
        accountType, email, mobileNumber,
        firstName, middleName, lastName, nickname,
        status, senderId, expirationDate
    }) => {
        const password = generator.generate(passwordRules);
        const apiKey = generator.generate(passwordRules);
        const apiCode = md5(API_CODE_MODIFIER + email);
        const senderIds = senderId ? [senderId] : [];

        const params = {
            Key: {
                api_code: ACCOUNT_PREFIX + apiCode,
                metadata: METADATA_PREFIX + apiCode
            },
            Item: {
                "email": email,
                "password": md5(password),
                "mobile_number": mobileNumber,
                "api_code": ACCOUNT_PREFIX + apiCode,
                "metadata": METADATA_PREFIX + apiCode,
                "api_key": md5(apiKey),
                "account_type": accountType || ACCOUNT_TYPE_CREDIT,
                "account_status": status,
                "date_created": (new Date()).toISOString(),
                "date_updated": (new Date()).toISOString(),
                "first_name": firstName,
                "middle_name": middleName,
                "last_name": lastName,
                "nickname": nickname,
                "sender_id": senderIds,
                "credits": 0,
                "last_credit_transaction": null,
            },
            ReturnConsumedCapacity: "TOTAL",
            TableName: tableName,
            ConditionExpression: '#api_code <> :api_code',
            ExpressionAttributeNames: {
                '#api_code': 'api_code'
            },
            ExpressionAttributeValues: {
                ':api_code': ACCOUNT_PREFIX + apiCode
            }
        };

        // Add expiration date if account is trial
        if (params.Item.account_type === ACCOUNT_TYPE_TRIAL) {
            params.Item['expiration_date'] = getExpirationDate();
        }

        return  {
            params: params,
            public: {
                password,
                apiKey,
                email,
                apiCode,
                accountType: accountType || ACCOUNT_TYPE_CREDIT,
                senderIds
            }
        };
    }

    /**
     * All values should be valid at this point.
     * @param {} param
     */
    const updateAccount = ({
        apiCode,
        accountType, mobileNumber,
        firstName, middleName, lastName, nickname,
        status, credits, lastCreditTransaction
    }) => {
        const params = {
            Key: {
                api_code: ACCOUNT_PREFIX + apiCode,
                metadata: METADATA_PREFIX + apiCode
            },
            Item: {
                "mobile_number": mobileNumber,
                "account_status": status,
                "account_type": accountType,
                "date_updated": (new Date()).toISOString(),
                "first_name": firstName,
                "middle_name": middleName,
                "last_name": lastName,
                "nickname": nickname,
                "credits": credits,
                "last_credit_transaction": lastCreditTransaction,
            },
            ReturnConsumedCapacity: "TOTAL",
            TableName: tableName,
            ReturnValues: "UPDATED_NEW"
        };

        const updateExpression = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        // Delete all keys with empty value
        const keys = Object.keys(params.Item);
        keys.forEach(key => {
            if (!params.Item[key] && params.Item[key] !== 0) {
                delete params.Item[key];
            } else {
                updateExpression.push(`#${key} = :${key}`);
                expressionAttributeNames[`#${key}`] = key;
                expressionAttributeValues[`:${key}`] = params.Item[key];
            }
        });

        params['UpdateExpression'] = 'set ' + updateExpression.join(', ');
        params['ExpressionAttributeNames'] = expressionAttributeNames;
        params['ExpressionAttributeValues'] = expressionAttributeValues;

        return  {
            params: params,
            public: {
                apiCode
            }
        };
    }

    const getAccount = ({ apiCode, email }) => {
        const prefix = ACCOUNT_PREFIX;
        const prefixedApiCode = prefix + (email ? md5(API_CODE_MODIFIER + email) : apiCode);
        const metadata = METADATA_PREFIX + (email ? md5(API_CODE_MODIFIER + email) : apiCode);

        const params = {
            TableName: tableName,
            Key: {
                api_code: prefixedApiCode,
                metadata: metadata
            }
        };

        return params;
    }

    const getActiveTrialAccounts = async () => {
        const params = {
            TableName: tableName,
            IndexName: 'account_type-credits-index',
            KeyConditionExpression: 'account_type = :hkey and credits < :rkey',
            // ConditionExpression: 'account_status = :account_status',
            FilterExpression: 'account_status = :account_status',
            ExpressionAttributeValues: {
                ':hkey': ACCOUNT_TYPE_TRIAL,
                ':rkey': 10,
                ':account_status': ACCOUNT_STATUS_ENABLED
            },
        };

        return docClient.query(params).promise();
    }

    const getExpirationDate = (extension = 3) => {
        const date = new Date();
        date.setHours(23);
        date.setMinutes(59);
        date.setSeconds(59);
        date.setDate(date.getDate() + extension);

        return date.toISOString();
    }

    return {
        createAdminAccount,
        createAccount,
        updateAccount,
        getAccount,
        getActiveTrialAccounts,
        getExpirationDate,
        ACCOUNT_STATUS,
        ACCOUNT_TYPES,
        ADMIN_ACCOUNT_TYPES,
        API_CODE_MODIFIER,
        VALID_ACCOUNT_TYPES,
        TABLE_PREFIXES
    };
}

module.exports.AccountsManager = AccountsManager;
