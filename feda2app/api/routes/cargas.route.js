const express = require('express');
const router = express.Router();
const _ = require('lodash');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const CargasCtrl = require('../controllers/cargas.ctrl');
const AuthClientCtrl = require('../controllers/auth-client.ctrl');
const DataLakeCtrl = require('../controllers/datalake-ctrl');
const BricksCtrl = require('../controllers/databricks.ctrl');
const PlantillasCtrl = require('../controllers/plantilla.ctrl');
const InfoCargas = require('../models/prueba.model');
const BaseNums = require('../models/pruebnum.model');
const Busqueda = require('../models/Busqueda.model');
const hdfsCtrl = require("../controllers/hdfs.ctrl");

// = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = = ==
router.route('/getCargas').post(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      const data = req.body;
      const response = await CargasCtrl.getCargas(data.fecha, data.authUserId, data.cveEntFed, data.orgCveStr);
      res.status(200).send(response);
    } catch (error) {
      console.log(error);
      res.status(400).send('error');
    }
  };

  fnMain(req, res);
});


// = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = = ==
router.route('/getCargas/:id/:cveEntFed/:orgCveStr').get(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      const authData = AuthClientCtrl.getAuthHeadersInfo(req.headers);
      const response = await CargasCtrl.getCargasById(req.params.id, authData.userId, req.params.cveEntFed, req.params.orgCveStr);
      res.status(200).send(response);
    } catch (error) {
      console.log(error);
      res.status(400).send('error');
    }
  };

  fnMain(req, res);
});


// = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = = ==
router.route('/req-stg-tok').get(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      const response = await DataLakeCtrl.getDataLakeToken();
      res.status(200).send({
        at: response
      });
    } catch (error) {
      console.log(error);
      res.status(400).send('error');
    }
  };

  fnMain(req, res);
});


// = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = = ==
router.route('/upsert-carga').post(function (req, res) {
  let fnMain = async (req,res) => {
    try {

      const response = await CargasCtrl.upsertCarga(req.body);

      res.status(200).send(response);
    } catch (error) {
      console.log(error);
      res.status(400).send('error');
    }
  };

  fnMain(req, res);
});


// = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = = ==
router.route('/regtask').post(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      const bodyData = req.body;
      const response = await BricksCtrl.registerJob(bodyData.cargaId);
      res.status(200).send(response);
    } catch (error) {
      console.log(error);
      res.status(400).send('error');
    }
  };

  fnMain(req, res);
});


// = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = = ==
router.route('/updateproc').post(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      const bodyData = req.body;
      const response = await CargasCtrl.updateProceso(bodyData);
      res.status(200).send(response);
    } catch (error) {
      console.log(error);
      res.status(400).send('error');
    }
  };

  fnMain(req, res);
});


// = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = = ==
router.route('/updatewsproc').post(function (req, res) {
  let fnMain = async (req,res) => {
    try {
      const bodyData = req.body;
      const response = await CargasCtrl.updateWSCarga(bodyData);
      res.status(200).send(response);
    } catch (error) {
      console.log(error);
      res.status(400).send(error.toString());
    }
  };

  fnMain(req, res);
});


//>> LEER ARCHIVOS ======================================================================
router.route('/getfile/comp/:fileName').get(function (req, res) {
  console.log('getfile post (1)');
  
  try {
    console.log('getfile post (2)');
    console.log(typeof hdfsCtrl.downloadVoucher);
    hdfsCtrl.downloadVoucher(req.params.fileName+'.pdf', res);
  } catch (e) {
    console.log('getfile post (3)');
    console.log(e);
  }


  // let fnMain = async (req,res) => {
  //   console.log(`getfile post (2) : ${req.params.fileName+'.pdf'}`);

  //   try {
  //     hdfsCtrl.downloadVoucher(req.params.fileName+'.pdf', res);
  //   } catch (e) {
  //     console.log('getfile post (3)');
  //     console.log(e);
  //   }
    
  //   // try {
  //   //   console.log('getfile post (2)');
  //   //   let dataLakeClient = DataLakeCtrl.GetDataLakeServiceClient();
  //   //   console.log('getfile post (3)');
  //   //   let downloaded = await DataLakeCtrl.GetFile(dataLakeClient, process.env.ADL_DIR_COMPROBANTE, req.params.fileName+'.pdf');

  //   //   await DataLakeCtrl.streamToRead(downloaded.readableStreamBody, res);
  //   //   // res.status(200).send({accessToken: accessToken});
  //   // } catch (error){
  //   //   console.log(error);
  //   //   res.status(400).send(error);
  //   // }
  // };
  console.log('getiphafolio post (3)');
  // fnMain(req, res);
});



