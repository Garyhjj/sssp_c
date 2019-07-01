import { DataDrive, TableDataColumn } from './../shared/models/index';
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-data-inputer',
  templateUrl: './data-inputer.component.html',
  styleUrls: ['./data-inputer.component.css'],
})
export class DataInputerComponent implements OnInit {
  dataDrive: DataDrive;
  columns: TableDataColumn[];
  columnNameStrings: string[];
  inputTypeList: any[];

  formLayout = 'horizontal';
  @Input()
  set opts(opts: DataDrive) {
    if (!opts) {
      return;
    }
    this.dataDrive = opts;
    this.columns = opts.tableData.columns;
    this.columnNameStrings = this.columns.map(c => c.property);
  }
  @Input() changeIdx = 1;

  @Input() type = 0;

  validateForm: FormGroup;

  submitForm() {
    // console.log(this.validateForm.value);
  }

  get isHorizontal() {
    return this.formLayout === 'horizontal';
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit() {}
}
