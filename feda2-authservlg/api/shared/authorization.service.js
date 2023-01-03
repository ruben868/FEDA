const moment = require('moment');
const mongoose = require('mongoose');
const crypto = require('crypto');
const _ = require('lodash');

// CONSTANTES
const BAREAR_TOKEN_SEP = '!@@@!';

module.exports = {
  validateClientSecret: validateClientSecret,
  authClient: authClient,
  authAccount: authAccount,
  authorize: authorize,
  getAuthHeadersInfo: getAuthHeadersInfo,
  endAccountSession: endAccountSession,
  createUnatt: createUnatt,
  authorizeClient: authorizeClient,
};

// DB MODELS - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const Clients = require('../models/clients.model');
const User = require('../models/usuario.model');
const UserSession = require('../models/user-sesions.model');

const Gencode = require('../shared/gencode.service');
const LogCtrl = require('../controllers/logs.ctrl');

async function validateClientSecret(clientId, clientSecret) {
  let resVal = false;

  try {
    // Buscar información
    const client = await Clients.findOne({clientId: clientId, clientSecret:clientSecret, clientActive: true});
    if (_.isNil(client)) {
      resVal = false;
    } else {
      resVal = true;
    }
  } catch (e) {
    console.log(e);
    throw e;
  }

  return resVal;
}

async function authorize(req, res, next) {
  let authorized = false;
  let errMsg = 'Unkown Error';
  let err;
  try {
    await LogCtrl.dolog({
      pos: 1,
      module: 'authorization.services',
      func: 'authorize',
      msg: 'init'
    });

    let token = req.headers['authorization'];
    if (token.startsWith('Bearer ')) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    } else {
      throw new Error('InvalidToken');
    }
    const userid = req.headers['x-int-aid'];
    const clientId = req.headers['x-int-cid'];

    console.log(token);
    console.log(userid);
    console.log(clientId);

    await LogCtrl.dolog({
      pos: 2,
      module: 'authorization.services',
      func: 'authorize',
    });



    // Validar que no estén vacios
    if (!_.isNil(clientId) && !_.isEmpty(clientId)) {
      if (_.isNil(userid) || _.isEmpty(userid)) {
        // No contiene el dato de userId. Se asumen que el token y el client ID corresponde a un Cliente (Es decir, una
        // applicacion (con el secret).
        authorized = await authClient(clientId, token);
      }
      else {
        await LogCtrl.dolog({
          pos: 4,
          module: 'authorization.services',
          func: 'authorize',
        });
        // Se asume que es una cuenta de usuario. Esta puede ser atendida o desatentdida.
        // Se valida con el userid que el token sea válido
        let authAccountResult = false;
        try {
          authAccountResult = await authAccount(clientId, userid, token);
        } catch (e) {
          console.log('Error on authAccount >>>>>')
        }

        let authUnattendedAccountResult = false;
        try {
          authUnattendedAccountResult = await authUnattendedAccount(userid, token);
        } catch (e) {
          console.log('Error on authUnattendedAccount >>>>>')
        }

        await LogCtrl.dolog({
          pos: 5,
          module: 'authorization.services',
          func: 'authorize',
        });

        authorized = authAccountResult || authUnattendedAccountResult;
      }
    } else {
      // El client id no es válido
      throw new Error('InvalidClientID');
    }
  } catch (e) {
    err = e;
    await LogCtrl.dolog({
      code: 91,
      module: 'authorization.services',
      func: 'authorize',
      msg: e.toString()
    });
    console.log(e);
  }

  if (authorized) {
    next();
  } else {
    console.log(err);
    res.status(401).send({msg: 'Not authorized'});
  }

  // return authorized;
}

async function authClient(clientId, secret) {
  let isAuthClient = false;
  // console.log(isAuthClient);
  if (!_.isNil(clientId) && !_.isNil(secret)) {
    try {
      const client = await Clients.findOne({clientId: clientId, clientSecret: secret});

      if (_.isNil(client)) {
        console.log('AUTH: InvalidClientData');
        throw ('AUTH: InvalidClientData');
      }

      if (client.clientActive) {
        isAuthClient = true;
      }
    } catch (e) {
      console.log('authClient - - - - - - - - - - - - - - - - - - - - - - - -');
      // console.log(e);
      throw e;
    }
  } else {
    // valores inválidos
    console.log('AUTH: InvalidAuthClient');
    throw ('AUTH: InvalidAuthClient');
  }
  console.log(isAuthClient);
  return isAuthClient;
}

async function authAccount(clientId, userId, token) {
  console.log('init authAccount - - - - - - -');
  console.log(clientId);
  console.log(userId);
  console.log(token);
  let isAuth = false;
  if (!_.isNil(clientId) && !_.isNil(userId) && !_.isNil(token)) {
    try {
      // Validar que la cuenta de usuario exista y esté activa
      const user = await User.findOne({_id: userId});
      const isActive = _.get(user, 'docInfo.isActive', false);
      if (!isActive) {
        throw ('UserAccountInactive');
      }

      // Validar que el cliente exista y esté activo
      const client = await Clients.findOne({clientId: clientId});
      console.log(client);
      if (!client.clientActive) {
        throw ('ClientInactive');
      }

      let sessionData = await UserSession.aggregate([
        {
          '$match': {
            'clientId': clientId,
            'userId': mongoose.Types.ObjectId(userId),
          }
        }, {
          '$unwind': {
            'path': '$sesions',
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$match': {
            'sesions.tokenData.token': token
          }
        }, {
          '$project': {
            '_id': 1,
            'clientId': 1,
            'userId': 1,
            'sesions': 1
          }
        }
      ]);
      console.log(sessionData);
      sessionData = sessionData[0]; // obtener el primer elemento

      // Si la sesión fue finalizada
      if (!sessionData.sesions.isActive) {
        throw ('SessionEnded');
      }

      // Si la sesión expiró
      if (_validateExpiration(sessionData.sesions.created, sessionData.sesions.expirationTime)) {
        throw ('SessionExpired');
      }

      // Si el token expiró
      if (_validateExpiration(sessionData.sesions.tokenData.created, sessionData.sesions.tokenData.expirationTime)) {
        throw ('TokenExpired');
      }

      isAuth = true;
    } catch (e) {
      console.log('authAccount: Error inesperado - - - - - - - - - - - - - - - - - - - - - - - -');
      console.log(e);
      throw e;
    }
  } else {
    // valores inválidos
    throw ('InvalidAuthAccount');
  }
  return isAuth;
}


