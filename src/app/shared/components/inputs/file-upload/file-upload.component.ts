import { UtilService } from './../../../../core/services/util.service';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { map } from 'rxjs/operators';
// tslint:disable
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnDestroy,
  forwardRef,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UploadFile, NzMessageService } from 'ng-zorro-antd';
import { environment } from '../../../../../environments/environment';
import { Observable, Subscription } from 'rxjs';
import { isArray } from '../../../utils';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true,
    },
  ],
})
export class FileUploadComponent implements OnInit, OnDestroy {
  uploading = false;
  fileList: UploadFile[] = [];
  @Input() postUrl;

  @Input() maxCount = 8;
  @Input() hideUploadButton = false;
  @Input() onSubmit: Observable<any>;
  @Input() uploadFilter: (ls:any) => any;
  @Input() miAccept: (ls:any) => any;

  sub: Subscription;
  @Output() uploadSuccess = new EventEmitter<any>();

  @Output() uploadError = new EventEmitter<any>();
  private propagateChange = (_: any) => { };
  constructor(
    private http: HttpClient,
    private msg: NzMessageService,
    private util: UtilService,
  ) { }

  /**
   * 给外部formControl写入数据
   *
   * @param {*} value
   */
  writeValue(value: string[]) {
    if (isArray(value)) {
      if (value.length > 0) {
        value.forEach(v => {
          if (v) {
            this.fileList.push({
              name: this.getName(v),
              url: v,
              uid: new Date().getTime() + Math.ceil(Math.random() * 10000),
            } as any);
          }
        });
      } else {
        this.fileList = [];
      }
    } else {
      this.fileList = [];
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
  registerOnTouched(fn: any) { }

  getName(raw: string) {
    const rawName = raw.split('/').pop();
    if (rawName) {
      const year = new Date().getFullYear();
      const parts = rawName.split('.');
      const lgParts = parts.length;
      if (lgParts === 1) {
        const str = parts[0];
        const lg = str.length;
        return str.slice(0, lg - 17);
      } else {
        const lastTwo = parts[lgParts - 2];
        const lg = lastTwo.length;
        parts[lgParts - 2] = lastTwo.slice(0, lg - 17);
        return parts.join('.');
      }
    }
    return '';
  }
  ngOnInit() {
    if (this.onSubmit instanceof Observable) {
      this.sub = this.onSubmit.subscribe(() => this.handleUpload());
    }
  }
  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
  beforeUpload = (file: UploadFile): boolean => {
    while (this.maxCount && this.maxCount <= this.fileList.length) {
      this.fileList.shift();
    }
    if (file.size < 1024 * 1024 * 15) {
      const filter = this.uploadFilter;
      if(typeof filter === 'function') {
        file = filter(file);
      }
      if(file) {
        this.fileList = this.fileList.concat(file);
      }
    } else {
      this.util.showGlobalErrMes('too big!!');
    }
    return false;
  };

  handleUpload() {
    const fileList = this.fileList.filter(f => !f.url);
    if (fileList.length === 0) {
      const out = this.fileList.filter(f => f.url).map(f => f.url);
      this.propagateChange(out);
      this.uploadSuccess.emit(out);
    } else {
      const formData = new FormData();
      this.fileList.forEach((file: any) => {
        formData.append('Files', file);
      });
      let dismiss;
      if (this.hideUploadButton) {
        dismiss = this.util.showLoading2();
      } else {
        this.uploading = true;
      }
      const final = () => {
        if (this.hideUploadButton) {
          dismiss();
        } else {
          this.uploading = false;
        }
      };
      // You can use any AJAX library you like
      const upload = () => {
        this.http
          .post(
            environment.fileEndUrl + 'SystemOperation/UploadFiles',
            formData,
          )
          // .pipe(map((fs: { FilePath: string }[]) => fs.map(f => f.FilePath)))
          .subscribe(
            (value: string[]) => {
              final();
              const hasUpload = this.fileList.filter(f => f.url);
              value.forEach(v => {
                if (v) {
                  hasUpload.push({
                    name: this.getName(v),
                    url: v,
                  } as any);
                }
              });
              this.fileList = hasUpload;
              const out = this.fileList.map(f => f.url);
              this.propagateChange(out);
              this.uploadSuccess.emit(out);
            },
            err => {
              final();
              this.uploadError.emit(err);
              this.util.errDeal(err);
            },
          );
      };
      upload();
    }
  }
}
