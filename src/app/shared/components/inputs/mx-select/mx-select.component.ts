import { CacheService } from './../../../../core/services/cache.service';
import { isArray, sortUtils } from './../../../utils/index';
import { Component, OnInit, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DataDriveService } from '../../data-drive/core/services/data-drive.service';
import { AuthService } from '../../../../core/services/auth.service';
import { shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-mx-select',
  templateUrl: './mx-select.component.html',
  styleUrls: ['./mx-select.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MxSelectComponent),
      multi: true,
    },
  ],
})
export class MxSelectComponent implements OnInit {
  _value = [];
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

  propagateChange = (_: any) => {};
  constructor(
    private dataDriveService: DataDriveService,
    private auth: AuthService,
    private cache: CacheService,
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
    this.lazyLoad();
  }

  lazyLoad() {
    if (this.lazyAPI) {
      const lazyAPIUserMes = this.lazyAPIUserMes;
      if (typeof lazyAPIUserMes === 'object') {
        const user = this.auth.user;
        // tslint:disable-next-line:forin
        for (let prop in lazyAPIUserMes) {
          const replaceMes = user[lazyAPIUserMes[prop]];
          this.lazyAPI = this.lazyAPI.replace(
            `{${prop}}`,
            replaceMes ? replaceMes : '',
          );
        }
      }
      const cacheName = 'mxSelectLazy';
      let cache = this.cache.get(cacheName, this.lazyAPI, false);
      if (!cache) {
        cache = this.dataDriveService
          .lazyLoad(this.lazyAPI)
          .pipe(shareReplay());
        this.cache.update(cacheName, this.lazyAPI, cache, 2 * 1000);
      }
      cache.subscribe((r: any[]) => {
        if (isArray(r)) {
          const options = r
            .filter(f => f)
            .map(d => {
              if (isArray(d)) {
                if (d.length === 1) {
                  return { property: d[0], value: d[0] };
                } else if (d.length > 1) {
                  return { property: d[0], value: d[1] };
                }
              } else if (typeof d === 'object') {
                const params = this.lazyParams;
                const keys =
                  isArray(params) && params.length > 0
                    ? params
                    : Object.keys(d);
                if (keys.length === 1) {
                  return { property: d[keys[0]], value: d[keys[0]] };
                } else if (keys.length > 1) {
                  return { property: d[keys[0]], value: d[keys[1]] };
                }
              }
            })
            .sort((a, b) => sortUtils.byCharCode(a.value, b.value));
          this._options.length = 0;
          this._options.push(...options);
        }
      });
    }
  }
}
