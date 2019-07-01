var express = require('express');
var compression = require('compression');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var exec = require('child_process').exec;

app.use(bodyParser.json());
app.use(compression());
app.use(express.static('dist'));

if (!(process.env.NODE_ENV && process.env.NODE_ENV.trim() === 'production')) {
  const safeCommands = [
    'npm run update',
    'npm run serve',
    'npm run reServe',
    'npm run update:dev',
    'npm run serve:dev',
    'npm run reServe:dev',
    'npm run build',
    'pm2 list',
    'git checkout -- .',
    'pm2 delete mitacEnd',
    'pm2 retart mitacEnd',
    'npm rebuild',
    'git pull'
  ];
  app.post('/utils/commands', function (req, res) {
    const body = req.body;
    const user = body.user;
    const password = body.password;
    if (user === 'mitacoa' && password === 'MSL2018!') {
      if (typeof body.command === 'string' && body.command) {
        const command = body.command;
        const testCommand = command => {
          return safeCommands.indexOf(command) > -1;
          // const ls = command.split('&&');
          // let valid = true;
          // for (let i = 0, lg = ls.length; i < lg; i++) {
          //   const l = ls[i].trim();
          //   const first = l.split(' ')[0];
          //   if (['npm', 'git', 'pm2'].indexOf(first) < 0) {
          //     valid = false;
          //     break;
          //   }
          // }
          // return valid;
        };
        if (testCommand(command)) {
          exec(command, function (err, stdout, stderr) {
            if (err) {
              res.status(400);
              res.end(err.stack);
            } else {
              res.end(stdout);
            }
          });
        } else {
          res.status(400);
          res.end('无效命令');
        }
      } else {
        res.status(400);
        res.end('无效命令');
      }
    } else {
      res.status(403);
      res.end('未授权');
    }
  });
}

app.use(function (req, res, next) {
  fs.readFile(path.join(__dirname, 'dist/index.html'), function (err, data) {
    res.end(data);
  });
});

const port =
  process.env.NODE_ENV && process.env.NODE_ENV.trim() === 'production' ?
  8090 :
  8090;
app.listen(port, function () {
  console.log('production on port ' + port);
});
