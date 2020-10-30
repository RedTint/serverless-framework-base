'use strict';

const errorManager = require('../../shared/errors')();

const AccountsManager = require('./accounts-manager').AccountsManager;
const TransactionsManager = require('./transactions-manager').TransactionsManager;

// CONSTANTS
const API_CODE_MODIFIER = 'BotAmplifierIsAwesome';

const ACCOUNT_TYPE_ADMIN = 'ADMIN'; // use itexmo to save cost
const ACCOUNT_TYPE_ADMIN_CREDIT = 'ADMIN_CREDIT'; // use semaphore to save cost
const ACCOUNT_TYPE_CREDIT = 'PREPAID'; // use semaphore for credits
const ACCOUNT_TYPE_MONTHLY = 'MONTHLY'; // use itexmo
const ACCOUNT_TYPE_TRIAL = 'TRIAL'; // use itexmo
const ACCOUNT_TYPE_PASSTHROUGH = 'PASSTHROUGH'; // use their own account

const AGENT_NAME_SEMAPHORE = 'SEMAPHORE';
const AGENT_NAME_ITEXMO = 'ITEXMO';

const AGENT_TYPE_DEFAULT = 'DEFAULT'; // use bot_amplifier's semaphore or itexmo account
const AGENT_TYPE_PASSTHROUGH = 'PASSTHROUGH'; // user user's semaphore or other agent account

const ACCOUNT_PREFIX = 'ACCOUNT#';
const METADATA_PREFIX = 'METADATA#';
const AGENT_PREFIX = 'AGENT#';

const TABLE_PREFIXES = {
    ACCOUNT_PREFIX,
    AGENT_PREFIX,
    METADATA_PREFIX
};

const AGENT_TYPES = {
    AGENT_TYPE_DEFAULT,
    AGENT_TYPE_PASSTHROUGH
};

const AGENT_NAMES = {
    AGENT_NAME_ITEXMO,
    AGENT_NAME_SEMAPHORE
};

const agents = [
    {
        'agent_id': 1,
        'agent_name': AGENT_NAME_ITEXMO,
        'api_code': process.env.ITEXMO_API_CODE,
        'api_password': process.env.ITEXMO_API_PASSWORD,
        'agent_type': AGENT_TYPE_DEFAULT
    },
    {
        'agent_id': 2,
        'agent_name': AGENT_NAME_SEMAPHORE,
        'api_code': process.env.SEMAPHORE_API_CODE,
        'api_password': '',
        'agent_type': AGENT_TYPE_DEFAULT
    }
];

const DataManager = ({ tableName}) => {

    const createAgent = ({
        apiCode,
        agentId,
        agentName,
        agentType,
        agentApiCode,
        agentApiPassword,
        accountId
    }) => {
        const params = {
            Item: {
                'api_code': AGENT_PREFIX + apiCode,
                'agent_name': agentName,
                'api_code': apiCode,
                'api_password': apiPassword,
                'agent_type': agentType
            },
            ReturnConsumedCapacity: "TOTAL",
            TableName: tableName,
            ConditionExpression: '#api_code <> :api_code',
            ExpressionAttributeNames: {
                '#api_code': 'api_code'
            },
            ExpressionAttributeValues: {
                ':api_code': AGENT_PREFIX + apiCode
            }
        };

        return params
    }

    const getAgent = (account) => {
        switch (account.accountType) {
            case ACCOUNT_TYPE_ADMIN:
            case ACCOUNT_TYPE_MONTHLY:
            case ACCOUNT_TYPE_TRIAL:
                return agents
                    .filter(x => x.agent_type === AGENT_TYPE_DEFAULT &&
                        x.agent_name === AGENT_NAME_ITEXMO)
            case ACCOUNT_TYPE_CREDIT:
            case ACCOUNT_TYPE_ADMIN_CREDIT:
                return agents
                    .filter(x => x.agent_type === AGENT_TYPE_DEFAULT &&
                        x.agent_name === AGENT_NAME_SEMAPHORE)
            case ACCOUNT_TYPE_PASSTHROUGH:
                return agents
                    .filter(x => x.agent_type === AGENT_TYPE_PASSTHROUGH &&
                        x.agent_name === AGENT_NAME_SEMAPHORE &&
                        x.account_id === account.account_id)
                break;
            default:
                throw errorManager.getErrorMessage('007');
        }
    }

    const transactionsManager = TransactionsManager({ tableName });
    const accountsManager = AccountsManager({ tableName });

    return {
        accounts: accountsManager,
        agents: {
            getAgent
        },
        transactions: transactionsManager,
        AGENT_NAMES,
        AGENT_TYPES,
        API_CODE_MODIFIER,
        TABLE_PREFIXES,
    }

}

module.exports.DataManager = DataManager;
