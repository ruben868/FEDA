const expect = require('chai').expect;
const _ = require('lodash');

const CargasCtrl = require('../controllers/datalake-ctrl');

describe('Data Lake Controller', function () {
  this.timeout(20000);

  it('should get auth token for dev account', async () => {
    // 1. Arrange

    // 2. ACT
    const resp = await CargasCtrl.getDataLakeToken();
    // 3. ASSERT
    console.log('3. ASSERT - - - - - - - - - - - -');
    console.log(resp);

    expect(true).to.be.equal(!_.isNil(resp));
  });

});
