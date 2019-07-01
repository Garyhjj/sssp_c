import { environment } from './../../../../../../environments/environment';
import { TabelViewSet } from './../../shared/models/viewer/table';
import {
  TableInsideData,
  TableInsideDataModel,
} from './../../shared/models/table-data/index';
import { NzModalService } from 'ng-zorro-antd';
import { CacheService } from './../../../../../core/services/cache.service';
import { isArray, parse } from './../../../../utils/index';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService } from './../../../../../core/services/auth.service';
import { MyStore, UserState } from './../../../../../core/store';
import { DataDrive } from './../../shared/models/index';
import { HttpClient } from '@angular/common/http';
import { DataDriveStore } from './../../shared/config/index';
import { Injectable } from '@angular/core';
import { UtilService } from '../../../../../core/services/util.service';
import { replaceQuery } from '../../../../utils/index';

@Injectable()
export class DataDriveService {
  user: UserState;
  constructor(
    private http: HttpClient,
    private utilSerive: UtilService,
    private auth: AuthService,
    private cache: CacheService,
    private modalService: NzModalService,
  ) {
    this.user = this.auth.user;
  }

  async initDataDrive(name: string) {
    const cacheName = 'DateDrive';
    let cache, pureOption;
    const userName = this.user ? this.user.USER_NAME : '';
    cache = this.cache.get(cacheName, name);
    if (typeof cache === 'object' && cache) {
      pureOption = cache;
    } else {
      pureOption = this.getDriveOption(name) || name;
      // tslint:disable-next-line:no-unused-expression
      typeof pureOption === 'object' &&
        (pureOption = JSON.parse(JSON.stringify(pureOption)));
      if (typeof pureOption === 'number') {
        pureOption = await this.getSettingByNet(pureOption)
          .toPromise()
          .catch(err => {
            this.utilSerive.errDeal(err);
          });
        pureOption = pureOption || '';
        if (pureOption) {
          this.cache.update(cacheName, name, pureOption, 60 * 1000);
        }
      }
    }
    if (typeof pureOption === 'object') {
      return new DataDrive(pureOption, userName);
    } else {
      return null;
    }
  }

  getSettingByNet(id) {
    const cacheName = 'dataDriveSetting';
    let cache = this.cache.get(cacheName, id, false);
    if (!cache) {
      cache = this.http
        .get(replaceQuery(environment.END_URL +  'SystemOperation/GetDataDrives?id={id}&description={description}', { id }))
        .pipe(
          map((d: any[]) => {
            if (isArray(d) && d.length === 1) {
              const opts: any = {};
              const target = d[0];
              opts.tableData = parse(target.TABLE_DATA);
              opts.updateSets = parse(target.UPDATE_SETS);
              opts.searchSets = parse(target.SEARCH_SETS);
              if (target.MAIN_SET) {
                Object.assign(opts, parse(target.MAIN_SET));
              }
              opts.id = target.ID;
              opts.description = target.DESCRIPTION;
              return opts;
            } else {
              return null;
            }
          }),
          shareReplay(),
        );
      this.cache.update(cacheName, id, cache, 2 * 1000);
    }
    return cache;
  }

  getInitData(dataDrive: DataDrive, isFirstInit = false) {
    const searchSets = dataDrive.searchSets;
    const def = {};
    if (isFirstInit) {
      if (isArray(searchSets)) {
        searchSets.forEach(s => {
          const opts = s.InputOpts;
          if (opts && opts.default !== void 0 && opts.default !== '') {
            def[s.apiProperty ? s.apiProperty : s.property] = opts.default;
          }
        });
      }
    }
    return this.searchData(dataDrive, def);
  }

