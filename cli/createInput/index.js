const fs = require('fs'),
  path = require('path'),
  template = require('./template');


module.exports = (cli) => {
  const defaultCommand = cli.command('createInput', {
    desc: '新建angular的form的组件'
  }, (input, flags) => {
    let subPath = flags.subPath || '';
    const prePath = `./src/app/${subPath}`;
    if (flags.name) {
      let name = flags.name;
      filePath = path.join(prePath, `${name}`);
      fs.mkdir(filePath, (err) => {
        if (err) {
          console.error(err);
        } else {
          const tpls = template(flags);
          let htmlPath = path.join(filePath, `${name}.component.html`);
          fs.writeFile(htmlPath, tpls.HTML, (err) => {
            if (err) {
              console.error('command failed:', err);
            } else {
              console.log('Finished:', htmlPath);
            }
          });
          let cssPath = path.join(filePath, `${name}.component.css`);
          fs.writeFile(cssPath, '', (err) => {
            if (err) {
              console.error('command failed:', err);
            } else {
              console.log('Finished:', cssPath);
            }
          });

          let tsPath = path.join(filePath, `${name}.component.ts`);
          fs.writeFile(tsPath, tpls.ts, (err) => {
            if (err) {
              console.error('command failed:', err);
            } else {
              console.log('Finished:', tsPath);
            }
          });
        }
      })
    }
  });

  defaultCommand.option('name', {
    desc: 'tell me the component name'
  });

}
