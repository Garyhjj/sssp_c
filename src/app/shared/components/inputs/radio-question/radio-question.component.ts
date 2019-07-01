import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-radio-question',
  templateUrl: './radio-question.component.html',
  styleUrls: ['./radio-question.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioQuestionComponent),
      multi: true,
    },
  ],
})
export class RadioQuestionComponent implements OnInit {
  @Input() radios = [];

  @Input() title;
  @Input() fontSize = '1.6rem';
  @Input() titlePrefix = '';
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
  radioValue;
  yourAnswerString;
  private propagateChange = (_: any) => {};

  constructor() {}

  /**
   * 给外部formControl写入数据
   *
   * @param {*} value
   */
  writeValue(value: string) {
    if (value) {
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
        this.radioValue = result.trueAnswer;
      }
      if (result.hasOwnProperty('yourAnswer')) {
        const yourAnswer = this.radios.filter(r => r[0] === result.yourAnswer);
        this.yourAnswerString = yourAnswer.length > 0 ? yourAnswer[0][0] : '空';
      }
    }
  }
}
