const cac = require('cac'),
  createDDC = require('./createDDC'),
  createInput = require('./createInput');


const cli = cac();

createDDC(cli);
createInput(cli);

cli.on('error', err => {
  console.error('command failed:', err)
  process.exit(1)
});

cli.parse();

// console.log(process.argv)
