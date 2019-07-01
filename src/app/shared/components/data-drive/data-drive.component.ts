import { TableDataColumn } from './shared/models/table-data/index';
import { Subscription } from 'rxjs';
import { DataDrive, TableDataModel } from './shared/models/index';
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  TemplateRef,
  ContentChild,
} from '@angular/core';
import { DataDriveService } from './core/services/data-drive.service';
import { UtilService } from '../../../core/services/util.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-data-drive',
  templateUrl: './data-drive.component.html',
  styleUrls: ['./data-drive.component.css'],
})
export class DataDriveComponent implements OnInit, OnDestroy {
  @ContentChild('actionRef') actionRef: TemplateRef<void>;
  @ContentChild('tableCellRef') tableCellRef: TemplateRef<void>;
  @ContentChild('headerCellRef') headerCellRef: TemplateRef<void>;
  tableData: TableDataModel;
  dataDrive: DataDrive;
  isShowModal = of(false);
  attachFn: Function;
  private _name: any;
  sub1: Subscription;
  sub2: Subscription;
  timeID: any;
  @Input()
  set name(n: any) {
    this._name = n;
  }
  @Input() viewerMinWidth;
  @Input() headerCellStyle: (c: TableDataColumn) => any;
  @Input() bodyCellStyle: (data: any, property: string) => any;
  @Input() dataDriveInit2: (d: DataDrive) => void;

  @Output() dataDriveInit: EventEmitter<DataDrive> = new EventEmitter();

  constructor(
    private dataDriveService: DataDriveService,
    private utilService: UtilService,
  ) {}

  async ngOnInit() {
    const loadingId = this.utilService.showLoading();
    this.dataDrive = await this.dataDriveService.initDataDrive(this._name);
    this.utilService.dismissLoading(loadingId);
    if (!this.dataDrive) {
      return;
    }
    if (typeof this.dataDriveInit2 === 'function') {
      this.dataDriveInit2(this.dataDrive);
    }
    this.dataDriveInit.emit(this.dataDrive);
    this.tableData = this.dataDrive.tableData;
    this.isShowModal = this.dataDrive.observeIsShowModal();
    if (this.tableData && !this.tableData.stopFirstInit) {
      this.dataDrive.isGetingData = true;
      const final = () =>
        setTimeout(() => (this.dataDrive.isGetingData = false), 200);
      this.dataDriveService.getInitData(this.dataDrive, true).subscribe(
        (ds: any) => {
          this.dataDriveService.initTableData(this.dataDrive, ds);
          final();
        },
        err => {
          this.utilService.errDeal(err);
          final();
        },
      );
    }
    this.dataDrive
      .observeSelfUpdateTableData()
      .subscribe(d => this.dataDriveService.initTableData(this.dataDrive, d));
    const searchSets = this.dataDrive.searchSets;
    const refreshDataInterval = this.tableData.refreshDataInterval;
    if (!Number.isNaN(+refreshDataInterval)) {
      const interval = Math.max(refreshDataInterval, 1000 * 10);
      const updateViewData = () => {
        if (!this.timeID) {
          this.timeID = setTimeout(() => {
            this.timeID = null;
            this.dataDriveService.updateViewData(this.dataDrive);
            updateViewData();
          }, interval);
        }
      };
      updateViewData();
    } else {
      if (this.dataDrive.canAutoUpdate) {
        this.dataDrive.observeScrollToBottom().subscribe(_ => {
          this.dataDriveService.updateViewData(this.dataDrive);
        });
      }
    }
  }

  ngOnDestroy() {
    // tslint:disable-next-line:no-unused-expression
    this.sub1 && this.sub1.unsubscribe();
    // tslint:disable-next-line:no-unused-expression
    this.sub2 && this.sub2.unsubscribe();
    clearTimeout(this.timeID);
  }
}
