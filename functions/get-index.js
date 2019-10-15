'use strict';

const Promise = require("bluebird");
const fs = require('fs');
const util = require('util');
const Mustache = require('mustache');
const http = require('superagent');
const aws4 = require('aws4');
const URL = require('url');
const awscred = Promise.promisifyAll(require('awscred'));
const readFile = util.promisify(fs.readFile);

const awsRegion = process.env.AWS_REGION;
const cognitoUserPoolId = process.env.cognito_user_pool_id;
const cognitoClientId = process.env.cognito_client_id;

const restaurantApiRoot = process.env.restaurantApiRoot;
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

var html;

async function loadHtml() {
  if (!html) {
    html = await readFile('static/index.html', 'utf-8');
    return html;
  }
  return html;
}

async function getRestaurants() {
  let url = URL.parse(restaurantApiRoot);
  let opts = {
    host: url.hostname,
    path: url.pathname
  }

  if (!process.env.AWS_ACCESS_KEY_ID) {
    let cred = await awscred.loadAsync();
    process.env.AWS_ACCESS_KEY_ID = cred.credentials.accessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = cred.credentials.secretAccessKey;
  }

  aws4.sign(opts);

  let httpReq = http.get(restaurantApiRoot)
                    .set('Host', opts.headers['Host'])
                    .set('X-Amz-Date', opts.headers['X-Amz-Date'])
                    .set('Authorization', opts.headers['Authorization']);
  
  if (opts.headers['X-Amz-Security-Token']) {
    httpReq.set('X-Amz-Security-Token', opts.headers['X-Amz-Security-Token']);
  }

  let resp = await httpReq;
  
  return resp.body;
}

exports.handler = async function (event, context) {
  let template = await loadHtml();
  let restaurants = await getRestaurants();
  let dayOfWeek = days[new Date().getDay()];
  let view = {
    dayOfWeek,
    restaurants,
    awsRegion,
    cognitoUserPoolId,
    cognitoClientId,
    searchUrl: `${restaurantApiRoot}/search`
  };
  let html = Mustache.render(template, view);

  const response = {
    statusCode: 200,
    body: html,
    headers: {
      'content-type': 'text/html; charset=UTF-8'
    }
  };
  return response;
};
