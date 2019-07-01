import { AuthService } from './../../../../core/services/auth.service';
import { CacheService } from './../../../../core/services/cache.service';
import { DataDriveService } from './../../data-drive/core/services/data-drive.service';
import {
  filter,
  shareReplay,
  debounceTime,
  distinctUntilChanged,
  switchMap,
} from 'rxjs/operators';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { isArray, sortUtils } from './../../../utils/index';
import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-mx-auto-complete',
  templateUrl: './mx-auto-complete.component.html',
  styleUrls: ['./mx-auto-complete.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MxAutoCompleteComponent),
      multi: true,
    },
  ],
})
export class MxAutoCompleteComponent implements OnInit {
  inputValue: string;
  _options: { value: string; property: string }[];
  valueOptions;
  @Input()
  set options(os) {
    if (isArray(os)) {
      this._options = os;
      if (this.isSelection && this.inputValue) {
        this.onChange(this.inputValue);
      }
    }
  }
  @Input() myPlaceHolder;
  @Input() lazyAPI: string;
  @Input() lazyParams: string[];
  @Input() lazyAPIUserMes;
  @Input() isSelection: boolean; // 是否只能限定选项内容

  searchTerms = new Subject<string>();
  mySub: Subscription;

  private propagateChange = (_: any) => {};
  constructor(
    private dataDriveService: DataDriveService,
    private cache: CacheService,
    private auth: AuthService,
  ) {}

  /**
   * 给外部formControl写入数据
   *
   * @param {*} value
   */
  writeValue(value: any) {
    if (value !== void 0) {
      this.inputValue = value;
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

  ngOnInit() {
    this.lazyLoad();
    this.mySub = this.searchTerms
      .asObservable()
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
      )
      .subscribe((value: string) => {
        const MAX = 50;
        if (value) {
          value = value.toLowerCase();
          this.valueOptions = this._options
            .filter(l => l.value.toLowerCase().indexOf(value) > -1)
            .slice(0, MAX)
            .map(l => l.value)
            .sort((a, b) => sortUtils.byCharCode(a, b));
        } else {
          this.valueOptions = this._options
            .slice(0, MAX)
            .sort((a, b) => sortUtils.byCharCode(a, b))
            .map(l => l.value);
        }
      });
  }

  lazyLoad() {
    if (this.lazyAPI) {
      const lazyAPIUserMes = this.lazyAPIUserMes;
      if (typeof lazyAPIUserMes === 'object') {
        const user = this.auth.user;
        // tslint:disable-next-line:forin
        for (const prop in lazyAPIUserMes) {
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
          this.options = options;
        }
      });
    }
  }

  onInput(value: string): void {
    this.searchTerms.next(value);
  }

  onChange(val: string) {
    if (!val) {
      this.propagateChange('');
      return;
    }
    if (this.isSelection) {
      val = val.toLowerCase();
      const tar = this._options.find(l => {
        const v = l.value;
        if (v.toLowerCase() === val) {
          return true;
        }
        return false;
      });
      if (tar) {
        this.propagateChange(tar.value);
      }
    } else {
      this.propagateChange(val);
    }
  }
}
