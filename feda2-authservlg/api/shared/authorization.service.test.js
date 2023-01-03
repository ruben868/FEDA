const expect = require('chai').expect;
const authSrv = require('../shared/authorization.service');
const dotenv = require('dotenv');
dotenv.config();

async function connectToMongo() {
  const mongoose = require('mongoose');
  mongoose.Promise = global.Promise;
  await mongoose.connect(process.env.MDBCS, {
    useNewUrlParser: true
  });
}

describe('authorization.service Client Secret', function () {
  this.timeout(20000);
  it('should authorize client secret', async () => {
      // console.log('1.');
      // 1. Arrange
      // !!! SE REQUIERE QUE ESTÉ EL REGISTRO EN LA BD
      await connectToMongo();
      const respExpected = true;
      const clientId = 'FTfucH4jFPYuvuKMYXm1RTBAadmta+UElWWpaASm2bzog6r8lrw1K74Nsd07xTPhS8rrpkBnS2vToymte8kA7w==';
      const secret = 'MtpN1PRL81Och1cnu5y+UoFk2/oTyG8G37CBZ6gnI4/wWzf4KP1vroFJNp5oYxBLgaW5RMTVx/vqE3muZEuGDA==';

      // 2. ACT
      // console.log('2.');
      let resp = false;
      try {
        resp = await authSrv.authClient(clientId, secret);
      } catch (e) {
        console.log(e);
      }

      // console.log('After execute');
      // console.log(resp);

      // 3. ASSERT
      // console.log('3.');
      expect(resp).to.be.equal(respExpected);
      //done();
  });
  it('should reject client secret', async () => {
    // console.log('1.');
    // 1. Arrange
    // !!! SE REQUIERE QUE ESTÉ EL REGISTRO EN LA BD
    // await connectToMongo();
    const respExpected = false;
    const clientId = 'FTfucH4jFPYuvuKMYXm1RTBAadmta+UElWWpaASm2bzog6r8lrw1K74Nsd07xTPhS8rrpkBnS2vToymte8kA7w==';
    const secret = 'lol+UoFk2/oTyG8G37CBZ6gnI4/wWzf4KP1vroFJNp5oYxBLgaW5RMTVx/vqE3muZEuGDA==';

    // 2. ACT
    // console.log('2.');
    let resp = false;
    try {
      resp = await authSrv.authClient(clientId, secret);
    } catch (e) {
      // console.log(e);
    }

    // console.log('After execute');
    // console.log(resp);

    // 3. ASSERT
    // console.log('3.');
    expect(resp).to.be.equal(respExpected);
    //done();
  });
});

