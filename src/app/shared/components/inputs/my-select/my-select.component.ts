import { isArray } from './../../../utils/index';
import {
  Component,
  OnInit,
  forwardRef,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DataDriveService } from '../../data-drive/core/services/data-drive.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-my-select',
  templateUrl: './my-select.component.html',
  styleUrls: ['./my-select.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MySelectComponent),
      multi: true,
    },
  ],
})
export class MySelectComponent implements OnInit {
  @Output() emitSelectList = new EventEmitter();
  @Input()
  set options(os) {
    if (isArray(os)) {
      this._options = os;
    }
  }
  @Input() myPlaceHolder: string;
  @Input() lazyAPI: string;
  @Input() lazyParams: string[];
  @Input() lazyAPIUserMes;
  @Input() label: string;

  // @Input() allOptions;
  // myPlaceHolder;
  // lazyAPI: string;
  // lazyParams: string[];
  // lazyAPIUserMes;

  _value = [];
  _options = [];
  private propagateChange = (_: any) => {};

  constructor(
    private dataDriveService: DataDriveService,
    private auth: AuthService,
  ) {}

  /**
   * 给外部formControl写入数据
   *
   * @param {*} value
   */
  writeValue(value: any) {
    if (value !== void 0) {
      this._value = value;
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
    this.propagateChange(this._value);
  }

  ngOnInit() {
    if (this.lazyAPI) {
      this.lazyLoad();
    } else {
      this.emitSelectList.emit({
        label: this.label,
        values: this._options,
      });
    }
  }

  lazyLoad() {
    if (this.lazyAPI) {
      const lazyAPIUserMes = this.lazyAPIUserMes;
      if (typeof lazyAPIUserMes === 'object') {
        const user = this.auth.user;

        for (const prop in lazyAPIUserMes) {
          if (lazyAPIUserMes.hasOwnProperty(prop)) {
            const replaceMes = user[lazyAPIUserMes[prop]];
            this.lazyAPI = this.lazyAPI.replace(
              `{${prop}}`,
              replaceMes ? replaceMes : '',
            );
          }
        }

        // for (let prop in lazyAPIUserMes) {
        //   const replaceMes = user[lazyAPIUserMes[prop]]
        //   this.lazyAPI = this.lazyAPI.replace(`{${prop}}`, replaceMes ? replaceMes : '');
        // }
      }
      this.dataDriveService.lazyLoad(this.lazyAPI).subscribe((r: any[]) => {
        if (isArray(r)) {
          this._options = r.filter(f => f).map(d => {
            if (isArray(d)) {
              if (d.length === 1) {
                return { property: d[0], value: d[0] };
              } else if (d.length > 1) {
                return { property: d[0], value: d[1] };
              }
            } else if (typeof d === 'object') {
              const params = this.lazyParams;
              const keys =
                isArray(params) && params.length > 0 ? params : Object.keys(d);
              if (keys.length === 1) {
                return { property: d[keys[0]], value: d[keys[0]] };
              } else if (keys.length > 1) {
                return { property: d[keys[0]], value: d[keys[1]] };
              }
            }
          });
          this.emitSelectList.emit({
            label: this.label,
            values: this._options,
          });
        }
      });
    }
  }
}
