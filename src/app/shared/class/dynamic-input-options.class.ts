import { InputSetFactory } from './../components/data-drive/shared/models/input/index';
import { Validators, ValidatorFn } from '@angular/forms';
export class DynamicFormInput {
  isRequired: boolean;
  isReadonly:boolean;
  validators: ValidatorFn[] = null;
  errMes: any = {};
  constructor(
    public label: string,
    public property: string,
    public inputOptions: {
      type: string;
      default?: any;
      more?: { [prop: string]: any };
      isRequire?: boolean;
    },
  ) {
    if (this.inputOptions) {
      this.inputOptions = new InputSetFactory(
        Object.assign({}, this.inputOptions as any),
      ) as any;
    }
  }

  required() {
    this.isRequired = true;
    if (this.required) {
      this.validators = this.validators || [];
      this.validators.push(Validators.required);
      this.errMes['required'] = '不能为空';
    }
    return this;
  }

  set default(a) {
    this.inputOptions.default = a;
  }
  get default() {
    return this.inputOptions.default || null;
  }

  setValidator(validators: ValidatorFn | ValidatorFn[]) {
    this.validators = this.validators || [];
    this.validators = this.validators.concat(validators);
    return this;
  }

  readonly() {
    this.isReadonly = true;
    return this;
  }

  addErrMes(e: { [p: string]: string }) {
    Object.assign(this.errMes, e);
    return this;
  }
}
