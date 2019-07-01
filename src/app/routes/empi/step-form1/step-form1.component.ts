import { TokenService, DA_SERVICE_TOKEN } from '@delon/auth';
import { EmpiService } from './../shared/services/empi.service';
// tslint:disable-next-line:use-path-mapping
import { NgxValidatorExtendService } from './../../../core/services/ngx-validator-extend.service';
import { EMPI_DC } from './../shared/empi-constants';
import { ACLService } from '@delon/acl';
// tslint:disable-next-line:use-path-mapping
import { isNil, isFunction } from './../../../shared/utils/index';
// tslint:disable-next-line:use-path-mapping
import { DynamicFormInput } from './../../../shared/class/dynamic-input-options.class';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit, Input, Inject } from '@angular/core';
// tslint:disable-next-line:use-path-mapping
import { UtilService } from '@core/services/util.service';
// tslint:disable-next-line:use-path-mapping
import { inputTypeValues } from '@shared/constants';
import { EMPI_ADMIN } from '../shared/empi-constants';

@Component({
  selector: 'app-step-form1',
  templateUrl: './step-form1.component.html',
  styleUrls: ['./step-form1.component.css'],
})
export class StepForm1Component implements OnInit {
  myForm: FormGroup;
  @Input() onSubmit;
  @Input() defaults;

  @Input() toHideCategory;
  forms = [
    new DynamicFormInput('empi.fileCategory', 'FILE_CATEGORY', {
      type: inputTypeValues.SELECT,
      default: '1',
      more: {
        options: [
          { property: '0', value: this.translateText['empi.formatFile'] },
          { property: '1', value: this.translateText['empi.trialFile'] },
        ],
      },
    }).required(),
    new DynamicFormInput('empi.fileType', 'FILE_TYPE', {
      type: inputTypeValues.SELECT,
      more: {
        lazyAPI: 'lookup?type=FILE_TYPE',
        lazyParams: ['CODE', 'VALUE'],
      },
    }).required(),
    new DynamicFormInput('empi.MN', 'MN_NO', {
      type: inputTypeValues.TEXT,
    }).required(),
    new DynamicFormInput('empi.tempFileType', 'TEMP_FILE_TYPE', {
      type: inputTypeValues.SELECT,
      more: {
        options: [
          { property: this.translateText['empi.trialFile'], value: this.translateText['empi.trialFile'] },
          { property: this.translateText['empi.rmaFile'], value: this.translateText['empi.rmaFile'] },
          { property: this.translateText['empi.tempFile'], value: this.translateText['empi.tempFile'] },
        ],
      },
    }).required(),
    new DynamicFormInput('empi.mails', 'mails', {
      type: inputTypeValues.CHECKBOX,
      more: {
        lazyAPI: 'mailgroups',
        lazyParams: ['MAIL_ADDRESS', 'MAIL_ADDRESS'],
        pickerFormat: 'array',
      },
    }).required(),
    new DynamicFormInput('empi.fileVersion', 'FILE_VERSION', {
      type: inputTypeValues.TEXT,
    }),
    new DynamicFormInput('empi.fileRemark', 'REMARK', {
      type: inputTypeValues.TEXT,
    }),
    new DynamicFormInput('empi.signBoss', 'boss', {
      type: inputTypeValues.COLLEAGUE_SEARCHER,
    }).readonly(),
    new DynamicFormInput('QE', 'APPROVER2', {
      type: inputTypeValues.COLLEAGUE_SEARCHER,
      more: {
        searchFilter: (list) =>{
          if(Array.isArray(list)) {
            const user = this.tokenService.get();
            return list.filter((l) => {
              if(this.boss) {
                return l.ID !== user.ID && this.boss !== l.EMPNO;
              }else {
                return l.ID !== user.ID;
              }
            });
          }
        },
        editable: true,
        pickerFormat: '{ID}'
      }
    })
  ];
  boss;
  constructor(
    private fb: FormBuilder,
    private util: UtilService,
    private aclService: ACLService,
    private validatorExtendService: NgxValidatorExtendService,
    private empiSrv : EmpiService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: TokenService,
  ) {}


  get translateText() {
    return this.empiSrv.translateText;
  }

  ngOnInit() {
    const isAdmin = this.aclService.data.roles.find(_ => _ === EMPI_ADMIN);
    const formSet = {};
    const first = this.forms[0];
    const third = this.forms[3];
    const def = this.defaults;
    if(def && def.FILE_CATEGORY === '0') {
      this.forms = this.forms.filter(_ => _.property !== 'TEMP_FILE_TYPE');
    }
    if(def) {
      this.forms = this.forms.filter(_ => _.property !== 'boss' && _.property !== 'APPROVER2');
    }
    if (!isAdmin) {
      first.readonly();
      const isDC = this.aclService.data.roles.find(_ => _ === EMPI_DC);
      if(isDC) {
        this.forms = this.forms.filter(_ => _.property !== 'TEMP_FILE_TYPE' && _.property !== 'boss' && _.property !== 'APPROVER2');
      }
      first.default = isDC ? '0' : '1';
    }
    if (this.toHideCategory) {
      this.forms.shift();
      this.forms = this.forms.filter(_ => _.property !== 'mails');
    }
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
    const cate = myForm.get('FILE_CATEGORY');
    if(cate) {
      cate.valueChanges.subscribe(v => {
        const temp = myForm.get('TEMP_FILE_TYPE');
        if (+v === 1) {
          temp.setValidators(this.validatorExtendService.required());
          third.isRequired = true;
          myForm.updateValueAndValidity();
        } else {
          // temp.clearValidators();
          myForm.removeControl('TEMP_FILE_TYPE');
          this.forms = this.forms.filter(_ => _.property !== 'TEMP_FILE_TYPE');
          // third.isRequired = false;
          // setTimeout(() => temp.setValue(''), 80);
        }
      });
    }
    const boss = myForm.get('boss');
    if(boss) {
      this.empiSrv.getBoss().subscribe((res:any) =>{
        boss.setValue(res.BOSS);
        this.boss = res.BOSS;
      })
    }
  }

  submit() {
    const value = Object.assign({}, this.myForm.value);
    value.MAIL_GROUP = value.mails
    if (isFunction(this.onSubmit)) {
      this.onSubmit(value);
    }
  }
}
