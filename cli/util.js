const path = require('path');
class TSFactory {
  constructor(params) {
    this.params = params;
    this.init();
  }

  init() {}

  addAttrList(att) {
    this.attrList = this.attrList || [];
    this.attrList.push(att);
  }

  generateAttrs() {
    let tpl = '';
    if (this.attrList) {
      this.attrList.forEach(a => {
        tpl += tpl ? '\r\n' + a : a;
      })
    }
    return tpl;
  }

  addDependency(name, site) {
    this.dependencies = this.dependencies || [];
    const relatePath = path.relative(this.filePath, site).replace(/\\/g, '/');
    this.dependencies[relatePath] = this.dependencies[relatePath] || [];
    this.dependencies[relatePath].push(name);
  }

  generateDependencies() {
    let tpl = '';
    if (this.dependencies) {
      const des = this.dependencies;
      for (let prop in des) {
        if (des.hasOwnProperty(prop) && Array(des[prop])) {
          const t = `import { ${des[prop].join(', ')} } from '${prop}';`;
          tpl += t + '\r\n';
        }
      }
    }
    return tpl;
  }

  getTemplate() {}
}

module.exports = {
  TSFactory
}
