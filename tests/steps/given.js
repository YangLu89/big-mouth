'use strict'

const AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';
const cognito = new AWS.CognitoIdentityServiceProvider();
const chance = require('chance').Chance();

let random_password = () => {
  return `${chance.string({ lenght: 8 })}B!gM0uth`;
}

exports.an_authenticated_user = async function() {
  let userpoolId = process.env.cognito_user_pool_id;
  let clientId = process.env.cognito_server_client_id;

  let firstName = chance.first();
  let lastName = chance.last();
  let username = `test-${firstName}-${lastName}-${chance.string({ lenght: 8 })}`;
  let password = random_password();
  let email = `${firstName}-${lastName}@big-mouth.com`;

  let createReq = {
    UserPoolId: userpoolId,
    Username: username,
    MessageAction: 'SUPPRESS',
    TemporaryPassword: password,
    UserAttributes: [
      { Name: 'given_name', Value: firstName},
      { Name: 'family_name', Value: lastName},
      { Name: 'email', Value: email},
    ]
  };
  await cognito.adminCreateUser(createReq).promise();

  console.log(`[${username}] - user is created`);

  let req = {
    AuthFlow: 'ADMIN_NO_SRP_AUTH',
    UserPoolId: userpoolId,
    ClientId: clientId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password
    }
  };
  let resp = await cognito.adminInitiateAuth(req).promise();

  console.log(`[${username}] - initialized auth flow`);

  let challengeReq = {
    UserPoolId: userpoolId,
    ClientId: clientId,
    ChallengeName: resp.ChallengeName,
    Session: resp.Session,
    ChallengeResponses: {
      USERNAME: username,
      NEW_PASSWORD: random_password()
    }
  };
  let challengeResp = await cognito.adminRespondToAuthChallenge(challengeReq).promise();

  console.log(`[${username}] - responded to auth challenge`);

  return {
    username,
    firstName,
    lastName,
    idToken: challengeResp.AuthenticationResult.IdToken
  };
};