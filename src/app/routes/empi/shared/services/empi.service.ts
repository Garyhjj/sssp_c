import { TokenService, DA_SERVICE_TOKEN } from '@delon/auth';
// tslint:disable-next-line:use-path-mapping
import { replaceQuery } from './../../../../shared/utils/index';
import { TranslateService } from '@ngx-translate/core';
import { ACLService } from '@delon/acl';
import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import api from '../api';
import { EMPI_ADMIN, EMPI_DC, EMPI_NARMAL_UPLOAD } from '../empi-constants';
import { forkJoin } from 'rxjs';
@Injectable()
export class EmpiService {
  lines;
  operations;
  parts;
  models;
  families;

  translateText = {};
  constructor(private http: HttpClient, private aclService: ACLService, private translateService: TranslateService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: TokenService) {
    this.translateService
      .stream([
        'empi.updateRelation',
        'empi.changeRelation',
        'empi.confirmDisableFile',
        'empi.confirmSign',
        'empi.confirmReject',
        'scan',
        'alter',
        'exitByEsc',
        'empi.formatFile',
        'empi.trialFile',
        'empi.rmaFile',
        'empi.tempFile',
        'empi.uploadFile',
        'empi.uploadTypeErr',
        'empi.uploadSucc',
        'empi.uploadErr'
      ])
      .subscribe(data => {
        this.translateText = data;
      });
  }
  get isDC() {
    return !!this.aclService.data.roles.find(_ => _ === EMPI_DC);
  }
  updateFiles(bodys, feedback?) {
    const query = feedback ? '?feedback=1' : '';
    return this.http.post(api.updateFiles + query, bodys);
  }

  updateRelation(bodys) {
    return this.http.post(api.updateRelation, bodys);
  }

  isNotCommonUser() {
    return [EMPI_ADMIN, EMPI_DC, EMPI_NARMAL_UPLOAD];
  }

  sendMails(ids,mails) {
    return this.http.post(api.sendMails, {ids,mails});
  }

  sendRejectMail(fileID) {
    return this.http.get(replaceQuery(api.sendRejectMail, {fileID}));
  }

  updateBasicSetting() {
    forkJoin([this.http.get(api.getLines),this.http.get(api.getModels),this.http.get(api.getOperations),this.http.get(api.getParts)
    ,this.http.get(api.getFamilies)]).subscribe((res) => {
      [this.lines, this.models, this.operations, this.parts, this.families] = res;
    })
  }

  getBoss() {
    const user = this.tokenService.get();
    return this.http.get(replaceQuery(api.getBoss,{}, user));
  }
}