//>> PLANTILLAS ======================================================================
router.route('/plantilla/getAll').get(function (req, res) {
  console.log('getfile post (1)');
  let fnMain = async (req,res) => {
    try {
      const plantillas = await PlantillasCtrl.getAllPlantillas();
      res.status(200).send(plantillas);
    } catch (error){
      console.log(error);
      res.status(400).send(error);
    }
  };
  console.log('getiphafolio post (3)');
  fnMain(req, res);
});


//>> DESCARGA DE PLANTILLAS ======================================================================
router.route('/getfile/plant/:fileName').get(function (req, res) {
  console.log('getfile post (1)');
  let fnMain = async (req,res) => {
    try {
      console.log('getfile post (2)');
      let dataLakeClient = DataLakeCtrl.GetDataLakeServiceClient();
      console.log('getfile post (3)');
      let downloaded = await DataLakeCtrl.GetFile(dataLakeClient, process.env.ADL_DIR_PLANTILLAS, req.params.fileName);

      await DataLakeCtrl.streamToRead(downloaded.readableStreamBody, res);
      // res.status(200).send({accessToken: accessToken});
    } catch (error){
      console.log(error);
      res.status(400).send(error);
    }
  };
  console.log('get /getfile/plant/:fileName (3)');
  fnMain(req, res);
});

//>> DESCARGA DE PLANTILLAS ======================================================================
router.route('/getstatwscarga/:entFed/:yearWeek/:orgCveStr').get(function (req, res) {
  console.log('getstatwscarga post (1)');
  let fnMain = async (req,res) => {
    try {
      const resp = await CargasCtrl.getCurrentStatWSCarga(req.params.entFed, req.params.yearWeek, req.params.orgCveStr);
      res.status(200).send(resp);
    } catch (error){
      console.log(error);
      res.status(400).send(error);
    }
  };
  console.log('get /getfile/plant/:fileName (3)');
  fnMain(req, res);
});

// >> BUSQUEDA = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = = ==
const routeName = '/getAllNumeros';
router.route(routeName).post(function (req, res) {
  const rn = routeName;
  const bodyData = req.body;
  console.log(rn + ' : ' + 'inicio');
  
  let fnMain = async (req,res) => {
    let fechaconsulta = null;
    bodyData.fechaconsulta =  new Date();
    console.log('GETALLLLL 1');
    console.log(bodyData);
    console.log('GETALLLLL  2');

    try {

    let response = await getAllNumeros(bodyData, req.query.pageIndex, req.query.pageSize);


      res.status(200).send(response);
    } 
    catch (error){
      res.status(400).send(error);
    }

    console.log(rn + ' : '+'fin');
  };

  fnMain(req, res);
});

