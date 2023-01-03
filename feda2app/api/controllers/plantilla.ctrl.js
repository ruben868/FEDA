
// Common = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const _ = require('lodash');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// DB & Models = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const Plantillas = require('../models/plantillas-model');

module.exports = {
  getAllPlantillas: getAllPlantillas,
};

async function getAllPlantillas () {
  let plantillas = null;
  // Obtener información del servidor auth
  try {
    const plantillas = await Plantillas.aggregate([
      {
        '$sort': {
          'fechaCreacion': -1
        }
      }
    ]);

    return plantillas;
  } catch (e) {
    throw e;
  }

  return plantillas;
}

