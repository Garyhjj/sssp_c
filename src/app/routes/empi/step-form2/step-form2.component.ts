import { EmpiService } from './../shared/services/empi.service';
import { Subject } from 'rxjs';
// tslint:disable-next-line:use-path-mapping
import { isNil, isFunction } from './../../../shared/utils/index';
// tslint:disable-next-line:use-path-mapping
import { DynamicFormInput } from './../../../shared/class/dynamic-input-options.class';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
// tslint:disable-next-line:use-path-mapping
import { UtilService } from '@core/services/util.service';
// tslint:disable-next-line:use-path-mapping
import { inputTypeValues } from '@shared/constants';
@Component({
  selector: 'app-step-form2',
  templateUrl: './step-form2.component.html',
  styleUrls: ['./step-form2.component.css'],
})
export class StepForm2Component implements OnInit {

  myForm: FormGroup;
  @Input() onSubmit;
  @Input() defaults;

  callUpload = new Subject();

  get translateText() {
    return this.empiSrv.translateText;
  }

  uploadFilter = (file) => {
    const name: string = file.name;
    if(name.toLocaleLowerCase().endsWith('.pdf')) {
      return file;
    }else {
      this.util.showGlobalWarningMes(this.translateText['empi.uploadTypeErr']);
    }
  }
  forms = [
    new DynamicFormInput(this.translateText['empi.uploadFile'], 'files', {
      type: inputTypeValues.FILE_UPLOAD,
    }).required(),
  ];
  constructor(private fb: FormBuilder, private util: UtilService,private empiSrv: EmpiService) {}

  ngOnInit() {
    const formSet = {};
    this.forms.forEach(f => {
      const property = f.property;
      formSet[property] = [
        !isNil(f.default)
          ? f.default
          : this.defaults && !isNil(this.defaults[property])
            ? this.defaults[property]
            : '',
        f.validators,
      ];
    });
    const myForm = (this.myForm = this.fb.group(formSet));
  }

  afterFileUpload(type, res) {
    const util = this.util;
    if(+type ===1) {
      this.onSubmit(res);
      util.showGlobalSucMes(this.translateText['empi.uploadSucc']);
    }else {
      this.util.errDeal(res);
      util.showGlobalSucMes(this.translateText['empi.uploadErr'])
    }
  }

  submit() {
    this.callUpload.next(1);
  }




}
