// USUARIOS
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DocInfo = require('../models/docinfo.model');

// Define collection and schema for Business
let AuthUserModel = new Schema({
  nom: {
    type: String
  },
  appat: {
    type: String
  },
  apmat: {
    type: String
  },
  mail: {
    type: String,
    required: true,
    unique: true
  },
  fecnac: {
    type: Date
  },
  sexo: {
    type: Object
  },
  docInfo: {
    type: DocInfo.schema
  },
});

module.exports = mongoose.model('auth-user-model', AuthUserModel);
