'use strict';

suite('pipe-core', function() {

  setup(function() {
    this.sinon = sinon.sandbox.create();
  });

  teardown(function() {
    this.sinon.restore();
  });

  suite('Worker', function() {
    var pipe;

    setup(function() {
      pipe = new Pipe({src: '/base/test/worker.js'});
    });

    teardown(function() {
       pipe.terminate();
    });

    test('request data', function(done) {
      pipe.request('getAll').then(results => {
        assert.equal(results.length, 3);
        done();
      });
    });
  });

  suite('SharedWorker', function() {
    var pipe;

    setup(function() {
      pipe = new Pipe({
        src: '/base/test/worker.js',
        overrides: {
          '/base/test/worker.js': {
            WorkerClass: SharedWorker
          }
        }
      });
    });

    teardown(function() {
      pipe.terminate();
    });

    test('request data', function(done) {
      done();
    });
  });
});