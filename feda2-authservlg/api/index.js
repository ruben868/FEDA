// server.js
const dotenv = require('dotenv');
dotenv.config();

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

const secure = require('./routes/securing.route');
const authorization = require('./shared/authorization.service')

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
app.use(express.static(process.env.ANGAPPDIRNAME));
app.use(bodyParser.json());
app.use(cors());

//ROUTES ------------------------------------------------
// Gen CRUD
const genCrudRoute = require('./routes/gencrud.route');
app.use('/api/gencrud', genCrudRoute);

// Usuarios
const usersRoute = require('./routes/user.route');
app.use('/api/users', authorization.authorize, usersRoute);

// Clients
const clientsRoute = require('./routes/clients.route');
app.use('/api/clients', authorization.authorize, clientsRoute);

// Auth
const authRoute = require('./routes/auth.route');
app.use('/api/auth', authRoute);

// Auth app
const authAppRoute = require('./routes/auth-app.route');
app.use('/api/auth-app', authorization.authorize, authAppRoute);

// ADM
const admRoute = require('./routes/adm.route');
app.use('/api/adm', admRoute);

// ADM-ADMIN
const admClientRoute = require('./routes/adm-client.route');
app.use('/api/client/adm', authorization.authorizeClient, admClientRoute);

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

// Depending on your own needs, this can be extended
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.raw({ limit: '50mb' }));
app.use(bodyParser.text({ limit: '50mb' }));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));


const port = process.env.PORT || 4350;

const server = app.listen(port, function(){
  console.log('Listening on port ' + port);
});
