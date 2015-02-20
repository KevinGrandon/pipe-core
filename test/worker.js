importScripts('/node_modules/pipe-core/pipe.js');

var allRecords = [
  {id: 1},
  {id: 2},
  {id: 3}
];

var pipe = new Pipe();

pipe.handle('getAll', () => {
  return new Promise(resolve => {
    resolve(allRecords);
  });
});
