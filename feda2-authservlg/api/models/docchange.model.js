// Business.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for Business
let DocChange = new Schema({
  idUsr: {
    type: Schema.ObjectId
  },
  change: {
    type: Date
  },
});

module.exports = mongoose.model('docchanges', DocChange);
