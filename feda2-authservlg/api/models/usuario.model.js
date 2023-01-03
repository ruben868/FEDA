// USUARIOS

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DocInfo = require('../models/docinfo.model');
const DocChange = require('../models/docchange.model');

// Define collection and schema for Business
let Usuario = new Schema({
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
    // required: true,
    // unique: true
  },
  hpwd: {
    type: String,
    // required: true
  },
  fecnac: {
    type: Date
  },
  entnac: {
    cve: {type: Number},
    cveStr: {type: String},
    nom: {type: String},
    tipo: {type: String},
  },
  tipo: {
    type: String,
    default: 'personal' // persona, unattended
  },
  sexo: {
    type: Object
  },
  isMailOwnershipConfirmed: {
    type: Boolean,
    default: false
  },
  needsChangePwd: {
    type: Boolean,
    default: true
  },
  invitationCode: {
    type: String
  },
  pinCode: {
    type: String
  },
  pinCodeGen: {
    type: Date
  },
  docInfo: {
    type: DocInfo.schema
  },
  lstChanges: [
    {
      type: DocChange.schema
    }
  ],
  tipoCreacion: {
    cveStr: {type: String},
    cve: {type: Number},
    cat: {type: String},
    nom: {type: String},
  },
  ancestors: [{type: mongoose.Types.ObjectId}],
  clientId: {type: String},
  clientSecret: {type: String},
});

module.exports = mongoose.model('usuarios', Usuario);
