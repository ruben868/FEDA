// Cargas.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Periods = require('../models/periods.model');
const OrgModel = require('../models/org.model');

// Define collection and schema for Business
let Cargas = new Schema({
  authUserId: { type: Schema.ObjectId },
  fechaCarga: { type: Date },
  nomArchivoOrg: { type: String },
  intentos: { type: Number },
  estatus: { type: String },
  periodo: { type: Periods.schema  },
  genFileName: { type: String },
  fileId: { type: String },
  isActive: { type: Boolean },

  org: { type: OrgModel.schema },

  entfed: {
    cve: {type: Number},
    cveStr: {type: String},
    nom: {type: String},
    tipo: {type: String},
    abr: {type: String},
  },

  proceso: {
    registros: { type: Number },
    calificacion: { type: Number },
    suministro: { type: Number },
    oportunidad: { type: Number },
    integridad: { type: Number },
    fechaInicio: { type: Date },
    fechaFin: { type: Date },
  },
  wscarga: {
    registros: { type: Number },
    calificacion: { type: Number },
    suministro: { type: Number },
    oportunidad: { type: Number },
    integridad: { type: Number },
    fechaFin: { type: Date },
    numprocs: { type: Number },
    stat: { type: Number }, // 1: OK, 2: ERROR
    comprobante: { type: String },
  },
});

module.exports = mongoose.model('cargas', Cargas);
