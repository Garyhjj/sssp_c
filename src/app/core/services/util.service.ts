import { TranslateService } from '@ngx-translate/core';
import { sify, tify } from './../../shared/utils/chinese-conv/index';
// import { LookupInterface } from './../../my-modules/ihub/shared/interface/lookup.interface';
// import { MyErrorHandlerService } from './myErrorHandler.service';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import * as moment from 'moment';
import * as XLSX from 'xlsx';

@Injectable()
export class UtilService {
  loadingId: string;
  audio: HTMLAudioElement;
  constructor(
    private router: Router,
    private _message: NzMessageService,
    private modalService: NzModalService,
    // private myErrorHandlerService: MyErrorHandlerService,
    private translate: TranslateService,
  ) { }

  errDeal(err) {
    if (err && !isNaN(err.status)) {
      switch (err.status) {
        case 401:
          this.tokenTimeOut();
          return;
        case 403:
          this.tokenTimeOut();
          return;
        case 400:
          return this._message.error(
            err.error.message || err.error || '無效請求',
            {
              nzDuration: 3000,
            },
          );
        case 404:
          return this._message.error('没找到资源', { nzDuration: 3000 });
        case 500:
          return this._message.error('無法連接到服務器,請稍後重試！', {
            nzDuration: 3000,
          });
        case 0:
          return this._message.error(err.statusText, { nzDuration: 3000 });
        default:
          // this.myErrorHandlerService.handleError(err);
      }
    }
  }

  tokenTimeOut() {
    this._message.create('error', '授权已超时,请重新登录', {
      nzDuration: 5000,
    });
    this.router.navigate(['/login']);
  }

  toExcel(
    name: string,
    header: (string | number)[],
    data: (string | number)[][],
  ) {
    data.unshift(header);
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, `${name}.xlsx`);
    // if (!ExportJsonExcel) {
    //   this._message.error(
    //     '由於瀏覽器不支持,該功能不可用,請升級瀏覽器或使用別的瀏覽器,如Chrome',
    //     { nzDuration: 4000 },
    //   );
    //   return;
    // }
    // const option: ExportJsonExcelOptions = {} as ExportJsonExcelOptions;

    // option.fileName = name;
    // option.datas = [
    //   {
    //     sheetData: data,
    //     sheetHeader: header,
    //   },
    // ];
    // const toExcel = new ExportJsonExcel(option); // new
    // toExcel.saveExcel(); // 保存
    this._message.info('文件將被下載到瀏覽器的默認下載目錄中', {
      nzDuration: 4000,
    });
  }

  showGlobalSucMes(mes) {
    this._message.success(mes, { nzDuration: 3000 });
  }

  showGlobalErrMes(mes) {
    this._message.error(mes, { nzDuration: 3000 });
  }

  showGlobalWarningMes(mes) {
    this._message.warning(mes, { nzDuration: 3000 });
  }

  showWarningConfirm(
    set: { title: string; content?: string; okText?: string },
    cb?: () => void,
  ) {
    set.okText = set.okText || '收到';
    this.modalService.warning({
      nzTitle: set.title,
      nzContent: set.content,
      nzOkText: set.okText,
      nzOnOk: cb,
    });
  }

  showBisicConfirmModal(opts: {
    title: string;
    okCb?: () => void;
    cancelCb?: () => void;
  }) {
    this.modalService.confirm({
      nzTitle: opts.title,
      nzOnOk() {
        if (opts.okCb) {
          opts.okCb();
        }
      },
      nzOnCancel() {
        if (opts.cancelCb) {
          opts.cancelCb();
        }
      },
    });
  }

  showLoading() {
    // tslint:disable-next-line:no-unused-expression
    this.loadingId && this.dismissLoading(this.loadingId);
    this.loadingId = this._message.loading('正在執行中', {
      nzDuration: 0,
    }).messageId;
    return this.loadingId;
  }

  showLoading2() {
    const loadindId = this.showLoading();
    const dismiss = () => this.dismissLoading(loadindId);
    return dismiss;
  }

  dismissLoading(id: string) {
    this._message.remove(id);
  }

  playAudio(
    text: string,
    opts?: {
      succFn?: () => void;
      errFn?: (err) => void;
      endFn?: (audio) => void;
      single?: boolean;
    },
  ) {
    if (text) {
      let audio = new Audio(
        `http://tts.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=2&text=${encodeURI(
          text,
        )}`,
      );
      const isSingle = opts && opts.single;
      audio.addEventListener('ended', () => {
        if (opts && opts.endFn) {
          opts.endFn(audio);
        }
        audio = null;
      });
      if (isSingle) {
        // tslint:disable-next-line:no-unused-expression
        this.audio && this.audio.pause();
      }
      audio
        .play()
        .then(() => {
          if (opts && opts.succFn) {
            opts.succFn();
          }
        })
        .catch(err => {
          if (opts && opts.errFn) {
            opts.errFn(err);
          }
        });
      if (isSingle) {
        this.audio = audio;
      } else {
        this.audio = null;
      }
      return audio;
    }
  }

  chineseConv(value: string): string {
    if (value) {
      const currentLang = this.translate.currentLang;
      if (!currentLang) {
        return value;
      }
      const chinese = ['ZH-CN', 'ZH-TW'];
      const idx = chinese.indexOf(currentLang.toUpperCase());
      switch (idx) {
        case 0:
          // return sify(JSON.stringify(value)).replace(/^\"/g, '').replace(/\"$/g, '');
          return sify(value);
        case 1:
          // return tify(JSON.stringify(value)).replace(/^\"/g, '').replace(/\"$/g, '');
          return tify(value);
        default:
          return value;
      }
    }
  }

  removeNullAttribute(obj: any) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (!obj[key]) {
          delete obj[key];
        }
      }
    }
    return obj;
  }

  changeNull(obj) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (obj[key] === 'null') {
          obj[key] = '';
        }
      }
    }
    return obj;
  }

  isNull(arg1: any) {
    return !arg1 && arg1 !== 0 && typeof arg1 !== 'boolean' ? true : false;
  }

  getDateTime(date?: string, format: string = 'YYYY-MM-DD HH:mm:ss') {
    if (!date) {
      date = moment(new Date()).format(format);
    }
    const d = moment(date).format(format);
    return d.toLocaleString();
  }
  getADName() {
    const user = localStorage.getItem('currentUser') as any;
    if (user) {
      return user.USER_NAME;
    }
    return '';
  }

  dateFormat(date: any, toFormat: string, fromFormat?: string) {
    const m = moment(date, fromFormat);
    if (m.isValid()) {
      return m.format(toFormat);
    } else {
      return date;
    }
  }
}
