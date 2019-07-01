import { EmpiService } from './../shared/services/empi.service';
// tslint:disable-next-line:use-path-mapping
import { TabelViewSet } from './../../../shared/components/data-drive/shared/models/viewer/table';
import { Component, OnInit, Input } from '@angular/core';
// tslint:disable-next-line:use-path-mapping
import { DataDrive } from '../../../shared/components/data-drive/shared/models';
import { NzModalService } from 'ng-zorro-antd';
import { RelationFormComponent } from '../relation-form/relation-form.component';
// tslint:disable-next-line:use-path-mapping
import { UtilService } from '@core/services/util.service';
import { Subject } from 'rxjs';
import { ACLService } from '@delon/acl';
import { EMPI_DC, EMPI_NARMAL_UPLOAD } from '../shared/empi-constants';

@Component({
  selector: 'app-step-form3',
  templateUrl: './step-form3.component.html',
  styleUrls: ['./step-form3.component.css'],
})
export class StepForm3Component implements OnInit {
  _lists: any[];
  d: DataDrive;
  selectedList;
  hasUpdateRelation: boolean;
  ids;
  callUpdateRelation = new Subject();
  sendingMail = false;
  @Input() set lists(ls) {
    this._lists = ls || [];
    this.ids = ls.map(_ => _.ID).join(',');
    if (this.d) {
      this.d.selfUpdateTableData(ls);
    }
  }
  @Input() afterDone;

  @Input() mails;
  constructor(
    private modalService: NzModalService,
    private empiService: EmpiService,
    private util: UtilService,
    private aclService: ACLService
  ) {}

  ngOnInit() {}

  getDataDrive(d: DataDrive) {
    d.dataViewSet.more.showAction = false;
    let otherHide = [];
    const roles = this.aclService.data.roles;
    if(roles.find(_ => _ === EMPI_DC)) {
      otherHide = ['FILE_VERSION', 'TEMP_FILE_TYPE', 'REMARK']
    }else if(roles.find(_ => _ === EMPI_NARMAL_UPLOAD)){
      otherHide = ['FILE_VERSION', 'REMARK']
    }
    const hideList = ['ENABLED', 'APPROVE_FLAG','APPROVER1_EMPNO', 'APPROVER2_EMPNO', 'APPROVE_DATE1', 'APPROVE_DATE2'].concat(otherHide);
    d.tableData.columns = d.tableData.columns.filter(_ => hideList.indexOf(_.property) < 0 );
    this.d = d;
    d.tableData.searchable = false;
    d.tableData.stopFirstInit = true;
    setTimeout(() => d.selfUpdateTableData(this._lists), 50);
    const tableViewer = d.dataViewSet as TabelViewSet;
    tableViewer.showCheckbox();
    d.observeCheckedData().subscribe(ls => {
      this.selectedList = ls;
    });
  }

  updateRelation() {
    const ls = this.selectedList;
    const subscription = this.modalService.create({
      nzTitle: '维护关系',
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
          };
          this.empiService.updateRelation(sends).subscribe(
            () => {
              final();
              this.hasUpdateRelation = true;
              this.callUpdateRelation.next(1);
            },
            () => dismiss(),
          );
        },
      },
      nzWidth: 680 + 'px',
    });
  }

  sendMail() {
    const dismiss = this.util.showLoading2();
    this.sendingMail = true;
    const final = () => {
      dismiss();
      this.sendingMail = false
    };
    this.empiService
      .sendMails(this.ids.split(',').map(_ => +_), this.mails)
      .subscribe(() => {
        if(typeof this.afterDone) {
          this.afterDone();
        };
        final()},() => final());
  }
}
