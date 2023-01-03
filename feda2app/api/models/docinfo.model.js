// Business.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for Business
let DocInfo = new Schema({
  creation: {
    type: Date
  },
  lchange: {
    type: Date
  },
  idUsrCreator: {
    type: Schema.ObjectId
  },
  isActive: {
    type: Boolean
  }
});

module.exports = mongoose.model('docinfo', DocInfo);
