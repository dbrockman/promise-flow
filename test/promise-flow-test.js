import * as pf from '../src';
import { deferredFactoryResolveSpy } from './test-utils';

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
    const [factory_1, resolve_1] = deferredFactoryResolveSpy('value 1');
    const [factory_2, resolve_2] = deferredFactoryResolveSpy('value 2');
    return pf.series([factory_1, factory_2]).then(() => {
      factory_1.calledBefore(resolve_1).should.equal(true, 'factory_1 should be called before resolve_1');
      resolve_1.calledBefore(factory_2).should.equal(true, 'resolve_1 should be called before factory_2');
      factory_2.calledBefore(resolve_2).should.equal(true, 'factory_2 should be called before resolve_2');
    });
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

  it('should reject if one of the functions throw an error', () => {
    return pf.series([
      () => Promise.resolve('value 1'),
      () => {
        throw new Error('test error');
      }
    ]).should.be.rejectedWith('test error');
  });

  it('should throw an error if the argument is not an array', () => {
    pf.series.bind(null, {}).should.throw();
  });

});


describe('parallel', () => {

  it('should run each function in parallel', () => {
    const [factory_1, resolve_1] = deferredFactoryResolveSpy('value 1');
    const [factory_2, resolve_2] = deferredFactoryResolveSpy('value 2');
    return pf.parallel([factory_1, factory_2]).then(() => {
      factory_1.calledBefore(factory_2).should.equal(true, 'factory_1 should be called before factory_2');
      factory_2.calledBefore(resolve_1).should.equal(true, 'factory_2 should be called before resolve_1');
      resolve_1.calledBefore(resolve_2).should.equal(true, 'resolve_1 should be called before resolve_2');
    });
  });

  it('should resolve with an array of the resolved return values from each function', () => {
    return pf.parallel([
      () => Promise.resolve('value 1'),
      () => Promise.resolve('value 2')
    ]).should.eventually.eql(['value 1', 'value 2']);
  });

  it('should pass along non-promise values', () => {
    return pf.parallel([
      () => Promise.resolve('value 1'),
      () => 'value 2'
    ]).should.eventually.eql(['value 1', 'value 2']);
  });

  it('should reject if one of the functions throw an error', () => {
    return pf.parallel([
      () => Promise.resolve('value 1'),
      () => {
        throw new Error('test error');
      }
    ]).should.be.rejectedWith('test error');
  });

  it('should throw an error if the argument is not an array', () => {
    pf.parallel.bind(null, {}).should.throw();
  });

});
