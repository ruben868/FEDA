// Periods.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for Business
let Plantillas = new Schema({
  base: { type: String },
  plantilla: { type: String },
  archivo: { type: String },
  version: { type: String },
  fechaCreacion: { type: Date },
  // startNum: { type: Number },
  // endNum: { type: Number },
  // weekNum: {type: Number},
  // weekLabel: {type: String},
  // year: {type: Number},
  // yearWeek: {type: String, required: true},
  // isActive: { type: Boolean }
});

module.exports = mongoose.model('plantillas', Plantillas);
