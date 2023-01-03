// LOGS
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for Business
let LogModel = new Schema({
  code: {type: Number},
  pos: {type: Number},
  module: {type: String},
  func: {type: String},
  date: {type: Date},
  msg:  {type: String},
});

module.exports = mongoose.model('logs', LogModel);
