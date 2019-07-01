import { replaceQuery } from './../../../utils/index';
import { TranslateService } from '@ngx-translate/core';
import { DataDriveService } from './../core/services/data-drive.service';
import { Observable, forkJoin } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { DataDriveComponent } from './../data-drive.component';
import { UtilService } from './../../../../core/services/util.service';
import { DataDrive } from './../shared/models/index';
import { UploadFile, NzModalService } from 'ng-zorro-antd';
import { Component, OnInit, Input } from '@angular/core';
import * as XLSX from 'xlsx';
import { isArray } from '../../../utils';

@Component({
  selector: 'app-muti-update',
  templateUrl: './muti-update.component.html',
  styleUrls: ['./muti-update.component.css'],
})
export class MutiUpdateComponent implements OnInit {
  uploading = false;
  fileList: UploadFile[] = [];
  primaryKey: string;
  translateText = {};
  @Input() dataDrive: DataDrive;
  @Input() succCb: () => void;

  hasData;
  dataHaveError;
  constructor(
    private util: UtilService,
    private modalService: NzModalService,
    private dataDriveService: DataDriveService,
    private translateService: TranslateService,
  ) {}

  beforeUpload = (file: UploadFile): boolean => {
    this.fileList[0] = file;
    this.readExcel().subscribe((data: any[]) => {
      this.hasData = !!(data && data.length);
      if(!this.hasData) {
        this.util.showGlobalWarningMes('无资料');
      }else {
        const res = this.dataDrive.runOnMutiUpdateSelectFile(data);
        if(res === false) {
          this.preview();
          this.dataHaveError = true;
        }else {
          this.dataHaveError = false;
        }
      }
    })
    return false;
  };

  handleUpload() {
    // if (!this.primaryKey) {
    //   return this.util.showGlobalErrMes(
    //     this.translateText['dataDriveModule.noPrimaryKey'],
    //   );
    // }
    const doUpload = () => {
      this.readExcel().subscribe((data: any[]) => {
        data = data.map(d => {
          if (this.primaryKey) {
            d[this.primaryKey] = 0;
          }
          return d;
        });
        this.uploading = true;
        const dataDrive = this.dataDrive;
        let succCount = 0;
        this.dataDriveService
          .updateData(dataDrive, data)
          .pipe(
            catchError(_ => {
              const req = [];
              data.forEach(d =>
                req.push(
                  this.dataDriveService
                    .updateData(dataDrive, d)
                    .pipe(tap(__ => succCount++)),
                ),
              );
              return forkJoin(req);
            }),
          )
          .subscribe(
            _ => {
              if (typeof this.succCb === 'function') {
                this.succCb();
              }
              this.uploading = false;
              this.util.showGlobalSucMes(this.translateText['submitSuccess']);
              this.dataDriveService.updateViewData(dataDrive, true);
            },
            err => {
              this.uploading = false;
              this.util.errDeal(err);
              this.util.showGlobalErrMes(
                this.translateText['dataDriveModule.mutiUpdateErrRes']
                  ? replaceQuery(
                      this.translateText['dataDriveModule.mutiUpdateErrRes'],
                      {
                        succCount,
                        errorCount: data.length - succCount,
                      },
                    )
                  : '',
              );
            },
          );
      });
    };
    doUpload();
    // this.modalService.confirm({
    //   nzTitle: this.translateText['dataDriveModule.mutiUpdateConfirm'],
    //   nzZIndex: 9991,
    //   nzOnOk() {
    //     doUpload();
    //   },
    //   nzOnCancel() {},
    // });
  }

  readExcel() {
    return new Observable(ob => {
      if (this.fileList[0]) {
        const dataDrive = this.dataDrive;
        const columns = dataDrive.tableData.columns;
        const reader: FileReader = new FileReader();
        reader.onload = (e: any) => {
          /* read workbook */
          const bstr: string = e.target.result;
          let res;
          try {
            const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
            /* grab first sheet */
            const wsname: string = wb.SheetNames[0];
            const ws: XLSX.WorkSheet = wb.Sheets[wsname];
            /* save data */
            res = XLSX.utils.sheet_to_json(ws, {
              header: 1,
              defval: '',
            }) as string[][];
          } catch (e) {
            ob.error(e);
            this.util.showGlobalErrMes(
              this.translateText['dataDriveModule.readExcelFail'],
            );
          }
          if (!res) {
            return;
          }
          if (res.length < 2) {
            ob.next([]);
          }else {
            ob.next(
              res.slice(1).map(r => {
                const out = {};
                if (isArray(r)) {
                  columns.forEach((_, idx) => {
                    out[_.property] = r[idx];
                  });
                }
                return out;
              }),
            );
          }
          ob.complete();
        };
        reader.readAsBinaryString(this.fileList[0] as any);
      }
    });
  }
  preview() {
    const dataDrive = this.dataDrive;
    this.readExcel().subscribe((res: any[]) => {
      if(res.length === 0) {
        this.util.showGlobalWarningMes('无资料');
        return;
      }
      const subscription = this.modalService.create({
        nzTitle: this.translateText['preview'],
        nzContent: DataDriveComponent,
        nzZIndex: 99999,
        nzOnOk() {},
        nzOnCancel() {},
        nzFooter: null,
        nzComponentParams: {
          name: dataDrive.id,
          dataDriveInit2: (d: DataDrive) => {
            if (d instanceof DataDrive) {
              d.additionalFn = {};
              if (d.tableData) {
                const tableData = d.tableData;
                tableData.addable = tableData.editable = tableData.deletable = tableData.searchable = false;
                tableData.stopFirstInit = true;
              }
              const viewSet = d.dataViewSet;
              if (viewSet.type === 'table') {
                viewSet.more.showAction = false;
              }
              setTimeout(() => {
                d.selfUpdateTableData(res);
              }, 20);
            }
          },
          bodyCellStyle: dataDrive.mutiPreviewBodyStyle
        },
        nzWidth: '75%',
      });
    });
  }

  downLoadTemplet() {
    const dataDrive = this.dataDrive;
    const tableData = dataDrive.tableData;
    const dataViewSet = dataDrive.dataViewSet;
    let title = (dataViewSet && dataViewSet.title) || '';
    title = title + '-' + this.translateText['template'];
    const columns = tableData.columns;
    const data = tableData.data;
    let excelHeader = [];
    let excelData = [];
    if (columns && columns.length > 0) {
      excelHeader = columns.map(c => c.value);
    }
    if (data && data.length > 0) {
      excelData = data
        .slice(0, 1)
        .map(c => c.filter(s => !s.hide).map(d => d.value));
    }
    this.util.toExcel(title, excelHeader, excelData);
  }
  ngOnInit() {
    if (!(this.dataDrive instanceof DataDrive)) {
      throw new Error(this.translateText['dataDriveModule.noDataDrive']);
    }
    if (this.dataDrive.updateSets) {
      const primaryKeySet = this.dataDrive.updateSets.find(
        s => s.InputOpts.type === 'primary',
      );
      if (primaryKeySet) {
        this.primaryKey = primaryKeySet.property;
      }
    }
    this.translateService
      .get([
        'submitSuccess',
        'preview',
        'template',
        'dataDriveModule.noPrimaryKey',
        'dataDriveModule.mutiUpdateErrRes',
        'dataDriveModule.mutiUpdateConfirm',
        'dataDriveModule.readExcelFail',
        'dataDriveModule.noDataDrive',
      ])
      .subscribe(_ => (this.translateText = _));
  }
}
