'use strict';

module.exports.sample = async event => {

  console.log('ENV VAR', process.env.FUNCTION_DEEP_VAR)
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Serverless Framework Base - Going Serverless v1.0!'
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