  searchData(dataDrive: DataDrive, params: any = {}) {
    const newSearchWay = dataDrive.runChangeSearchWay(params) as Observable<
      any
    >;
    if (newSearchWay instanceof Observable) {
      return newSearchWay;
    }
    if (Object.keys(params).length === 0) {
      params = dataDrive.lastestSearchParams
        ? dataDrive.lastestSearchParams
        : {};
    } else {
      dataDrive.lastestSearchParams = params;
    }
    const isCompanyLimited = dataDrive.isCompanyLimited() as any;
    if (isCompanyLimited) {
      params = this.addCompanyID(params, isCompanyLimited);
    }
    params = dataDrive.runBeforeSearch(params) || params;
    const defaultSearchParams =
      (dataDrive.tableData && dataDrive.tableData.defaultSearchParams) || {};
    const copyDefault = Object.assign(
      {},
      this.bindUserMesFordefaultSearchParams(defaultSearchParams),
    );
    params = Object.assign(copyDefault, params);
    return this.http.get(
      replaceQuery(
        environment.EMPI_URL + dataDrive.APIs.search,
        params,
        this.user,
      ),
    );
  }
  bindUserMesFordefaultSearchParams(p) {
    for (const prop in p) {
      if (p.hasOwnProperty(prop)) {
        const val = p[prop];
        if (typeof val === 'string') {
          p[prop] = replaceQuery(p[prop], this.user);
        }
      }
    }
    return p;
  }
  getDriveOption(name: string) {
    if (typeof name === 'object') {
      return name;
    }
    return DataDriveStore[name];
  }
  updateViewData(dataDrive: DataDrive, isInside?: boolean) {
    if (isInside) {
      const res = dataDrive.runBeforeInsideUpdateView();
      if (res === false) {
        return;
      }
    }
    const dismiss = this.utilSerive.showLoading2();
    this.getInitData(dataDrive).subscribe(
      (c: any[]) => {
        this.initTableData(dataDrive, c);
        dismiss();
      },
      err => {
        dismiss();
        this.utilSerive.errDeal(err);
      },
    );
  }

  initTableData(dataDrive: DataDrive, ds: any[]) {
    const tableData = dataDrive.tableData;
    const alterData = dataDrive.runBeforeInitTableData(ds);
    if (alterData) {
      ds = alterData;
    }
    if (isArray(ds) && ds.length > 0) {
      const sortMes = Object.keys(ds[0]);
      // 根据返回的数据筛选已配置的列
      tableData.columns = tableData.columns.filter(
        c => sortMes.indexOf(c.property) > -1,
      );
      const mySort = tableData.columns.map(c => c.property);
      // tableData.columns.sort((a, b) => sortMes.indexOf(a.property) - sortMes.indexOf(b.property));
      const columnsPros = tableData.columns.map(c => c.property);
      const checkedDataSubject = dataDrive.checkedDataSubject;
      const data = ds.map(d => {
        const trs = [];
        trs['originalData'] = Object.assign({}, d);
        for (const prop in d) {
          if (Object.prototype.hasOwnProperty.call(d, prop)) {
            trs.push(
              new TableInsideDataModel(
                {
                  property: prop,
                  value: d[prop],
                  hide: columnsPros.indexOf(prop) > -1 ? false : true,
                },
                checkedDataSubject,
              ),
            );
          }
        }
        mySort.forEach(prop => {
          if (!Object.prototype.hasOwnProperty.call(d, prop)) {
            trs.push(
              new TableInsideDataModel({
                property: prop,
                value: '',
              }),
            );
          }
        });
        // 根據配置排序拿到的數據
        return trs.sort(
          (a, b) => mySort.indexOf(a.property) - mySort.indexOf(b.property),
        );
      });
      tableData.data = data;
    } else {
      tableData.data = [];
    }
    dataDrive.emitAfterDataInit(ds);
  }

  updateData(dataDrive: DataDrive, ds: any) {
    if (isArray(ds)) {
      ds = ds.map(d => dataDrive.runOnUpdateData(d));
    } else {
      ds = dataDrive.runOnUpdateData(ds);
    }
    const isCompanyLimited = dataDrive.isCompanyLimited() as any;
    if (isCompanyLimited) {
      if (isArray(ds)) {
        ds = ds.map(d => this.addCompanyID(d, isCompanyLimited));
      } else {
        ds = this.addCompanyID(ds, isCompanyLimited);
      }
    }
    const newUpdateWay = dataDrive.runChangeUpdateWay(ds) as Observable<any>;
    if (newUpdateWay instanceof Observable) {
      return newUpdateWay;
    }
    if (!dataDrive.APIs || !dataDrive.APIs.update) {
      throw new Error('沒有找到更新的api配置信息');
    }
    const url = dataDrive.APIs.update;
    return this.http.post(environment.EMPI_URL + url, ds);
  }

