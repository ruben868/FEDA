const moment = require('moment');
const Crypto = require('crypto');

module.exports = {
  decode: decode,
  encrypt: encrypt,
};

function encrypt(data, secret) {
  const input_enc = 'utf8';
  const output_enc = 'base64';
  // const iv = '0123456789abcdefghijklmnopqrstwx';
  //const iv = Crypto.randomBytes(16);
  const iv = '0123456789ABCDEF';
  console.log(iv.toString());
  const key32 = (secret+secret+secret).substr(0,32);
  console.log(secret);
  console.log(key32);

  try {
    const jsonData = JSON.stringify(data);

    const cipher = Crypto.createCipheriv("aes-256-cbc", key32, iv);
    const hash = cipher.update(jsonData, input_enc, output_enc);
    const encrypted = hash + cipher.final(output_enc);
    console.log(encrypted);
    return encrypted;
  } catch (err) {
    console.error(err);
    return "";
  }
}

function decode(data, secret) {
  const input_enc = 'utf8';
  const output_enc = 'base64';
  const key32 = (secret+secret+secret).substr(0,32);
  const iv = '0123456789ABCDEF';

  try {
    const decipher = Crypto.createDecipheriv("aes-256-cbc", key32, iv);
    const dec = decipher.update(data, output_enc, input_enc);
    const jsonData = dec + decipher.final(input_enc);
    return JSON.parse(jsonData);
  } catch (err) {
    console.error(err);
    return "";
  }
}
