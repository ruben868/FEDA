const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const _ = require('lodash');
const crypto = require('crypto');
let AuthCodeInfo = require('../models/auth-code-info.model');
let User = require('../models/usuario.model');
const moment = require('moment');
let AuthToken = require('../models/auth-token.model');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const jwt_secret = process.env.JWTSECRET;
let Clients = require('../models/clients.model');
let AuthData = require('../models/auth-data.model');
let UserSession = require('../models/user-sesions.model');
const EncSrv = require('../shared/encdec.service');

const UsrCtrl = require('../controllers/user.controller');
const LogCtrl = require('../controllers/logs.ctrl');

const authCodeExpiration = 3;
const tokenMinExpiration = 1;
const jwtExpirationMinutes = 1;
const defaultTokenExpirationMinutes = 1440;

const jwtRenewTimeInMinutes      = 5;
const jwtExpirationTimeInMinutes = 24*60;

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
router.route('/v1/getAuthCode').post(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      await LogCtrl.dolog({
        pos: 1,
        module: 'auth.route',
        func: 'v1/getAuthCode'
      });
      let response = await createAuthCodeV2(req.body.auth, req.body.userData);
      console.log(response);
      res.status(200).send({
        authCode: response.authCode,
      });
    } catch (error){
      console.log(error);
      res.status(400).send(error);
    }
  };

  fnMain(req, res);
});

async function createAuthCodeV2 (data, userData) {
  let sessionData = {};
  let clientData;

  await LogCtrl.dolog({
    pos: 1,
    module: 'auth.route',
    func: 'createAuthCodeV2'
  });

  // Validar user y pwd
  const user = await authenticate(userData);

  try {
    if(!_.isNil(user)) {
      await LogCtrl.dolog({
        pos: 201,
        module: 'auth.route',
        func: 'createAuthCodeV2',
      });

      // Obtener configuraciones del cliente
      clientData = await Clients.findOne({clientId: data.clientId});

      if(_.isNil(clientData)) {
        console.log('createAuthCodeV2 = Client no existe');



        throw new Error('clientDataNull');
      }

      // Obtener sesiones del usuario
      let userSession = await UserSession.findOne({clientId: data.clientId, userId: user._id});

      if (_.isNil(userSession)) {
        console.log('createAuthCodeV2 = Creando sesion');
        userSession = {
          clientId: data.clientId,
          userId: user._id,
          sesions: [],
          _id: mongoose.Types.ObjectId(),
        };
      } else {
        // Buscar si existe el PKCE
        for(let i=0; i < userSession.sesions.length; ++i) {
          if (userSession.sesions[i].pkce === data.codeChallange) {
            // Ya existe el PKCE
            // Validar si aún está vigente
            const authCodeData = userSession.sesions[i].authCodeData;
            const expDate = moment(authCodeData.created).add(authCodeData.expirationTime,'s').toDate();

            if (new Date() < expDate) {
              console.log('createAuthCodeV2 = AuthCode aún válido');
              return {
                userId: user._id,
                authCode: authCodeData.authCode
              };
            }
          }
        }

        if (userSession.sesions.length > clientData.config.maxSessionPerUser - 1) {
          const sortedArray = _.sortBy(userSession.sesions, [function(o) {return o.authCodeData.created}]);
          let sortedSessions = [];
          for(let i=1; i<sortedArray.length; ++i) {
            sortedSessions.push(sortedArray[i]);
          }
          userSession.sesions = sortedSessions;
        }
      }

      // Generar auth code
      const authCodeCreated = generateAuthCode(null);

      sessionData = {
        pkce: data.codeChallange,
        pkce_method: data.codeChallangeMethod,
        authCodeData: {
          authCode: authCodeCreated.authCode,
          created: authCodeCreated.creationDate,
          expirationTime: clientData.config.authCodeExpTime,
        },
        expirationTime: (60*((60*24)*2)),
        isActive: true
      };
      userSession.sesions.push(sessionData);

      // sessionData._id = _.isNil(_.get(sessionData, '_id', null)) ? mongoose.Types.ObjectId() : sessionData._id;

      // Guardar información de la session
      const dbResp = await UserSession.findOneAndUpdate({_id: userSession._id}, userSession, {
        new: true,
        upsert: true // Make this update into an upsert
      });


      await LogCtrl.dolog({
        pos: 202,
        module: 'auth.route',
        func: 'createAuthCodeV2',
        msg: 'Auth code generado'
      });
      console.log('createAuthCodeV2 = AuthCode generado');
      return {
        userId: user._id,
        authCode: authCodeCreated.authCode
      };
    } else {
      await LogCtrl.dolog({
        pos: 301,
        module: 'auth.route',
        func: 'createAuthCodeV2',
        msg: error.toString()
      });
      console.log('createAuthCodeV2 = UserOrPwdIncorrect');
      throw new Error('UserOrPwdIncorrect');
    }
  } catch (e) {
    await LogCtrl.dolog({
      pos: 99,
      module: 'auth.route',
      func: 'createAuthCodeV2',
      msg: e.toString()
    });
    console.log('createAuthCodeV2 = Error Desconocido');
    console.log(e);
    throw new Error('Unknow error');
  }
}
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =


// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
router.route('/v1/gettoken').post(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      const data = req.body;
      let response = await getTokenV2(data.authcode, data.clientId, data.code);
      res.status(200).send(response);
    } catch (error) {
      await LogCtrl.dolog({
        pos: 1,
        module: 'auth.route',
        func: 'v1/gettoken',
        msg: error.toString()
      });

      if (error.message.indexOf('ExpiredAuthToken')!== -1) {
        res.status(401).send(error);
        return;
      }

      console.log(error.message);
      res.status(400).send(error);
    }
  };

  fnMain(req, res);
});

async function getTokenV2(authCode, clientId, codeVerifier) {
  // console.log('getTokenV2 (1)');
  await LogCtrl.dolog({
    pos: 1,
    module: 'auth.route',
    func: 'getTokenV2',
    msg: ''
  });

  // Validar codigo de autorizacion --------------------------------------------------------
  // console.log('getTokenV2 (2)');
  // console.log(authCode);
  // console.log(clientId);
  // console.log(codeVerifier);
  const userSession = await _findUserSessionByAuthCode(clientId, authCode);

  if (!_.isNil(userSession)) {
    await LogCtrl.dolog({
      pos: 201,
      module: 'auth.route',
      func: 'getTokenV2',
      msg: ''
    });

    // Validar que no esté expirado el AuthToken
    if (_isAuthCodeExpired(userSession.sesions.authCodeData)) {
      console.log('getTokenV2 (3.2)');
      await LogCtrl.dolog({
        pos: 202,
        module: 'auth.route',
        func: 'getTokenV2',
        msg: 'ExpiredAuthToken'
      });
      throw new Error('ExpiredAuthToken');
    }

    // Validar que el codigo de verificación sea válido
    if (!_isCodeVerifierValid(codeVerifier, userSession)) {
      console.log('getTokenV2 (3.3)');
      await LogCtrl.dolog({
        pos: 203,
        module: 'auth.route',
        func: 'getTokenV2',
        msg: 'InvalidCodeVerifier'
      });
      throw new Error('InvalidCodeVerifier');
    }

    // Generar token
    const genTokenData = generateTokenV2(clientId, userSession.userId);
    const genRefreshTokenData = generateTokenV2(clientId, userSession.userId);
    console.log(genTokenData);
    console.log('getTokenV2 (3.4)');

    // Guardar información en la bd - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Obtener objeto de la BD
    const fullUserSes = await UserSession.findOne({clientId: userSession.clientId, userId: userSession.userId});
    console.log('getTokenV2 (3.5)');
    // Obtener las configuraciones del cliente
    const clientData = await Clients.findOne({clientId: userSession.clientId});
    console.log('getTokenV2 (3.6)');
    // Actualizar el token
    for (const item of fullUserSes.sesions) {
      if (item.authCodeData.authCode === authCode) {
        item.tokenData = {
          token: genTokenData.token,
          created: genTokenData.creationDate,
          expirationTime: clientData.config.tokenExpTime,
          refreshToken: genRefreshTokenData.token,
          prevRefreshToken: null
        };
        break;
      }
    }
    const dbResp = await UserSession.findOneAndUpdate({_id: fullUserSes._id}, fullUserSes, {
      new: true,
      upsert: true // Make this update into an upsert
    });
    console.log('getTokenV2 (3.7)');

    return {
      token: genTokenData.token,
      refreshToken: genRefreshTokenData.token,
      userId: userSession.userId
    };
  } else {
    await LogCtrl.dolog({
      pos: 3,
      module: 'auth.route',
      func: 'getTokenV2',
      msg: ''
    });
    throw new Error('InvalidAuthCode');
  }
}

