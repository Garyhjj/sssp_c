import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { toBoolean } from '@delon/util';

@Component({
  selector: 'app-dynamic-input',
  templateUrl: './dynamic-input.component.html',
  styleUrls: ['./dynamic-input.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicInputComponent),
      multi: true,
    },
  ],
})
export class DynamicInputComponent implements OnInit {
  _value;
  @Input() inputOptions;
  _isReadonly: boolean;
  @Input()
  set isReadonly(r: boolean) {
    this._isReadonly = toBoolean(r);
  }
  readonlyStyle = {['background-color']: '#eee',opacity: '0.5'}
  private propagateChange = (_: any) => {};
  constructor() { }
  /**
   * 给外部formControl写入数据
   *
   * @param {*} value
   */
  writeValue(value: any) {
      this._value = value;
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

  change() {
    this.propagateChange(this._value);
  }
  ngOnInit() {
  }

}
