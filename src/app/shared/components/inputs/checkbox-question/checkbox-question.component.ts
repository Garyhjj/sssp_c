import { Component, OnInit, Input, ViewChild, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-checkbox-question',
  templateUrl: './checkbox-question.component.html',
  styleUrls: ['./checkbox-question.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxQuestionComponent),
      multi: true,
    },
  ],
})
export class CheckboxQuestionComponent implements OnInit {
  @Input()
  checkOptions: { label: string; value: string; checked: boolean }[] = [];
  @Input() title = '';
  @Input() fontSize = '1.6rem';
  @Input() titlePrefix = '';
  @ViewChild('checkbox') checkbox: any;
  _result;
  yourAnswerString = '';
  private propagateChange = (_: any) => {};

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

  constructor() {}

  /**
   * 给外部formControl写入数据
   *
   * @param {*} value
   */
  writeValue(value: any) {
    if (Object.prototype.toString.call(value) === '[object Array]') {
      this.checkOptions = value;
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

  updateSingleChecked() {
    this.propagateChange(
      this.checkOptions
        .filter(c => c.checked)
        .map(a => a.value)
        .join(','),
    );
  }

  ngOnInit() {}

  checkResult() {
    const result = this.result;
    if (result) {
      if (result.hasOwnProperty('trueAnswer')) {
        const trueAnswer: string[] = result.trueAnswer
          ? result.trueAnswer.split(',')
          : [];
        let yourAnswer = [];
        if (result.hasOwnProperty('yourAnswer')) {
          yourAnswer = result.yourAnswer ? result.yourAnswer.split(',') : [];
          this.yourAnswerString = '';
        }
        this.checkOptions = this.checkOptions.map(c => {
          if (trueAnswer.indexOf(c.value) > -1) {
            c.checked = true;
          } else {
            c.checked = false;
          }
          if (yourAnswer.indexOf(c.value) > -1) {
            this.yourAnswerString += this.yourAnswerString
              ? '; ' + c.value
              : c.value;
          }
          return c;
        });
      }
    }
  }

  isTrueAnswer() {
    const result = this.result;
    if (result) {
      if (result.hasOwnProperty('trueAnswer')) {
        const trueAnswer: string[] = result.trueAnswer
          ? result.trueAnswer.split(',')
          : [];
        let yourAnswer = [];
        if (result.hasOwnProperty('yourAnswer')) {
          yourAnswer = result.yourAnswer ? result.yourAnswer.split(',') : [];
        }
        if (yourAnswer.length === trueAnswer.length) {
          if (
            new Set([...trueAnswer, ...yourAnswer]).size === trueAnswer.length
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
