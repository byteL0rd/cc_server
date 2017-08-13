import * as mocha from 'mocha';
import * as chai from 'chai'
import 'sinon'
import { flashMessages } from './../routes/middleware'

const expect = chai.expect;
const should = chai.should();

// process.env.NODE_ENV = "test";
console.log(process.env.NODE_ENV)
describe('functional testing of test module', () => {
    it('it should assert that true is true', () => {
        console.log(typeof flashMessages);
        should.equal(typeof flashMessages, 'function');

    });
});