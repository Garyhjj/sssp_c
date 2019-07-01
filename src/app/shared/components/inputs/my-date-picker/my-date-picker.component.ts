import { filter } from 'rxjs/operators';
import { Component, OnInit, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import * as moment from 'moment';
import { isArray } from '../../../utils';

@Component({
  selector: 'app-my-date-picker',
  templateUrl: './my-date-picker.component.html',
  styleUrls: ['./my-date-picker.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MyDatePickerComponent),
      multi: true,
    },
  ],
})
export class MyDatePickerComponent implements OnInit {
  @Input() myPickerFormat = 'YYYY-MM-DD';
  @Input() myShowTime: string | boolean = false;
  _myFormat = 'yyyy-MM-dd';
  @Input()
  set myFormat(n) {
    if (typeof n === 'string') {
      let n1 = n.replace(/Y/g, 'y');
      n1 = n1.replace(/D/g, 'd');
      this._myFormat = n;
    }
  }
  @Input() myPlaceHolder = '請選擇時間';
  @Input() myMode = 'day';
  _date: any = null;
  dataString: string;
  private propagateChange = (_: string) => {};
  constructor() {}

  ngOnInit() {}

  /**
   * 给外部formControl写入数据
   *
   * @param {*} value
   */
  writeValue(value: any) {
    if (value) {
      if (this.myMode === 'range') {
        if (isArray(value)) {
          this._date = value
            .map(v => {
              const m = moment(v);
              if (m.isValid()) {
                return m.toDate();
              } else {
                return null;
              }
            })
            .filter(v => !!v);
        }
      } else {
        const date = new Date(value);
        if (date.toString() !== 'Invalid Date') {
          this.dataString = value;
          this._date = date;
        } else {
          this._date = null;
          setTimeout(() => this.change(null), 20);
        }
      }
    } else {
      if (this._date) {
        this._date = null;
        setTimeout(() => this.change(null), 20);
      }
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

  /**
   * 内部更改例子
   * @param {*} fn
   */
  change(value: any) {
    if (this.myMode === 'range' && isArray(value)) {
      this.dataString = value
        .map(v => moment(v).format(this.myPickerFormat))
        .join(',');
    } else {
      this.dataString = value ? moment(value).format(this.myPickerFormat) : '';
    }
    this.propagateChange(this.dataString); // 去触发外部监控的函数
  }
}