  deleteData(dataDrive: DataDrive, ds: any[]) {
    if (!dataDrive.APIs || !dataDrive.APIs.delete) {
      throw new Error('沒有找到刪除的api配置信息');
    }
    const url = dataDrive.APIs.delete;
    const out: any = {};
    ds.forEach(d => {
      out[d.property] = d.value;
    });
    return this.http.delete(
      replaceQuery(environment.EMPI_URL + url, out, this.user),
    );
  }
  toExcel(dataDrive: DataDrive) {
    if (!dataDrive) {
      return;
    }
    const tableData = dataDrive.tableData;
    const dataViewSet = dataDrive.dataViewSet as TabelViewSet;
    const name = (dataViewSet && dataViewSet.title) || 'default';
    const columns = tableData.columns;
    const data = tableData.data;
    let excelHeader = [];
    let excelData = [];
    const isShowIndex = dataViewSet.more.showIndex;
    if (columns && columns.length > 0) {
      excelHeader = columns.map(c => c.value);
      if (isShowIndex) {
        excelHeader.unshift('NO');
      }
    }
    if (data && data.length > 0) {
      const notHide = data.map(c => c.filter(s => !s.hide));
      const dismiss = this.utilSerive.showLoading2();
      dataDrive
        .runOnDownloadExcel(notHide.map(c => this.tableInsideDataToObject(c)))
        .subscribe(
          ds => {
            dismiss();
            if (ds) {
              excelData = notHide.map((c, idx) => {
                const cs = c.map(d => {
                  const property = d.property;
                  const n = ds[idx];
                  if (n && n.hasOwnProperty(property)) {
                    return n[property];
                  } else {
                    return d.value;
                  }
                });
                if (isShowIndex) {
                  cs.unshift(idx + 1);
                }
                return cs;
              });
            }
            this.utilSerive.toExcel(name, excelHeader, excelData);
          },
          err => {
            this.utilSerive.errDeal(err);
            dismiss();
          },
        );
    }
  }

  tableInsideDataToObject(t: TableInsideData[]) {
    const out: any = {};
    t.forEach(d => {
      out[d.property] = d.value;
    });
    return out;
  }

  addCompanyID(send: any, otherName: string) {
    if (typeof send === 'object' && this.user) {
      const name = typeof otherName === 'string' ? otherName : 'company_id';
      const out = isArray(send)
        ? send.map(s => Object.assign({}, s, { [name]: this.user.COMPANY_ID }))
        : Object.assign({}, send, { [name]: this.user.COMPANY_ID });
      return out;
    } else {
      return send;
    }
  }

  lazyLoad(api: string) {
    if (!api) {
      throw new Error('無API');
    }
    return this.http.get(
      replaceQuery(
        api.indexOf('https:') > -1 || api.indexOf('http:') > -1
          ? api
          : environment.EMPI_URL + api,
        {},
        this.user,
      ),
    );
  }
  getDataByIdx(dataDrive: DataDrive, idx: number) {
    const data = dataDrive.getData()[idx];
    const out: any = {};
    if (isArray(data)) {
      data.forEach(d => {
        out[d.property] = d.value;
      });
      return out;
    } else {
      return null;
    }
  }

  toUpdate(d: DataDrive, idx: number, component: any) {
    if (!d.runBeforeUpdateShow(this.getDataByIdx(d, idx))) {
      return false;
    }
    const notPrimarySets = d.updateSets.filter(u => {
      if (u.InputOpts.type !== 'primary') {
        return true;
      } else {
        return false;
      }
    });
    const colNum = Math.ceil(notPrimarySets.length / 8);
    const subscription = this.modalService.create({
      nzTitle: idx > -1 ? '更新' : '新增',
      nzContent: component,
      nzOnOk() {},
      nzOnCancel() {},
      nzFooter: null,
      nzComponentParams: {
        opts: d,
        changeIdx: idx,
        afterSubmitSuccess: () => {
          subscription.destroy();
        },
      },
      nzWidth: 520 + Math.max(colNum - 1, 0) * 300 + 'px',
    });
  }
}
