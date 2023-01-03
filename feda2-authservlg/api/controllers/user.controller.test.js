
const mongoose = require('mongoose');
const expect = require('chai').expect;
const UserCtrl = require('../controllers/user.controller');
const _ = require('lodash');

async function connectToMongo() {
  mongoose.Promise = global.Promise;
  await mongoose.connect(process.env.MDBCS, {
    useNewUrlParser: true
  });
}

describe('User Controller', function () {
  this.timeout(20000);

  it('should send test mail', async () => {
    // 1. Arrange
    expectedData = true;

    // 2. ACT
    let resp;
    let error = true;
    try {
      resp = await UserCtrl.sendMail(null);
    } catch (e) {
      console.log(e);
      error = false;
    }

    // 3. ASSERT
    console.log('3. ASSERT - - - - - - - - - - - -');
    console.log(resp);
    console.log(expectedData);
    expect(expectedData).to.be.equal(!_.isNil(resp));
  });
});
