[![Build Status](https://travis-ci.org/KevinGrandon/pipe-core.svg?branch=master)](https://travis-ci.org/KevinGrandon/pipe-core)

# pipe-core

Pipe is a framework for creating fast and responsive HTML5 applications. It enables you to build an architecture which offloads work to Workers and SharedWorkers, and communicate easily between them.

## Get the code
```
bower install KevinGrandon/pipe.js
```

## Example Usage

**Include pipe.js in your page**

```
<script defer src="/bower_components/pipe-core/pipe.js"></script>
```

**Requesting data**

```js
var pipe = new Pipe({src: '/myworker.js'});
pipe.request('myEventFetchSomeData').then(results => {
  results.forEach(result => {
    // Do something with the result.
  });
});

```

**Listening for data, from a worker**

```js
importScripts('/bower_components/pipe-core/pipe.js');

var pipe = new Pipe();

pipe.handle('myEventFetchSomeData', () => {
  return new Promise(resolve => {
    resolve([/* ... */]);
  });
});

```

**Multiple Workers**

You can setup a pipe to communicate to multiple workers by passing an array of srcs into the constructor.

```js
var pipe = new Pipe({src: [
    '/first_worker.js'
    '/second_worker.js'
]});
pipe.request('fetchFromOneWorker').then(results => {
  results.forEach(result => {
    // Do something with the result.
  });
});

```

**Overriding Worker Types**

You can override the worker types via configuration. For now this is how you would specify a SharedWorker.

```js
var overrides = {
  '/second_worker.js': {
    WorkerClass: SharedWorker
  }
};

var pipe = new Pipe({src: [
    '/first_worker.js'
    '/second_worker.js'
],
overrides: overrides});
```
