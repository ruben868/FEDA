
// Common = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const _ = require('lodash');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// DB & Models = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const LogsModel = require('../models/log.model');


module.exports = {
  dolog: dolog,
};


async function dolog(obj) {
  let newObj = {};
  newObj.code = _.get(obj, 'code', 0);
  newObj.pos = _.get(obj, 'pos', 0);
  newObj.module = _.get(obj, 'module', 'no-module');
  newObj.func = _.get(obj, 'func', 'no-func');
  newObj.date = _.get(obj, 'date', new Date());
  newObj.msg = _.get(obj, 'msg', '-');
  newObj.doLog = _.get(obj, 'doLob', false);

  const text = `[${newObj.module}] - [${newObj.func}] : pos: [${newObj.pos}] code: [${newObj.code}] msg: ${newObj.msg}`;
  console.log(text);

  const dbItem = new LogsModel(newObj);
  await dbItem.save();
}

