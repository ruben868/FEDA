// WSCARGA

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const OrgModel = require('../models/org.model');

// Define collection and schema for Business
let WSCargasInfo = new Schema({
  clientId: {type: String},
  fechaCarga: {type: Date},
  ipCarga: {type: String},
  registros: {type: Number},
  estatus: {type: Number}, // 0: En proceso; 1: Correcto; 2: Error;
  fechaFin: {type: Date},
  errorStrCode: {type: String},
  periodoCarga: {type: String},
  entFed: {
    cve: {type: Number},
    cveStr: {type: String},
    nom: {type: String},
    tipo: {type: String},
    abr: {type: String},
  },
  org: { type: OrgModel.schema },
});

module.exports = mongoose.model('info-wscargas', WSCargasInfo);
