const moment = require('moment');
const crypto = require('crypto');

module.exports = {
  // makeid: makeid,
  // dynamicHashMethod: dynamicHashMethod,
  generateToken: generateToken,
  makeidNum: makeidNum,
  makeid: makeid
};

function makeid(length) {
  let result           = '';
  let characters       = '@ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-!';
  let charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function makeidNum(length) {
  let result           = '';
  let characters       = '0123456789';
  let charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function dynamicHashMethod() {
  let methods = ['sha1', 'sha256', 'sha512'];
  let result           = Math.floor(Math.random() * 3);
  // console.log(result);
  // console.log(methods[result]);
  return methods[result];
}

function generateToken (data1, data2) {
  const algo = dynamicHashMethod();
  const currentDate = new Date();
  const tokenCore = makeid(50) + moment(currentDate).format('YYYYMMDDHHmmssSSS') + data1 + data2;
  const token = crypto.createHash(algo).update(tokenCore).digest('base64');

  return {
    token: token,
    creationDate: currentDate
  };
}
