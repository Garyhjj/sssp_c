import { driveLifeCycle } from './../constants';
import { filter, mergeMap, debounceTime, map } from 'rxjs/operators';
import { deepClone } from './../../../../utils/index';
import { Observable, Subject, BehaviorSubject, of, isObservable } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { AdditionalFn } from './additionalFn/index';
import { TableDataModel, TableData, TableInsideData } from './table-data/index';
import { SearchItemSet } from './searcher';
import {
  DataViewSet,
  TabelViewSetMore,
  DataViewType,
  selfComponentPrefix,
  selfTemplateRefPrefix,
} from './viewer/index';
// tslint:disable-next-line:import-blacklist
import { bindEventForArray, isArray } from '../../../../utils/index';
import {
  DataViewSetFactory,
  isSelfComponent,
  isSelfTemplateRef,
} from './viewer/index';
import { SelfStoreSet, SelfStore, DataDriveStoreSet } from './self-store/index';
import { InputSetFactory } from './input/index';
import { TemplateRef } from '@angular/core';
export * from './viewer';
export * from './self-store';
export * from './table-data';
export * from './input';
export interface DataDriveOptions {
  id: number;
  searchSets?: SearchItemSet[];
  updateSets?: SearchItemSet[];
  additionalFn?: AdditionalFn;
  tableData: TableData;
  APIs: {
    search: string;
    delete?: string;
    add?: string;
    update?: string;
  };
  nameSets?: {
    delete?: string;
    add?: string;
    update?: string;
    actionCol?: string;
  };
  dataViewSet?: DataViewSet;
  selfHideLists?: string[];
  otherDataViewSets?: DataViewSet[];
}
const _selfStoreSet = new SelfStoreSet();
export class DataDrive implements DataDriveOptions {
  private user: string;
  private _selfHideLists?: string[];
  private dataViewSetFactory;
  private inputSetFactory;
  private selfStoreSet;
  private tableDataModel;
  private selfStore;
  private hideListSubject = new BehaviorSubject<string[]>([]);
  private isGetingDataSubject = new BehaviorSubject<boolean>(false);
  private isShowModalSubject = new BehaviorSubject<boolean>(false);
  private selfSearchDataSubject = new Subject<any[]>();
  private scrollToBottomSubject = new Subject<any>();
  private isInBackgroundSubject = new Subject<any>();
  checkedDataSubject = new Subject<any>();
  viewerChange = new Subject<any>();
  isInBackground = false;
  eventSubject = new Subject<string>();
  eventsQueue = {};
  lastestSearchParams;
  id: number;
  searchSets?: SearchItemSet[];
  updateSets?: SearchItemSet[];
  tableData: TableDataModel;
  canAutoUpdate = true;
  additionalFn?: AdditionalFn;
  APIs: {
    search: string;
    delete?: string;
    add?: string;
    update?: string;
  };
  nameSets?: {
    delete?: string;
    add?: string;
    update?: string;
    actionCol?: string;
  };
  dataViewSet?: DataViewSet;
  allHideLists: string[];
  otherDataViewSets?: DataViewSet[];
  useSearchCollapse: boolean;
  mutiPreviewBodyStyle: (data: any, property: string) => any;
  constructor(
    opts: DataDriveOptions,
    user: string = 'default',
    dataViewSetFactory: DataViewSetFactory = DataViewSetFactory,
    inputSetFactory = InputSetFactory,
    selfStoreSet = _selfStoreSet,
    selfStore = SelfStore,
    tableDataModel = TableDataModel,
  ) {
    Object.assign(this, deepClone(opts));
    this.user = user;
    this.dataViewSetFactory = dataViewSetFactory;
    this.inputSetFactory = inputSetFactory;
    this.selfStoreSet = selfStoreSet;
    this.selfStore = selfStore;
    this.tableDataModel = tableDataModel;
    this.init();
  }
  set isGetingData(status: boolean) {
    this.isGetingDataSubject.next(status);
  }
  set selfHideLists(ls: string[]) {
    this._selfHideLists = ls;
    bindEventForArray(this._selfHideLists, this.updateSelfSetStore.bind(this));
    this.updateSelfSetStore({ prefer: this._selfHideLists });
  }
  set modalSataus(s: boolean) {
    this.isShowModalSubject.next(s);
  }
  updateSelfSetStore(opts: DataDriveStoreSet) {
    const storeSet = new this.selfStore(this.user, [
      Object.assign({ id: this.id }, opts),
    ]);
    this.selfStoreSet.update(storeSet);
    if (opts.prefer) {
      this.combineHideLists();
    }
  }
  get selfHideLists() {
    return this._selfHideLists;
  }
  private combineHideLists() {
    this._selfHideLists = this._selfHideLists || [];
    const baseHideLists: string[] = this.dataViewSet.hideLists || [];
    this.allHideLists = this._selfHideLists
      .concat(baseHideLists)
      .filter(function(ele, index, array) {
        return index === array.indexOf(ele);
      });
    this.hideListSubject.next(this.allHideLists);
  }
  private initHideLists() {
    const prefer = this.selfStoreSet.getSetByUserAndId(
      this.user,
      this.id,
      'prefer',
    );
    this._selfHideLists = isArray(prefer) ? prefer : [];
    this.combineHideLists();
  }
  getSetStore(): DataDriveStoreSet {
    return this.selfStoreSet.getSetByUserAndId(this.user, this.id);
  }
  isDataAddable() {
    return !!this.tableData.addable;
  }
  isDataEdditable() {
    return !!this.tableData.editable;
  }
  isDataDeletable() {
    return !!this.tableData.deletable;
  }
  isCompanyLimited() {
    return this.tableData.isCompanyLimited;
  }
  observeIsInBackground() {
    return this.isInBackgroundSubject.asObservable();
  }

