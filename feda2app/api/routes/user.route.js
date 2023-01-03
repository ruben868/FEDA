const express = require('express');
const router = express.Router();
const _ = require('lodash');
const mongoose = require('mongoose');

// Controllers = = = = = = = = = = = = = = = = =
const UserCtrl = require('../controllers/user.ctrl');
const AuthClientCtrl = require('../controllers/auth-client.ctrl');
const CatsCtrl = require('../controllers/catalogos.ctrl');

// = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = = ==
router.route('/getUserById/:authUserId').get(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      console.log('INIT - - - - - - - - - - - - - -');
      console.log(req.headers);
      const authData = AuthClientCtrl.getAuthHeadersInfo(req.headers);
      const response = await UserCtrl.getUserData(req.params.authUserId, authData);
      res.status(200).send(response);
      console.log('END - - - - - - - - - - - - - -');
    } catch (error) {
      console.log(error);
      console.log('END WITH ERROR- - - - - - - - - - - - - -');
      if (error.name === 'MongoError' && error.codeName === 'DuplicateKey') {
        // Error de correo duplicado
        res.status(406).send(error);
      } else {
        res.status(400).send(error);
      }
    }
  };

  fnMain(req, res);
});


// = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = = ==
router.route('/getUserById').get(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      console.log('INIT - - - - - - - - - - - - - -');
      console.log(req.headers);
      const authData = AuthClientCtrl.getAuthHeadersInfo(req.headers);
      const response = await UserCtrl.getUserData(authData.userId, authData);
      res.status(200).send(response);
      console.log('END - - - - - - - - - - - - - -');
    } catch (error) {
      console.log(error);
      console.log('END WITH ERROR- - - - - - - - - - - - - -');
      if (error.name === 'MongoError' && error.codeName === 'DuplicateKey') {
        // Error de correo duplicado
        res.status(406).send(error);
      } else {
        res.status(400).send(error);
      }
    }
  };

  fnMain(req, res);
});


// = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = = ==
router.route('/upsertUser').post(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      const resp = await UserCtrl.createNewUser(req.body);
      res.status(200).send(resp);
      console.log('END - - - - - - - - - - - - - -');
    } catch (error) {
      console.log(error);
      console.log('END WITH ERROR- - - - - - - - - - - - - -');
      if (error.name === 'MongoError' && error.codeName === 'DuplicateKey') {
        // Error de correo duplicado
        res.status(406).send(error);
      } else {
        res.status(400).send(error);
      }
    }
  };

  fnMain(req, res);
});
// router.route('/upsert').post(function (req, res) {
//   let fnMain = async (req,res) => {
//     try {
//       let response = await upsertUsuario(req.body);
//       res.status(200).send(response);
//     } catch (error){
//       if (error.name === 'MongoError' && error.codeName === 'DuplicateKey') {
//         // Error de correo duplicado
//         res.status(406).send(error);
//       } else {
//         res.status(400).send(error);
//       }
//     }
//   };
//
//   fnMain(req, res);
// });
//
// async function getUserInfo(userId) {
//   try {
//     // Obtener información del servidor auth
//
//   } catch (e) {
//     console.log(e);
//   }
// }
//
// // = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = = ==
//
// router.route('/getall').get(function (req, res) {
//   let fnMain = async (req,res) => {
//     try {
//       let response = await getAllUsuarios();
//       res.status(200).send(response);
//     } catch (error){
//       res.status(400).send(error);
//     }
//   };
//
//   fnMain(req, res);
// });
//
// router.route('/getById/:id').get(function (req, res) {
//   let fnMain = async (req,res) => {
//     try {
//       let response = await getUsrById(req.params.id);
//       res.status(200).send(response);
//     } catch (error){
//       res.status(400).send(error);
//     }
//   };
//
//   fnMain(req, res);
// });
//
// async function upsertUsuario (data) {
//   // Validar que tenga id
//   const _id =  _.isNull(_.get(data,'_id',null)) ? null : _.get(data,'_id');
//
//   // Validar que el correo sea único
//   let hasUnique = false;
//   data.mail = data.mail.toLowerCase();
//
//   if ( _.isNull(_id) ) {
//     // Es nuevo
//     data._id = mongoose.Types.ObjectId();
//   }
//
//   // Tranformaciones de datos
//   let selAttrs = {
//     nom: null,
//     appat: null,
//     apmat: null,
//     mail: null,
//     hpwd: null,
//     fecnac: null,
//     docInfo: null,
//     sexo: null,
//     lstChanges: null
//   };
//
//   if (!_.isNil(data.pwd)) {
//     data.hpwd = crypto.createHash('sha256').update(data.pwd).digest('base64');
//   }
//
//   let result = _.pick(data, _.keys(selAttrs));
//
//   // console.log(result);
//   //let usuario = new Usuarios(result);
//   //console.log(usuario);
//
//   let resp = await Usuarios.findOneAndUpdate({_id: data._id}, result, {
//     new: true,
//     upsert: true // Make this update into an upsert
//   });
//   // console.log(resp);
//
//   return {
//     data: resp,
//     error: '',
//     errorCode: 0
//   };
// }
//
// async function getAllUsuarios () {
//   let resp = await Usuarios.find({'docInfo.isActive': true});
//   return resp;
// }
//
// async function getUsrById (id) {
//   let resp = await Usuarios.find({_id: id});
//   return resp;
// }


// = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = = ==
router.route('/getAllUsers').get(function (req, res) {
  let fnMain = async (req, res) => {
    try {
      const resp = await UserCtrl.getAllUserPage(req.query.pageIndex, req.query.pageSize);
      res.status(200).send(resp);
      console.log('END - - - - - - - - - - - - - -');
    } catch (error) {
      console.log(error);
      console.log('END WITH ERROR- - - - - - - - - - - - - -');
      if (error.name === 'MongoError' && error.codeName === 'DuplicateKey') {
        // Error de correo duplicado
        res.status(406).send(error);
      } else {
        res.status(400).send(error);
      }
    }
  };

  fnMain(req, res);
});


// = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = = ==
router.route('/get/:id').get(function (req, res) {
  let fnMain = async (req, res) => {
    try {
      const resp = await UserCtrl.getUserById(req.params.id);
      res.status(200).send(resp);
      console.log('END - - - - - - - - - - - - - -');
    } catch (error) {
      console.log(error);
      console.log('END WITH ERROR- - - - - - - - - - - - - -');
      if (error.name === 'MongoError' && error.codeName === 'DuplicateKey') {
        // Error de correo duplicado
        res.status(406).send(error);
      } else {
        res.status(400).send(error);
      }
    }
  };

  fnMain(req, res);
});


// = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = = ==
router.route('/getroles').get(function (req, res) {
  let fnMain = async (req, res) => {
    try {
      const resp = await UserCtrl.getRoles();
      res.status(200).send(resp);
      console.log('END - - - - - - - - - - - - - -');
    } catch (error) {
      console.log(error);
      console.log('END WITH ERROR- - - - - - - - - - - - - -');
      if (error.name === 'MongoError' && error.codeName === 'DuplicateKey') {
        // Error de correo duplicado
        res.status(406).send(error);
      } else {
        res.status(400).send(error);
      }
    }
  };

  fnMain(req, res);
});

// = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = = ==
router.route('/getcatalogos').get(function (req, res) {
  let fnMain = async (req, res) => {
    try {
      const resp = await CatsCtrl.getAllCatalogos();
      res.status(200).send(resp);
      console.log('END - - - - - - - - - - - - - -');
    } catch (error) {
      console.log(error);
      console.log('END WITH ERROR- - - - - - - - - - - - - -');
      if (error.name === 'MongoError' && error.codeName === 'DuplicateKey') {
        // Error de correo duplicado
        res.status(406).send(error);
      } else {
        res.status(400).send(error);
      }
    }
  };

  fnMain(req, res);
});

// = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = = ==
router.route('/delete-account').post(function (req, res) {
  let fnMain = async (req, res) => {
    try {
      const data = req.body;
      const resp = await UserCtrl.deleteAccount(data.userId, data.hardDelete);
      res.status(200).send(resp);
      console.log('END - - - - - - - - - - - - - -');
    } catch (error) {
      console.log(error);
      console.log('END WITH ERROR- - - - - - - - - - - - - -');
      if (error.name === 'MongoError' && error.codeName === 'DuplicateKey') {
        // Error de correo duplicado
        res.status(406).send(error);
      } else {
        res.status(400).send(error);
      }
    }
  };

  fnMain(req, res);
});

router.route('/create-unattended/:id').post(function (req, res) {
  let fnMain = async (req, res) => {
    try {
      const resp = await UserCtrl.createUnattended(req.params.id);
      res.status(200).send(resp);
      console.log('END - - - - - - - - - - - - - -');
    } catch (error) {
      console.log(error);
      console.log('END WITH ERROR- - - - - - - - - - - - - -');
      if (error.name === 'MongoError' && error.codeName === 'DuplicateKey') {
        // Error de correo duplicado
        res.status(406).send(error);
      } else {
        res.status(400).send(error);
      }
    }
  };

  fnMain(req, res);
});

router.route('/get-unattended/:id').get(function (req, res) {
  let fnMain = async (req, res) => {
    try {
      const resp = await UserCtrl.getUserUnattended(req.params.id);
      res.status(200).send(resp);
      console.log('END - - - - - - - - - - - - - -');
    } catch (error) {
      console.log(error);
      console.log('END WITH ERROR- - - - - - - - - - - - - -');
      if (error.name === 'MongoError' && error.codeName === 'DuplicateKey') {
        // Error de correo duplicado
        res.status(406).send(error);
      } else {
        res.status(400).send(error);
      }
    }
  };

  fnMain(req, res);
});

module.exports = router;
