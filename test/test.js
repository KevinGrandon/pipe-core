'use strict';

suite('pipe-core', function() {

  setup(function() {
    this.sinon = sinon.sandbox.create();
  });

  teardown(function() {
    this.sinon.restore();
  });

  suite('validates context', function() {
    setup(function() {
    });

    teardown(function() {
      
    });

    test('valid context', function(done) {
      done();
    });

    test('invalid context', function(done) {
      done();
    });
  });

  suite('validates params', function() {
    setup(function() {
    });

    teardown(function() {
    });

    test('invalid params', function(done) {
      done();
    });

    test('valid params', function(done) {
      done();
    });
  });
});