async function getAllNumeros (busqueda, page, perPage) {
  const rn = routeName;
  console.log(rn + ' : inicio');

  let resp = null;
  let count = null;
  
  try {

    page = page ? Number(page):0
    perPage = perPage ? Number(perPage):15

    let skip = page > 0 ? (page * perPage):0

    resp = await BaseNums.find(
      
      {

        $or:[
          {"Denuncia.NUMS": {$in: [busqueda.busqueda]}},
          {"Denuncia.NO_CUENTA": {$in: [busqueda.busqueda]}},
          {"Denuncia.NOMBRE_COMPROBANTE": busqueda.busqueda}
        ]

  }).skip(skip).limit(perPage).sort({"Denuncia.FECHA_DENUNCIA": -1});

  count = await BaseNums.find(
    {

          $or:[
            {"Denuncia.NUMS": {$in: [busqueda.busqueda]}},
            {"Denuncia.NO_CUENTA": {$in: [busqueda.busqueda]}},
            {"Denuncia.NOMBRE_COMPROBANTE": busqueda.busqueda}
          ]

    }).count();

console.log(resp);
console.log('RESPUESTA 1');

let returnData = {};
busqueda.encontrados = 0;

    if (resp && resp.length > 0) {
      busqueda.encontrados = resp.length;
      resp.sort((a,b) => {
        if (a.Denuncia.FECHA_DENUNCIA < b.Denuncia.FECHA_DENUNCIA) {
          return 1;
        } else if (a.Denuncia.FECHA_DENUNCIA > b.Denuncia.FECHA_DENUNCIA) {
          return -1
        }
        return 0;
      });

       returnData = {
        "data": resp,
        // "total": count
        "total": count
      }

    } else {
      returnData = { message: 'No Hay Datos sobre ese Número'}
    }

console.log(returnData);
//INSERTAR INFORMACION DE USUARIO Y BUSQUEDA
    busqueda._id = _.get(busqueda, '_id', mongoose.Types.ObjectId());

const res = await Busqueda.findOneAndUpdate({_id: busqueda._id}, busqueda, {
  new: true,
  upsert: true // Make this update into an upsert
});

console.log(res);

    return returnData;

  } catch (e) {
    console.log(rn + ' : error, No existe el número');
    console.log(e);
    console.log('ERRORES');
  }  
}

// >> BITÄCORA = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = == = = = == == = = = = = = = = = = ==

router.route('/getAllUsuarios').get(function (req, res) {
  console.log('entro');
  let fnMain = async (req,res) => {
    try {
      let response = await getAllUsuarios(req.query.ent);
      res.status(200).send(response);
    } catch (error){
      res.status(400).send(error);
    }
  };

  fnMain(req, res);
});

async function getAllUsuarios (ent) {
  console.log('getAllUsuarios: init');
  // ent = 'CIUDAD DE MÉXICO'

  try{
    resp = await Busqueda.aggregate(
      [
        {
          '$match': {
            'infoUser.entFed.nom': ent
          }
        }, {
          '$group': {
            '_id': {
              'correo': '$infoUser.mail', 
              'Entidad': '$infoUser.entFed.nom', 
              'Organizacion': '$infoUser.org.nom', 
              'Clave': '$infoUser.org.cveStr', 
              'nomComp': {
                '$concat': [
                  '$infoUser.appat', ' ', '$infoUser.apmat', ' ', '$infoUser.nom'
                ]
              },
            }, 
            'nocoincidencias': {
              '$sum': {
                '$cond': [
                  {
                    '$eq': [
                      '$encontrados', 0
                    ]
                  }, 1, 0
                ]
              }
            }, 
            'coincidencias': {
              '$sum': {
                '$cond': [
                  {
                    '$eq': [
                      '$encontrados', 1
                    ]
                  }, 1, 0
                ]
              }
            }, 
            'total': {
              '$sum': 1
            }
          }
        }, {
          '$project': {
            'correo': 1, 
            'nomComp': 1, 
            'Entidad': 1, 
            'Organizacion': 1, 
            'Clave': 1, 
            'total': 1, 
            'coincidencias': 1, 
            'nocoincidencias': 1, 
            'coincidencias_porcentaje': {
              '$trunc': [
                {
                  '$multiply': [
                    {
                      '$divide': [
                        '$coincidencias', '$total'
                      ]
                    }, 100
                  ]
                }, 2
              ]
            }, 
            'nocoincidencias_porcentaje': {
              '$trunc': [
                {
                  '$multiply': [
                    {
                      '$divide': [
                        '$nocoincidencias', '$total'
                      ]
                    }, 100
                  ]
                }, 2
              ]
            }
          }
        }
      ]
          // '$project': { 
          //   'usuario': '$infoUser.mail', 

          //   'entidad': '$infoUser.entFed.nom', 
          //   'cve': '$infoUser.org.cveStr', 
          //   'institucion': '$infoUser.org.nom', 
          //   'coincidencias': '$encontrados'
          // }

    );
  }catch (e) {
    console.log('getAllUsuarios: Error ');
    console.log(e);
  }

  return resp;
}

module.exports = router;
