import { EMPI_NARMAL_UPLOAD } from './../shared/empi-constants';
import { ACLService } from '@delon/acl';
// tslint:disable-next-line:use-path-mapping
import { UtilService } from '@core/services/util.service';
import { EmpiService } from './../shared/services/empi.service';
import { RelationFormComponent } from './../relation-form/relation-form.component';
import { Subscription, of, timer } from 'rxjs';
// tslint:disable-next-line:use-path-mapping
import { DataDriveService } from '@shared/components/data-drive/core/services/data-drive.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
// tslint:disable-next-line:use-path-mapping
import { DataDrive } from '../../../shared/components/data-drive/shared/models';
import { Observable } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd';
import { EMPI_DC } from '../shared/empi-constants';

@Component({
  selector: 'app-relation-table',
  templateUrl: './relation-table.component.html',
  styleUrls: ['./relation-table.component.css'],
})
export class RelationTableComponent implements OnInit, OnDestroy {
  @Input() searchAgr;
  @Input() attchFile;
  @Input() attchFiles: any[];
  @Input() callUpdate: Observable<any>;
  @Input() mutiUpdate;
  d: DataDrive;
  sub: Subscription;
  constructor(
    private dataDriveService: DataDriveService,
    private modalService: NzModalService,
    private empiSrv: EmpiService,
    private util: UtilService,
    private aclService: ACLService,
  ) {}

  ngOnInit() {
    if (this.callUpdate) {
      this.sub = this.callUpdate.subscribe(() => {
        this.dataDriveService.updateViewData(this.d);
      });
    }
    this.empiSrv.updateBasicSetting();
  }

  get translateText() {
    return this.empiSrv.translateText;
  }
  ngOnDestroy() {
    // tslint:disable-next-line:no-unused-expression
    this.sub && this.sub.unsubscribe();
  }
  get parts() {
    return this.empiSrv.parts;
  }

  get lines() {
    return this.empiSrv.lines;
  }

  get models() {
    return this.empiSrv.models;
  }

  get operations() {
    return this.empiSrv.operations;
  }

  get families() {
    return this.empiSrv.families;
  }

