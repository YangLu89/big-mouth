'use restrict'

const expect = require('chai').expect;
const when = require('../steps/when');
const init = require('../steps/init').init;

describe(`When we invoke the GET /restaurants endpoint`, function() {
  before(async function() {
    await init();
  });

  it(`Should return an array of 8 restaurants`, async function() {
    let res = await when.we_invoke_get_restaurants();

    expect(res.statusCode).to.equal(200);
    expect(res.body).to.have.lengthOf(8);

    for (let restaurant of res.body) {
      expect(restaurant).to.have.property('name');
      expect(restaurant).to.have.property('image');
    }
  });
});