  /**
   * 注册并添加新的Viewer,支持component和TemplateRef类型
   *
   * @param {*} component
   * @param {*} params
   * @memberof DataDrive
   */
  viewerRegister(component, params?) {
    const getRandom = () => {
      return new Date().getTime() + '' + (Math.random() * 1000).toFixed(0);
    };
    const addViewer = (viewer, type) => {
      this.otherDataViewSets = this.otherDataViewSets || [];
      this.otherDataViewSets.push(viewer);
      this.additionalFn = this.additionalFn || {};
      const types = (this.additionalFn.switchViewType = this.additionalFn
        .switchViewType || [this.dataViewSet.type]);
      this.additionalFn.switchViewType = Array.from(new Set(types).add(type));
    };
    if (typeof component === 'function') {
      const type = selfComponentPrefix + getRandom();
      const viewer: DataViewSet = {
        type,
        container: component,
        params,
      };
      addViewer(viewer, type);
      return {
        type,
        drop: () => {
          this.viewerDrop({ type });
        },
      };
    } else if (component instanceof TemplateRef) {
      const type = selfTemplateRefPrefix + getRandom();
      const viewer: DataViewSet = {
        type,
        container: component,
        params,
      };
      addViewer(viewer, type);
      return {
        type,
        drop: () => {
          this.viewerDrop({ type });
        },
      };
    } else {
      console.warn('not support this type of viewer');
    }
  }

