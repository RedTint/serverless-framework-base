/**
 * Allows fetching of environment variables from the serverless.yml file
 * and then deployment to AWS Lambda $stage
 */

module.exports.fetchNodeEnv = () => {
    const nodeEnv = process.env.NODE_ENV;
    return nodeEnv;
}

module.exports.fetchAwsAccessKeyId = () => {
    const keyId = process.env.AWS_ACCESS_KEY_ID;
    return keyId;
}

module.exports.fetchAwsSecretAccessKey = () => {
    const secret = process.env.AWS_SECRET_ACCESS_KEY;
    return secret;
}