async function authUnattendedAccount(clientId, clientSecret) {
  console.log('init authUnattendedAccount > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > >');
  console.log(clientId);
  console.log(clientSecret);

  let isAuth = true;
  if (!_.isNil(clientId) && !_.isNil(clientSecret)) {
    try {
      // Validar que la cuenta de usuario exista y esté activa
      const user = await User.findOne({clientId: clientId, clientSecret: clientSecret, tipo: 'unattended'});
      if (_.isNil(user)) {
        console.log('authUnattendedAccount: Usuario vacio < < < < < < < < < < < < < < < < < < < < < < < < <');
        return false;
      }

      const isActive = _.get(user, 'docInfo.isActive', false);
      if (!isActive) {
        console.log('authUnattendedAccount: Error UserAccountInactive < < < < < < < < < < < < < < < < <  <');
        throw ('UserAccountInactive');
      }

      console.log('authUnattendedAccount: Cuenta activa < < < < < < < < < < < < < < < < < < < < < < < < < <');
      return isActive;
    } catch (e) {
      console.log('authUnattendedAccount: Error inesperado < < < < < < < < < < < < < < < < < < < < < < < <');
      console.log(e);
      throw e;
    }
  } else {
    // valores inválidos
    console.log('authUnattendedAccount: Error InvalidAuthAccount < < < < < < < < < < < < < < < < < < < < < ');
    throw ('InvalidAuthAccount');
  }
}


function _validateExpiration(createdDate, expirationSeconds) {
  const expDate = moment(createdDate).add(expirationSeconds,'s').toDate();

  if (new Date() > expDate) {
    return true;
  }

  return false;
}

async function endAccountSession(clientId, userId, token) {

  // Obtener información de la BD
  const userSessionData = UserSession.findOne({clientId: clientId, userId: userId});

  if (_.isNil(userSessionData) || _.isNil(userSessionData.sesion)) throw new Error('Session not found');

  for(let i = 0; i < userSessionData.sesion.length; i++) {
    const ses = userSessionData.sesion[i];
    const sesToken = _.get(ses, 'tokenData.token', '');
    if (sesToken === token) {
      ses.isActive = false;
      ses.endSesion = new Date();
      userSessionData.sesion[i] = ses;

      // Guardar información en la BD
      await UserSession.findOneAndUpdate({clientId: clientId, userId: userId}, userSessionData, {
        new: true,
        upsert: true // Make this update into an upsert
      });

      return {
        msg: 'Session ended'
      };

      break;
    }
  }

  return {
    msg: 'No session found'
  };
}

function getAuthHeadersInfo (headers) {
  let authInfo = {};
  const authorization = _.get(headers, 'authorization', '');
  try {
    authInfo.token = authorization.slice(7, authorization.length);
  } catch (e) {
    throw new Error('@apperr:Authorization token not found');
  }

  authInfo.clientId = _.get(headers, 'x-int-cid', '');
  authInfo.userId = _.get(headers, 'x-int-aid', '');

  return authInfo;
}

async function createUnatt (data) {
  try {
    console.log('createUnatt');
    console.log(data);
    if (data.tipo === 'unattended') {
      const idParent = data.ancestors[0];
      // TODO: VALIDAR QUE SE ENCUENTRE EL PADRE
      if (!_.isNil(data._id)) {
        delete data._id;
      }
      data.clientId = Gencode.generateToken(data._id, data).token;
      data.clientSecret = Gencode.generateToken(data._id, data).token;
      const userData = new User(data);
      const resp = await userData.save();
      return resp;
    }
    return null;
  } catch (e) {
    console.log(e);
    throw new Error('@apperr:Authorization token not found');
  }
}


async function authorizeClient(req, res, next) {
  let authorized = false;
  let errMsg = 'Unkown Error';
  let err;
  try {
    let token = req.headers['authorization'];
    if (token.startsWith('Bearer ')) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    } else {
      throw new Error('InvalidToken');
    }
    const userid = req.headers['x-int-aid'];
    const clientId = req.headers['x-int-cid'];

    // Validar que no estén vacios
    if (!_.isNil(clientId) && !_.isEmpty(clientId)) {
      if (_.isNil(userid) || _.isEmpty(userid)) {
        // No contiene el dato de userId. Se asumen que el token y el client ID corresponde a un Cliente (Es decir, una
        // applicacion (con el secret).
        authorized = await authClient(clientId, token);
      }
    } else {
      // El client id no es válido
      throw new Error('InvalidClientID');
    }
  } catch (e) {
    err = e;
    console.log(e);
  }

  if (authorized) {
    next();
  } else {
    console.log(err);
    res.status(401).send({msg: 'Not authorized'});
  }

}
