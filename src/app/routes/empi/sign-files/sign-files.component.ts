import { ScanComponent } from './../scan/scan.component';
// tslint:disable-next-line:use-path-mapping
import { UtilService } from '@core/services/util.service';
import { EmpiService } from './../shared/services/empi.service';
// tslint:disable-next-line:use-path-mapping
import { DataDriveService } from '@shared/components/data-drive/core/services/data-drive.service';
import { DA_SERVICE_TOKEN, TokenService } from '@delon/auth';
import { Component, OnInit, Inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
// tslint:disable-next-line:use-path-mapping
import { DataDrive } from '../../../shared/components/data-drive/shared/models';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-sign-files',
  templateUrl: './sign-files.component.html',
  styleUrls: ['./sign-files.component.less'],
})
export class SignFilesComponent implements OnInit , OnDestroy{
  isSignVisible = false;
  QE;

  signingData;
  d: DataDrive;
  targetPdf;
  attachFn;
  bodyCellStyle = (data: any /* 所在行的数据 */, property: string /* 栏位位 */) => {
    if( property === 'FILE_NAME') {
      return { 'max-width': '250px' };
    }
  };
  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: TokenService,
    private dataDriveService: DataDriveService,
    private modalService: NzModalService,
    private empiService: EmpiService,
    private util: UtilService,
    private _message: NzMessageService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {}

  getDataDrive(d: DataDrive) {
    this.d = d;
    const showColumns = ['FILE_NAME', 'MN_NO', 'FILE_CATEGORY','FILE_TYPE','UPLOAD_BY','UPLOAD_TIME'];
    d.tableData.columns = d.tableData.columns.filter(_ => showColumns.indexOf(_.property)>-1);
    d.tableData.searchable = false;
    d.tableData.stopFirstInit = true;
    const user = this.tokenService.get();
    const id = user.ID;
    d.addDefaultSearchParams({ signer: user.ID });
    d.beforeInitTableData(
      ls =>
        ls &&
        ls.filter(
          l =>
            (!l.APPROVE_DATE1 && l.APPROVER1 === id) ||
            (!l.APPROVE_DATE2 && l.APPROVER2 === id && l.APPROVE_DATE1),
        ),
    );
    this.dataDriveService.updateViewData(d);
  }

  updateData() {
    this.dataDriveService.updateViewData(this.d);
  }

  get translateText() {
    return this.empiService.translateText;
  }

  sendRejectMail(id) {
    this.empiService.sendRejectMail(id).subscribe(() => {

    },(err) => console.log('邮件通知出错' + err))
  }

  reject(data) {
    this.modalService.confirm({
      nzTitle: this.translateText['empi.confirmReject'],
      nzOnOk: () => {
        const {ID} = data;
        if(data.APPROVER2) {
          const send = {
            ID,
            APPROVE_DATE1: '',
            APPROVE_DATE2: '',
            APPROVE_FLAG: 'N',
          };
          const dismiss = this.util.showLoading2();
          this.empiService.updateFiles(send).subscribe(
            () => {
              dismiss();
              this.updateData();
              this.sendRejectMail(ID);
            },
            () => dismiss(),
          );
        }else {
          this.sendRejectMail(ID);
        }
        
      },
      nzOnCancel() {},
    });
  }

  sign(data) {
    const { APPROVE_DATE1, APPROVER2 } = data;
    this.signingData = data;
    const user = this.tokenService.get();
    const id = user.ID;
    if (APPROVE_DATE1) {
      this.modalService.confirm({
        nzTitle: this.translateText['empi.confirmSign'],
        nzOnOk: () => {
          const send = {
            ID: data.ID,
            APPROVER2: id,
            APPROVE_DATE2: new Date(),
            APPROVE_FLAG: 'Y',
          };
          const dismiss = this.util.showLoading2();
          this.empiService.updateFiles(send).subscribe(
            () => {
              dismiss();
              this.updateData();
            },
            () => dismiss(),
          );
        },
        nzOnCancel() {},
      });
    } else {
      // this.isSignVisible = true;
      this.modalService.confirm({
        nzTitle: this.translateText['empi.confirmSign'],
        nzOnOk: () => {
          const send = {
            ID: data.ID,
            APPROVE_DATE1: new Date(),
            APPROVE_FLAG: APPROVER2?'W': 'Y',
          };
          const dismiss = this.util.showLoading2();
          this.empiService.updateFiles(send).subscribe(
            () => {
              dismiss();
              this.updateData();
            },
            () => dismiss(),
          );
        },
        nzOnCancel() {},
      });
    }
  }

  submitSignForm() {
    const { APPROVER1, ID } = this.signingData;
    const QE = this.QE;
    let send;
    if (+QE === +APPROVER1) {
      send = {
        ID: ID,
        APPROVE_DATE1: new Date(),
        APPROVER2: QE,
        APPROVE_DATE2: new Date(),
        APPROVE_FLAG: 'Y',
      };
    } else {
      send = {
        ID: ID,
        APPROVE_DATE1: new Date(),
        APPROVER2: QE,
        APPROVE_FLAG: 'W',
      };
    }
    const dismiss = this.util.showLoading2();
    this.empiService.updateFiles(send).subscribe(
      () => {
        dismiss();
        this.updateData();
        this.isSignVisible = false;
      },
      () => dismiss(),
    );
  }

  ngOnDestroy() {
    if (this.attachFn) {
      window.removeEventListener('keydown', this.attachFn);
    }
  }

  scanPdf(d) {
    this.targetPdf = d.FILE_PATH;
    this._message.info(this.translateText['exitByEsc'], { nzDuration: 5000 });
    if (!this.attachFn) {
      window.addEventListener(
        'keydown',
        (this.attachFn = e => {
          // tslint:disable-next-line:no-unused-expression
          e.keyCode === 27 && (this.targetPdf = '');
          this.cd.markForCheck();
        }),
      );
    }
  }
}