  /**
   * 移除已有的Viewer
   *
   * @param {{ type?: DataViewType; container?: any }} opts
   * @memberof DataDrive
   */
  viewerDrop(opts: { type?: DataViewType; container?: any }) {
    const { type, container } = opts;
    this.additionalFn = this.additionalFn || {};
    const switchViewType = this.additionalFn.switchViewType;
    if (isArray(switchViewType)) {
      this.additionalFn.switchViewType = switchViewType.filter(s => s !== type);
    }
    let otherViewSets = this.otherDataViewSets;
    if (isArray(otherViewSets) && otherViewSets.length > 0) {
      this.otherDataViewSets = otherViewSets.filter(o => {
        if (type && container) {
          return o.type !== type && o.container !== container;
        } else if (!type && container) {
          return o.container !== container;
        } else if (type && !container) {
          return o.type !== type;
        } else {
          return true;
        }
      });
    }
    const viewerShowing = this.dataViewSet;
    if (type && container) {
      if (
        viewerShowing.type === type &&
        viewerShowing.container === container
      ) {
        this.dataViewSet = null;
      }
    } else if (!type && container) {
      if (viewerShowing.container === container) {
        this.dataViewSet = null;
      }
    } else if (type && !container) {
      if (viewerShowing.type === type) {
        this.dataViewSet = null;
      }
    }
    otherViewSets = this.otherDataViewSets;
    if (
      !this.dataViewSet &&
      isArray(otherViewSets) &&
      otherViewSets.length > 0
    ) {
      const c = otherViewSets[0];
      this.switchViewType(c.type);
    }
  }
  /**
   * 覆盖内部的命名
   *
   * @param {{
   *     delete?: string;
   *     add?: string;
   *     update?: string;
   *     actionCol?: string;
   *   }} p
   * @memberof DataDrive
   */
  changeNameSets(p: {
    delete?: string;
    add?: string;
    update?: string;
    actionCol?: string;
  }) {
    this.nameSets = this.nameSets || {};
    Object.assign(this.nameSets, p);
  }
  runIntoBackground() {
    this.isInBackground = true;
    this.isInBackgroundSubject.next(true);
  }
  backIntoFront() {
    this.isInBackground = false;
    this.isInBackgroundSubject.next(false);
  }
  /**
   * 获得所有checkbox选中的数据
   *
   * @returns 数据
   * @memberof DataDrive
   */
  getCheckedData() {
    const data = this.getData().filter(d => d[0] && d[0].checked === true);
    if (data.length > 0) {
      return data.map(d => {
        let out = d['originalData'];
        if (!out) {
          out = {};
          d.forEach(l => (out[l.property] = l.value));
        }
        return out;
      });
    }
    return [];
  }
  observeCheckedData() {
    return this.checkedDataSubject.asObservable().pipe(
      debounceTime(300),
      map(() => this.getCheckedData()),
    );
  }
  /**
   * 增加默認搜索參數
   * @param {any} p
   * @memberof DataDrive
   */
  addDefaultSearchParams(p) {
    if (typeof p === 'object') {
      this.tableData.defaultSearchParams =
        this.tableData.defaultSearchParams || {};
      Object.assign(this.tableData.defaultSearchParams, p);
    }
  }
  /**
   * 设置配置的搜索框的默认值
   * @param {string} prop
   * @param {any} def
   * @memberof DataDrive
   */
  setSearchInputDefault(prop: string, def: any) {
    const searchSets = this.searchSets;
    if (isArray(searchSets)) {
      const status = searchSets.find(
        s => s.property === prop || s.apiProperty === prop,
      );
      if (status) {
        status.InputOpts = status.InputOpts || {};
        status.InputOpts.default = def;
      }
    }
  }
  /**
   * 獲得table數據
   *
   * @returns {any[]}
   * @memberof DataDrive
   */
  getData(): TableInsideData[][] {
    if (Array.isArray(this.tableData.data)) {
      return this.tableData.data;
    } else {
      return [];
    }
  }

  /**
   * 觀察被隱藏的列
   *
   * @returns {Observable<string[]>}
   * @memberof DataDrive
   */
  observeHideLists(): Observable<string[]> {
    return this.hideListSubject.asObservable();
  }

  /**
   * 觀察是否在獲取數據
   *
   * @returns Observable<boolean>
   * @memberof DataDrive
   */
  observeIsGettingData(): Observable<boolean> {
    return this.isGetingDataSubject.asObservable();
  }

  /**
   * 觀察是否在全屏視圖中
   *
   * @returns Observable<boolean>
   * @memberof DataDrive
   */
  observeIsShowModal(): Observable<boolean> {
    return this.isShowModalSubject.asObservable();
  }
  /**
   * 下载数据时，可对数据进行格式化。
   *
   * @param {((data: any) => any | void)} cb
   * @memberof DataDrive
   */
  onDownloadExcel(cb: (data: any) => any | void) {
    this.on(driveLifeCycle.ON_DOWNLOAD_EXCEL, cb);
  }

  /**
   * 更新操作的生命週期----表單顯示時
   *
   * @param {(fg: FormGroup, sub: Subject<string>, InputList: any[]) => void} cb
   * @memberof DataDrive
   */
  onUpdateFormShow(
    cb: (
      fg: FormGroup,
      sub: Subject<string>,
      InputList: any[],
      data: any,
    ) => void,
  ) {
    this.on(driveLifeCycle.UPDATE_FORM_SHOW, cb);
  }

  /**
   * 點擊paramsOut定義按鈕的訂閱函數
   *
   * @param {(data) => void} cb
   * @memberof DataDrive
   */
  onParamsOut(cb: (data) => void) {
    this.on('paramsOut', cb);
  }

