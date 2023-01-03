// server.js
const dotenv = require('dotenv');
dotenv.config();
const cron = require('node-cron');
const ZeppelinCtrl = require('./controllers/zeppelin.ctrl');

const allowedExt = [
  '.js',
  '.ico',
  '.css',
  '.png',
  '.jpg',
  '.woff2',
  '.woff',
  '.ttf',
  '.svg',
];

const express = require('express'),
  path = require('path'),
  bodyParser = require('body-parser'),
  cors = require('cors'),
  mongoose = require('mongoose');

// Controllers =========================================================================================
const AuthClientCtrl = require('./controllers/auth-client.ctrl');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MDBCS, {
  useNewUrlParser: true
}).then(
  () => {
    console.log('Database is connected')
    mongoose.set('useFindAndModify', false);
  },
  err => { console.log('Can not connect to the database'+ err)}
);

const app = express();
// app.use(express.static(process.env.ANGAPPDIRNAME));
// app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '50mb' }));
// Depending on your own needs, this can be extended
app.use(bodyParser.raw({ limit: '50mb' }));
app.use(bodyParser.text({ limit: '50mb' }));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));
app.use(cors());

//ROUTES -------------------------------------------------------------
// Usuarios
const usersRoute = require('./routes/user.route');
app.use('/api/users', AuthClientCtrl.attemptAuthorize, usersRoute);

// SignIn
const signInRoute = require('./routes/sign-in.route');
app.use('/api/signin', AuthClientCtrl.attemptAuthorize, signInRoute);

// Cargas
const cargasRoute = require('./routes/cargas.route');
app.use('/api/cargas',  cargasRoute);
// app.use('/api/cargas', AuthClientCtrl.attemptAuthorize, cargasRoute);
// app.use('/api/cargas', cargasRoute);

// IN
const inRoute = require('./routes/in.route');
app.use('/api/in', AuthClientCtrl.attemptAuthorize, inRoute);
// app.use('/api/cargas', cargasRoute);

// Schedule
const BricksCtrl = require('./controllers/databricks.ctrl');
cron.schedule('* * * * *', async () => {
  console.log('DEAMON LAUNCHED INI - - - - - - -');
  // const resp = await BricksCtrl.runFirstJob(); // SE HACE CAMBIO PARA EJECUTAR JOBS ZEPPELIN
  const resp = await ZeppelinCtrl.deamonExtorsionesFiles();
  console.log(resp);
  console.log('DEAMON LAUNCHED END - - - - - - - \n');
});


// CARGA DE ARCHIVOS ON NODE
const nodeFileUpload = require('./routes/node-file-upload.route');
app.use('/api/files', AuthClientCtrl.attemptAuthorize, nodeFileUpload);


// Redirect all the other resquests

// const __dirname11 = process.env.ANGAPPDIRNAME;
// app.get('*', function (req, res) {
//   var _req = req;
//   if (allowedExt.filter(function (ext) {
//     return _req.url.indexOf(ext) > 0;
//   }).length > 0) {
//     res.sendFile(path.join(__dirname11, '/', req.url));
//   } else {
//     res.sendFile(path.join(__dirname11, '/index.html'));
//   }
// });




// //Instituciones
// const instRoute = require('./route/instituciones.route');
// app.use('/api/instituciones', instRoute);
// //Conferencias
// const conferenciaRoute = require('./route/conferencias.route');
// app.use('/api/conferencias', conferenciaRoute);
// //Documentos
// const docsRoute = require('./route/docs.route');
// app.use('/api/docs', docsRoute);
// //DocEtiquetas
// const docEtq = require('./route/docetiquetas.route');
// app.use('/api/docetiq', docEtq);
// //Usuarios
// const userRoute = require('./route/usuarios.route');
// app.use('/api/usuarios', userRoute);



const port = process.env.PORT || 4350;

const server = app.listen(port, function(){
  console.log('Listening on port ' + port);
});
