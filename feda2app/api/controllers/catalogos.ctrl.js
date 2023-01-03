// Common = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const _ = require('lodash');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// DB & Models = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const CatalogosModel = require('../models/catalogos.model');
const EntidadesModel = require('../models/entidades-federativas.model');

// DB & Models = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
module.exports = {
  getAllCatalogos: getAllCatalogos,
};

async function getAllCatalogos() {
  try {
    const sexos = await CatalogosModel.find({cat: 'sexos'});
    const tipoCreacion = await CatalogosModel.find({cat: 'tipo-creacion'});
    const entidades = await EntidadesModel.find({"anc-id": null});
    return {
      sexos: sexos,
      tipoCreaciones: tipoCreacion,
      entidades: entidades
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
}
