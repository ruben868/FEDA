
// Common = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const _ = require('lodash');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const got = require('got');
const axios = require('axios');

// DB & Models = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const Usuario = require('../models/usuario.model');
const RolesModel = require('../models/roles.model');
const Carga = require('../controllers/cargas.ctrl');
const LogCtrl = require('../controllers/logs.ctrl');

module.exports = {
  getAuthUserData: getAuthUserData,
  getUserData: getUserData,
  isUserMailAlreadyExists: isUserMailAlreadyExists,
  createNewUser: createNewUser,
  //getAllUser: getAllUser,
  getAllUserPage: getAllUserPage,
  getUserById: getUserById,
  getRoles: getRoles,
  createUnattended: createUnattended,
  deleteAccount: deleteAccount,
  getUserUnattended: getUserUnattended,
};

async function getUserData (authIdUser, authInfo) {
  let userData = null;
  let newUseData = {};
  // Obtener información del servidor auth
  try {
    console.log('// getUserData >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    const authUserData = await getAuthUserData(authIdUser, authInfo);
    console.log(authUserData);
    if (_.isNil(authUserData)) {
      throw new Error('@@apperr:Auth user not found');
    }

    console.log(authIdUser);
    userData = await Usuario.findOne({authUserId: mongoose.Types.ObjectId(authIdUser)},null,{lean: true}).valueOf();
    console.log(userData);
    if (_.isNil(userData)) {
      throw new Error('@@apperr:User not found');
    }

    // Obtener información de la cuenta desatendida
    const unattended = await Usuario.findOne({'authInfo.ancestors': mongoose.Types.ObjectId(userData._id)});

    // newUseData = _.defaults({}, userData, {clientId: unattended.authInfo.clientId, clientSecret: unattended.authInfo.clientSecret});//_.clone(userData);
    // newUseData['clientId'] = unattended.authInfo.clientId;
    // newUseData['clientSecret'] = unattended.authInfo.clientSecret;
    if (!_.isNil(unattended)) {
      userData.clientId = unattended.authInfo.clientId;
      userData.clientSecret = unattended.authInfo.clientSecret;
    }


    userData.authInfo = authUserData;
    console.log(userData);
  } catch (e) {
    throw e;
  }

  return userData;
}

async function getAuthUserData(idUser, authInfo) {
  let authUserData = null;
  const headers = {
    'Authorization': 'Bearer ' + process.env.AUTH_SECRET,
    'x-int-cid': process.env.AUTH_CLIENTID,
  };
  const url = process.env.AUTH_API_URL + 'users/getById/' + idUser;
  console.log(url);

  try {
    const response = await got.get(url, {
      headers: headers,
      responseType: 'json'
    });
    authUserData = response.body[0];
    // authUserData  = await request.post(data);
  } catch (e) {
    // ERROR
    console.log('ERROR = = = = = = = = = = = = = =');
    console.log(e);
  }

  console.log(authUserData);
  console.log('END');
  return authUserData;
}

async function isUserMailAlreadyExists(userMail) {
  let isUserMailAlreadyExistsRes = null;
  const headers = {
    'Authorization': 'Bearer ' + process.env.AUTH_SECRET,
    'x-int-cid': process.env.AUTH_CLIENTID,
  };
  const url = process.env.AUTH_API_URL + 'users/mailAlreadyExists/' + userMail;

  try {
    const response = await axios.get(url, {headers: headers});
    isUserMailAlreadyExistsRes = response.data;
    // authUserData  = await request.post(data);
  } catch (e) {
    await LogCtrl.dolog({
      module: 'user.ctrl',
      func: 'isUserMailAlreadyExists',
      code: 1,
      msg: e.toString()
    });

    // ERROR
    console.log('ERROR = = = = = = = = = = = = = =');
    console.log(e);
    throw e;
  }

  console.log(isUserMailAlreadyExistsRes);
  console.log('END');
  return isUserMailAlreadyExistsRes;
}

async function createNewUser(data) {
  console.log('createNewUser > > > > > > > > > > > > > > > > > > > > > > > > > > > > > >');
  let isNew = false;
  const headers = {
    'Authorization': 'Bearer ' + process.env.AUTH_SECRET,
    'x-int-cid': process.env.AUTH_CLIENTID,
  };
  console.log(data);
  // const url = process.env.AUTH_API_URL + 'users/mailAlreadyExists/' + userMail;

  let e;

  try {
    // Validar que el correo no exista si es nuevo elemento
    const id = _.get(data, '_id', null);
    if (_.isNil(id) || _.isEmpty(id)) {
      console.log('_id es nulo');
      data._id = mongoose.Types.ObjectId();
      const isMailAlreadyExist = await isUserMailAlreadyExists(data.authInfo.mail);
      console.log(isMailAlreadyExist);
      if (isMailAlreadyExist.alreadyExists) {
        throw Carga.newAppErrObj({
          module: 'create-new-user',
          code: 1,
          strCode: 'DuplicateMail'
        });
      }
    } else {
      isNew = true;
      console.log('_id no es nulo');
      // Si no es nuevo y el correo cambio, hacer validación
      const currentUser = await getUserData(data.authUserId);
      console.log(currentUser);
      if (!_.isNil(currentUser) && !_.isEmpty(currentUser)) {
        if (currentUser.authInfo.mail !== data.authInfo.mail) {
          const isMailAlreadyExist = await isUserMailAlreadyExists(data.authInfo.mail);
          if (isMailAlreadyExist.alreadyExists) {
            throw Carga.newAppErrObj({
              module: 'create-new-user',
              code: 1,
              strCode: 'DuplicateMail'
            });
          }
        }
      }
    }
    console.log('Despues de user mail');

    // Paso las validaciones. Insertar en la bd de auth
    try {
      let authResp;
      authResp = await createNewUserOnAuthServer(data.authInfo);
      data.authUserId = authResp._id;
      data.authInfo = authResp;
      console.log('createNewUserOnAuthServer');
      console.log(authResp);
    } catch (e) {
      await LogCtrl.dolog({
        module: 'user.ctrl',
        func: 'createNewUser',
        code: 1,
        msg: e.toString()
      });
      throw Carga.newAppErrObj({
        data: e,
        module: 'create-new-user',
        code: 2,
        strCode: 'ErrorOnAuthServer'
      });
    }


    // Guardar en la base de datos local
    let resp;
    try {
      resp = await Usuario.findOneAndUpdate({authUserId: data.authUserId}, data, {
        new: true,
        upsert: true // Make this update into an upsert
      });
      console.log('findOneAndUpdate');
    } catch (e) {
      await LogCtrl.dolog({
        module: 'user.ctrl',
        func: 'createNewUser',
        code: 2,
        msg: e.toString()
      });

      // TODO: Si existe error al guardar local, eliminar el elemento creado en el servidor auth
      throw Carga.newAppErrObj({
        module: 'create-new-user',
        code: 3,
        strCode: 'ErrorOnLocal',
        data: e
      });
    }

    return {
      _id: resp._id,
      authUserId: resp.authUserId
    };

  } catch (e) {
    await LogCtrl.dolog({
      module: 'user.ctrl',
      func: 'createNewUser',
      code: 3,
      msg: e.toString()
    });

    // ERROR
    console.log('ERROR = = = = = = = = = = = = = =');
    if (Carga.isInstanceOfAppError(e)) {
      throw e;
    }
    throw Carga.newAppErrObj({
      data: e.toString(),
      module: 'create-new-user',
      code: 0,
      strCode: 'UnknownError'
    });
  }
}

async function createNewUserOnAuthServer(data) {
  try {
    // Insertar información en el servidor auth
    const headers = {
      'Authorization': 'Bearer ' + process.env.AUTH_SECRET,
      'x-int-cid': process.env.AUTH_CLIENTID,
    };
    const url = process.env.AUTH_API_URL + 'users/upsertUser';

    const response = await axios.post(url, data, {headers: headers});

    return response.data;
  } catch (e) {
    await LogCtrl.dolog({
      module: 'user.ctrl',
      func: 'createNewUserOnAuthServer',
      code: 1,
      msg: e.toString()
    });

    console.log(e);
    throw e;
  }
}

async function getAllUserPage(page, perPage) {

  let resp = null
  let count = null

  try {

    page = page ? Number(page):0
    perPage = perPage ? Number(perPage):15

    let skip = page > 0 ? (page * perPage):0
    let personal = 'personal'

    // resp = await Usuario.find({"authInfo.tipo": 'personal'}).skip(skip).pretty(perPage);
    resp = await Usuario.aggregate([
      {
        '$match': {
          'authInfo.tipo': personal
        }
      }
    ]).skip(skip).limit(perPage);
    count = await Usuario.aggregate(
      [
        {
          '$match': {
            "authInfo.tipo": 'personal'
          }
        },
        { $group: { _id: 'authInfo.mail', count: { $sum: 1 } } }
      ]);
  console.log(perPage)
  console.log('perPage')

  } catch (e) {
    console.log(e);
    throw e;
  }
  let users = {
    "data": resp,
    "total": count[0].count
  }

  console.log(users)
  console.log('users')
  return users;

}

async function getUserById(id) {
  try {
    const users = await Usuario.findOne({_id: id}, null, {lean: true});
    const unattended = await Usuario.findOne({'authInfo.ancestors': mongoose.Types.ObjectId(users._id)});

    if (!_.isNil(unattended)) {
      users.clientId = unattended.authInfo.clientId;
      users.clientSecret = unattended.authInfo.clientSecret;
    }

    delete users.hpwd;

    console.log(users);
    return users;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

async function getUserUnattended(id) {
  try {
    const unattendedUser = await Usuario.findOne({'authInfo.ancestors': mongoose.Types.ObjectId(id)});
    console.log(unattendedUser);
    return unattendedUser;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

async function getRoles() {
  try {
    const roles = await RolesModel.find();
    console.log(roles);
    return roles;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

async function createUnattended(userId) {
  try {

    // BUSCAR UN ATTENDED
    console.log('createUnattended (1)   > > > > > > > > > > > > > > > > ');
    const childs = await Usuario.findOne({'authInfo.ancestors': mongoose.Types.ObjectId(userId)});
    if (!_.isNil(childs)) {
      return childs;
    }

    console.log('createUnattended (2)   > > > > > > > > > > > > > > > > ');
    // Buscar el user id
    const user = await Usuario.findOne({_id: userId});
    console.log(user);
    // Preparar objeto para la carga
    let unattended = {
      _id: user.authInfo._id,
      nom: user.authInfo.nom,
      appat: user.authInfo.appat,
      apmat: user.authInfo.apmat,
      // mail: user.authInfo.mail,
      fecnac: user.authInfo.fecnac,
      tipo: 'unattended',
      sexo: user.authInfo.sexo,
      tipoCreacion: user.authInfo.tipoCreacion,
      entnac: user.authInfo.entnac,
      docInfo: {
        isActive: true,
      },
      ancestors: [userId],
    };

    //   user.authInfo;
    // unattended.tipo = 'unattended';
    // unattended.docInfo = {
    //   isActive: true,
    // };
    // unattended.ancestors = [];
    // unattended.ancestors.push(userId);
    console.log('createUnattended (3)   > > > > > > > > > > > > > > > > ');
    console.log(unattended);

    const headers = {
      'Authorization': 'Bearer ' + process.env.AUTH_SECRET,
      'x-int-cid': process.env.AUTH_CLIENTID,
    };
    const url = process.env.AUTH_API_URL + 'client/adm/create-unattended';
    const response = await axios.post(url, unattended, {headers: headers});
    console.log(response.data);
    // unattended._id = response._id;
    // unattended.clientId = response.clientId;

    console.log('createUnattended (4)   > > > > > > > > > > > > > > > > ');
    const newData = new Usuario({
        authUserId: unattended._id,
        org: user.org,
        entFed: user.entFed,
        docInfo: user.docInfo,
        authInfo: response.data
    });
    const savedData = await newData.save();



    // Guardar la información en la bd
    console.log('createUnattended (5)   > > > > > > > > > > > > > > > > ');

    return savedData;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

async function deleteAccount(userId, hardDelete) {
  try {
    // Buscar el user id
    console.log('deleteAccount > > > > > > > > > > > > > > > > > > > > > > > > > > > >');
    console.log(userId);
    console.log(hardDelete);
    const user = await Usuario.findOne({_id: userId});

    const headers = {
      'Authorization': 'Bearer ' + process.env.AUTH_SECRET,
      'x-int-cid': process.env.AUTH_CLIENTID,
    };
    const url = process.env.AUTH_API_URL + 'client/adm/delete-account';
    const response = await axios.post(url, {userId: user.authUserId, hardDelete: hardDelete}, {headers: headers});

    if (response) {
      if (hardDelete) {
        console.log('deleteAccount [hardDelete] > > > > > > > > > > > > > > > > > > > >');
        const respDel = await Usuario.deleteOne({_id: mongoose.Types.ObjectId(userId)});
        // const respDel = await Usuario.remove({_id: user._id});
        console.log(respDel);
      } else {
        console.log('deleteAccount [else] > > > > > > > > > > > > > > > > > > > > > > >');
        user.docInfo.isActive = false;
        await user.save();
      }
    }

    return true;
  } catch (e) {
    console.log(e);
    throw e;
  }
}
