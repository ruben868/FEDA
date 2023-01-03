// Common = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const _ = require('lodash');
const got = require('got');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  getAuthHeadersInfo: getAuthHeadersInfo,
  attemptAuthorize: attemptAuthorize,
  endAccountSession: endAccountSession,
};


function getAuthHeadersInfo (headers) {
  let authInfo = {};
  const authorization = _.get(headers, 'authorization', '');
  try {
    authInfo.token = authorization.slice(7, authorization.length);
  } catch (e) {
    throw new Error('@apperr:Authorization token not found');
  }

  authInfo.clientId = _.get(headers, 'x-int-cid', '');
  authInfo.userId = _.get(headers, 'x-int-aid', '');

  return authInfo;
}

async function attemptAuthorize(req, res, next) {
  try {
    const headers = {
      'authorization': _.get(req.headers, 'authorization', ''),
      'x-int-cid': _.get(req.headers, 'x-int-cid', process.env.AUTH_CLIENTID),
      'x-int-aid': _.get(req.headers, 'x-int-aid', ''),
    };
    const url = process.env.AUTH_API_URL + 'auth-app/v1/authorize';
    console.log(headers);

    const response = await got.get(url, {
      headers: headers,
      responseType: 'json'
    });
    authUserData = response.body[0];
    next();
  } catch (e) {
    console.log('ERROR attemptAuthorize >>>>>>>>>>');
    console.log(e);
    const statusCode = _.get(e, 'response.statusCode', null);
    console.log(statusCode);
    console.log('<<<<<<<<<< ERROR');
    if (!_.isNil(statusCode) && statusCode === 401) {
      res.status(401).send({msg: 'Not authorized', e: e.toString()});
    } else {
      res.status(400).send({msg: 'Unknow error'});
    }
  }
}

async function endAccountSession(authHeaderData) {
  try {
    const headers = {
      'authorization': _.get(authHeaderData, 'token', ''),
      'x-int-cid': _.get(authHeaderData, 'clientId', ''),
      'x-int-aid': _.get(authHeaderData, 'userId', ''),
    };
    const url = process.env.AUTH_API_URL + 'auth-app/v1/end-account-session';
    console.log(headers);

    const response = await got.get(url, {
      headers: headers,
      responseType: 'json'
    });
    const data = response.body[0];
    return data;
  } catch (e) {
    console.log('ERROR attemptAuthorize >>>>>>>>>>');
    console.log(e);
    console.log('<<<<<<<<<< ERROR');
  }

  return null;
}

