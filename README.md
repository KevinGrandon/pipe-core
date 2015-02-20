# pipe-core

Pipe is a framework for creating fast and responsive HTML5 applications. It enables you to build an architecture which offloads work to Workers and SharedWorkers, and communicate easily between them.

## Get the code
```
bower install KevinGrandon/pipe.js
```

## Example Usage

*Include pipe.js in your page*
```
<script defer src="/bower_components/pipe-core/pipe.js"></script>
```

*Requesting data*
```js
var pipe = new Pipe({src: '/myworker.js'});
pipe.request('myEventFetchSomeData').then(results => {
  results.forEach(result => {
    // Do something with the result.
  });
});

```

*Listening for data, from a worker*
```js
importScripts('/bower_components/pipe-core/pipe.js');

var pipe = new Pipe();

pipe.handle('myEventFetchSomeData', () => {
  return new Promise(resolve => {
    resolve([/* ... */]);
  });
});

```
