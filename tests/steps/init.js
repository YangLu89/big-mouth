// 'use strict'

const Promise = require("bluebird");
const awscred = Promise.promisifyAll(require('awscred'));

let initialized = false;

exports.init = async function () {
  if (initialized) {
    return
  }

  process.env.restaurantApiRoot = 'https://ygwnyjhfek.execute-api.us-east-1.amazonaws.com/dev/restaurants';
  process.env.restaurants_table = 'restaurants';
  process.env.AWS_REGION = 'us-east-1';
  process.env.cognito_client_id = 'test_cognito_client_id';
  process.env.cognito_user_pool_id = 'us-east-1_MkTTmMrCu';
  process.env.cognito_server_client_id = '63bihr8cs847p8csc7u55htdgv';
  let cred = await awscred.loadAsync();
  process.env.AWS_ACCESS_KEY_ID = cred.credentials.accessKeyId;
  process.env.AWS_SECRET_ACCESS_KEY = cred.credentials.secretAccessKey;

  if (cred.sessionToken) {
    process.env.AWS_SESSION_TOKEN = cred.sessionToken;
  }

  console.log('AWD credentials loaded');

  initialized = true;
};