const moment = require('moment');
const crypto = require('crypto');

module.exports = {
  createNewClientSecret: createNewClientSecret,
  createNewClientId: createNewClientId,
};

function createNewClientId(clientName) {
  const base = _makeid(50) + moment().format('YYYYMMDDHHmmssSSS') + clientName;
  const newId = crypto.createHash('sha512').update(base).digest('base64');
  return newId;
}

function createNewClientSecret() {
  return _genBaseRandomString();
}

function _genBaseRandomString () {
  const tokenCore = _makeid(50) + moment().format('YYYYMMDDHHmmssSSS');
  const newId = crypto.createHash('sha512').update(tokenCore).digest('base64');
  return newId;
}

function _makeid(length) {
  let result           = '';
  let characters       = '@ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-!';
  let charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
