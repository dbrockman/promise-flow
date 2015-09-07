import * as pf from '../src';

describe('allObject', () => {

  it('should resolve with all resolved values', () => {
    return pf.allObject({
      key1: Promise.resolve('value 1'),
      key2: Promise.resolve('value 2')
    }).should.eventually.eql({
      key1: 'value 1',
      key2: 'value 2'
    });
  });

  it('should reject if one of the values reject', () => {
    return pf.allObject({
      key1: Promise.resolve('value 1'),
      key2: Promise.reject(new Error('test error'))
    }).should.be.rejectedWith('test error');
  });

  it('should pass along non-promise values', () => {
    return pf.allObject({
      key1: Promise.resolve('value 1'),
      key2: 'value 2'
    }).should.eventually.eql({
      key1: 'value 1',
      key2: 'value 2'
    });
  });

});
