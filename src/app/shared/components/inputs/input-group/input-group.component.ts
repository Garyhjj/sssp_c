import { isArray } from './../../../utils/index';
import { Component, OnInit, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input-group',
  templateUrl: './input-group.component.html',
  styleUrls: ['./input-group.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputGroupComponent),
      multi: true,
    },
  ],
})
export class InputGroupComponent implements OnInit {
  @Input() afterInputSet;
  @Input() mainInputSet;
  mainValue;
  afterValue;
  addOnBeforeTemplate;
  private propagateChange = (_: any) => { };

  constructor() { }

  ngOnInit() { }

  /**
   * 给外部formControl写入数据
   *
   * @param {*} value
   */
  writeValue(value: any) {
    if (isArray(value)) {
      this.mainValue = value[0];
      this.afterValue = value[1];
    } else {
      this.mainValue = '';
      this.afterValue = '';
    }
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
  registerOnTouched(fn: any) { }

  change() {
    this.propagateChange([this.mainValue, this.afterValue]);
  }
}