  /**
   * 更新操作的生命週期----表單提交前,return false 可以取消提交操作, sub可發佈取消的原因
   *
   * @param {(fg: FormGroup, sub: Subject<string>) => void} cb
   * @memberof DataDrive
   */
  beforeUpdateSubmit(
    cb: (fg: FormGroup, sub: Subject<string>, originalData: any) => any,
  ) {
    this.on(driveLifeCycle.BEFORE_UPDATE_SUBMIT, cb);
  }

  /**
   * 更新操作的生命週期----更新操作點擊時,return false 可不顯示默認的更新頁面
   *
   * @param {(data: any) => Boolean} cb
   * @memberof DataDrive
   */
  beforeUpdateShow(cb: (data: any) => Boolean) {
    this.on(driveLifeCycle.BEFORE_UPDATE_SHOW, cb);
  }

  runBeforeUpdateShow(data) {
    return this.emitEvent(driveLifeCycle.BEFORE_UPDATE_SHOW, data);
  }

  /**
   * 搜索的生命週期---搜索前,可操作data數據，也可return 新的搜索條件
   *
   * @param {(data: any) => any} cb
   * @memberof DataDrive
   */
  beforeSearch(cb: (data: any) => any) {
    this.on(driveLifeCycle.BEFORE_SEARCH, cb);
  }

  /**
   * 數據視圖的渲染週期---視圖顯示數據后
   *兔
   * @param {(data: any) => void} cb
   * @memberof DataDrive
   */
  afterDataInit(cb: (data: any) => void) {
    this.on(driveLifeCycle.AFTER_DATA_INIT, cb);
  }
  /**
   * 數據視圖的渲染週期---視圖顯示數據前
   *
   * @param {((data: any[]) => any | void)} cb
   * @memberof DataDrive
   */
  beforeInitTableData(cb: (data: any[]) => any | void) {
    this.on(driveLifeCycle.BEFORE_INIT_TABLE_DATA, cb);
  }

  /**
   * 更新操作的生命週期----更新數據發送前，可為數據進行最後的加工
   *
   * @param {((data: any) => any | void)} cb
   * @memberof DataDrive
   */
  onUpdateData(cb: (data: any) => any | void) {
    this.on(driveLifeCycle.ON_UPDATE_DATA, cb);
  }

  runOnUpdateData(data) {
    return this.onAlterData(driveLifeCycle.ON_UPDATE_DATA, data);
  }

  runOnDownloadExcel(data) {
    return this.onAlterDataFlex(driveLifeCycle.ON_DOWNLOAD_EXCEL, data);
  }

  /**
   * 改寫默認的搜索方法（使用配置API去搜索）
   *
   * @param {((data?: any) => Observable<any>)} cb
   * @memberof DataDrive
   */
  changeSearchWay(cb: (data?: any) => Observable<any>) {
    if (this.eventsQueue[driveLifeCycle.CHANGE_SEARCH_WAY]) {
      this.eventsQueue[0] = cb;
    } else {
      this.eventsQueue[driveLifeCycle.CHANGE_SEARCH_WAY] = [cb];
    }
  }

  runChangeSearchWay(data) {
    const eventQueue: Array<Function> =
      this.eventsQueue[driveLifeCycle.CHANGE_SEARCH_WAY] || [];
    if (eventQueue.length > 0) {
      return eventQueue[0](data);
    }
    return false;
  }

  /**
   * 改寫默認的更新方法（使用配置API去更新）
   *
   * @param {((data: any) => Observable<any> | boolean)} cb
   * @memberof DataDrive
   */
  changeUpdateWay(cb: (data: any) => Observable<any> | boolean) {
    if (this.eventsQueue[driveLifeCycle.CHANGE_UPDATE_WAY]) {
      this.eventsQueue[0] = cb;
    } else {
      this.eventsQueue[driveLifeCycle.CHANGE_UPDATE_WAY] = [cb];
    }
  }
  runChangeUpdateWay(data) {
    const eventQueue: Array<Function> =
      this.eventsQueue[driveLifeCycle.CHANGE_UPDATE_WAY] || [];
    if (eventQueue.length > 0) {
      return eventQueue[0](data);
    }
    return false;
  }
  /**
   * 组件内部增删改后进行自动更新数据前, return false 会取消更新
   *
   * @param {((data: any) => Observable<any> | boolean)} cb
   * @memberof DataDrive
   */
  beforeInsideUpdateView(cb: () => any) {
    if (this.eventsQueue[driveLifeCycle.BEFORE_INSIDE_UPDATE_VIEW]) {
      this.eventsQueue[0] = cb;
    } else {
      this.eventsQueue[driveLifeCycle.BEFORE_INSIDE_UPDATE_VIEW] = [cb];
    }
  }

