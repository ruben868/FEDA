
const DocInfo = require('../models/docinfo.model');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Clients = new Schema({
  clientInternalId: {
    type: String
  },
  clientId: {
    type: String
  },
  clientSecret: {
    type: String
  },
  clientName: {
    type: String
  },
  type: {
    type: String
  },
  label: {
    type: String
  },
  docInfo: {
    type: DocInfo.schema
  },
  clientActive: {
    type: Boolean
  },
  config: {
    authCodeExpTime: {type: Number},
    tokenExpTime: {type: Number},
    maxSessionPerUser: {type: Number},
    clientSecretExpiration: {type: Number},
  }
});

module.exports = mongoose.model('clients', Clients);
