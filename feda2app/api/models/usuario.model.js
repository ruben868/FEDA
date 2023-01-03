// USUARIOS

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DocInfo = require('../models/docinfo.model');
const AuthUserSubset = require('../models/auth-user-subset.model');
const OrgModel = require('../models/org.model');
// const AuthUser = require('../models/auth-user.model');

// Define collection and schema for Business
let Usuario = new Schema({
  authUserId: {type: Schema.ObjectId},
  authInfo: { type: AuthUserSubset.schema },
  org: { type: OrgModel.schema },
  entFed: {
    cve: {type: Number},
    cveStr: {type: String},
    nom: {type: String},
    tipo: {type: String},
    abr: {type: String},
  },
  roles: [{
    cveStr: {type: String},
    nom: {type: String},
    isActive: {type: Boolean},
    paths: [{type: String}]
  }],
  docInfo: { type: DocInfo.schema },
  telOf: {type: String},
  telExt: {type: String},
  telCel: {type: String},
  telCel2: {type: String},
});

module.exports = mongoose.model('usuarios', Usuario);
