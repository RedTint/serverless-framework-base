/**
 * Organizes the config pulled from the environment variables
 */
function ConfigManager() {

    const getConfig = () => {
        return {
            database: {
                tableName: 'your-application-' + process.env.NODE_ENV,
            },
            itexmo: {
                apiCode: process.env.ITEXMO_API_CODE,
                password: process.env.ITEXMO_API_PASSWORD
            },
            semaphore: {
                apiCode: process.env.SEMAPHORE_API_CODE
            }
        }
    }

    return {
        getConfig
    };
}

module.exports = ConfigManager;
