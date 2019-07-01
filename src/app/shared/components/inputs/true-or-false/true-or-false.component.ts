import { Component, OnInit, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-true-or-false',
  templateUrl: './true-or-false.component.html',
  styleUrls: ['./true-or-false.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TrueOrFalseComponent),
      multi: true,
    },
  ],
})
export class TrueOrFalseComponent implements OnInit {
  radioValue = '';
  _myTrueFormat: string | number = 'Y';
  @Input()
  set myTrueFormat(_: string | number) {
    if (_ !== void 0 && _ !== null) {
      this._myTrueFormat = _;
    }
  }
  _myFalseFormat: string | number = 'N';
  @Input()
  set myFalseFormat(_: string | number) {
    if (_ !== void 0 && _ !== null) {
      this._myFalseFormat = _;
    }
  }

  @Input() fontSize = '1.6rem';
  _result;

  @Input()
  set result(r: { trueAnswer: any; yourAnswer: any }) {
    if (typeof r === 'object') {
      this._result = r;
      this.checkResult();
    }
  }
  get result() {
    return this._result;
  }

  @Input() titlePrefix = '';

  @Input() question;
  private propagateChange = (_: any) => {};

  constructor() {}

  /**
   * 给外部formControl写入数据
   *
   * @param {*} value
   */
  writeValue(value: string) {
    if ([this._myFalseFormat, this._myTrueFormat].indexOf(value) > -1) {
      this.radioValue = value;
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

  change(val) {
    this.propagateChange(val);
  }

  ngOnInit() {}

  checkResult() {
    const result = this.result;
    if (result) {
      if (result.hasOwnProperty('trueAnswer')) {
        if (
          [this._myFalseFormat, this._myTrueFormat].indexOf(result.trueAnswer) >
          -1
        ) {
          this.radioValue = result.trueAnswer;
        }
      }
    }
  }
}
