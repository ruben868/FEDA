// Periods.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for Business
let Periods = new Schema({
  start: { type: Date },
  end: { type: Date },
  startNum: { type: Number },
  endNum: { type: Number },
  weekNum: {type: Number},
  weekLabel: {type: String},
  year: {type: Number},
  yearWeek: {type: String, required: true},
  isActive: { type: Boolean }
});

module.exports = mongoose.model('periods', Periods);
