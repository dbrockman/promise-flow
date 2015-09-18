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


describe('map', () => {

  it('should map the array to the resolved value of calling the function with each item', () => {
    return pf.map([1, 2, 3], n => Promise.resolve(n * 2)).should.eventually.eql([2, 4, 6]);
  });

  it('should map the array in parallel', () => {
    const history = [];
    return pf.map([10, 20, 30], (...args) => {
      const joined_args = args.join(', ');
      history.push(`map ${joined_args}`);
      return new Promise(resolve => {
        setImmediate(() => {
          history.push(`resolve ${joined_args}`);
          resolve();
        });
      });
    }).then(() => {
      history.should.eql([
        'map 10, 0',
        'map 20, 1',
        'map 30, 2',
        'resolve 10, 0',
        'resolve 20, 1',
        'resolve 30, 2'
      ]);
    });
  });

  it('should not require the function to return a promise', () => {
    return pf.map([10, 20, 30], n => n * 2).should.eventually.eql([20, 40, 60]);
  });

  it('should reject if the function throws an error', () => {
    return pf.map([10, 20, 30], (n, i) => {
      throw new Error(`error ${n}, ${i}`);
    }).should.be.rejectedWith('error 10, 0');
  });

});


describe('mapSeries', () => {

  it('should map the array to the resolved value of calling the function with each item', () => {
    return pf.mapSeries([1, 2, 3], n => Promise.resolve(n * 2)).should.eventually.eql([2, 4, 6]);
  });

  it('should map the array in series', () => {
    const history = [];
    return pf.mapSeries([10, 20, 30], (...args) => {
      const joined_args = args.join(', ');
      history.push(`map ${joined_args}`);
      return new Promise(resolve => {
        setImmediate(() => {
          history.push(`resolve ${joined_args}`);
          resolve();
        });
      });
    }).then(() => {
      history.should.eql([
        'map 10, 0',
        'resolve 10, 0',
        'map 20, 1',
        'resolve 20, 1',
        'map 30, 2',
        'resolve 30, 2'
      ]);
    });
  });

  it('should not require the function to return a promise', () => {
    return pf.mapSeries([10, 20, 30], n => n * 2).should.eventually.eql([20, 40, 60]);
  });

  it('should reject if the function throws an error', () => {
    return pf.mapSeries([10, 20, 30], (n, i) => {
      throw new Error(`error ${n}, ${i}`);
    }).should.be.rejectedWith('error 10, 0');
  });

});


describe('filter', () => {

  it('should filter the array based on the async response from the function', function() {
    const array = ['a', 'b', 'c'];
    return pf.filter(array, value => {
      return Promise.resolve(value !== 'b');
    }).should.eventually.eql(['a', 'c']);
  });

  it('should pass both value and index', function() {
    const array = ['a', 'b', 'c'];
    return pf.filter(array, (value, index) => {
      return Promise.resolve(index !== 1);
    }).should.eventually.eql(['a', 'c']);
  });

  it('should work with sync return', function() {
    const array = ['a', 'b', 'c'];
    return pf.filter(array, value => value !== 'b').should.eventually.eql(['a', 'c']);
  });

  it('should reject if the closure rejects', function() {
    const array = ['a', 'b', 'c'];
    return pf.filter(array, () => Promise.reject(new Error('test'))).should.be.rejectedWith('test');
  });

  it('should reject if the closure throws', function() {
    const array = ['a', 'b', 'c'];
    return pf.filter(array, () => {
      throw new Error('test');
    }).should.be.rejectedWith('test');
  });

});


describe('filterSeries', () => {

  it('should filter the array based on the async response from the function', function() {
    const array = ['a', 'b', 'c'];
    return pf.filterSeries(array, value => {
      return Promise.resolve(value !== 'b');
    }).should.eventually.eql(['a', 'c']);
  });

  it('should pass both value and index', function() {
    const array = ['a', 'b', 'c'];
    return pf.filterSeries(array, (value, index) => {
      return Promise.resolve(index !== 1);
    }).should.eventually.eql(['a', 'c']);
  });

  it('should work with sync return', function() {
    const array = ['a', 'b', 'c'];
    return pf.filterSeries(array, value => value !== 'b').should.eventually.eql(['a', 'c']);
  });

  it('should reject if the closure rejects', function() {
    const array = ['a', 'b', 'c'];
    return pf.filterSeries(array, () => Promise.reject(new Error('test'))).should.be.rejectedWith('test');
  });

  it('should reject if the closure throws', function() {
    const array = ['a', 'b', 'c'];
    return pf.filterSeries(array, () => {
      throw new Error('test');
    }).should.be.rejectedWith('test');
  });

});


describe('entangledCallback', () => {

  describe('without a value resolver', () => {
    let promise;
    let callback;

    beforeEach(() => {
      [promise, callback] = pf.entangledCallback();
    });

    describe('when callback is invoked without any args', () => {

      it('should resolve with undefined', () => {
        setImmediate(callback);
        return promise.should.eventually.equal(undefined);
      });

    });

    describe('when callback is invoked with a single value', () => {

      it('should resolve with the value', () => {
        setImmediate(callback, null, 'value');
        return promise.should.eventually.equal('value');
      });

    });

    describe('when callback is invoked with multiple values', () => {

      it('should resolve with the first value', () => {
        setImmediate(callback, null, 'a', 'b', 'c');
        return promise.should.eventually.equal('a');
      });

    });

    describe('when callback is invoked with an error', () => {

      it('should reject with the error', () => {
        setImmediate(callback, new Error('test error'));
        return promise.should.be.rejectedWith('test error');
      });

    });

    describe('when callback is invoked with an error and values', () => {

      it('should ignore the values and reject with the error', () => {
        setImmediate(callback, new Error('test error'), 'a', 'b', 'c');
        return promise.should.be.rejectedWith('test error');
      });

    });

  });

  describe('with a value resolver', () => {
    let promise;
    let callback;

    beforeEach(() => {
      [promise, callback] = pf.entangledCallback((...args) => `(${args.join(', ')})`);
    });

    describe('when callback is invoked without any args', () => {

      it('should resolve with undefined', () => {
        setImmediate(callback);
        return promise.should.eventually.equal('()');
      });

    });

    describe('when callback is invoked with a single value', () => {

      it('should resolve with the value returned by the value resolver', () => {
        setImmediate(callback, null, 'value');
        return promise.should.eventually.equal('(value)');
      });

    });

    describe('when callback is invoked with multiple values', () => {

      it('should resolve with the value returned by the value resolver', () => {
        setImmediate(callback, null, 'a', 'b', 'c');
        return promise.should.eventually.equal('(a, b, c)');
      });

    });

    describe('when callback is invoked with an error', () => {

      it('should reject with the error', () => {
        setImmediate(callback, new Error('test error'));
        return promise.should.be.rejectedWith('test error');
      });

    });

    describe('when callback is invoked with an error and values', () => {

      it('should ignore the values and reject with the error', () => {
        setImmediate(callback, new Error('test error'), 'a', 'b', 'c');
        return promise.should.be.rejectedWith('test error');
      });

    });

  });

});
