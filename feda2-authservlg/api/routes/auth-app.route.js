const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const _ = require('lodash');

const gencodeSrv = require('../shared/gencode.service');

// DB Objects - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - --
const Clients = require('../models/clients.model');
const UserSession = require('../models/user-sesions.model');

const authorization = require('../shared/authorization.service');
const LogCtrl = require('../controllers/logs.ctrl');

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
router.route('/v1/requestToken').post(function (req, res) {
  let fnMain = async (req,res) => {
    try {

      let response = await requestToken(req.body.clientId, req.body.clientSecret);
      console.log(response);
      res.status(200).send(response);
    } catch (error){
      console.log(error);
      res.status(400).send(error);
    }
  };

  fnMain(req, res);
});

async function requestToken (clientId, clientSecret) {
  try {
    // Obtener información del cliente
    const client = await Clients.findOne({clientId: clientId, clientSecret: clientSecret});
    if (_.isNil(client)) {
      console.log('InvalidClientInformation');
      throw new Error('InvalidClientInformation');
    }
    const maxSessions = client.config.maxSessionPerUser;

    // Crear sesion - - - - - - - -- - - - - - -
    console.log('CLIENTE . . . . . . . .');
    console.log(client);
    console.log(client.config.clientSecretExpiration);
    const createdDate = new Date();
    const newToken = gencodeSrv.generateToken(clientId, clientSecret);
    let newSession = {
      created: createdDate,
      expirationTime: client.config.clientSecretExpiration,
      isActive: true,
      tokenData: {
        token: newToken.token,
        created: createdDate,
        expirationTime: client.config.clientSecretExpiration,
      }
    };

    // Obtener user session
    let userSession = await UserSession.findOne({clientId: clientId, clientSecret: clientSecret});
    if (_.isNil(userSession)) {
      // Se crea nueva sesion
      userSession = {
        clientId: client.clientId,
        secret: client.clientSecret,
        type: 'app',
        sesions: [newSession],
      };
    } else {
      // Actualizar la sesión
      // Ordenar los arreglos
      let sortedArray = _.sortBy(userSession.sesions, [function(o) {return o.sesions.created}]);

      // Si se ha superado el límite, borrar el último dato
      if (sortedArray.length > maxSessions-1) {
        sortedArray = sortedArray.splice(maxSessions-1, 1);
      }

      sortedArray.push(newSession);
    }
    console.log('USER SESSION  . . . . . . .');
    console.log(userSession);

    // const dbData = await UserSession.findOne({clientId: clientId, clientSecret: clientSecret});
    const dbData = await UserSession.findOneAndUpdate(
      {clientId: userSession.userSession, secret: userSession.secret},
      userSession, {
        new: true,
        upsert: true // Make this update into an upsert
    });

    return {
      token: newToken.token
    };
  } catch (e) {
    console.log('Unknow Error');
    console.log(e);
    throw new Error('Unknow Error');
  }

}
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =


// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
router.route('/v1/authorize').get(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      // Si el codigo llegó aqui, se ha validado el acceso
      const response = {
        status: 'authorized'
      };
      res.status(200).send(response);
    } catch (error) {

      const response = {
        status: 'authorized'
      };
      res.status(401).send(response);
    }
  };

  fnMain(req, res);
});
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =


// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
router.route('/v1/end-account-session').get(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      const authData = authorization.getAuthHeadersInfo(req.headers);

      const resp = await authorization.endAccountSession(authData.clientId, authData.userId, authData.token);
      res.status(200).send(resp);
    } catch (error) {
      res.status(400).send(response);
    }
  };

  fnMain(req, res);
});
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
// router.route('/v1/authorize').post(function (req, res) {
//   let fnMain = async (req,res) => {
//     try {
//       const parms = req.body;
//       let response = await authorization.authClient(parms.clientId, parms.clientSecret);
//       console.log(response);
//       res.status(200).send(response);
//     } catch (error){
//       console.log(error);
//       res.status(400).send(error);
//     }
//   };
//
//   fnMain(req, res);
// });
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

module.exports = router;
