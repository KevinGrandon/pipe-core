importScripts('/base/pipe.js');

var pipe = new Pipe();

pipe.debug('got service worker');

var allRecords = [
  {id: 1},
  {id: 2},
  {id: 3}
];

pipe.handle('getAll', () => {
  return new Promise(resolve => {
    resolve(allRecords);
  });
});

pipe.request('fromSW');

self.addEventListener('install', e => {
  pipe.debug('install');
  //e.waitUntil(install(e));
});

self.addEventListener('activate', e => {
  pipe.debug('activated');
});

self.addEventListener('fetch', e => {
  pipe.debug('fetch ' + e.request.url);
});