async function _findUserSessionByAuthCode(clientId, authCode) {
  try {
    const userSession = await UserSession.aggregate([
      {
        '$match': {
          'clientId': clientId,
        }
      }, {
        '$unwind': {
          'path': '$sesions',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$match': {
          'sesions.authCodeData.authCode': authCode
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
    return userSession[0];
  } catch (e) {
    return null;
  }
}

function _isAuthCodeExpired(authCodeData) {
  const expDate = moment(authCodeData.created).add(authCodeData.expirationTime,'s').toDate();

  if (new Date() > expDate) {
    return true;
  }

  return false;
}

function _isCodeVerifierValid(codeVerifier, userSession) {
  const codeVerMethod = userSession.sesions.pkce_method;
  const pkce = crypto.createHash(codeVerMethod).update(codeVerifier).digest('base64');
  if (userSession.sesions.pkce === pkce) {
    return true;
  }

  return false;
}
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =


router.route('/v1/checkToken').post(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      const data = req.body;
      let response = await checkToken(data);
      res.status(200).send(response);
    } catch (error){
      console.log(error);
      if (error.message.indexOf('InvalidToken')!== -1) {
        console.log('checkToken (1)');
        res.status(401).json(error);
        return;
      }

      res.status(400).send(error);
    }
  };

  fnMain(req, res);
});

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
router.route('/v1/checkTokenCli').post(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      // console.log('checkTokenCli (1)');
      const data = req.body;
      let response = await clientCheckTokenV2(data.clientId, data.userId, data.token);
      // console.log('checkTokenCli (2)');
      console.log(response);

      if (!_.isNil(response)) {
        const strData = EncSrv.encrypt(response.tokenData, response.pckeData.pcke);
        const decodedData = EncSrv.decode(strData, response.pckeData.pcke);
        console.log(decodedData);

        // const jwtResponse = jwt.sign(response.tokenData, response.pckeData.pcke);
        // const theData = _encryptObject(response.tokenData, response.pckeData.pcke);
        // console.log(theData);
        // const decrypted = _decryptObject(theData, response.pckeData.pcke);
        // console.log(decrypted);

        // console.log('checkTokenCli (3)');
        res.status(200).json({
          d: strData
        });
      } else {
        // console.log('checkTokenCli (4)');
        console.log('/v1/checkTokenCli = ERROR DESCONOCIDO');
        throw new Error('UnknowError');
      }
    } catch (error) {
      // console.log('checkTokenCli (5)');
      if (error.message.indexOf('TokenExpired')!== -1) {
        // console.log('checkTokenCli (6)');
        console.log('/v1/checkTokenCli = TOKEN INVÁLIDO');
        res.status(401).send({
          msg: 'TokenExpired'
        });
        return;
      } else if (error.message.indexOf('TokenInvalid')!== -1) {
        // console.log('checkTokenCli (6)');
        console.log('/v1/checkTokenCli = TOKEN INVÁLIDO');
        res.status(401).send({
          msg: 'TokenInvalid'
        });
        return;
      }
      console.log(error);
      console.log('/v1/checkTokenCli = ERROR DESCONOCIDO on catch');
      res.status(400).send(error);
      return;
    }
  };

  fnMain(req, res).catch(function(error, data){
    console.log('checkTokenCli (2.1)');
    console.log(error);
    console.log(data);
    res.status(400).send(error);
  });
});

