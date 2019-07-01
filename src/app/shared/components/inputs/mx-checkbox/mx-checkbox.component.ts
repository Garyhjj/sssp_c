import { CacheService } from './../../../../core/services/cache.service';
import { AuthService } from './../../../../core/services/auth.service';
import { DataDriveService } from './../../data-drive/core/services/data-drive.service';
import { Component, OnInit, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MxSelectComponent } from '../mx-select/mx-select.component';
import { isArray } from '../../../utils';

@Component({
  selector: 'app-mx-checkbox',
  templateUrl: './mx-checkbox.component.html',
  styleUrls: ['./mx-checkbox.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MxCheckboxComponent),
      multi: true,
    },
  ],
})
export class MxCheckboxComponent extends MxSelectComponent implements OnInit {
  _value = [];
  first = true;
  _options = [];
  @Input()
  set options(os) {
    if (isArray(os)) {
      this._options = os;
    }
  }
  @Input() myPlaceHolder;
  @Input() lazyAPI: string;
  @Input() lazyParams: string[];
  @Input() lazyAPIUserMes;
  _pickerFormat = 'string';
  @Input()
  set pickerFormat(v: string) {
    if (['string', 'array'].indexOf(v) > -1) {
      this._pickerFormat = v;
    }
  }
  propagateChange = (_: any) => {};

  constructor(
    dataDriveService: DataDriveService,
    auth: AuthService,
    cache: CacheService,
  ) {
    super(dataDriveService, auth, cache);
  }

  /**
   * 给外部formControl写入数据
   *
   * @param {*} value
   */
  writeValue(value: any) {
    if (value !== void 0) {
      if (typeof value === 'string') {
        if (this._pickerFormat === 'string') {
          if (value) {
            this._value = value.split(',');
          } else {
            this._value = [];
          }
        } else {
          this._value = [value];
        }
      } else if (typeof value === 'number') {
        this._value = [value];
      } else if (Object.prototype.toString.call(value) === '[object Array]') {
        this._value = value;
      }
    }
    if (value === null) {
      this._value = [];
    }
    if (this._value.length > 0) {
      setTimeout(() => this.change(), 50);
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

  change() {
    let out;
    this._value = this._value.filter(v => v);
    if (this._pickerFormat === 'string') {
      out = this._value.join(',');
    } else {
      out = this._value;
    }
    if (this.first) {
      if (out.length !== 0) {
        this.propagateChange(out);
      }
    } else {
      this.propagateChange(out);
    }
    this.first = false;
  }

  ngOnInit() {
    this.lazyLoad();
  }
}
