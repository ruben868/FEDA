// WSCargaPeriodoModel.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for Business
let WSCargaPeriodoModel = new Schema({
  authUserId: { type: Schema.ObjectId },
  fechaCarga: { type: Date },
  nomArchivoOrg: { type: String },
  intentos: { type: Number },
  estatus: { type: String },
  periodo: { type: Periods.schema  },
  genFileName: { type: String },
  fileId: { type: String },
  isActive: { type: Boolean },
  proceso: {
    registros: { type: Number },
    calificacion: { type: Number },
    suministro: { type: Number },
    oportunidad: { type: Number },
    integridad: { type: Number },
    fechaFin: { type: Date },
  }
});

module.exports = mongoose.model('wscargas-periodos', WSCargaPeriodoModel);
