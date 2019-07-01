import { TabelViewSet } from './../../shared/models/viewer/table';
import { DataViewType } from './../../shared/models/viewer/index';
import { DataUpdateComponent } from './../data-update/data-update.component';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { deepClone } from './../../../../utils/index';
import { SearchItemSet } from './../../shared/models/searcher/index';
import { DataDrive, TableDataColumn } from './../../shared/models/index';
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { NgxValidatorExtendService } from '../../../../../core/services/ngx-validator-extend.service';
import { DataDriveService } from '../../core/services/data-drive.service';
import { UtilService } from '../../../../../core/services/util.service';
import { isArray } from '../../../../utils/index';
import { MutiUpdateComponent } from '../../muti-update/muti-update.component';

@Component({
  selector: 'app-data-searchbar',
  templateUrl: './data-searchbar.component.html',
  styleUrls: ['./data-searchbar.component.css'],
})
export class DataSearchbarComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private validExd: NgxValidatorExtendService,
    private dataDriveService: DataDriveService,
    private util: UtilService,
    private modalService: NzModalService,
    private _message: NzMessageService,
  ) {}

  currentViewIdx = -1;
  isShowModal = false;
  attachFn: any;
  dataDrive: DataDrive;
  columns: TableDataColumn[];
  searchSets: SearchItemSet[];
  columnNameStrings: string[];
  inputTypeList: any[];
  errMes: any = {};
  formLayout = 'inline';
  @Input()
  set opts(opts: DataDrive) {
    if (!opts) {
      return;
    }
    this.dataDrive = opts;
    this.searchSets = opts.searchSets;
    this.columns = opts.tableData.columns;
    try {
      this.columnNameStrings = this.searchSets.map(s => s.property);
    } catch (e) {
      this.columnNameStrings = [];
    }
    // console.log(this.dataDrive);
  }

  // Modal
  isVisible = false;

  // 高级搜索框
  show = false;
  validateForm: FormGroup;
  controlArray = [];
  isCollapse = true;

  // 存储搜索框的key值
  selectedOption;
  // 存储搜索框的value值
  filterValue: string;
  filterList = {};
  optionList: any[];
  tagList = [];
  mode: string;
  notShowSearchInput = false;

  // 调整字体大小
  showFontSizeModal = false;
  headerFontSize = 16;
  bodyFontSize = 16;
  viewerType: string;

  /**
   * 当搜索栏中的选项发生变化时触发
   * @param searchTexte
   */

  toggle() {
    this.show = !this.show;
  }

  ngOnInit() {
    const setStore = this.dataDrive.getSetStore();
    if (typeof setStore === 'object' && setStore) {
      if (setStore.headerFontSize) {
        this.headerFontSize = Number(setStore.headerFontSize.replace('px', ''));
        this.changeHeaderSize();
      }
      if (setStore.bodyFontSize) {
        this.bodyFontSize = Number(setStore.bodyFontSize.replace('px', ''));
        this.changeBodySize();
      }
    }
    this.validateForm = this.fb.group({});

    for (let i = 0; i < 3; i++) {
      this.controlArray.push({ index: i, show: true });
      this.validateForm.addControl(`field${i}`, new FormControl());
    }

    if (!this.dataDrive) {
      return;
    }
    const myForm: any = {};
    let hasRequired;
    if (this.searchSets && this.searchSets.length > 0) {
      this.inputTypeList = this.searchSets.map(s => {
        const def = (s.InputOpts && s.InputOpts.default) || '';
        const mapColumn = this.columns.find(c => c.property === s.property);
        const match = s.InputOpts.match;
        let valid = null;
        if (match) {
          if (match.err) {
            this.errMes[s.property] = match.err;
          }
          if (isArray(match.fns)) {
            valid = [];
            match.fns.forEach(f => {
              const validFn = this.validExd[f.name];
              const validParmas = f.params || f.parmas || [];
              if (validFn) {
                valid.push(validFn(...validParmas));
              }
            });
          }
        }
        myForm[s.property] = [def, valid];
        const isRequired =
          s.InputOpts.match &&
          isArray(s.InputOpts.match.fns) &&
          !!s.InputOpts.match.fns.find(_ => _.name === 'required');
        if (isRequired) {
          hasRequired = true;
        }
        const label = mapColumn ? mapColumn.value : s.property;
        return Object.assign(
          {
            label: label,
            apiProperty: s.apiProperty,
            isRequired,
          },
          s.InputOpts,
        );
      });
      this.validateForm = this.fb.group(myForm);
      this.optionList = this.inputTypeList.filter(
        value =>
          value.type === 'text' ||
          value.type === 'textarea' ||
          value.type === 'number',
      );
      if (this.optionList.length === 0) {
        this.show = true;
      }
      this.selectedOption = this.optionList[0];
      if (this.selectedOption) {
        this.selectedOption.placeHolder =
          this.selectedOption.placeHolder || ' ';
      }
      if(this.dataDrive.useSearchCollapse) {
        this.notShowSearchInput = true;
        return;
      }
      if (this.validateForm.valid && !hasRequired ) {
        this.notShowSearchInput = false;
      } else {
        this.notShowSearchInput = true;
        this.show = true;
      }
    }
  }

  showModalTop = () => {
    this.isVisible = true;
  };

  closeModal() {
    this.isVisible = false;
  }

  reSet() {
    this.validateForm.reset();
  }

  updateView() {
    this.dataDriveService.updateViewData(this.dataDrive);
  }

  submitForm(mode: string) {
    let value;
    if (mode === 'simple' && Object.keys(this.filterList).length > 0) {
      value = this.filterList;
    } else {
      value = deepClone(this.validateForm.value);
      this.filterList = value;
      this.tagList = [];
      this.getAllTagList(this.tagList, this.filterList);
    }
    const cascaderProps = this.inputTypeList
      .filter(i => i.type === 'cascader')
      .map(t => t.label);
    cascaderProps.forEach(c => {
      const cascaderProp = value[c];
      if (cascaderProp) {
        Object.assign(value, cascaderProp);
      }
      delete value[c];
    });

    const send: any = Object.assign({}, value);
    this.searchSets.forEach(s => {
      if (value.hasOwnProperty(s.property)) {
        const trueProp = s.apiProperty ? s.apiProperty : s.property;
        if (!(mode === 'simple' && send[trueProp])) {
          send[trueProp] = value[s.property];
        }
      }
    });
    const id = this.util.showLoading();
    const finalFn = loadingId => this.util.dismissLoading(loadingId);
    this.dataDriveService.searchData(this.dataDrive, send).subscribe(
      (c: any[]) => {
        this.dataDriveService.initTableData(this.dataDrive, c);
        finalFn(id);
      },
      err => {
        this.util.errDeal(err);
        finalFn(id);
      },
    );
  }

  clickSimpleSearch(mode: string) {
    if (this.validateForm.valid) {
      this.getFinalSearchValue(this.filterValue);
      this.submitForm(mode);
      this.filterValue = '';
    }
  }

  onCloseTag(tag: Tag, mode: string) {
    let index = this.tagList.indexOf(tag);
    this.tagList.splice(index, 1);
    delete this.filterList[tag.prop];
    this.submitForm(mode);
  }

  /**
   * 清除所有的查询条件
   * @param mode
   */
  clearAllFilter(mode: string) {
    this.reSet();
    this.filterList = {};
    this.tagList = [];
    this.submitForm(mode);
  }

  /**
   * 根据中文名找数据库栏位名
   * @param name
   */
  getDbTitleName(name: string): string {
    // 首先从columns里面找
    for (let i = 0; i < this.columns.length; i++) {
      if (this.columns[i].value === name) {
        return this.columns[i].property;
      }
    }
    // 如果找不到，则从searchSets找
    for (let j = 0; j < this.searchSets.length; j++) {
      if (this.searchSets[j].property === name) {
        return this.searchSets[j].apiProperty;
      }
    }
  }

  /**
   * 根据数据库名查询对应的中文名
   * @param title
   */
  getChineseTitleName(title: string): string {
    for (let i = 0; i < this.columns.length; i++) {
      if (this.columns[i].property === title) {
        return this.columns[i].value;
      }
    }
    return title;
  }

  getFinalSearchValue(filterValue: string) {
    if (filterValue) {
      let title = this.getDbTitleName(this.selectedOption.label);
      if (title) {
        this.filterList[title] = filterValue;
        this.getTagList(this.tagList, filterValue);
      }
    }
  }

  getTagList(tagList: Tag[], filterValue: string) {
    let label = `${this.selectedOption.label}:${filterValue}`;
    let finded = false;
    let title = this.getDbTitleName(this.selectedOption.label);
    for (let i = 0; i < tagList.length; i++) {
      if (tagList[i].prop === title) {
        tagList[i].label = label;
        finded = true;
        break;
      }
    }
    if (!finded) {
      tagList.push({
        prop: title,
        label: label,
      });
    }
  }

  getAllTagList(tagList: Tag[], filterList: any) {
    let label;
    let keys = Object.keys(filterList).filter(value => filterList[value]);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      let itemType = this.getItemType(key);
      let chineseTitle = this.getChineseTitleName(key);

      let value = filterList[key];

      if (itemType === 'checkbox' || itemType === 'select') {
        const set = this.searchSets
          .filter(s => {
            const type = s.InputOpts.type;
            return type === 'checkbox' || type === 'select';
          })
          .find(s => s.property === key);
        if (set) {
          const vL = (value + '').split(',') as string[];
          set.InputOpts.more.options.forEach(v => {
            const idx = vL.indexOf(v.property + '');
            if (idx > -1) {
              vL[idx] = v.value;
            }
          });
          value = vL.join(',');
        }
      }

      // 判断value是否为object，如果是，则把object的所有value值拼接起来
      if (typeof value === 'object') {
        value = Object.values(value).join('/ ');
      }

      if (value) {
        label = `${chineseTitle}:${value}`;
        tagList.push({
          prop: keys[i],
          label: label,
        });
      }
    }
  }

  getItemType(title: string) {
    let result = this.searchSets.filter(value => {
      return value.property === title;
    });
    if (result.length > 0) {
      if (result[0].InputOpts && result[0].InputOpts.type) {
        return result[0].InputOpts.type;
      }
    }
    return 'text';
  }

  /**
   * 新增数据
   */
  addItem() {
    if (!this.dataDrive.isDataAddable()) {
      return;
    }
    this.dataDriveService.toUpdate(this.dataDrive, -1, DataUpdateComponent);
  }

  /**
   * 导出数据到Excel
   */
  toExcel() {
    this.dataDriveService.toExcel(this.dataDrive);
  }

  /**
   * 全屏显示
   */
  showModal() {
    this.dataDrive.modalSataus = this.isShowModal = true;
    this._message.info('按下键盘Esc按钮可退出', { nzDuration: 5000 });
    if (!this.attachFn) {
      window.addEventListener(
        'keydown',
        (this.attachFn = e =>
          e.keyCode === 27 &&
          (this.dataDrive.modalSataus = this.isShowModal = false)),
      );
    }
  }

  /**
   * 视图切换
   * @param type
   */
  switchViewType(type: DataViewType[]) {
    if (!isArray(type)) {
      return;
    }
    if (this.currentViewIdx < 0) {
      this.currentViewIdx = type.findIndex(
        t => t === this.dataDrive.dataViewSet.type,
      );
    }
    if (this.currentViewIdx < 0) {
      this.currentViewIdx = 0;
    }
    this.currentViewIdx++;
    if (this.currentViewIdx > type.length - 1) {
      this.currentViewIdx = 0;
    }
    this.dataDrive.switchViewType(type[this.currentViewIdx]);
  }

  /**
   * 打開調整字體大小模態框
   */
  openFontSizeModal() {
    this.showFontSizeModal = true;
  }

  /**
   * 關閉調整字體大小模態框
   */
  closeFontSizeModal() {
    this.showFontSizeModal = false;
  }

  changeHeaderSize() {
    this.viewerType = this.dataDrive.dataViewSet.type;
    const size = this.headerFontSize + 'px';
    switch (this.viewerType) {
      case 'table':
        this.dataDrive.dataViewSet.changeHeaderFontSize(size);
        this.dataDrive.updateSelfSetStore({ headerFontSize: size });
        break;
    }
  }

  changeBodySize() {
    this.viewerType = this.dataDrive.dataViewSet.type;
    const size = this.bodyFontSize + 'px';
    switch (this.viewerType) {
      case 'table':
        this.dataDrive.dataViewSet.changeBodyFontSize(size);
        this.dataDrive.updateSelfSetStore({ bodyFontSize: size });
        break;
    }
  }

  showMutiUpdate() {
    const subscription = this.modalService.create({
      nzTitle: '批量插入数据',
      nzContent: MutiUpdateComponent,
      nzOnOk() {},
      nzOnCancel() {},
      nzFooter: null,
      nzComponentParams: {
        dataDrive: this.dataDrive,
        succCb: () => {
          subscription.destroy();
        },
      },
    });
  }

  stopScrolling() {
    let d = this.dataDrive;
    if (d.dataViewSet && d.dataViewSet.type === 'table') {
      let tableView = d.dataViewSet as TabelViewSet;
      tableView.stopScrolling();
    }
  }

  beginScrolling() {
    let d = this.dataDrive;
    if (d.dataViewSet && d.dataViewSet.type === 'table') {
      let tableView = d.dataViewSet as TabelViewSet;
      tableView.beginScrolling();
    }
  }
}

interface Tag {
  prop: string;
  label: string;
}
