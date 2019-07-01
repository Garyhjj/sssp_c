const path = require('path'),
  {
    TSFactory
  } = require('../util');

function getHTML() {
  return '';
}

class InputTSFactory extends TSFactory {
  constructor(params) {
    super(params);
  }

  init() {
    this.name = this.params.name;
  }
  getTemplate() {
    const name = this.name;
    let classNamePre = name.split('-').map((str) => str.substring(0, 1).toUpperCase() + str.substring(1)).join('');
    return `import { Component, OnInit, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-${name}',
  templateUrl: './${name}.component.html',
  styleUrls: ['./${name}.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ${classNamePre}Component),
      multi: true,
    },
  ],
})
export class ${classNamePre}Component implements OnInit {

  private propagateChange = (_: any) => {};

  constructor() {}

  ngOnInit() {}

  /**
   * 给外部formControl写入数据
   *
   * @param {*} value
   */
  writeValue(value: string) {
  }

  /**
   * 把外面登记的监测change的函数赋值给this.propagateChange
   * 当内部数据改变时,可使用this.propagateChange(this.imgs)去触发传递出去
   * @param {*} fn
   */
  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  /**
   * 也是一样注册,当 touched 然后调用
   * @param {*} fn
   */
  registerOnTouched(fn: any) {}

}

`
  }
}

function getTS(params) {
  return new InputTSFactory(params).getTemplate();
}

function getTemplates(params) {
  return {
    HTML: getHTML(params),
    ts: getTS(params)
  }
}
module.exports = getTemplates;
