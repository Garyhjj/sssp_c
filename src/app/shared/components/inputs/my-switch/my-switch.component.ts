import { Component, OnInit, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-my-switch',
  templateUrl: './my-switch.component.html',
  styleUrls: ['./my-switch.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MySwitchComponent),
      multi: true,
    },
  ],
})
export class MySwitchComponent implements OnInit {
  _value: boolean;
  @Input() myTrueFormat: string | number = 'Y';
  @Input() myFalseFormat: string | number = 'N';
  private propagateChange = (_: any) => {};

  constructor() {}

  ngOnInit() {}

  /**
   * 给外部formControl写入数据
   *
   * @param {*} value
   */
  writeValue(value: string | number) {
    if (value === this.myTrueFormat) {
      this._value = true;
    } else {
      this._value = false;
      setTimeout(() => this.change(this._value), 50);
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
  registerOnTouched(fn: any) {}

  change(value) {
    let out: any;
    if (value) {
      out = this.myTrueFormat === void 0 ? true : this.myTrueFormat;
    } else {
      out = this.myFalseFormat === void 0 ? false : this.myFalseFormat;
    }
    this.propagateChange(out);
  }
}
