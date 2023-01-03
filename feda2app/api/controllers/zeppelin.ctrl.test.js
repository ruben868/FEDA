const expect = require('chai').expect;
const _ = require('lodash');
const zeppelinCrtl = require('./zeppelin.ctrl');
const mongoose = require('mongoose');

async function connectToMongo() {
    mongoose.Promise = global.Promise;
    await mongoose.connect(process.env.MDBCS, {
      useNewUrlParser: true
    });
  }

describe('Zeppelin Controler', function () {
    this.timeout(90000);

    beforeEach(async function() {
        await connectToMongo();
    });

    afterEach(async function() {
        await mongoose.disconnect();
    });

    it('Get note id estatus (test01)', async () => {
        // npx mocha 'controllers/zeppelin.ctrl.test.js' -g '(test01)'
        // 1. Arrange
        const jobId = "2G4C75VQE";
        const expectedData = false;
    
        // 2. ACT
        let result = await zeppelinCrtl.getNotebookStatus(jobId);
    
        // 3. ASSERT
        console.log('3. ASSERT - - - - - - - - - - - -');
        console.log(result);
        expect(expectedData).to.be.equal(result.hasError);
      });

      it('Intentar lanzar un job (test02)', async () => {
        // npx mocha 'controllers/zeppelin.ctrl.test.js' -g '(test02)'
        // 1. Arrange
        console.log('1. ARRANGE - - - - - - - - - - - -');
        const expectedData = false;
    
        // 2. ACT
        console.log('2. ACT - - - - - - - - - - - - - - -');
        let result = await zeppelinCrtl.deamonExtorsionesFiles();
        console.log(result);
    
        // 3. ASSERT
        console.log('3. ASSERT - - - - - - - - - - - -');
        expect(expectedData).to.be.equal(result.hasError);
      });
});