import { environment } from './../../../../../../environments/environment';
import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/overlay';
import { TableDataColumn } from './../../shared/models/table-data/index';
import { NgxValidatorExtendService } from './../../../../../core/services/ngx-validator-extend.service';
import { UtilService } from './../../../../../core/services/util.service';
import { DataUpdateComponent } from './../../data-inputer/data-update/data-update.component';
import { NzModalService } from 'ng-zorro-antd';
import { DataDriveService } from './../../core/services/data-drive.service';
import {
  TabelViewSetMore,
  TabelViewSet,
} from './../../../data-drive/shared/models/viewer/table';
// tslint:disable-next-line:import-blacklist
import { Subscription } from 'rxjs';
import { TableData } from '../../../data-drive/shared/models/index';
import {
  Component,
  OnInit,
  Input,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  TemplateRef,
  ViewChild,
  HostListener,
  Renderer2,
  ElementRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DataDrive } from '../../../data-drive/shared/models/index';
import { throttle, isArray, sortUtils } from '../../../../utils/index';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent implements OnInit, AfterViewInit, OnDestroy {
  _dataDrive: DataDrive;

  tableSet: TabelViewSet;
  setDetail: TabelViewSetMore;
  tableData: TableData;
  dataViewList: any[] = [];
  canScroll = true;
  informTime: Date;
  showData: any[];
  indeterminate = false;
  private timeEvent1;
  private timeEvent2;
  private timeEvent3;
  private hideLists: string[];
  private sub1: Subscription;
  private sub2: Subscription;
  private sub3: Subscription;
  private pipes: any = {};
  private types: any = {};
  showInformer = new Subject<any>();
  fileList;
  allChecked;
  loadingMore;
  tableBody;
  @ViewChild('myDriveTable') myDriveTable;
  @Input() actionRef: TemplateRef<void>;
  @Input() tableCellRef: TemplateRef<void>;
  @Input() headerCellRef: TemplateRef<void>;
  @Input() headerCellStyle: (column: TableDataColumn) => any;
  @Input() bodyCellStyle: (data: any, property: string) => any;
  @Input()
  set opts(opts: DataDrive) {
    this.tableSet = opts.dataViewSet as TabelViewSet;
    this.tableSet.setForceUpdate(() => this.ref.detectChanges());
    this.calAdditionalColNum();
    this.setDetail = this.tableSet.more;
    this.tableData = Object.assign({}, opts.tableData);
    this.tableData.data = [];
    this._dataDrive = opts;
    this.pageCount = this.setDetail.pageSet.count;
    this.getPipes();
    this.getTypes();
    this.bindTableData();
    this.subjectHideList();
    this.subjectIsGettingData();
  }

  @Input() isModal: boolean;
  @Input() minWidth;
  perColWidth;
  _loading = false;
  _header = true;

  _scrollInterval: number;
  _loopScroll: boolean;

  additionalColNum = 0;
  // tslint:disable-next-line: no-use-before-declare
  styleCache = new StyleCache();
  pageIndex = 1;
  pageCount;
  floor = n => Math.floor(n);
  constructor(
    private ref: ChangeDetectorRef,
    private dataDriveService: DataDriveService,
    private modalService: NzModalService,
    private util: UtilService,
    private validatorExtendService: NgxValidatorExtendService,
    private render: Renderer2,
    private scrollDispatcher: ScrollDispatcher,
    private elementRef: ElementRef,
  ) {}

  _headerCellStyle(item: TableDataColumn) {
    let def: any = {};
    if (this.setDetail && this.setDetail.header) {
      const header = this.setDetail.header;
      def = {
        'background-color': header.bgColor,
        color: header.textColor,
        'font-size': header.textSize,
      };
    }
    let outDefine;
    if (this.headerCellStyle && item) {
      outDefine = this.headerCellStyle(item);
    }
    return typeof outDefine === 'object' ? Object.assign(def, outDefine) : def;
  }

  get canEdit() {
    return this._dataDrive.isDataEdditable();
  }
  get canDelete() {
    return this._dataDrive.isDataDeletable();
  }

  @HostListener('window:resize', ['$event'])
  onresize(event) {
    throttle(this.cacalScrollHeight, this, [], 200);
  }
  sort(name: string, v: string, by: { name: string; params: any[] }) {
    if (!name || !v || !by) {
      return;
    }
    const isAscend = v === 'ascend';
    this._dataDrive.tableData.data = this.tableData.data = this.tableData.data
      .sort((a: any, b: any) => {
        if (!isArray(a) || !isArray(b)) {
          return 0;
        }
        const target_a = a.find(p => p.property === name).value || '';
        const target_b = b.find(p => p.property === name).value || '';
        const a_value = target_a || target_a.value || '';
        const b_value = target_b || target_b.value || '';
        if (typeof by !== 'object') {
          return 0;
        }
        const byWhat = sortUtils[by.name];
        const params = by.params || [];
        return typeof byWhat === 'function'
          ? byWhat(a_value, b_value, isAscend, ...params)
          : 0;
      })
      .slice();
  }

  cacalXWidth(min) {
    if(!min) {
      return min;
    }
    const ori = parseInt(min, 10);
    const to = this.perColWidth * this.tableData.columns.length;
    return (min + '').replace('' + ori, to + '');
  }

  cacalScrollHeight(spec?) {
    if (this.setDetail && this.setDetail.fixedHeader) {
      if (this.myDriveTable && this.myDriveTable.nativeElement) {
        const tableContainer = this.myDriveTable.nativeElement;
        if (this.setDetail.fixedHeader.scrollHeight === 'auto') {
          const body = (this.tableBody = tableContainer.querySelector(
            '.ant-table-body',
          ));
          if (this.tableBody) {
            if (this.isModal) {
              const top = body.offsetTop;
              this.render.setStyle(body, 'maxHeight', `calc(100vh - ${top}px)`);
            } else {
              const table = tableContainer.querySelector('table');
              if (table) {
                const otherHeight =
                  table.getBoundingClientRect().bottom + 50 + 3;
                this.render.setStyle(
                  body,
                  'maxHeight',
                  `calc(100vh - ${spec ? 600 : otherHeight}px)`,
                );
              }
            }
          }
        }
      }
    }
  }
  subjectHideList() {
    if (this._dataDrive) {
      if (this.sub1) {
        this.sub1.unsubscribe();
      }
      this.sub1 = this._dataDrive.observeHideLists().subscribe(ls => {
        this.hideLists = ls;
        this.updateFilterColumns();
      });
    }
  }

  bindTableData() {
    this._dataDrive.afterDataInit(() => {
      // this.tableData.data = this._dataDrive.tableData.data;
      this.allChecked = false;
      this.updateFilterColumns(true);
      this.loadData();
    });
  }

  loadData() {
    const data = this.tableData.data;
    if (data) {
      // 防止一次性加载太多
      const INERVAL = 10,
        lg = data.length;
      if (lg > INERVAL && !this.setDetail.pageSet.enable /* 不分页*/) {
        this.tableData.data = [];
        const fn = start => {
          if (lg < start) {
            return this.dataChange();
          }
          this.tableData.data = this.tableData.data.concat(
            data.slice(start, start + INERVAL),
          );
          try {
            this.ref.detectChanges();
          } catch (err) {}
          setTimeout(() => fn(start + INERVAL), 300);
        };
        fn(0);
      } else {
        this.dataChange();
        try {
          this.ref.detectChanges();
        } catch (err) {}
      }
    }
  }

  getPipes() {
    this._dataDrive.tableData.columns
      .filter(c => c.more && c.more.pipe)
      .forEach(f => {
        this.pipes[f.property] = f.more.pipe;
      });
  }
  getTypes() {
    this._dataDrive.tableData.columns
      .filter(c => c.more && c.more.type)
      .forEach(f => {
        const type = f.more.type;
        this.types[f.property] = type ? type.name : 'text';
      });
  }

  toDelete(idx) {
    if (!this.canDelete) {
      return;
    }
    idx = this.calIdx(idx);
    const deleteFn = () => {
      const data = this._dataDrive.getData();
      if (!data[idx]) {
        return;
      }
      const id = this.util.showLoading();
      const finalFn = loadingID => this.util.dismissLoading(loadingID);
      this.dataDriveService.deleteData(this._dataDrive, data[idx]).subscribe(
        r => {
          this.dataDriveService.updateViewData(this._dataDrive, true);
          finalFn(id);
        },
        err => {
          this.util.errDeal(err);
          finalFn(id);
        },
      );
    };
    this.modalService.confirm({
      nzTitle: '您確定要刪除這一條目嗎？',
      nzOnOk() {
        deleteFn();
      },
      nzOnCancel() {},
    });
    return false;
  }

  getDataByIdx(idx: number) {
    const data = this._dataDrive.getData()[idx];
    const out: any = {};
    if (isArray(data)) {
      data.forEach(d => {
        out[d.property] = d.value;
      });
    }
    return out;
  }

  toUpdate(idx) {
    if (!this.canEdit) {
      return;
    }
    idx = this.calIdx(idx);
    const res = this.dataDriveService.toUpdate(
      this._dataDrive,
      idx,
      DataUpdateComponent,
    );
    if (res === false) {
      return false;
    }
    return false;
  }

  calAdditionalColNum() {
    this.additionalColNum = 0;
    if (this.tableSet.more && this.tableSet.more.showAction) {
      this.additionalColNum++;
    }
  }

  subjectIsGettingData() {
    // tslint:disable-next-line:no-unused-expression
    this.sub2 && this.sub2.unsubscribe();
    this.sub2 = this._dataDrive.observeIsGettingData().subscribe(s => {
      // if (!s && this._loading) {
      //   this.updateFilterColumns();
      // }
      this._loading = s;
      this.ref.detectChanges();
    });
  }

  updateFilterColumns(fromAfterInit?) {
    const ls = this.hideLists;
    const myFilter = c => ls.indexOf(c.property) < 0;
    const filterColumns = this._dataDrive.tableData.columns
      .slice()
      .filter(myFilter);
    const originData =
      this._dataDrive.tableData.data && this._dataDrive.tableData.data.slice();
    let filterData = [];
    if (originData && originData.length > 0) {
      filterData = originData.map(trs => trs.filter(myFilter));
    }
    this.tableData.columns = filterColumns;
    if (filterData) {
      this.tableData.data = filterData;
    }
    if (!fromAfterInit) {
      try {
        this.ref.detectChanges();
      } catch (err) {}
    }
  }
  dataChange() {
    clearTimeout(this.timeEvent3);
    this.timeEvent3 = setTimeout(() => {
      this.cacalScrollHeight();
      this.initAutoScroll();
    }, 50);
  }

  subscribeIsInBackground() {
    this._dataDrive.observeIsInBackground().subscribe(_ => {
      this.clearTimeEvent();
      if (!_) {
        this.autoScroll();
      }
    });
  }

  initAutoScroll() {
    let autoScroll;
    if (
      this.setDetail &&
      this.setDetail.fixedHeader &&
      (autoScroll = this.setDetail.fixedHeader.autoScroll)
    ) {
      const tableContainer = this.myDriveTable.nativeElement;
      const body = this.tableBody
        ? this.tableBody
        : tableContainer.querySelector('.ant-table-body');
      const dataViewList = (this.dataViewList = tableContainer.querySelectorAll(
        'tbody tr',
      ));
      if (body) {
        body.addEventListener('scroll', e => {
          for (let lg = dataViewList.length, i = lg - 1; i > -1; i--) {
            if (dataViewList[i].offsetTop <= e.target.scrollTop) {
              this.tableSet.emitFn(
                this.tableSet.eventNames.onScrollTo,
                this.getDataByIdx(i),
              );
              break;
            }
          }
        });
      }
      this._scrollInterval = autoScroll.interval;
      this._loopScroll = autoScroll.loop;
      this.canScroll = true;
      this.autoScroll();
    } else {
      this.clearTimeEvent();
      this.dataViewList = null;
      this._scrollInterval = NaN;
      this._loopScroll = false;
    }
  }

  hasScrolledToBottom() {
    const nowTime = new Date();
    const inform = () => {
      this.informTime = nowTime;
      this._dataDrive.hasScrolledToBottom();
    };
    if (this.informTime) {
      if (nowTime.getTime() - this.informTime.getTime() > 1000 * 10) {
        inform();
      }
    } else {
      inform();
    }
  }
  autoScroll(idx: number = 0) {
    clearTimeout(this.timeEvent1);
    const isInBackground = this._dataDrive.isInBackground;
    const lg = this.dataViewList.length;
    if (!isInBackground) {
      if (idx >= lg && this._loopScroll) {
        this.hasScrolledToBottom();
        idx = 0;
      }
    }
    if (idx < lg) {
      if (this.canScroll && !isInBackground && this.tableSet.scrollSet) {
        this.tableSet.isScrolling = true;
        this.dataViewList[idx].scrollIntoView();
      } else {
        this.tableSet.isScrolling = false;
        --idx;
      }
      this.timeEvent1 = setTimeout(
        () => this.autoScroll(++idx),
        this._scrollInterval,
      );
    }
  }
  scanImgs(imgs: string) {
    if (imgs) {
      this.fileList = imgs.split(',').map(i => {
        return { url: environment.END_URL + i };
      });
      this.showInformer.next(1);
    }
  }

  paramsOut(p: string[], idx: number) {
    idx = this.calIdx(idx);
    const data = this._dataDrive.getData()[idx];
    if (isArray(p)) {
      if (data) {
        const out: any = {};
        data.forEach(d => {
          if (p.indexOf(d.property) > -1) {
            out[d.property] = d.value;
          }
        });
        this._dataDrive.emitParamsOut(out);
      }
    } else {
      const out: any = {};
      data.forEach(d => {
        out[d.property] = d.value;
      });
      this._dataDrive.emitParamsOut(out);
    }
    return false;
  }

  arrayToObjectForData(idx: number) {
    idx = this.calIdx(idx);
    const data = this._dataDrive.getData()[idx];
    // const out: any = {};
    if (isArray(data)) {
      let out = data['originalData'];
      if (!out) {
        out = {};
        data.forEach(l => (out[l.property] = l.value));
        data['originalData'] = Object.assign({}, out);
      }
      return out;
    } else {
      return {};
    }
  }

  linkToPhone(params: { url: string; local: string }, idx: number) {
    // let url = params.url;
    // let router = params.local;
    // if (typeof url === 'string') {
    //   idx = this.calIdx(idx);
    //   const data = this._dataDrive.getData()[idx];
    //   const reg = /(\{(\w+)\})/;
    //   while (reg.exec(url)) {
    //     const target = data.find(d => d.property === RegExp.$2);
    //     url = url.replace(
    //       new RegExp(RegExp.$1, 'g'),
    //       target ? target.value : '',
    //     );
    //   }
    //   if (typeof router === 'string') {
    //     while (reg.exec(router)) {
    //       const target = data.find(d => d.property === RegExp.$2);
    //       router = router.replace(
    //         new RegExp(RegExp.$1, 'g'),
    //         target ? target.value : '',
    //       );
    //     }
    //   }
    //   const subscription = this.modalService.create({
    //     nzTitle: '鏈接二維碼',
    //     nzContent: QRComponent,
    //     nzOnOk() {},
    //     nzOnCancel() {},
    //     nzFooter: null,
    //     nzComponentParams: {
    //       url: url,
    //       router: router,
    //     },
    //   });
    // }
  }

  calIdx(idx) {
    return this.pageIndex > -1
      ? (this.pageIndex - 1) * this.pageCount + idx
      : idx;
  }

  runRegExp(
    dataIdx: number,
    body: {
      textColor?: string;
      textSize?: string;
      bgColor?: string;
      rules?: {
        matches: string[][];
        textColor?: string;
        textSize?: string;
        bgColor?: string;
      }[];
    },
    property?: string,
  ) {
    const bS = this.bodyCellStyle;
    if (!body && !bS) {
      return Object.create(null);
    }
    const cache = this.styleCache;
    dataIdx = this.calIdx(dataIdx);
    const test = () => {
      if (!body) {
        return Object.create(null);
      }
      const allData = this._dataDrive.getData();
      const target = allData && allData[dataIdx];
      let rules: {
        matches: string[][];
        textColor?: string;
        textSize?: string;
        bgColor?: string;
      }[];
      if (cache.idx === dataIdx && allData.length > 1) {
        return cache;
      } else {
        cache.reset(dataIdx);
      }
      if (!(rules = body.rules) || !target) {
        return body;
      } else {
        if (rules.length > 0) {
          for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            if (rule.matches && rule.matches.length > 0) {
              const matches = rule.matches;
              if (matches instanceof Array) {
                let result = true;
                for (let y = 0; y < matches.length; y++) {
                  const match = matches[y];
                  if (match.length < 2) {
                    result = false;
                    break;
                  } else {
                    let params;
                    if (match.length < 3) {
                      params = [];
                    } else {
                      params = isArray(match[2]) ? match[2] : [match[2]];
                    }
                    const t = target.find(s => s.property === match[0]) as any;
                    if (!t) {
                      result = false;
                      break;
                    }
                    if (
                      this.validatorExtendService[match[1]] &&
                      this.validatorExtendService[match[1]](...params)(t)
                    ) {
                      result = false;
                      break;
                    }
                  }
                }
                if (result) {
                  return rule ? Object.assign({}, body, rule) : body;
                }
              }
            }
          }
        }
      }
      return body;
    };
    const res = test();
    const types = ['bgColor', 'textSize', 'textColor'];
    types.forEach(t => cache.setCache(t, res[t]));
    const def = {
      'background-color': cache.bgColor,
      color: cache.textColor,
      'font-size': cache.textSize,
    };
    let outStyle;
    if (bS) {
      outStyle = bS(this.arrayToObjectForData(dataIdx), property);
    }
    return typeof outStyle === 'object'
      ? Object.assign({}, def, outStyle)
      : def;
  }
  clearTimeEvent() {
    clearTimeout(this.timeEvent1);
    clearTimeout(this.timeEvent2);
  }
  unsubscribeAll() {
    // tslint:disable-next-line:no-unused-expression
    this.sub1 && this.sub1.unsubscribe();
    // tslint:disable-next-line:no-unused-expression
    this.sub2 && this.sub2.unsubscribe();
    // tslint:disable-next-line:no-unused-expression
    this.sub3 && this.sub3.unsubscribe();
  }
  mouseEnter() {
    this.canScroll = false;
  }
  mouseLeave() {
    this.canScroll = true;
  }

  trackByIndex(index, item) {
    return typeof item === 'object' && item.hasOwnProperty('ID')
      ? item.ID
      : index;
  }

  checkAll(isAll) {
    const data = this.tableData.data;
    data.forEach(d => d[0] && !d[0].disableCheck && (d[0].checked = isAll));
  }
  refreshChecked(checked, data) {
    data.checked = checked;
    const allData = this.tableData.data;
    this.allChecked = allData.every(a => a[0] && a[0].checked === true);
  }

  onLoadMore() {
    this.loadingMore = true;
  }

  ngOnInit() {
    if (!this.isModal) {
      this.sub3 = this._dataDrive
        .observeIsShowModal()
        .subscribe(s => (this.canScroll = !s));
      this.updateFilterColumns();
    } else {
      this.updateFilterColumns(true);
      this.loadData();
    }
    this.scrollDispatcher
      .ancestorScrolled(this.elementRef, 1000)
      .subscribe((scrollable: CdkScrollable) => {
        this.cacalScrollHeight(true);
        setTimeout(() => this.cacalScrollHeight(), 50);
      });
    if (this.minWidth) {
      const w = parseInt(this.minWidth, 10);
      if (w > 0) {
        this.perColWidth = Math.floor(
          w / this._dataDrive.tableData.columns.length,
        );
      }
    }
  }

  ngOnDestroy() {
    this.clearTimeEvent();
    this.unsubscribeAll();
  }
  ngAfterViewInit() {
    setTimeout(this.cacalScrollHeight.bind(this), 50);
  }

  // ngAfterViewChecked() {
  //   this.timeEvent2 = throttle(this.cacalScrollHeight, this, [], 500);
  // }
}

class StyleCache {
  idx: number;
  bgColor: string;
  textSize: string;
  textColor: string;
  constructor() {}

  reset(idx: number) {
    this.idx = idx;
    this.bgColor = '';
    this.textSize = '';
    this.textColor = '';
  }

  getCache(type: string) {
    if (type && this[type]) {
      return this[type];
    }
  }

  setCache(type: string, val: string) {
    this[type] = val;
  }
}
