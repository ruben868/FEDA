const expect = require('chai').expect;
const _ = require('lodash');
const mongoose = require('mongoose');

async function connectToMongo() {
  mongoose.Promise = global.Promise;
  await mongoose.connect(process.env.MDBCS, {
    useNewUrlParser: true
  });
}

const BricksCtrl = require('../controllers/databricks.ctrl');

describe('Data Bricks Controller', function () {
  this.timeout(20000);

  // it('should get stat from cluster', async () => {
  //   // 1. Arrange
  //
  //   // 2. ACT
  //   const resp = await BricksCtrl.getStat();
  //   console.log(resp);
  //   // 3. ASSERT
  //   console.log('3. ASSERT - - - - - - - - - - - -');
  //   expect(true).to.be.equal(!_.isNil(resp));
  // });

  // it('should start cluster', async () => {
  //   // 1. Arrange
  //
  //   // 2. ACT
  //   const resp = await BricksCtrl.startCluster();
  //   console.log(resp);
  //   // 3. ASSERT
  //   console.log('3. ASSERT - - - - - - - - - - - -');
  //   expect(true).to.be.equal(!_.isNil(resp));
  // });

  // it('should return if job is running or not', async () => {
  //   // 1. Arrange
  //
  //   // 2. ACT
  //   const resp = await BricksCtrl.isJobRunning();
  //   console.log(resp);
  //   // 3. ASSERT
  //   console.log('3. ASSERT - - - - - - - - - - - -');
  //   expect(true).to.be.equal(!_.isNil(resp));
  // });

  // it('should register job succesfuly', async () => {
  //   // 1. Arrange
  //   await connectToMongo();
  //
  //   // 2. ACT
  //   const resp = await BricksCtrl.registerJob('5e938143fd766d2ce1e8969b');
  //   console.log(resp);
  //   // 3. ASSERT
  //   console.log('3. ASSERT - - - - - - - - - - - -');
  //   expect(true).to.be.equal(!_.isNil(resp));
  // });

  // it('should run job', async () => {
  //   // 1. Arrange
  //   // await connectToMongo();
  //
  //   // 2. ACT
  //   const resp = await BricksCtrl.runJob();
  //   console.log(resp);
  //   // 3. ASSERT
  //   console.log('3. ASSERT - - - - - - - - - - - -');
  //   expect(true).to.be.equal(!_.isNil(resp));
  // });

  it('should run task job', async () => {
    // 1. Arrange
    await connectToMongo();

    // 2. ACT
    const resp = await BricksCtrl.runFirstJob();
    console.log(resp);
    // 3. ASSERT
    console.log('3. ASSERT - - - - - - - - - - - -');
    expect(true).to.be.equal(!_.isNil(resp));
  });

});