  checkFileName(name) {
    return this.attchFiles.find(_ => _.FILE_NAME === name);
  }
  getDataDrive(d: DataDrive) {
    this.d = d;
    let otherHide = [];
    d.additionalFn = { menu: true, mutiUpdate: true };
    d.tableData.addable = true;
    d.mutiPreviewBodyStyle = (data, property) => {
      const { PART_NO, LINE, OPERATION_CODE, MODEL, FILE_NAME, FAMILY_NAME } = data,
        wrongStyle = { color: 'red', 'font-weight': 'bold' };
      if (property === 'PART_NO' && PART_NO) {
        const exists = this.parts.find(_ => _.PART_NO === PART_NO);
        if (!exists) {
          return wrongStyle;
        }
      }
      if (property === 'LINE' && LINE) {
        const existsLine = this.lines.find(_ => _.OPERATION_LINE_NAME === LINE);
        if (!existsLine) {
          return wrongStyle;
        }
      }
      if (property === 'OPERATION_CODE' && OPERATION_CODE) {
        const existsOp = this.operations.find(
          _ => _.OPERATION_NAME === OPERATION_CODE,
        );
        if (!existsOp) {
          return wrongStyle;
        }
      }
      if (property === 'MODEL' && MODEL) {
        const existsModel = this.models.find(_ => _.MODEL === MODEL);
        if (!existsModel) {
          return wrongStyle;
        }
      }
      if (property === 'MODEL' && MODEL) {
        const existsModel = this.models.find(_ => _.MODEL === MODEL);
        if (!existsModel) {
          return wrongStyle;
        }
      }
      if (property === 'FAMILY_NAME' && FAMILY_NAME) {
        const existsF = this.families.find(_ => _.FAMILY_NAME === FAMILY_NAME);
        if (!existsF) {
          return wrongStyle;
        }
      }
      if(property === 'FILE_NAME' && FILE_NAME) {
        if(!this.checkFileName(FILE_NAME)) {
          return wrongStyle;
        }
      }
    };
    d.onMutiUpdateSelectFile(ls => {
      let lg = ls.length;
      const errMes = () => this.util.showGlobalErrMes('数据有错误, 请校验');
      while (lg--) {
        const data = ls[lg];
        const { PART_NO, LINE, OPERATION_CODE, MODEL, FILE_NAME, FAMILY_NAME } = data;
        if (PART_NO) {
          const existsPart = this.parts.find(_ => _.PART_NO === PART_NO);
          if (!existsPart) {
            errMes();
            return false;
          }
        }
        if (LINE) {
          const existsLine = this.lines.find(
            _ => _.OPERATION_LINE_NAME === LINE,
          );
          if (!existsLine) {
            errMes();
            return false;
          }
        }
        if (MODEL) {
          const existsModel = this.models.find(_ => _.MODEL === MODEL);
          if (!existsModel) {
            errMes();
            return false;
          }
        }
        if (OPERATION_CODE) {
          const existsOp = this.operations.find(
            _ => _.OPERATION_NAME === OPERATION_CODE,
          );
          if (!existsOp) {
            errMes();
            return false;
          }
        }
        if (FAMILY_NAME) {
          const existsF = this.families.find(
            _ => _.FAMILY_NAME === FAMILY_NAME,
          );
          if (!existsF) {
            errMes();
            return false;
          }
        }
        if(FILE_NAME) {
          if(!this.checkFileName(FILE_NAME)) {
            errMes();
            return false;
          }
        }else {
          this.util.showGlobalErrMes('文件名不能为空');
          return false;
        }
      }
    });


    d.changeUpdateWay(ds => {
      ds.forEach(_ => {
        const tar = this.attchFiles.find(a => a.FILE_NAME === _.FILE_NAME);
        if(tar) {
          _.FILE_ID = tar.ID;
        }
      })
      return this.empiSrv.updateRelation(ds);
    })

    const roles = this.aclService.data.roles;
    if (roles.find(_ => _ === EMPI_DC)) {
      otherHide = ['FILE_VERSION', 'TEMP_FILE_TYPE', 'REMARK'];
    } else if (roles.find(_ => _ === EMPI_NARMAL_UPLOAD)) {
      otherHide = ['FILE_VERSION', 'REMARK'];
    }
    const hideList = ['COMPANY_CODE'].concat(otherHide);
    d.tableData.columns = d.tableData.columns.filter(
      _ => hideList.indexOf(_.property) < 0,
    );
    if (this.searchAgr) {
      d.addDefaultSearchParams(this.searchAgr);
      this.dataDriveService.updateViewData(d);
    }
  }

  changeRelation(data) {
    const subscription = this.modalService.create({
      nzTitle: this.translateText['empi.updateRelation'],
      nzContent: RelationFormComponent,
      nzOnOk() {},
      nzOnCancel() {},
      nzFooter: null,
      nzComponentParams: {
        onSubmit: value => {
          const send = { ...data, ...value };
          const dismiss = this.util.showLoading2();
          const final = () => {
            dismiss();
            subscription.destroy();
            this.dataDriveService.updateViewData(this.d);
          };
          this.empiSrv.updateRelation(send).subscribe(
            () => {
              final();
            },
            () => dismiss(),
          );
        },
        defaults: { ...data },
      },
      nzWidth: 680 + 'px',
    });
  }

  updateRelation() {
    const subscription = this.modalService.create({
      nzTitle: this.translateText['empi.updateRelation'],
      nzContent: RelationFormComponent,
      nzOnOk() {},
      nzOnCancel() {},
      nzFooter: null,
      nzComponentParams: {
        onSubmit: value => {
          const f = this.attchFile;
          const basic = { FILE_ID: f.ID, COMPANY_CODE: f.COMPANY_CODE };
          const send = { ...basic, ...value };
          const dismiss = this.util.showLoading2();
          const final = () => {
            dismiss();
            subscription.destroy();
          };
          this.empiSrv.updateRelation(send).subscribe(
            () => {
              final();
              this.dataDriveService.updateViewData(this.d);
            },
            () => dismiss(),
          );
        },
      },
      nzWidth: 680 + 'px',
    });
  }
}