  runBeforeInsideUpdateView() {
    const eventQueue: Array<Function> =
      this.eventsQueue[driveLifeCycle.BEFORE_INSIDE_UPDATE_VIEW] || [];
    if (eventQueue.length > 0) {
      return eventQueue[0]();
    }
    return true;
  }

  onMutiUpdateSelectFile(cb) {
    if (this.eventsQueue[driveLifeCycle.ON_MUTI_UPDATE_SELECT_FILE]) {
      this.eventsQueue[0] = cb;
    } else {
      this.eventsQueue[driveLifeCycle.ON_MUTI_UPDATE_SELECT_FILE] = [cb];
    }
  }

  runOnMutiUpdateSelectFile(data: any[]) {
    const eventQueue: Array<Function> =
      this.eventsQueue[driveLifeCycle.ON_MUTI_UPDATE_SELECT_FILE] || [];
    if (eventQueue.length > 0) {
      return eventQueue[0](data);
    }
    return true;
  }
  emitAfterDataInit(data) {
    return this.onAlterData(driveLifeCycle.AFTER_DATA_INIT, data);
  }
  emitParamsOut(data) {
    this.emitEvent(driveLifeCycle.PARAMS_OUT, data);
  }

  emitEvent(name: string, ...p) {
    const eventQueue: Array<Function> = this.eventsQueue[name] || [];
    let canContinue = true;
    for (let i = 0; i < eventQueue.length; i++) {
      const cb = eventQueue[i];
      if (cb) {
        if (cb(...p) === false) {
          canContinue = false;
        }
      }
    }
    return canContinue;
  }

  on(eventType: string, cb: Function): void {
    if (this.eventsQueue[eventType]) {
      this.eventsQueue[eventType].push(cb);
    } else {
      this.eventsQueue[eventType] = [cb];
    }
  }
  onAlterDataFlex(eventName: string, data: any) {
    const eventQueue: Array<Function> = this.eventsQueue[eventName] || [];
    const runFlex = (observable: Observable<any>, fn) => {
      return observable.pipe(
        mergeMap(d => {
          if (typeof fn === 'function') {
            const res = fn(d);
            if (isObservable(res)) {
              return res;
            } else if (res instanceof Promise) {
              return new Observable<any>(ob => {
                res
                  .then(_ => {
                    ob.next(isArray(_) ? _ : d);
                    ob.complete();
                  })
                  .catch(e => ob.error(e));
              });
            } else if (isArray(res)) {
              return of(res);
            } else {
              return of(d);
            }
          } else {
            return of(d);
          }
        }),
      );
    };
    let observe = of(data);
    for (let i = 0; i < eventQueue.length; i++) {
      const cb = eventQueue[i];
      observe = runFlex(observe, cb);
    }
    return observe;
  }

  onAlterData(eventName: string, data: any) {
    const eventQueue: Array<Function> = this.eventsQueue[eventName] || [];
    for (let i = 0; i < eventQueue.length; i++) {
      const cb = eventQueue[i];
      if (cb) {
        const res = cb(data);
        if (typeof res === 'object') {
          data = res;
        }
      }
    }
    return data;
  }

  runBeforeInitTableData(data) {
    return this.onAlterData(driveLifeCycle.BEFORE_INIT_TABLE_DATA, data);
  }
  runBeforeSearch(data: any) {
    const eventQueue: Array<Function> =
      this.eventsQueue[driveLifeCycle.BEFORE_SEARCH] || [];
    if (typeof data !== 'object') {
      return data;
    }
    for (let i = 0; i < eventQueue.length; i++) {
      const cb = eventQueue[i];
      if (cb) {
        const res = cb(Object.assign({}, data));
        if (typeof res === 'object') {
          data = Object.assign({}, data, res);
        }
      }
    }
    return data;
  }

