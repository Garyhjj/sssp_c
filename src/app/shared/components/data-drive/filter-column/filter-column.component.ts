import { Subscription } from 'rxjs';
import { DataDrive } from '../../data-drive/shared/models/index';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-filter-column',
  templateUrl: './filter-column.component.html',
  styleUrls: ['./filter-column.component.css'],
})
export class FilterColumnComponent implements OnInit, OnDestroy {
  private dataDrive: DataDrive;

  @Input()
  set opts(opts: DataDrive) {
    this.dataDrive = opts;
    this.columns = opts.tableData.columns.slice();
  }
  hideLists: string[] = [];
  columns;
  private sub1: Subscription;
  checkOptionsOne: { label: string; value: string; checked: boolean }[];
  allChecked = false;
  indeterminate = true;

  ngOnInit() {
    this.subjectHideList();
  }

  updateCheckOptions() {
    this.checkOptionsOne = this.columns.map(c => {
      const property = c.property;
      return {
        label: c.value,
        value: property,
        checked: this.hideLists.indexOf(property) > -1 ? false : true,
      };
    });
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    // tslint:disable-next-line:no-unused-expression
    this.sub1 && this.sub1.unsubscribe();
  }

  subjectHideList() {
    if (this.dataDrive) {
      if (this.sub1) {
        this.sub1.unsubscribe();
      }
      this.sub1 = this.dataDrive.observeHideLists().subscribe(ls => {
        this.hideLists = ls;
        this.updateCheckOptions();
      });
    }
  }

  updateAllChecked() {
    this.indeterminate = false;
    if (this.allChecked) {
      this.checkOptionsOne.forEach(item => (item.checked = true));
      this.dataDrive.selfHideLists = [];
    } else {
      const hideList = [];
      this.checkOptionsOne.forEach(item => {
        item.checked = false;
        hideList.push(item.value);
      });
      this.dataDrive.selfHideLists = hideList;
    }
  }

  updateHideList() {
    const hideList = [];
    this.checkOptionsOne.forEach(item => {
      // tslint:disable-next-line:no-unused-expression
      !item.checked && hideList.push(item.value);
    });
    this.dataDrive.selfHideLists = hideList;
  }

  updateSingleChecked() {
    if (this.checkOptionsOne.every(item => item.checked === false)) {
      this.allChecked = false;
      this.indeterminate = false;
    } else if (this.checkOptionsOne.every(item => item.checked === true)) {
      this.allChecked = true;
      this.indeterminate = false;
    } else {
      this.indeterminate = true;
    }
    this.updateHideList();
  }
}
