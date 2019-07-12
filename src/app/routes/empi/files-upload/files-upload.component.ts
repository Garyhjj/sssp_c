// tslint:disable-next-line:use-path-mapping
import { UserState } from './../../../core/store';
import { TokenService, DA_SERVICE_TOKEN } from '@delon/auth';
import { EmpiService } from './../shared/services/empi.service';
import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-files-upload',
  templateUrl: './files-upload.component.html',
  styleUrls: ['./files-upload.component.less'],
})
export class FilesUploadComponent implements OnInit {
  step = 0;

  frontSet;

  hasUploadList;

  mails;
  constructor(private empiSrv: EmpiService, @Inject(DA_SERVICE_TOKEN) private tokenService: TokenService, private router: Router) {}

  ngOnInit() {}

  submit1 = (v)  => {
    this.frontSet = v;
    this.step = 1;
    this.mails = v.mails
  }

  submit2= (files:string[])=>  {
    const empiSrv = this.empiSrv;
    const user: UserState = this.tokenService.get();
    const sends = files.map((f) => {
      const send:any = {...this.frontSet};
      send.FILE_NAME = this.getName(f);
      send.FILE_PATH = f;
      send.ENABLED = 'Y';
      send.APPROVE_FLAG = empiSrv.isDC? 'Y': 'N';
      send.COMPANY_CODE = user.COMPANY_ID;
      return send;
    });
    this.empiSrv.updateFiles(sends, true ).subscribe((res) => {
      this.hasUploadList = res;
      this.step = 2;
    })
  }

  getName(raw: string) {
    const rawName = raw.split('/').pop();
    return rawName? rawName.split('-')[1]: '';
    // const rawName = raw.split('/').pop();
    // if (rawName) {
    //   const year = new Date().getFullYear();
    //   const parts = rawName.split('.');
    //   const lgParts = parts.length;
    //   if (lgParts === 1) {
    //     const str = parts[0];
    //     const lg = str.length;
    //     return str.slice(0, lg - 17);
    //   } else {
    //     const lastTwo = parts[lgParts - 2];
    //     const lg = lastTwo.length;
    //     parts[lgParts - 2] = lastTwo.slice(0, lg - 17);
    //     return parts.join('.');
    //   }
    // }
    // return '';
  }

  toFirst= () => {
    this.step = 0;
  }

  backToList = () => {
    this.router.navigateByUrl('empi/lists');
  } 

}
