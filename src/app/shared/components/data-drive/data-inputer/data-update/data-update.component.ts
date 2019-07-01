import { Subscription, Subject } from 'rxjs';
import { UtilService } from './../../../../../core/services/util.service';
import { DataDrive, TableDataColumn } from './../../shared/models/index';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SearchItemSet } from '../../shared/models/searcher/index';
import { NgxValidatorExtendService } from '../../../../../core/services/ngx-validator-extend.service';
import { DataDriveService } from '../../core/services/data-drive.service';
import { isArray } from '../../../../utils/index';

@Component({
  selector: 'app-data-update',
  templateUrl: './data-update.component.html',
  styleUrls: ['./data-update.component.css'],
})
export class DataUpdateComponent implements OnInit, OnDestroy {
  dataDrive: DataDrive;
  columns: TableDataColumn[];
  updateSets: SearchItemSet[];
  columnNameStrings: string[];
  notPrimarySets: SearchItemSet[];
  inputTypeList: any[];
  errMes: any = {};
  primaryKey: string;
  primaryValue: number;
  formLayout = 'horizontal';
  globalErr;
  sub1: Subscription;
  private globalUpdateErrSubject = new Subject<string>();
  onSubmit = new Subject<number>();
  colNum;
  sendValue;
  @Input() afterSubmitSuccess: () => {};
  @Input()
  set opts(opts: DataDrive) {
    if (!opts) {
      return;
    }
    this.dataDrive = opts;
    this.updateSets = opts.updateSets;
    this.columns = opts.tableData.columns;
    this.notPrimarySets = this.updateSets.filter(u => {
      if (u.InputOpts.type !== 'primary') {
        return true;
      } else {
        this.primaryKey = u.property;
        this.primaryValue = !Number.isNaN(+u.InputOpts.default)
          ? (u.InputOpts.default as number)
          : -1;
        return false;
      }
    });
    this.columnNameStrings = this.notPrimarySets.map(c => c.property);
    this.colNum = Math.ceil(this.columnNameStrings.length / 8);
  }
  @Input() changeIdx = -1;
  orinalData: any;
  validateForm: FormGroup;
  updating = false;

  get isHorizontal() {
    return this.formLayout === 'horizontal';
  }

  constructor(
    private fb: FormBuilder,
    private validExd: NgxValidatorExtendService,
    private dataDriveService: DataDriveService,
    private util: UtilService,
  ) {}

  arrayDataToObject(array) {
    const out = {};
    if (isArray(array)) {
      array.forEach(o => {
        out[o.property] = o.value;
      });
    }
    return out;
  }

  submitForm() {
    const out = {};
    const res = this.dataDrive.runBeforeUpdateSubmit(
      this.validateForm,
      this.globalUpdateErrSubject,
      this.arrayDataToObject(this.orinalData),
    );
    if (!res) {
      return setTimeout(() => this.globalUpdateErrSubject.next(''), 3000);
    }
    if (typeof res === 'object') {
      Object.assign(out, res);
    }
    const value = this.validateForm.value;
    const cascaderProps = this.inputTypeList
      .filter(i => i.type === 'cascader')
      .map(t => t.label);
    cascaderProps.forEach(c => {
      const cascaderProp = value[c];
      // tslint:disable-next-line:no-unused-expression
      cascaderProp && Object.assign(value, cascaderProp);
      delete value[c];
    });
    if (this.primaryKey) {
      value[this.primaryKey] = this.primaryValue;
    }
    this.sendValue = Object.assign(out, value);
    const hasFileUpload = !!this.inputTypeList.find(
      i => i.type === 'fileUpload',
    );
    this.updating = true;
    if (hasFileUpload) {
      this.onSubmit.next(1);
    } else {
      this.doUpdate();
    }
  }

  afterFileUpload(type: number, params) {
    if (type === 2) {
      this.util.showGlobalErrMes('文件上传出错');
      this.updating = false;
    } else if (type === 1) {
      const fileSet = this.inputTypeList.find(i => i.type === 'fileUpload');
      const fileProperty = fileSet ? fileSet.property : '';
      if (fileProperty) {
        this.sendValue[fileProperty] = params;
      }
      this.doUpdate();
    }
  }

  doUpdate() {
    const id = this.util.showLoading();
    const finalFn = () => {
      this.util.dismissLoading(id);
      this.updating = false;
    };
    this.dataDriveService.updateData(this.dataDrive, this.sendValue).subscribe(
      c => {
        finalFn();
        this.dataDriveService.updateViewData(this.dataDrive, true);
        this.util.showGlobalSucMes(
          this.changeIdx < 0 ? '插入成功' : '更新成功',
        );
        if (typeof this.afterSubmitSuccess === 'function') {
          this.afterSubmitSuccess();
        }
      },
      err => {
        this.util.errDeal(err);
        finalFn();
      },
    );
  }

  subscribeGlErr() {
    this.sub1 = this.globalUpdateErrSubject.subscribe(err => {
      this.globalErr = err;
      this.updating = false;
    });
  }

  ngOnDestroy() {
    // tslint:disable-next-line:no-unused-expression
    this.sub1 && this.sub1.unsubscribe();
  }
  ngOnInit() {
    if (!this.dataDrive) {
      return;
    }
    const myForm: any = {};
    this.inputTypeList = this.notPrimarySets
      .filter(u => u.InputOpts.type !== 'primary')
      .map(s => {
        let def: any = '';
        if (this.changeIdx > -1) {
          const data =
            this.dataDrive.tableData &&
            this.dataDrive.tableData.data[this.changeIdx];
          if (data) {
            this.orinalData = data;
            const target = data.find(d => d.property === s.property);
            if (target) {
              const primary = data.find(d => d.property === this.primaryKey);
              if (primary) {
                this.primaryValue = +primary.value;
              }
              def = target.value;
            } else {
              // 判断是否是级联组件，获得初始值
              const type = s.InputOpts.type;
              if (type === 'cascader') {
                const properties =
                  s.InputOpts.more && s.InputOpts.more.properties;
                if (isArray(properties)) {
                  def = '';
                  properties.forEach(p => {
                    if (typeof p === 'string') {
                      const target1 = data.find(d => d.property === p);
                      if (target1) {
                        const val = target1.value;
                        def += def ? ',' + val : val;
                      }
                    }
                  });
                }
              }
            }
          }
        } else {
          def = (s.InputOpts && s.InputOpts.default) || '';
        }
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
              // tslint:disable-next-line:no-unused-expression
              validFn && valid.push(validFn(...validParmas));
            });
          }
        }
        myForm[s.property] = [def, valid];
        const isRequired =
          s.InputOpts.match &&
          isArray(s.InputOpts.match.fns) &&
          !!s.InputOpts.match.fns.find(_ => _.name === 'required');
        const label = mapColumn ? mapColumn.value : s.property;
        return Object.assign(
          {
            label: label,
            property: s.property,
            isRequired,
          },
          s.InputOpts,
        );
      });
    // this.dataDrive.onUpdateFormShow((fg) => {
    //   console.log(fg.value);
    // })
    this.validateForm = this.fb.group(myForm);
    this.subscribeGlErr();
    this.dataDrive.updateFormGroupInited(
      this.validateForm,
      this.globalUpdateErrSubject,
      this.inputTypeList,
      this.arrayDataToObject(this.orinalData),
    );
  }
}
