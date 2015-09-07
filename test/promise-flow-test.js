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


describe('series', () => {

  it('should run each function in series', () => {
    let first_fn_spy;
    return pf.series([
      () => new Promise(resolve => setTimeout((first_fn_spy = sinon.spy(resolve)), 5)),
      () => {
        first_fn_spy.should.have.callCount(1);
      }
    ]).should.be.fulfilled();
  });

  it('should resolve with an array of the resolved return values from each function', () => {
    return pf.series([
      () => Promise.resolve('value 1'),
      () => Promise.resolve('value 2')
    ]).should.eventually.eql(['value 1', 'value 2']);
  });

  it('should pass along non-promise values', () => {
    return pf.series([
      () => Promise.resolve('value 1'),
      () => 'value 2'
    ]).should.eventually.eql(['value 1', 'value 2']);
  });

});
