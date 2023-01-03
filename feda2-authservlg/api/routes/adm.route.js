/**** * * * * * * * * * * * * * * * * * * * * * * * * * *
  SERVICIO PARA PRUEBA
  NO SOLICITA TOKEN
 * * * * * * * * * * * * * * * * * * * * * * * * * * ****/
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const _ = require('lodash');
const utils = require('../shared/utils.bloc');

//-- MODELS - - - - - - - - - - - - - - - - - - - - - - - -
let Clients = require('../models/clients.model');

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
router.route('/upsClient').post(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      let response = await upsClient_logic(req.body);
      res.status(200).send(response);
    } catch (error){
      res.status(400).send(error);
    }
  };

  fnMain(req, res);
});

async function upsClient_logic(clientData)  {
  // console.log(clientData);
  try {
    const clientFromDB = await Clients.findOne({clientName: clientData.clientName});
    // console.log(clientFromDB);

    // Existe en la base de datos
    if (!_.isNil(clientFromDB)) {
      _assigIfNil(clientData, clientFromDB);
    }
    // console.log(clientData);

    _assigIfNil(clientData, {
      _id: mongoose.Types.ObjectId(),
      clientSecret: utils.createNewClientSecret(),
      clientId: utils.createNewClientId(clientData.clientName),
      clientActive: true,
      type: 'app'
    });

    const resp = await Clients.findOneAndUpdate({_id: clientData._id}, clientData, {
      new: true,
      upsert: true // Make this update into an upsert
    });

    return resp;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

function _assigIfNil (obj, src) {
  if ( _.isNil(obj._id) )            obj._id = src._id;
  if ( _.isNil(obj.clientSecret) )   obj.clientSecret = src.clientSecret;
  if ( _.isNil(obj.clientId) )       obj.clientId = src.clientId;
  if ( _.isNil(obj.clientActive) )   obj.clientActive = src.clientActive;
  if ( _.isNil(obj.type) )           obj.type = src.type;
  if ( _.isNil(obj.label) )          obj.label = src.label;
}

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

module.exports = router;
