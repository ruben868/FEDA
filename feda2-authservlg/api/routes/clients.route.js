const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const _ = require('lodash');
const crypto = require('crypto');
const Errors = require('../shared/errors.data');
const utils = require('../shared/utils.bloc');

let Clients = require('../models/clients.model');

router.route('/getall').get(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      let response = await getAllClients();
      res.status(200).send(response);
    } catch (error){
      res.status(400).send(error);
    }
  };

  fnMain(req, res);
});

router.route('/getById/:id').get(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      let response = await getUsrById(req.params.id);
      res.status(200).send(response);
    } catch (error){
      res.status(400).send(error);
    }
  };

  fnMain(req, res);
});

async function upsertUsuario (data) {
  // Validar que tenga id
  const _id =  _.isNull(_.get(data,'_id',null)) ? null : _.get(data,'_id');

  // Validar que el correo sea único
  let hasUnique = false;
  data.mail = data.mail.toLowerCase();

  if ( _.isNull(_id) ) {
    // Es nuevo
    data._id = mongoose.Types.ObjectId();
  }

  // Tranformaciones de datos
  let selAttrs = {
    nom: null,
    appat: null,
    apmat: null,
    mail: null,
    hpwd: null,
    fecnac: null,
    docInfo: null,
    sexo: null,
    lstChanges: null
  };

  if (!_.isNil(data.pwd)) {
    data.hpwd = crypto.createHash('sha256').update(data.pwd).digest('base64');
  }

  let result = _.pick(data, _.keys(selAttrs));

  // console.log(result);
  //let usuario = new Usuarios(result);
  //console.log(usuario);

  let resp = await Usuarios.findOneAndUpdate({_id: data._id}, result, {
    new: true,
    upsert: true // Make this update into an upsert
  });
  // console.log(resp);

  return {
    data: resp,
    error: '',
    errorCode: 0
  };
}

async function getAllClients () {
  //let resp = await Clients.find({'docInfo.isActive': true});
  let resp = await Clients.find();
  return resp;
}

async function getUsrById (id) {
  let resp = await Usuarios.find({_id: id});
  return resp;
}


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

async function  upsClient_logic(clientData)  {
  try {
    const clientFromDB = await Clients.findOne({clientName: clientData.clientName});

    // Existe en la base de datos
    if (_.isNil(clientFromDB)) {
      clientData.clientSecret = clientFromDB.clientSecret;
      clientData.clientId = clientFromDB.clientId;
      clientData.clientActive = clientFromDB.clientActive;
    }

    if ( _.isNil(clientData._id) )            clientData._id = mongoose.Types.ObjectId();
    if (clientData.clientSecret)              clientData.clientSecret = utils.createNewClientSecret();
    if (clientData.clientId)                  clientData.clientId = utils.createNewClientId(clientData.clientName);
    if ( _.isNil(clientData.clientActive) )   clientData.clientActive = true;

    const resp = await Clients.findOneAndUpdate({_id: clientData._id}, clientData, {
      new: true,
      upsert: true // Make this update into an upsert
    });

    return resp;
  } catch (e) {
    throw e;
  }
}
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

module.exports = router;
