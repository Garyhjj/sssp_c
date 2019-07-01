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
  selector: 'app-relation-form',
  templateUrl: './relation-form.component.html',
  styleUrls: ['./relation-form.component.css'],
})
export class RelationFormComponent implements OnInit {
  myForm: FormGroup;
  @Input() onSubmit;
  @Input() defaults;

  forms = [
    new DynamicFormInput('empi.operation', 'OPERATION_CODE', {
      type: inputTypeValues.SELECT,
      more: {
        lazyAPI: 'lookup/operations',
        lazyParams: ['OPERATION_NAME','OPERATION_NAME']
      },
    }),
    new DynamicFormInput('empi.line', 'LINE', {
      type: inputTypeValues.SELECT,
      more: {
        lazyAPI: 'lookup/lines',
        lazyParams: ['OPERATION_LINE_NAME','OPERATION_LINE_NAME']
      },
    }),
    new DynamicFormInput('empi.partNO', 'PART_NO', {
      type: inputTypeValues.AUTO_COMPLETE,
      more: {
        lazyAPI: 'lookup/parts',
        lazyParams: ['PART_NO','PART_NO'],
        isSelection: true
      },
    }),
    new DynamicFormInput('empi.model', 'MODEL', {
      type: inputTypeValues.AUTO_COMPLETE,
      more: {
        lazyAPI: 'lookup/models',
        lazyParams: ['MODEL','MODEL'],
        isSelection: true
      },
    }),
    new DynamicFormInput('empi.familyName', 'FAMILY_NAME', {
      type: inputTypeValues.AUTO_COMPLETE,
      more: {
        lazyAPI: 'lookup/families',
        lazyParams: ['FAMILY_NAME','FAMILY_NAME'],
        isSelection: true
      },
    }),
  ];
  constructor(private fb: FormBuilder, private util: UtilService) {}

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

  submit() {
    const value = Object.assign({}, this.myForm.value);
    if (isFunction(this.onSubmit)) {
      this.onSubmit(value);
    }
  }
}
