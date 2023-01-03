const mongoose = require('mongoose');
const expect = require('chai').expect;
// const UserCtrl = require('../controllers/user.ctrl');
const _ = require('lodash');
const { execSync } = require('child_process');
const { spawnSync } = require('child_process');
const fs = require('fs');

async function connectToMongo() {
  mongoose.Promise = global.Promise;
  await mongoose.connect(process.env.MDBCS, {
    useNewUrlParser: true
  });
}

describe('User Controller', function () {
  this.timeout(20000);

  // it('should get auth user data with client secret', async () => {
  //   // 1. Arrange
  //   const expectedData = {};
  //   const userId = '5da3a61f0139897ee52e86fb';
  //   const authInfo = {
  //     clientId: 'FTfucH4jFPYuvuKMYXm1RTBAadmta+UElWWpaASm2bzog6r8lrw1K74Nsd07xTPhS8rrpkBnS2vToymte8kA7w==',
  //     token: 'MtpN1PRL81Och1cnu5y+UoFk2/oTyG8G37CBZ6gnI4/wWzf4KP1vroFJNp5oYxBLgaW5RMTVx/vqE3muZEuGDA==',
  //   };
  //   // 2. ACT
  //   const resp = await UserCtrl.getAuthUserData(userId, authInfo);
  //   // 3. ASSERT
  //   console.log('3. ASSERT - - - - - - - - - - - -');
  //   console.log(expectedData);
  //   console.log(resp);
  //   expect(resp._id).to.be.equal(userId);
  // });
  //
  // it('should get user data with client secret', async () => {
  //   // 1. Arrange
  //   await connectToMongo();
  //   const expectedData = {};
  //   const userId = '5da3a61f0139897ee52e86fb';
  //   const authInfo = {
  //     clientId: 'FTfucH4jFPYuvuKMYXm1RTBAadmta+UElWWpaASm2bzog6r8lrw1K74Nsd07xTPhS8rrpkBnS2vToymte8kA7w==',
  //     token: 'MtpN1PRL81Och1cnu5y+UoFk2/oTyG8G37CBZ6gnI4/wWzf4KP1vroFJNp5oYxBLgaW5RMTVx/vqE3muZEuGDA==',
  //   };
  //   // 2. ACT
  //   const resp = await UserCtrl.getUserData(userId, authInfo);
  //   // 3. ASSERT
  //   console.log('3. ASSERT - - - - - - - - - - - -');
  //   console.log(expectedData);
  //   console.log(resp);
  //   expect(resp.authUserId.toString()).to.be.equal(userId);
  // });

  // it('should check if mail already exists', async () => {
  //   // 1. Arrange
  //   const expectedData = true;
  //   const userMail = 'demo@demo.com';
  //
  //   // 2. ACT
  //   const resp = await UserCtrl.isUserMailAlreadyExists(userMail);
  //   // 3. ASSERT
  //   console.log('3. ASSERT - - - - - - - - - - - -');
  //   console.log(resp);
  //   console.log(expectedData);
  //   expect(expectedData).to.be.equal(resp.alreadyExists);
  // });
  //
  // it('should create new user with ok data', async () => {
  //   // 1. Arrange
  //   const expectedData = true;
  //   const userdata = {
  //     nom: 'prueba 1',
  //     appat: 'prueba 1',
  //     apmat: 'prueba 1',
  //     mail: 'prueba@prueba.com',
  //     pwd: '123412341234',
  //     fecnac: new Date(1980,1,1),
  //     sexo: {
  //       cve: 1,
  //       nom: 'Mujer'
  //     },
  //   };
  //
  //   // 2. ACT
  //   const resp = await UserCtrl.createNewUser(userdata);
  //   // 3. ASSERT
  //   console.log('3. ASSERT - - - - - - - - - - - -');
  //   console.log(resp);
  //   console.log(expectedData);
  //   expect(expectedData).to.be.equal(!_.isNil(resp));
  // });

  // it('should create new integrate user', async () => {
  //   // 1. Arrange
  //   await connectToMongo();
  //   const expectedData = true;
  //   const userdata = {
  //     _id: '5e9d0c7ed77e79ef4dae0055',
  //     authUserId: '5e9d0c7ed77e79ef4dae0036',
  //     authInfo: {
  //       nom: 'prueba 1',
  //       appat: 'prueba 1',
  //       apmat: 'prueba 1',
  //       mail: 'prueba5@prueba.com',
  //       pwd: '123412341234',
  //       fecnac: new Date(1980,1,1),
  //       sexo: {
  //         cve: 1,
  //         nom: 'Mujer'
  //       }
  //     },
  //     entFed: {
  //       cve: '19',
  //       nom: 'Nuevo León'
  //     },
  //     org: {
  //       nom: 'Centro de Control y mando ',
  //       abr: 'C5 NL',
  //       area: {
  //         nom: 'Dirección General'
  //       }
  //     }
  //   };
  //
  //   // 2. ACT
  //   let resp;
  //   try {
  //     resp = await UserCtrl.createNewUser(userdata);
  //   } catch (e) {
  //     console.log(e);
  //   }
  //
  //   // 3. ASSERT
  //   console.log('3. ASSERT - - - - - - - - - - - -');
  //   console.log(resp);
  //   console.log(expectedData);
  //   expect(expectedData).to.be.equal(!_.isNil(resp));
  // });

  it('should create new unattended account', async () => {
    // 1. Arrange
    await connectToMongo();
    const expectedData = true;
    const userId = '5e9f363d1eaeac69d20142af';

    // 2. ACT
    let resp;
    try {
      resp = await UserCtrl.createUnattended(userId);
    } catch (e) {
      console.log(e);
    }

    // 3. ASSERT
    console.log('3. ASSERT - - - - - - - - - - - -');
    console.log(resp);
    console.log(expectedData);
    expect(expectedData).to.be.equal(!_.isNil(resp));
  });

  it('should run terminal / bash command', async () => {
    
// stderr is sent to stdout of parent process
// you can set options.stdio if you want it to go elsewhere
    let filename = "0109090004220920212340502020-522020122199.xlsx";
    let parms2 = `-T /sitepub/bnext-app/src/bnextapp/api/tmp/${filename} "http://hadoop:50070/webhdfs/v1/mnt/baseproduccion/${filename}?op=CREATE&overwrite=false"`;
    let cmd = 'curl';
    let parms = ['-i', parms2]
    const stdout = execSync(cmd, parms);
    const child = spawnSync(cmd, parms);



    console.error('error', child.error);
    console.log('stdout ', child.stdout);
    console.log('stdout ', child.stdout.toString());
    console.error('stderr ', child.stderr);
  });

  it('should attempt load with node', async () => {
    
        let filename = "0109090004220920212340502020-522020122199.xlsx";
        let filepath = `/sitepub/bnext-app/src/bnextapp/api/tmp/${filename}`;
        let putURL = `http://hadoop:50070/webhdfs/v1/mnt/baseproduccion/${filename}?op=CREATE&overwrite=false`;

    
        fs.createReadStream(filepath).pipe(request.put(putURL,options,function(err, httpsResponse, body){
          if ( err ) {
              console.log('err', err);
          } else {
              console.log(body);
          }
        }));    
  
      });


  it('should attempt load with node 2', async () => {
      let filename = "0109090004230920211743452020-522020122199.xlsx";
      let filePath = `/sitepub/bnext-app/src/bnextapp/api/tmp/${filename}`;
      let putURL = `http://hadoop:50070/webhdfs/v1/mnt/baseproduccion/${filename}?op=CREATE&overwrite=false`;
      let tmpdata = fs.readFileSync(filePath, 'utf8') ;tmpdata
  
      var options = {
        method: 'put',
        body: tmpdata,
      };
  
      request(putURL, options, function(err, httpResponse, body) {
        console.log(httpResponse.statusCode);
        // CÓDIGO 201 indica que si se cargó correctamente
        // CÓDIGO 401 indica error. Suele pasar cuando override es false
  
        if ( err ) {
            console.log('err', err);
        } else {
            try {
              console.log(body);
              body = JSON.parse(body);
            } catch(e) {
              console.log(e);
            }
        }  
      });
  });

      


});
