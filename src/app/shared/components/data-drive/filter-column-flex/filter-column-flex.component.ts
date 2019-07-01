import { Subscription } from 'rxjs';
import { DataDrive } from '../../data-drive/shared/models/index';
import {
  Component,
  Input,
  Output,
  OnInit,
  OnDestroy,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'app-filter-column-flex',
  templateUrl: './filter-column-flex.component.html',
  styleUrls: ['./filter-column-flex.component.css'],
})
export class FilterColumnFlexComponent implements OnInit, OnDestroy {
  private dataDrive: DataDrive;

  @Input()
  set opts(opts: DataDrive) {
    this.dataDrive = opts;
    this.columns = opts.tableData.columns.slice();
  }
  @Input() isVisible;
  @Output() closed = new EventEmitter();
  hideLists: string[] = [];
  columns;
  private sub1: Subscription;
  checkOptionsOne: { label: string; value: string; checked: boolean }[];
  allChecked = false;
  indeterminate = true;
  checkOptionsOne2 = [
    { label: 'Apple', value: 'Apple', checked: true },
    { label: 'Pear', value: 'Pear' },
    { label: 'Apple', value: 'Apple', checked: true },
    { label: 'Pear', value: 'Pear' },
    { label: 'Apple', value: 'Apple', checked: true },
    { label: 'Pear', value: 'Pear' },
    { label: 'Apple', value: 'Apple', checked: true },
    { label: 'Pear', value: 'Pear' },
    { label: 'Apple', value: 'Apple', checked: true },
    { label: 'Pear', value: 'Pear' },
    { label: 'Apple', value: 'Apple', checked: true },
    { label: 'Pear', value: 'Pear' },
  ];

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
    if (this.sub1) {
      this.sub1.unsubscribe();
    }
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

  updateHideList() {
    const hideList = [];
    this.checkOptionsOne.forEach(item => {
      if (!item.checked) {
        hideList.push(item.value);
      }
    });
    this.dataDrive.selfHideLists = hideList;
  }

  updateSingleChecked() {
    this.updateHideList();
  }

  handleOkTop = e => {
    this.closeModal();
  };

  handleCancelTop = e => {
    this.closeModal();
  };

  closeModal() {
    this.closed.emit();
    this.isVisible = false;
  }
}
