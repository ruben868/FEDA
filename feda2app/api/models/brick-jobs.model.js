
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BrickJobsModel = new Schema({
  cargaId: [{ type: Schema.ObjectId }],
  created: { type: Date },
  modified: { type: Date },
  stat: { type: String }, // pending, triggered, finished
  runId: { type: String },
});

module.exports = mongoose.model('brick-jobs', BrickJobsModel);
