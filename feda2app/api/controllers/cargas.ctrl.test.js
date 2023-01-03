const expect = require('chai').expect;
const moment = require('moment');
const mongoose = require('mongoose');
const _ = require('lodash');

const CargasCtrl = require('../controllers/cargas.ctrl');

const CargasModel = require('../models/cargas.model');
const PeriodsModel = require('../models/periods.model');
const Usuario = require('../models/usuario.model');
const WSCarga = require('../models/wscarga.model');
const BrickJobs = require('../models/brick-jobs.model');
const InfoCargas = require('../models/wscarga-info.model');

async function connectToMongo() {
  const mongoose = require('mongoose');
  mongoose.Promise = global.Promise;
  await mongoose.connect(process.env.MDBCS, {
    useNewUrlParser: true
  });
}

describe('Cargas Controller', function () {
  this.timeout(90000);
  it('should create all periods from 2023', async () => {
    // 1. Arrange
    const year = 2021;
    const startDate = moment('2022-12-28').toDate();
    // 2. ACT
    const resp =CargasCtrl.createPeriods(year, startDate);
    console.log(resp);
    // 3. ASSERT
    expect(true).to.be.equal(!_.isNil(resp));
  });

  it('insertar datos de prueba', async () => {
    // 1. Arrange
    await connectToMongo();

    const year = 2023;
    const startDate = moment('2022-12-28').toDate();
    const periodList = CargasCtrl.createPeriods(year, startDate);

    // Insertar documento de pruebas
    // const nuevaCarga = new CargasModel({
    //   fechaCarga: new Date(),
    //   nomArchivoOrg: 'test.xlsx',
    //   intentos: 1,
    //   estatus: 'Cargado',
    //   periodo: periodList[0]
    // });
    // await nuevaCarga.save();




    // 2. ACT
    const resp = await CargasCtrl.insertPeriods(year, periodList);

    // 3. ASSERT
    expect(true).to.be.equal(!_.isNil(resp));
  });

  // it('should create get all periods from date', async () => {
  //   // 1. Arrange
  //   await connectToMongo();
  //   const startDate = new Date();
  //
  //   // 2. ACT
  //   const resp = await CargasCtrl.getCargas(startDate, '5da3a61f0139897ee52e86fb');
  //   console.log(resp);
  //
  //   // 3. ASSERT
  //   expect(true).to.be.equal(!_.isNil(resp));
  // });

  // it('should get carga by Id', async () => {
  //   // 1. Arrange
  //   const idPerido = '2020-01';
  //   const authUserId = '5da3a61f0139897ee52e86fb';
  //   await connectToMongo();
  //
  //   // 2. ACT
  //   const resp = await CargasCtrl.getCargasById(idPerido, authUserId);
  //   console.log(resp);
  //
  //   // 3. ASSERT
  //   expect(true).to.be.equa  l(!_.isNil(resp));
  // });


  // it('should create all periods from 2020 starting from mach 20', async () => {
  //   // 1. Arrange
  //   await connectToMongo();
  //   const authUserId = '5da3a61f0139897ee52e86fb';
  //   const usr = await Usuario.findOne({authUserId: authUserId});
  //   const periods = await CargasCtrl.getPeriodByYear(2020);
  //   console.log(periods);
  //   // const del = await WSCarga.deleteMany();
  //   const fechaCarga = new Date();
  //
  //   // Insertar documento de pruebas
  //   // const nuevaCarga = new CargasModel({
  //   //   fechaCarga: new Date(),
  //   //   nomArchivoOrg: 'test.xlsx',
  //   //   intentos: 1,
  //   //   estatus: 'Cargado',
  //   //   periodo: periodList[0]
  //   // });
  //   // await nuevaCarga.save();
  //
  //
  //   // 2. ACT
  //   let data = [];
  //   let p;
  //   // for(let p of periods) {
  //   // for(let i=0; i < periods.length; i++) {
  //   for(let i=0; i < 20; i++) {
  //     p = periods[i];
  //     data.push({
  //       usr: {
  //         entFed: {
  //           cve: '19',
  //           nom: 'NUEVO LEON',
  //         },
  //       },
  //       periodo: {
  //         start: p.start,
  //         end: p.end,
  //         startNum: p.startNum,
  //         endNum: p.endNum,
  //         yearWeek: p.yearWeek,
  //       },
  //       fechaCarga: fechaCarga,
  //       d: {
  //         TELEFONO: '1234-1234',
  //         COD_TIPO_TELEFONO: 1,
  //         COD_MEDIO: 1,
  //         MEDIO_OTRO: '',
  //         COD_IDENTIDAD: 1,
  //         IDENTIDAD_OTRO: '',
  //         COD_ENT: 1,
  //         COD_MUN: 1,
  //         COD_TIPO_EXTORSION: 1,
  //         TIPO_EXTORSION_OTRO: '',
  //         DIA_EXTORSION: 1,
  //         MES_EXTORSION: 1,
  //         ANIO_EXTORSION: 1,
  //         HORA_EXTORSION: 1,
  //         MINUTO_EXTORSION: 1,
  //         RELATO_HECHOS: 1,
  //         EDAD: 1,
  //         COD_SEXO: 1,
  //         COD_BIEN_ENTREGADO: 1,
  //         BIEN_ENTREGADO_DES: '',
  //         VALOR_BIEN: 0,
  //         BANCO: '',
  //         NO_CUENTA: '',
  //         COD_DENUNCIANTE: 1,
  //         COD_INSTITUCION: 1,
  //         FOLIO_INTERNO: 1,
  //         DIA_DENUNCIA: 1,
  //         MES_DENUNCIA: 1,
  //         ANIO_DENUNCIA: 1,
  //         HORA_DENUNCIA: 1,
  //         MINUTO_DENUNCIA: 1,
  //       }
  //     });
  //
  //     const respInsert = await WSCarga.insertMany(data);
  //   }
  //
  //   // 3. ASSERT
  //   const resp = true;
  //   expect(true).to.be.equal(!_.isNil(resp));
  // });


  // it('should updateWSCarga insert data on empty load period ', async () => {
  //   // 1. Arrange
  //   await connectToMongo();
  //   const data = {
  //     yearWeek: '2020-07',
  //     entfed: '19',
  //     registros: 10,
  //     calificacion: 90,
  //     suministro: 90,
  //     oportunidad: 90,
  //     integridad: 90,
  //     fechaFin: new Date(),
  //     stat: 1,
  //   };
  //
  //   // 2. ACT
  //   let resp = null;
  //   try {
  //     resp = await CargasCtrl.updateWSCarga(data);
  //   } catch (e) {
  //     console.log(e);
  //   }
  //
  //   // 3. ASSERT
  //   const expected = true;
  //   expect(expected).to.be.equal(!_.isNil(resp));
  //
  // });

  // it('should updateWSCarga insert data on empty load period ', async () => {
  //   // 1. Arrange
  //   await connectToMongo();
  //   const data = {
  //     yearWeek: '2020-07',
  //     entfed: '19',
  //     registros: 10,
  //     calificacion: 90,
  //     suministro: 90,
  //     oportunidad: 90,
  //     integridad: 90,
  //     fechaFin: new Date(),
  //     stat: 1,
  //   };
  //
  //   // 2. ACT
  //   let resp = null;
  //   try {
  //     resp = await CargasCtrl.updateWSCarga(data);
  //   } catch (e) {
  //     console.log(e);
  //   }
  //
  //   // 3. ASSERT
  //   const expected = true;
  //   expect(expected).to.be.equal(!_.isNil(resp));
  //
  // });

  // it('should updateWSCarga insert data on empty load period ', async () => {
  //   // 1. Arrange
  //   await connectToMongo();
  //   const data = {
  //     yearWeek: '2020-07',
  //     entfed: '19',
  //     registros: 10,
  //     calificacion: 90,
  //     suministro: 90,
  //     oportunidad: 90,
  //     integridad: 90,
  //     fechaFin: new Date(),
  //     stat: 1,
  //   };
  //
  //   // 2. ACT
  //   let resp = null;
  //   try {
  //     resp = await CargasCtrl.updateWSCarga(data);
  //   } catch (e) {
  //     console.log(e);
  //   }
  //
  //   // 3. ASSERT
  //   const expected = true;
  //   expect(expected).to.be.equal(!_.isNil(resp));
  //
  // });

  // it('should clean carga collections', async () => {
  //   // 1. Arrange
  //   const expectedResult = true;
  //   await connectToMongo();
  //
  //   // 2. ACT
  //   let res = false;
  //   await CargasModel.deleteMany();
  //   await BrickJobs.deleteMany();
  //   await InfoCargas.deleteMany();
  //   await WSCarga.deleteMany();
  //   res = true;
  //
  //   // 3. ASSERT
  //   const expected = true;
  //   expect(expectedResult).to.be.equal(res);
  //
  // });

  // it('corrección de ids', async () => {
  //   // 1. Arrange
  //   const tError = false;
  //   const expectedResult = true;
  //   await connectToMongo();
  //   const objetoDeEquivalencia = [
  //     {orgCveEntidad: 32,orgEntidad: "Zacatecas",newCveStr: "010037",orgCveStr: "010071"},
  //     {orgCveEntidad: 14,orgEntidad: "Jalisco",newCveStr: "010038",orgCveStr: "010037"},
  //   ];
  //
  //   // 2. ACT
  //   let error = false;
  //   try {
  //     for(let item of objetoDeEquivalencia) {
  //       // Obtener información de la organización
  //       const data = await Usuario.findOne({'org.cveStr': item.newCveStr, 'entFed.cve': item.orgCveEntidad});
  //       console.log(data);
  //
  //       // {'org.cveStr': item.org, 'org.backgroundUpdatedCons': 1}
  //       const list = await CargasModel.find(
  //         {
  //           "$and": [
  //             {'org.cveStr': item.orgCveStr},
  //             {'entfed.cve': item.orgCveEntidad},
  //             {'org.backgroundUpdatedCons': {"$ne": 1}}
  //           ]
  //         }
  //       );
  //       // console.log(list);
  //       // for(let carga of list) {
  //       //   carga.org.cveStr                = data.org.cveStr               ;
  //       //   carga.org.nom                   = data.org.nom                  ;
  //       //   carga.org.abr                   = data.org.abr                  ;
  //       //   // carga.org.area                  = data.org.area                 ;
  //       //   carga.org.eval                  = data.org.eval                 ;
  //       //   carga.org.backgroundUpdatedCons = 1;
  //       //   await carga.save();
  //       // }
  //     }
  //   } catch (e) {
  //     error = true;
  //     console.log(e);
  //   }
  //
  //   // 3. ASSERT
  //   expect(error).to.be.equal(tError);
  //
  // });
});
