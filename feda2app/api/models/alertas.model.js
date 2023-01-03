// ALERTAS
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for Business
let AlertasModel = new Schema({
  numOrg: {
    type: String
  },
  numClean: {
    type: String
  },
  fecha: {
    type: Date
  },
  tipoNot: {
    type: Number
  },
  isServerUploaded: {
    type: Boolean
  },
});

module.exports = mongoose.model('alertas-recibidas', AlertasModel);
