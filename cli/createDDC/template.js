const path = require('path'),
  {
    TSFactory
  } = require('../util');
const htmlPre = `<app-data-drive`;
const htmlEnd = `</app-data-drive>`;
let f = `[name]="'XXXX'"  [headerCellStyle]="headerSetStyle" [bodyCellStyle]="bodySetStyle"`;

const headerCellStyleFn = 'headerCellStyle',
  bodyCellStyleFn = `bodyCellStyle`,
  moreActionFn = `moreAction`;

function getHTML({
  dName,
  hStyle,
  bStyle,
  actionRef,
  tableCellRef,
  headerCellRef
}) {
  let middle = ` [name]="'${dName?dName:'XXX'}'" (dataDriveInit)="getDataDrive($event)"`;
  middle += hStyle ? ` [headerCellStyle]="${headerCellStyleFn}"` : '';
  middle += bStyle ? ` [bodyCellStyle]="${bodyCellStyleFn}"` : '';

  let content = '';
  content += actionRef ? `
  <ng-template #actionRef let-data="data">
    <span>
        <a (click)="${moreActionFn}(data)">moreAction</a>
    </span>
  </ng-template>
` : '';
  content += tableCellRef ? `
<ng-template #tableCellRef let-data="data" let-property="property">
    
  </ng-template>
` : '';
  content += headerCellRef ? `
<ng-template #headerCellRef let-col > /* html */ </ng-template>
` : '';
  return htmlPre + middle + '>' + content + htmlEnd;
}

class DDCTSFactory extends TSFactory {
  constructor(params) {
    super(params);
  }

  init() {
    this._hStyleAttr = `  ${headerCellStyleFn} = (c: TableDataColumn) => {
    return {
      color: 'red'
    };
  };`
    this._bStyleAttr = `  ${bodyCellStyleFn} = (
    data: any /* 所在行的数据 */,
    property: string /* 栏位位 */,
  ) => {
    return {
      color: 'red'
    };
  };`
    this._moreActionFn = `  ${moreActionFn}(data) {
    console.log(data);
  }`
    const params = this.params;
    this.name = params.name;
    const subPath = params.subPath ? params.subPath : '';
    const filePath = `./src/app/${subPath}/`;
    this.filePath = filePath + this.name;
    this.addDependency('DataDrive', './src/app/shared/components/data-drive/shared/models');
    if (params.hStyle) {
      this.addDependency('TableDataColumn', './src/app/shared/components/data-drive/shared/models/table-data/');
      this.addAttrList(this._hStyleAttr);
    };
    if (params.bStyle) {
      this.addAttrList(this._bStyleAttr);
    }
  }
  getTemplate() {
    const filePath = this.filePath;
    const name = this.name;
    let classNamePre = name.split('-').map((str) => str.substring(0, 1).toUpperCase() + str.substring(1)).join('');
    const devTpl = this.generateDependencies(),
      attrTpl = this.generateAttrs();
    return `import { Component, OnInit } from '@angular/core';
${devTpl}
@Component({
  selector: 'app-${name}',
  templateUrl: './${name}.component.html',
  styleUrls: ['./${name}.component.css'],
})
export class ${classNamePre}Component implements OnInit {
${attrTpl}
  constructor() {}

  ngOnInit() {}

  getDataDrive(d: DataDrive) {}

${this.params.actionRef? this._moreActionFn + '\r\n': ''}
}
`
  }
}

function getTS(params) {
  return new DDCTSFactory(params).getTemplate();
}

function getTemplates(params) {
  return {
    HTML: getHTML(params),
    ts: getTS(params)
  }
}
module.exports = getTemplates;
