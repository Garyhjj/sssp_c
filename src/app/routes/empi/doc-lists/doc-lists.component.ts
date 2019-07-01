import { DA_SERVICE_TOKEN, TokenService } from '@delon/auth';
import { EMPI_NARMAL_UPLOAD, EMPI_ADMIN } from './../shared/empi-constants';
import { ACLService, ACLType } from '@delon/acl';
import { RelationFormComponent } from './../relation-form/relation-form.component';
// tslint:disable-next-line:use-path-mapping
import { UtilService } from '@core/services/util.service';
import { EmpiService } from './../shared/services/empi.service';
import { Component, OnInit, Inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
// tslint:disable-next-line:use-path-mapping
import {
  DataDrive,
  TabelViewSet,
// tslint:disable-next-line:use-path-mapping
} from '../../../shared/components/data-drive/shared/models';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { ScanComponent } from '../scan/scan.component';
// tslint:disable-next-line:use-path-mapping
import { DataDriveService } from '@shared/components/data-drive/core/services/data-drive.service';
import { StepForm1Component } from '../step-form1/step-form1.component';
import { RelationTableComponent } from '../relation-table/relation-table.component';
import { MenuService } from '@delon/theme';
import { EMPI_DC } from '../shared/empi-constants';
// tslint:disable-next-line:use-path-mapping
import { sortUtils } from '@shared/utils';

@Component({
  selector: 'app-doc-lists',
  templateUrl: './doc-lists.component.html',
  styleUrls: ['./doc-lists.component.css'],
})
export class DocListsComponent implements OnInit, OnDestroy {
  d: DataDrive;
  selectedList;
  targetPdf;
  attachFn;
  roles = this.aclService.data.roles;
  get user() {
    return this.tokenService.get();
  }

  constructor(
    private modalService: NzModalService,
    private empiSrv: EmpiService,
    private util: UtilService,
    private dataDriveSrv: DataDriveService,
    private aclService: ACLService,
    private menuSrv: MenuService,
    private _message: NzMessageService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: TokenService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // this.aclService.change.subscribe((data: ACLType) => {
    //   if(data && data.role) {
    //     if(this.d) {
    //       const tableViewer = this.d.dataViewSet as TabelViewSet;
    //       if(!this.isCommonRole(data.role)) {
    //         tableViewer.showCheckbox();
    //       }else {
    //         tableViewer.hideCheckbox();
    //       }
    //     }
    //   }
    // })
  }

  get isDc() {
    return this.roles.indexOf(EMPI_DC) > -1;
  }

  get isNormalUpload() {
    return this.roles.indexOf(EMPI_NARMAL_UPLOAD) > -1;
  }

  get isAdmin() {
    return this.roles.indexOf(EMPI_ADMIN) > -1;
  }

  get isNotCommonUser() {
    return this.empiSrv.isNotCommonUser();
  }

  get translateText() {
    return this.empiSrv.translateText;
  }

  isCommonRole(roles: string[]) {
    return !roles.find(_ => this.isNotCommonUser.indexOf(_) > -1);
  }

  setRole(r) {
    this.aclService.setRole([r]);
    this.menuSrv.resume();
  }

  getDataDrive(d: DataDrive) {
    this.d = d;
    d.dataViewSet.more.fixedHeader = { enable: true, scrollHeight: '600px' };
    const hideList = [
      'COMPANY_CODE',
      'FILE_VERSION',
      'ENABLED',
      'APPROVER1_EMPNO',
      'APPROVER2_EMPNO',
      'APPROVE_DATE1',
      'APPROVE_DATE2',
      'REMARK',
    ];
    d.tableData.columns = d.tableData.columns.filter(
      _ => hideList.indexOf(_.property) < 0,
    );
    d.useSearchCollapse = true;
    const tableViewer = d.dataViewSet as TabelViewSet;
    if (!this.isCommonRole(this.aclService.data.roles)) {
      tableViewer.showCheckbox();
    }
    d.observeCheckedData().subscribe(ls => {
      this.selectedList = ls;
    });
    d.beforeInitTableData(ls =>
      ls
        .filter(_ => _.ENABLED !== 'N')
        .sort((a, b) => sortUtils.byDate(a.UPLOAD_TIME, b.UPLOAD_TIME, false)),
    );
    d.afterDataInit(ds => {
      const disabelChecekList = [];
      ds.forEach((data, idx) => {
        if (
          (+data.FILE_CATEGORY === 1 &&
            this.isNormalUpload &&
            (data.APPROVE_FLAG === 'Y' ||
              (data.APPROVE_FLAG !== 'Y' &&
                data.UPLOAD_BY === this.user.ID))) ||
          (data.FILE_CATEGORY === '0') ||
          this.isAdmin
        ) {
        } else {
          disabelChecekList.push(idx);
        }
      });
      if (disabelChecekList.length > 0) {
        const tableData = d.tableData.data;
        disabelChecekList.forEach(idx => {
          tableData[idx][0].disableCheck = true;
        });
      }
    });
  }

  updateRelation() {
    const ls = this.selectedList;
    const subscription = this.modalService.create({
      nzTitle: this.translateText['empi.updateRelation'],
      nzContent: RelationFormComponent,
      nzOnOk() {},
      nzOnCancel() {},
      nzFooter: null,
      nzComponentParams: {
        onSubmit: value => {
          const sends = ls.map(l => {
            const basic = { FILE_ID: l.ID, COMPANY_CODE: l.COMPANY_CODE };
            return { ...basic, ...value };
          });
          const dismiss = this.util.showLoading2();
          const final = () => {
            dismiss();
            subscription.destroy();
            this.updateList();
          };
          this.empiSrv.updateRelation(sends).subscribe(
            () => {
              final();
            },
            () => dismiss(),
          );
        },
      },
      nzWidth: 680 + 'px',
    });
  }

  changeRelation(file) {
    const allWidth = document.body.clientWidth || 1200;
    const subscription = this.modalService.create({
      nzTitle: this.translateText['empi.changeRelation'],
      nzContent: RelationTableComponent,
      nzOnOk() {},
      nzOnCancel() {},
      nzFooter: null,
      nzComponentParams: {
        searchAgr: { file_id: file.ID },
        attchFile: file,
        attchFiles: [file]
      },
      nzWidth: allWidth * 0.8 + 'px',
    });
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
    // const allWidth = document.body.clientWidth || 1200;
    // const subscription = this.modalService.create({
    //   nzTitle: this.translateText['scan'],
    //   nzContent: ScanComponent,
    //   nzOnOk() {},
    //   nzOnCancel() {},
    //   nzFooter: null,
    //   nzComponentParams: {
    //     pdfUrl: d.FILE_PATH,
    //   },
    //   nzWidth: allWidth * 0.9 + 'px',
    // });
  }

  updateList() {
    this.dataDriveSrv.updateViewData(this.d);
  }

  updateFiles(ds, final?: () => void) {
    const dismiss = this.util.showLoading2();
    this.empiSrv.updateFiles(ds).subscribe(
      res => {
        this.updateList();
        dismiss();
        // tslint:disable-next-line:no-unused-expression
        final && final();
      },
      () => {},
      () => {
        dismiss();
        // tslint:disable-next-line:no-unused-expression
        final && final();
      },
    );
  }

  disableFile(d) {
    const doDisbale = () => {
      this.updateFiles({ ID: d.ID, ENABLED: 'N' });
    };
    this.modalService.confirm({
      nzTitle: this.translateText['empi.confirmDisableFile'],
      nzOnOk() {
        doDisbale();
      },
      nzOnCancel() {},
    });
    this.empiSrv.updateFiles({ ID: d.ID, ENABLED: 'N' });
  }

  update(data) {
    const subscription = this.modalService.create({
      nzTitle: this.translateText['alter'],
      nzContent: StepForm1Component,
      nzOnOk() {},
      nzOnCancel() {},
      nzFooter: null,
      nzComponentParams: {
        defaults: data,
        toHideCategory: true,
        onSubmit: value => {
          this.updateFiles({ ...data, ...value }, () => subscription.destroy());
        },
      },
      nzWidth: 680 + 'px',
    });
  }
}