  runBeforeUpdateSubmit(
    fg: FormGroup,
    globalUpdateErrSubject: Subject<string>,
    originalData: any,
  ) {
    const eventQueue: Array<Function> =
      this.eventsQueue[driveLifeCycle.BEFORE_UPDATE_SUBMIT] || [];
    if (eventQueue.length > 0) {
      return eventQueue[0](fg, globalUpdateErrSubject, originalData);
    }
    return true;
  }

  private subscribeEvent() {
    this.eventSubject.subscribe(type => {
      const eventQueue: Array<Function> = this.eventsQueue[type] || [];
      switch (type) {
        default:
          eventQueue.forEach(cb => {
            if (cb) {
              cb();
            }
          });
      }
    });
  }
  /**
   * 發佈table的數據已自動滾到底部
   *
   * @memberof DataDrive
   */
  hasScrolledToBottom() {
    this.scrollToBottomSubject.next(1);
  }
  /**
   * 觀察table的數據自動滾到底部的時候
   *
   * @returns
   * @memberof DataDrive
   */
  observeScrollToBottom() {
    return this.scrollToBottomSubject.asObservable();
  }

  /**
   * 可自動更新table數據
   *
   * @param {any} data
   * @memberof DataDrive
   */
  selfUpdateTableData(data) {
    if (isArray(data)) {
      this.selfSearchDataSubject.next(data);
    }
  }

  observeSelfUpdateTableData() {
    return this.selfSearchDataSubject.asObservable();
  }

  updateFormGroupInited(
    fg: FormGroup,
    globalUpdateErrSubject: Subject<string>,
    inputTypeList,
    data,
  ) {
    return this.emitEvent(
      driveLifeCycle.UPDATE_FORM_SHOW,
      fg,
      globalUpdateErrSubject,
      inputTypeList,
      data,
    );
  }
  /**
   * 可設置paramsOut按鈕的名字及拋出的內容
   *
   * @param {string} name
   * @param {string[]} [params]
   * @memberof DataDrive
   */
  setParamsOut(name: string, params?: string[]) {
    if (this.dataViewSet.type === 'table') {
      const more: TabelViewSetMore = this.dataViewSet.more || {};
      more.paramsOut = {
        name: name,
        params: params,
      };
    }
  }

  /**
   * 更改視圖類型
   *
   * @param {DataViewType} type
   * @memberof DataDrive
   */
  switchViewType(type: DataViewType) {
    const currentView = this.dataViewSet;
    if (this.otherDataViewSets) {
      const targetIdx = this.otherDataViewSets.findIndex(c => c.type === type);
      if (targetIdx > -1) {
        const target = this.otherDataViewSets.splice(targetIdx, 1)[0];
        this.otherDataViewSets.push(currentView);
        target.tempAddition = currentView.tempAddition;
        this.dataViewSet = target;
        if (!isSelfComponent(target.type) && !isSelfTemplateRef(target.type)) {
          this.initDataViewSet();
        }
        this.viewerChange.next(target);
      }
    }
  }
  /**
   * 添加額外的視圖配置，對某些視圖類型有限（如：考卷）
   *
   * @param {any} a
   * @memberof DataDrive
   */
  setViewTempAddtion(a) {
    this.dataViewSet.tempAddition = a;
  }

  private init() {
    this.initDataViewSet();
    this.initSearchSets();
    this.initUpdateSets();
    this.initTableData();
    this.initHideLists();
    this.subscribeEvent();
  }

  private initUpdateSets() {
    if (this.updateSets && this.updateSets.length > 0) {
      this.updateSets = this.updateSets.map(s => {
        s.InputOpts = new this.inputSetFactory(s.InputOpts);
        return s;
      });
    }
  }

  private initSearchSets() {
    if (this.searchSets && this.searchSets.length > 0) {
      this.searchSets = this.searchSets.map(s => {
        s.InputOpts = new this.inputSetFactory(s.InputOpts);
        return s;
      });
    }
  }

  private initDataViewSet() {
    this.dataViewSet = new this.dataViewSetFactory(this.dataViewSet);
  }
  private initTableData() {
    this.tableData = new this.tableDataModel(this.tableData);
  }
}