async function clientCheckTokenV2(clientId, userId, token) {
  // Obtener información -----------------------------------------------------------------------
  const userSession = await _findUserSessionByToken(clientId, userId, token);
  if (!_.isNil(userSession)) {
    if (!_isTokenExpired(userSession)) {
      console.log('clientCheckTokenV2 = Token válido!!');
      return {
        tokenData: {
          token: token,
          userId: userId,
        },
        pckeData: {
          pcke: userSession.sesions.pkce,
          method: userSession.sesions.pkce_method,
        }
      };
    } else {
      console.log('clientCheckTokenV2 = El token ha expirado');
      throw new Error('TokenExpired');
    }
  } else {
    console.log('clientCheckTokenV2 = El token inválido!!');
    throw new Error('TokenInvalid');
  }
}

async function _findUserSessionByToken(clientId, userId, token) {
  try {
    const userSession = await UserSession.aggregate([
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
    return userSession[0];
  } catch (e) {
    return null;
  }
}

function _isTokenExpired(userSession) {
  const tokenData = userSession.sesions.tokenData;
  try {
    const expDate = moment(tokenData.created).add(tokenData.expirationTime,'s').toDate();

    if (new Date() > expDate) {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =


// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
router.route('/v1/renewToken').post(function (req, res) {
  console.log('/v1/renewToken (1)');
  let fnMain = async (req,res) => {
    try {
      const data = req.body;
      // authCode, clientCode, clientId
      let response = await refreshToken(data.clientId, data.userId, data.token, data.refreshToken);
      console.log(response);

      if (!_.isNil(response)) {
        const strData = EncSrv.encrypt(response.tokenData, response.pkce);
        console.log(strData);
        res.status(200).json({
          d: strData
        });
      } else {
        console.log('Error');
        throw new Error('UnknowError');
      }

    } catch (error) {
      if (error.message.indexOf('SessionExpired') == -1) {
        res.status(401).send({msg: 'SessionExpired'});
        return;
      } else if (error.message.indexOf('InvalidRefreshToken') == -1) {
        res.status(401).send({msg: 'InvalidRefreshToken'});
      } else if (error.message.indexOf('InvalidRefreshToken') == -1) {
        res.status(401).send({msg: 'TokenNotFound'});
      } else {
        res.status(400).send(error);
      }
    }
  };

  fnMain(req, res);
});

async function refreshToken(clientId, userId, token, refreshToken) {
  // Buscar en las sesiones de usuario el token
  const userSession = await _findUserSessionByToken(clientId, userId, token);

  if (!_.isNil(userSession)) {
    if (userSession.sesions.tokenData.refreshToken === refreshToken) {
      // TODO: Validar vigencia de la sesion
      if (_isSessionExpired(userSession)) {
        console.log('refreshToken = SessionExpired');
        throw new Error('SessionExpired');
      }

      // Renovar los token
      const genTokenData = generateTokenV2(clientId, userSession.userId);
      const genRefreshTokenData = generateTokenV2(clientId, userSession.userId);
      userSession.sesions.tokenData.token = genTokenData.token;
      userSession.sesions.tokenData.refreshToken = genRefreshTokenData.token;
      userSession.sesions.tokenData.prevRefreshToken = refreshToken;
      userSession.sesions.tokenData.created = new Date();
      // console.log('userSession = = = = = = = = = == = = = =  == = = = ');
      // console.log(userSession);

      // Actualizar
      const fullUserSes = await UserSession.findOne({clientId: userSession.clientId, userId: userSession.userId});
      for(let item in fullUserSes.sesions) {
        const curItem = fullUserSes.sesions[item];
        // console.log(item);
        // console.log(curItem._id);
        // console.log(userSession.sesions._id);
        if (curItem._id.toString() === userSession.sesions._id.toString()) {
          // console.log("ACTUALICAR - - - - - - -- - - - -- - -- - - -- - -X");
          curItem.tokenData.token = userSession.sesions.tokenData.token;
          curItem.tokenData.refreshToken = userSession.sesions.tokenData.refreshToken;
          curItem.tokenData.prevRefreshToken = userSession.sesions.tokenData.prevRefreshToken;
          curItem.tokenData.created = userSession.sesions.tokenData.created;
        }
      }
      // console.log('fullUserSes = = = = = = = = = == = = = =  == = = = ');
      // console.log(fullUserSes);
      console.log('refreshToken = Información guardada');
      await fullUserSes.save();
      // await UserSession.findOneAndUpdate({_id: fullUserSes._id}, fullUserSes, {
      //   new: true,
      //   upsert: true // Make this update into an upsert
      // });

      const returnData = {
        tokenData: {
          token: genTokenData.token,
          refreshToken: genRefreshTokenData.token,
          userId: userSession.userId,
        },
        pkce: userSession.sesions.pkce
      };
      console.log(returnData);
      return returnData;

    } else {
      // TODO: Invalidar sesión
      console.log('refreshToken = InvalidRefreshToken');
      throw new Error('InvalidRefreshToken');
    }
  } else {
    console.log('refreshToken = TokenNotFound');
    throw new Error('TokenNotFound');
  }
}

function _isSessionExpired(userSession) {
  try {
    const createdDate = userSession.sesions.authCodeData.created;
    const lenInSeconds = userSession.sesions.expirationTime;
    const expDate = moment(createdDate).add(lenInSeconds,'s').toDate();

    console.log(createdDate);
    console.log(expDate);

    if (new Date() > expDate) {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

router.route('/v1/logout').post(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      const data = req.body;
      // authCode, clientCode, clientId
      let response = await refreshToken(data.clientId, data.token);
      res.status(200).send(response);
    } catch (error) {
      // Error desconocido
      console.log(error);
      res.status(400).send(error);
    }
  };

  fnMain(req, res);
});

router.route('/v1/getClientName').post(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      const data = req.body;
      let response = await getClientName(data.clientId);

      if (!_.isNil(response)) {
        console.log(response);
        res.status(200).json(response);
      } else {
        console.log('error');
        res.status(400).json(response);
      }
    } catch (error) {
      // Error desconocido
      console.log(error);
      res.status(400).json(error);
    }
  };

  fnMain(req, res);
});

async function getClientName (clientId) {
  console.log('getClientName (1)');
  console.log(clientId);
  // Obtener la información
  const dbSearch = await Clients.findOne({'clientId': clientId});

  console.log('getClientName (2)');
  console.log(dbSearch);

  if (_.isNil(dbSearch)) {
    return null;
  } else {
    return {
      clientName: dbSearch.clientName,
      label: dbSearch.label,
    };
  }
}

async function logout (clientId, token) {
  // Obtener la información
  const dbSearch = await AuthData.findOne({'token.jwt': token, 'client.clientId': clientId});

  if (!_.isNil(token)) {
    dbSearch.isActive = false;
    await dbSearch.save();
    return true;
  } else {
    return false;
  }

  return false;
}



async function authenticate (userData) {
  const hpwd = crypto.createHash('sha256').update(userData.pwd).digest('base64');
  console.log(hpwd);

  let response = await User.findOne({mail: userData.mail, hpwd: hpwd});

  console.log(response);

  return response;
}

function makeid(length) {
  let result           = '';
  let characters       = '@ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-!';
  let charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function dynamicHashMethod() {
  let methods = ['sha1', 'sha256', 'sha512'];
  let result           = Math.floor(Math.random() * 3);
  console.log(result);
  console.log(methods[result]);
  return methods[result];
}



// async function getToken(data) {
//   console.log('getToken (1)');
//   console.log(data);
//
//   // Validar codigo de autorizacion --------------------------------------------------------
//   console.log('getToken (2)');
//   let authData = await AuthData.findOne({'authCode.authCodeHash': data.authcode});
//
//   if (_.isNil(authData)) {
//     console.log('Auth Data is null...');
//     throw new Error('InvalidAuthCode');
//     return;
//   }
//
//   // Validar vigencia del codigo de autorizacion -------------------------------------------
//   console.log('getToken (3)');
//   if (hasExpired(authData.authCode.created, authData.authCode.expirationTime)) {
//     throw new Error('ExpiredAuthToken');
//   }
//
//   // TODO: Validar client id ---------------------------------------------------------------
//   console.log('getToken (4)');
//   let clientCodeValidation = validateClientCode(authData, data.code);
//   if (clientCodeValidation.isValid && !clientCodeValidation.hasExpired) {
//     throw new Error('InvalidAuthCode');
//   }
//
//   // Generar token -------------------------------------------------------------------------
//   console.log('getToken (5)');
//   const tokenGenerated = generateToken(authData.client.clientId, authData.userInfo);
//
//   authData.token = {
//     jwt: tokenGenerated.token,
//     creation: tokenGenerated.creationDate,
//     expirationTime: tokenGenerated.expirationTime
//   };
//
//   // poner datos de la sesion
//   authData.sesion = {
//     isActive: true,
//     createdDate: tokenGenerated.creationDate,
//     logoutDate: null
//   };
//
//   authData = await authData.save();
//
//   console.log(authData);
//   console.log('getToken <<<<<<<<<<<');
//
//   return authData;
// }

async function checkToken(data) {
  //let response = false;
  console.log('checkToken >>>>>>>>>>');
  console.log(data);
  const clientId  = data.clientId;
  const jwtToken     = data.token;
  const clientSecret = data.clientSecret;

  // Validar cliente -----------------------------------------------------------------------
  const checkClientSecretResp = await checkClientSecret(clientId, clientSecret);
  if (!checkClientSecretResp) {
    console.log('Client id and client secret are invalid');
    throw new Error('InvalidToken');
    return;
  }

  const dbSearch = await AuthData.findOne({'token.jwt': jwtToken, 'client.clientId': clientId});
  if (_.isNil(dbSearch)) {
    console.log('No se encontró en db por el criterio token, clientId');
    throw new Error('InvalidToken');
  }

  if (!isTokenValid(jwtToken, dbSearch)) {
    throw new Error('InvalidToken');
  }

  console.log('checkToken <<<<<<<<<<<<');
  return data;
}



async function checkTokens(token, refreshToken) {
  let returnVal = {
    t: false,
    rt: false
  };

  console.log('checkTokens (1)');

  // Validar cliente -----------------------------------------------------------------------
  const dbSearch = await AuthData.findOne({'token.jwt': token, 'refreshToken': refreshToken});

  if (!_.isNil(dbSearch)) {
    console.log('checkTokens (2)');

    if (isTokenValid(token, dbSearch)) {
      returnVal.t = true;
    }
  }

  return returnVal;
}

async function newRefreshToken(clientId, userId, sesionId, keepSesion, creationDate) {
  // Se asume que estos elementos ya fueron validados.
  // GENERATE JWT TOKEN
  console.log('newRefreshToken (1)');
  if (_.isNil(clientId) || _.isNil(userId) || _.isNil(sesionId)) {
    console.log('newRefreshToken (2)');
    return null;
  }


  console.log('newRefreshToken (3)');
  creationDate = _.isNil(creationDate) ? new Date() : creationDate;

  const expirationInMinutes = 7200;
  const jwtToken = jwt.sign({
    clientId: clientId,
    userId: userId,
    sesionId: sesionId,
    creation: creationDate,
    expiration: expirationInMinutes,
    keepSesion: keepSesion
  }, jwt_secret);

  return jwtToken;
}

async function newSesionToken(clientId, userId, creationDate, keepSesion) {
  console.log('newSesionToken (1)');
  // Se asume que estos elementos ya fueron validados.
  // GENERATE JWT TOKEN
  if (_.isNil(clientId) || _.isNil(userId)) {
    console.log('newSesionToken (2)');
    console.log(clientId);
    console.log(userId);
    return null;
  }

  console.log('newSesionToken (3)');
  const algo = dynamicHashMethod();
  const tokenCore = makeid(50) + '-' + moment().format('YYYYMMDDHHmmssSSS');
  const sesionId = crypto.createHash('sha256').update(tokenCore).digest('base64');

  creationDate = _.isNil(creationDate) ? new Date() : creationDate;
  keepSesion = _.isNil(keepSesion) ? false : keepSesion;

  sesionObj = {
    clientId: clientId,
    userId: userId,
    sesionId: sesionId,
    creation: creationDate,
    keepSesion: keepSesion
  };

  const jwtToken = jwt.sign(sesionObj, jwt_secret);

  return {
    token: jwtToken,
    sesionObj: sesionObj
  };
}



async function checkClientSecret(clientId, clientSecret) {
  let response = false;
  const dbSearch = await Clients.findOne({clientId: clientId, clientSecret: clientSecret});
  console.log(dbSearch);

  if (!_.isNil(dbSearch)) {
    response = true;
  }

  return response;
}

async function validateClientCode(dbAuthData, clientCode) {
  let response = false;
  let vHasExpired = false;
  let dbSearch = null;

  console.log('validateClientCode (1)');

  try {
    const clientSecret = crypto.createHash(dbAuthData.pkce.codeChallangeMethod).update(clientCode).digest('base64');
    console.log(clientSecret);

    if (dbAuthData.pkce.codeChallange === clientSecret) {
      console.log('validateClientCode (2)');
      response = true;

      //vHasExpired = hasExpired(dbAuthData.pkce.creationDate, dbAuthData.pkce.expirationTime);
      vHasExpired = false;
    } else {
      console.log('validateClientCode (2): else');
      console.log(dbAuthData.pkce.codeChallange)
    }

  } catch (error) {
    console.log('validateClientCode (3)');
    console.log(error);
  }

  return {
    isValid: response,
    hasExpired: vHasExpired,
    data: dbSearch
  };
}

function generateAuthCode (creationDate) {
  const tempCode = makeid(60) + moment().format('YYYYMMDDHHmmssSSS');
  const algo = dynamicHashMethod();
  const authCodeHash = crypto.createHash(algo).update(tempCode).digest('base64');

  return {
    authCode: authCodeHash,
    method: algo,
    creationDate: creationDate || new Date(),
    expirationTime: authCodeExpiration
  };
}

function generateToken (clientId, userInfo) {
  const algo = dynamicHashMethod();
  const tokenCore = makeid(50) + moment().format('YYYYMMDDHHmmssSSS');
  console.log(tokenCore);
  const token = crypto.createHash(algo).update(tokenCore).digest('base64');
  console.log(token);
  const currentDate = new Date();

  // GENERATE JWT TOKEN
  const jwtToken = jwt.sign({
    clientId: clientId,
    token: token,
    user: userInfo,
    creation: currentDate,
    expiration: jwtExpirationMinutes
  }, jwt_secret);

  return {
    token: jwtToken,
    creationDate: currentDate,
    expirationTime: jwtExpirationMinutes
  };
}

function generateTokenV2 (clientId, userId) {
  const algo = dynamicHashMethod();
  const tokenCore = makeid(50) + moment().format('YYYYMMDDHHmmssSSS') + clientId + userId;
  console.log(tokenCore);
  const token = crypto.createHash(algo).update(tokenCore).digest('base64');
  console.log(token);
  const currentDate = new Date();

  return {
    token: token,
    creationDate: currentDate
  };
}

function isSesionValid(dbData) {
  let returnVal = false;

  if (dbData.sesion.isActive) {
    returnVal = true;
    // let decodedSesion = null;
    //
    // try {
    //   decodedSesion = jwt.verify(sesionToken, jwt_secret);
    // } catch (e) {
    //   returnVal = false;
    // }
    //
    // if (!_.isNil(decodedSesion)) {
    //   if (
    //     decodedSesion.clientId === dbData.client.clientId &&
    //     decodedSesion.sesionId === dbData.sesion.id &&
    //     decodedSesion.userId === dbData.userInfo.id
    //   ) {
    //     returnVal = true;
    //   }
    // }
  }

  return returnVal;
}

function isTokenValid(token, dbData) {
  /*
  clientId: clientId,
    token: token,
    user: userInfo,
    creation: currentDate,
    expiration: jwtExpirationMinutes
   */
  console.log('isTokenValid (1)');
  let returnVal = false;
  const decodedJwt = jwt.verify(token, jwt_secret);
  console.log('isTokenValid (2)');
  // Validar congruencia con bd
  console.log(decodedJwt);
  console.log(moment(decodedJwt.creation).toDate());
  console.log(dbData);
  if ( moment(decodedJwt.creation).isSame(dbData.token.creation)) {
    console.log('isTokenValid (3)');
    if (!hasExpired(decodedJwt.creation, decodedJwt.expiration)) {
      console.log('isTokenValid (4)');
      returnVal = true;
    }
  }

  console.log('isTokenValid (5)');
  return returnVal;
}
// 2019-11-04T02:52:30.848Z,

// async function checkClientCode(clientId, clientCode, algo) {
//   let response = false;
//   let vHasExpired = false;
//   let dbSearch = null;
//
//   try {
//     const clientSecret = crypto.createHash(algo).update(clientCode).digest('base64');
//     dbSearch = await Clients.findOne({clientId: clientId, clientSecret: clientSecret});
//     console.log(dbSearch);
//
//     if (!_.isNil(dbSearch)) {
//       response = true;
//
//       vHasExpired = hasExpired(dbSearch.pkce.creationDate, dbSearch.pkce.expirationTime);
//     }
//
//   } catch (error) {
//     console.log(error);
//   }
//
//   return {
//     isFound: response,
//     hasExpired: vHasExpired,
//     data: dbSearch
//   };
// }

function hasExpired(date, expirationTimeInMinutes) {
  let returnVal = true;
  const diffInMin = moment(new Date()).diff(date, 'minutes');
  if (diffInMin > expirationTimeInMinutes) {
    // Token ha expirado
    console.log('La fecha ha expirado');
  } else {
    returnVal = false;
  }
  return returnVal;
}

router.route('/v1/ic').post(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      const data = req.body;
      const action = _.get(data, 'a', null);
      if (!_.isNil(action)) {
        if (action === 1) {
          let response = await UsrCtrl.sendConfirmationCode(data.ic);
          res.status(200).send(true);
        } else if (action === 2) {
          let response = await UsrCtrl.validatePin(data.ic, data.pin);
          res.status(200).send(response);
        } else if (action === 3) {
          let response = await UsrCtrl.activateAccount(data.ic, data.pin, data.pwd);
          res.status(200).send(response);
        }
      } else {
        let response = await UsrCtrl.validateInvitationCode(data.ic);
        res.status(200).send(response);
      }
    } catch (error) {
      // Error desconocido
      console.log(error);
      res.status(400).send(error);
    }
  };

  fnMain(req, res);
});

module.exports = router;

