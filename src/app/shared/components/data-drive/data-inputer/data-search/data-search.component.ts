import { deepClone } from './../../../../utils/index';
import { SearchItemSet } from './../../shared/models/searcher/index';
import { DataDrive, TableDataColumn } from './../../shared/models/index';
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxValidatorExtendService } from '../../../../../core/services/ngx-validator-extend.service';
import { DataDriveService } from '../../core/services/data-drive.service';
import { UtilService } from '../../../../../core/services/util.service';
import { isArray } from '../../../../utils/index';

@Component({
  selector: 'app-data-search',
  templateUrl: './data-search.component.html',
  styleUrls: ['./data-search.component.css'],
})
export class DataSearchComponent implements OnInit {
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
    this.columnNameStrings = this.searchSets.map(s => s.property);
  }
  @Input() changeIdx = 1;

  validateForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private validExd: NgxValidatorExtendService,
    private dataDriveService: DataDriveService,
    private util: UtilService,
  ) {}

  reSet() {
    this.validateForm.reset();
  }

  submitForm() {
    const value = deepClone(this.validateForm.value);
    const cascaderProps = this.inputTypeList
      .filter(i => i.type === 'cascader')
      .map(t => t.label);
    cascaderProps.forEach(c => {
      const cascaderProp = value[c];
      // tslint:disable-next-line:no-unused-expression
      cascaderProp && Object.assign(value, cascaderProp);
      delete value[c];
    });

    const send: any = Object.assign({}, value);
    this.searchSets.forEach(s => {
      // tslint:disable-next-line:no-unused-expression
      value.hasOwnProperty(s.property) &&
        (send[s.apiProperty ? s.apiProperty : s.property] = value[s.property]);
    });
    const id = this.util.showLoading();
    const finalFn = () => this.util.dismissLoading(id);
    this.dataDriveService.searchData(this.dataDrive, send).subscribe(
      (c: any[]) => {
        this.dataDriveService.initTableData(this.dataDrive, c);
        finalFn();
      },
      err => {
        this.util.errDeal(err);
        finalFn();
      },
    );
  }

  get isHorizontal() {
    return this.formLayout === 'horizontal';
  }

  ngOnInit() {
    if (!this.dataDrive) {
      return;
    }
    const myForm: any = {};
    this.inputTypeList = this.searchSets.map(s => {
      let def = (s.InputOpts && s.InputOpts.default) || '';
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
            const validParmas = f.parmas || [];
            // tslint:disable-next-line:no-unused-expression
            validFn && valid.push(validFn(...validParmas));
          });
        }
      }
      myForm[s.property] = [def, valid];
      return Object.assign(
        { label: mapColumn ? mapColumn.value : s.property },
        s.InputOpts,
      );
    });
    this.validateForm = this.fb.group(myForm);
    this.dataDrive.observeScrollToBottom().subscribe(() => this.submitForm());
  }
}