const mongoose = require('mongoose');
const Clients = require('../models/clients.model');
const User = require('../models/usuario.model');
const UserSession = require('../models/user-sesions.model');
describe('authorization.service User Token', function () {
  this.timeout(20000);
  it('should authorize user token', async () => {
    // console.log('1.');
    // 1. Arrange
    await connectToMongo();
    // Insertar un elemento de prueba
    const docId = mongoose.Types.ObjectId('0123456789ABCDEF01234567');
    // const docIdClient = 'unitTestExample';
    // const docIdUserSession = 'unitTestExample';

    // Eliminar elementos de la db
    await UserSession.findByIdAndRemove(docId).exec();
    await User.findByIdAndRemove(docId).exec();
    await Clients.findByIdAndRemove(docId).exec();

    const userId = docId;
    const clientId = 'iddepruebadecliente';
    const token = 'tokendeprueba';

    const client = {
      _id: docId,
      clientId: clientId,
      clientActive: true
    };
    const userAccount = {
      _id: docId,
      mail: 'mail2@mail.com',
      hpwd: '13241234123',
      docInfo: {
        isActive: true
      }
    };
    const userSessionExample = {
      _id: docId,
      clientId: clientId,
      userId: userId,
      type: 'user-account',
      sesions: [
        {
          tokenData: {
            token: token,
            created: new Date(),
            expirationTime: 10000
          },
          isActive: true,
          expirationTime: 99000,
          created: new Date()
        }
      ],
    };

    const dbClient = new Clients(client);
    await dbClient.save();
    const dbUserAccount = new User(userAccount);
    await dbUserAccount.save();
    const dbUserSession = new UserSession(userSessionExample);
    await dbUserSession.save();


    const respExpected = true;

    // 2. ACT
    // console.log('2.');
    let resp = false;
    try {
      resp = await authSrv.authAccount(clientId, userId, token);
    } catch (e) {
      console.log(e);
    }

    // 3. ASSERT
    expect(resp).to.be.equal(respExpected);
    //done();
  });
  it('should reject token by UserAccountInactive', async () => {
    // console.log('1.');
    // 1. Arrange
    await connectToMongo();
    // Insertar un elemento de prueba
    const docId = mongoose.Types.ObjectId('0123456789ABCDEF01234567');
    // const docIdClient = 'unitTestExample';
    // const docIdUserSession = 'unitTestExample';

    // Eliminar elementos de la db
    await UserSession.findByIdAndRemove(docId).exec();
    await User.findByIdAndRemove(docId).exec();
    await Clients.findByIdAndRemove(docId).exec();

    const userId = docId;
    const clientId = 'iddepruebadecliente';
    const token = 'tokendeprueba';

    const client = {
      _id: docId,
      clientId: clientId,
      clientActive: true
    };
    const userAccount = {
      _id: docId,
      mail: 'mail2@mail.com',
      hpwd: '13241234123',
      docInfo: {
        isActive: false
      }
    };
    const userSessionExample = {
      _id: docId,
      clientId: clientId,
      userId: userId,
      type: 'user-account',
      sesions: [
        {
          tokenData: {
            token: token,
            created: new Date(),
            expirationTime: 10000
          },
          isActive: true,
          expirationTime: 99000,
          created: new Date()
        }
      ],
    };

    const dbClient = new Clients(client);
    await dbClient.save();
    const dbUserAccount = new User(userAccount);
    await dbUserAccount.save();
    const dbUserSession = new UserSession(userSessionExample);
    await dbUserSession.save();

    const respExpected = 'UserAccountInactive';

    // 2. ACT
    // console.log('2.');
    let resp = '';
    try {
      const theresp = await authSrv.authAccount(clientId, userId, token);
    } catch (e) {
      // console.log(e);
      resp = e;
    }

    // 3. ASSERT
    console.log('3. ASSERT - - - - - - - - - - -  - -');
    console.log(resp);
    console.log(respExpected);
    expect(resp).to.be.equal(respExpected);
    //done();
  });
  it('should reject token by ClientInactive', async () => {
    // console.log('1.');
    // 1. Arrange
    await connectToMongo();
    const docId = mongoose.Types.ObjectId('0123456789ABCDEF01234567');

    // Eliminar elementos de la db
    await UserSession.findByIdAndRemove(docId).exec();
    await User.findByIdAndRemove(docId).exec();
    await Clients.findByIdAndRemove(docId).exec();

    const userId = docId;
    const clientId = 'iddepruebadecliente';
    const token = 'tokendeprueba';

    const client = {
      _id: docId,
      clientId: clientId,
      clientActive: false
    };
    const userAccount = {
      _id: docId,
      mail: 'mail2@mail.com',
      hpwd: '13241234123',
      docInfo: {
        isActive: true
      }
    };
    const userSessionExample = {
      _id: docId,
      clientId: clientId,
      userId: userId,
      type: 'user-account',
      sesions: [
        {
          tokenData: {
            token: token,
            created: new Date(),
            expirationTime: 10000
          },
          isActive: true,
          expirationTime: 99000,
          created: new Date()
        }
      ],
    };

    const dbClient = new Clients(client);
    await dbClient.save();
    const dbUserAccount = new User(userAccount);
    await dbUserAccount.save();
    const dbUserSession = new UserSession(userSessionExample);
    await dbUserSession.save();

    console.log('DBCLIENTE -- - - - - - -  - - - - - - - - - - - -  - - -');
    console.log(dbClient);

    const respExpected = 'ClientInactive';

    // 2. ACT
    // console.log('2.');
    let resp = '';
    try {
      const theresp = await authSrv.authAccount(clientId, userId, token);
    } catch (e) {
      // console.log(e);
      resp = e;
    }

    // 3. ASSERT
    console.log('3. ASSERT - - - - - - - - - - -  - -');
    console.log(resp);
    console.log(respExpected);
    expect(resp).to.be.equal(respExpected);
    //done();
  });
  it('should reject token by SessionEnded', async () => {
    // console.log('1.');
    // 1. Arrange
    await connectToMongo();
    const docId = mongoose.Types.ObjectId('0123456789ABCDEF01234567');

    // Eliminar elementos de la db
    await UserSession.findByIdAndRemove(docId).exec();
    await User.findByIdAndRemove(docId).exec();
    await Clients.findByIdAndRemove(docId).exec();

    const userId = docId;
    const clientId = 'iddepruebadecliente';
    const token = 'tokendeprueba';

    const client = {
      _id: docId,
      clientId: clientId,
      clientActive: true
    };
    const userAccount = {
      _id: docId,
      mail: 'mail2@mail.com',
      hpwd: '13241234123',
      docInfo: {
        isActive: true
      }
    };
    const userSessionExample = {
      _id: docId,
      clientId: clientId,
      userId: userId,
      type: 'user-account',
      sesions: [
        {
          tokenData: {
            token: token,
            created: new Date(),
            expirationTime: 10000
          },
          isActive: false,
          expirationTime: 99000,
          created: new Date()
        }
      ],
    };

    const dbClient = new Clients(client);
    await dbClient.save();
    const dbUserAccount = new User(userAccount);
    await dbUserAccount.save();
    const dbUserSession = new UserSession(userSessionExample);
    await dbUserSession.save();

    // console.log('DBCLIENTE -- - - - - - -  - - - - - - - - - - - -  - - -');
    // console.log(dbClient);

    const respExpected = 'SessionEnded';

    // 2. ACT
    // console.log('2.');
    let resp = '';
    try {
      const theresp = await authSrv.authAccount(clientId, userId, token);
    } catch (e) {
      // console.log(e);
      resp = e;
    }

    // 3. ASSERT
    // console.log('3. ASSERT - - - - - - - - - - -  - -');
    // console.log(resp);
    // console.log(respExpected);
    expect(resp).to.be.equal(respExpected);
    //done();
  });
  it('should reject token by SessionExpired', async () => {
    // console.log('1.');
    // 1. Arrange
    await connectToMongo();
    const docId = mongoose.Types.ObjectId('0123456789ABCDEF01234567');

    // Eliminar elementos de la db
    await UserSession.findByIdAndRemove(docId).exec();
    await User.findByIdAndRemove(docId).exec();
    await Clients.findByIdAndRemove(docId).exec();

    const userId = docId;
    const clientId = 'iddepruebadecliente';
    const token = 'tokendeprueba';

    const client = {
      _id: docId,
      clientId: clientId,
      clientActive: true
    };
    const userAccount = {
      _id: docId,
      mail: 'mail2@mail.com',
      hpwd: '13241234123',
      docInfo: {
        isActive: true
      }
    };
    const userSessionExample = {
      _id: docId,
      clientId: clientId,
      userId: userId,
      type: 'user-account',
      sesions: [
        {
          tokenData: {
            token: token,
            created: new Date(),
            expirationTime: 10000
          },
          isActive: true,
          expirationTime: -10,
          created: new Date()
        }
      ],
    };

    const dbClient = new Clients(client);
    await dbClient.save();
    const dbUserAccount = new User(userAccount);
    await dbUserAccount.save();
    const dbUserSession = new UserSession(userSessionExample);
    await dbUserSession.save();

    // console.log('DBCLIENTE -- - - - - - -  - - - - - - - - - - - -  - - -');
    // console.log(dbClient);

    const respExpected = 'SessionExpired';

    // 2. ACT
    // console.log('2.');
    let resp = '';
    try {
      const theresp = await authSrv.authAccount(clientId, userId, token);
    } catch (e) {
      // console.log(e);
      resp = e;
    }

    // 3. ASSERT
    // console.log('3. ASSERT - - - - - - - - - - -  - -');
    // console.log(resp);
    // console.log(respExpected);
    expect(resp).to.be.equal(respExpected);
    //done();
  });
  it('should reject token by TokenExpired', async () => {
    // console.log('1.');
    // 1. Arrange
    await connectToMongo();
    const docId = mongoose.Types.ObjectId('0123456789ABCDEF01234567');

    // Eliminar elementos de la db
    await UserSession.findByIdAndRemove(docId).exec();
    await User.findByIdAndRemove(docId).exec();
    await Clients.findByIdAndRemove(docId).exec();

    const userId = docId;
    const clientId = 'iddepruebadecliente';
    const token = 'tokendeprueba';

    const client = {
      _id: docId,
      clientId: clientId,
      clientActive: true
    };
    const userAccount = {
      _id: docId,
      mail: 'mail2@mail.com',
      hpwd: '13241234123',
      docInfo: {
        isActive: true
      }
    };
    const userSessionExample = {
      _id: docId,
      clientId: clientId,
      userId: userId,
      type: 'user-account',
      sesions: [
        {
          tokenData: {
            token: token,
            created: new Date(),
            expirationTime: -10000
          },
          isActive: true,
          expirationTime: 10000,
          created: new Date()
        }
      ],
    };

    const dbClient = new Clients(client);
    await dbClient.save();
    const dbUserAccount = new User(userAccount);
    await dbUserAccount.save();
    const dbUserSession = new UserSession(userSessionExample);
    await dbUserSession.save();

    // console.log('DBCLIENTE -- - - - - - -  - - - - - - - - - - - -  - - -');
    // console.log(dbClient);

    const respExpected = 'TokenExpired';

    // 2. ACT
    // console.log('2.');
    let resp = '';
    try {
      const theresp = await authSrv.authAccount(clientId, userId, token);
    } catch (e) {
      // console.log(e);
      resp = e;
    }

    // 3. ASSERT
    // console.log('3. ASSERT - - - - - - - - - - -  - -');
    // console.log(resp);
    // console.log(respExpected);
    expect(resp).to.be.equal(respExpected);
    //done();
  });
  it('should reject token by InvalidAuthAccount', async () => {
    // console.log('1.');
    // 1. Arrange
    await connectToMongo();
    const docId = mongoose.Types.ObjectId('0123456789ABCDEF01234567');

    // Eliminar elementos de la db
    await UserSession.findByIdAndRemove(docId).exec();
    await User.findByIdAndRemove(docId).exec();
    await Clients.findByIdAndRemove(docId).exec();

    const userId = docId;
    const clientId = 'iddepruebadecliente';
    const token = null;

    const client = {
      _id: docId,
      clientId: clientId,
      clientActive: true
    };
    const userAccount = {
      _id: docId,
      mail: 'mail2@mail.com',
      hpwd: '13241234123',
      docInfo: {
        isActive: true
      }
    };
    const userSessionExample = {
      _id: docId,
      clientId: clientId,
      userId: userId,
      type: 'user-account',
      sesions: [
        {
          tokenData: {
            token: token,
            created: new Date(),
            expirationTime: -10000
          },
          isActive: true,
          expirationTime: 10000,
          created: new Date()
        }
      ],
    };

    const dbClient = new Clients(client);
    await dbClient.save();
    const dbUserAccount = new User(userAccount);
    await dbUserAccount.save();
    const dbUserSession = new UserSession(userSessionExample);
    await dbUserSession.save();

    // console.log('DBCLIENTE -- - - - - - -  - - - - - - - - - - - -  - - -');
    // console.log(dbClient);

    const respExpected = 'InvalidAuthAccount';

    // 2. ACT
    // console.log('2.');
    let resp = '';
    try {
      const theresp = await authSrv.authAccount(clientId, userId, token);
    } catch (e) {
      // console.log(e);
      resp = e;
    }

    // 3. ASSERT
    // console.log('3. ASSERT - - - - - - - - - - -  - -');
    // console.log(resp);
    // console.log(respExpected);
    expect(resp).to.be.equal(respExpected);
    //done();
  });
});

