import { deepClone } from './../../../../../utils/index';
import { isNumber } from '../../../../../utils/index';

export interface InputSet {
  type?: InputTypes;
  editable?: boolean;
  placeHolder?: string;
  default?: string | boolean | number | any[];
  match?: {
    fns: { name: string; parmas: any[]; params?: any[] }[];
    err: string;
  };
  more?: any;
  hasInit?: boolean;
}

export class FileUpload implements InputSet {
  type?: InputTypes;
  editable?: boolean;
  default?: string;
  more?: {
    maxCount?: number;
    hideUploadButton?: boolean;
  };
  constructor(opts?: any) {
    // tslint:disable-next-line:no-unused-expression
    opts && Object.assign(this, opts);
    this.more = this.more || {};
    if (!this.more.hasOwnProperty('hideUploadButton')) {
      this.more.hideUploadButton = true;
    }
    this.type = 'fileUpload';
  }
}

export class PhotoUpload implements InputSet {
  type?: InputTypes;
  editable?: boolean;
  default?: string;
  more?: {
    pickerFormat?: 'string' | 'array';
    maxCount?: number;
    removable?: boolean;
    addabble?: boolean;
    scanable?: boolean;
  };
  constructor(opts?: any) {
    // tslint:disable-next-line:no-unused-expression
    opts && Object.assign(this, opts);
    this.type = 'photoUpload';
  }
}

export class ColleagueSearcher implements InputSet {
  type: InputTypes;
  default?: string | number;
  more: {
    pickerFormat?: string;
  };
  constructor(opts?: any) {
    // tslint:disable-next-line:no-unused-expression
    opts && Object.assign(this, opts);
    this.type = 'colleagueSearcher';
  }
}

export class Switch implements InputSet {
  type: InputTypes;
  default?: string | boolean | number;
  falseFormat?: string | number;
  trueFormat?: string | number;
  constructor(opts?: any) {
    // tslint:disable-next-line:no-unused-expression
    opts && Object.assign(this, opts);
    this.type = 'switch';
    this.falseFormat = this.falseFormat || 'N';
    this.trueFormat = this.trueFormat || 'Y';
  }
}
export interface CascaderOption {
  value: string | number;
  label: string | number;
  isLeaf?: boolean;
  children?: CascaderOption[];
}
export interface CascaderLazySet {
  value: string | number;
  lazyLayer: number;
  isLeaf?: boolean;
  API?: string;
  params?: string[];
}
export class Cascader implements InputSet {
  type: InputTypes;
  placeHolder?: string;
  more?: {
    cascaderLazySets?: CascaderLazySet[];
    properties: string[];
    options?: CascaderOption[];
  };
  constructor(opts?: any) {
    // tslint:disable-next-line:no-unused-expression
    opts && Object.assign(this, opts);
    const lazySet = this.more && this.more.cascaderLazySets;
    if (lazySet && lazySet.length > 0) {
      lazySet.sort((a, b) => -a.lazyLayer + b.lazyLayer);
      lazySet[0].isLeaf = true;
      lazySet.reverse();
    }
    this.type = 'cascader';
  }
}

export class DatePicker implements InputSet {
  type: InputTypes;
  placeHolder?: string;
  more?: {
    pickerFormat?: string;
    showFormat?: string;
    showTime?: boolean;
    showMode?: 'month' | 'day';
  };
  constructor(opts?: any) {
    if (opts) {
      Object.assign(this, opts);
    }
    this.placeHolder = this.placeHolder || '請選擇時間';
    this.more = this.more || {};
    this.more.pickerFormat = this.more.pickerFormat || 'YYYY-MM-DD';
    this.more.showFormat = this.more.showFormat || 'YYYY-MM-DD';
    this.more.showTime = this.more.showTime || false;
    this.more.showMode = this.more.showMode || 'day';
    this.type = 'datePicker';
  }
}

export class TimePicker implements InputSet {
  type: InputTypes;
  placeHolder?: string;
  more?: {
    pickerFormat?: string;
    showFormat?: string;
  };
  constructor(opts?: any) {
    if (opts) {
      Object.assign(this, opts);
    }
    this.placeHolder = this.placeHolder || '請選擇時間';
    this.more = this.more || {};
    this.more.pickerFormat = this.more.pickerFormat || 'HH:mm:ss';
    this.more.showFormat = this.more.showFormat || 'HH:mm:ss';
    this.type = 'timePicker';
  }
}

export class InputSetDefault implements InputSet {
  editable: boolean;
  default?: string | boolean | number;
  more?: any;
  constructor() {
    this.more = { editable: true };
    this.editable = true;
    this.default = '';
  }
}
export class CheckboxInputSet implements InputSet {
  type: InputTypes = 'checkbox';
  editable?: boolean;
  placeHolder?: string;
  default?: string | boolean | number;
  more?: {
    options?: { property: string; value: string | number }[];
  };
  constructor(opts?: InputSet) {
    // tslint:disable-next-line:no-unused-expression
    opts && Object.assign(this, opts);
    this.more = this.more || {};
    this.more.options = this.more.options || [];
    this.type = 'checkbox';
  }
  setOptions(options: any[]) {
    const newOpts = [];
    if (options && options.length > 0) {
      options.forEach(o => {
        if (typeof o === 'object') {
          newOpts.push(o);
        } else if (typeof o === 'string' || typeof o === 'number') {
          newOpts.push({ property: o, value: o });
        }
      });
    }
    // tslint:disable-next-line:no-unused-expression
    newOpts.length > 0 && (this.more.options = newOpts);
  }
}

export class SelectInputSet implements InputSet {
  type: InputTypes = 'select';
  editable?: boolean;
  placeHolder?: string;
  default?: string | boolean | number;
  more?: {
    options?: { property: string; value: string | number }[];
    lazyAPI?: string;
    lazyParams?: string[];
    lazyAPIUserMes?: any;
  };
  constructor(opts?: InputSet) {
    // tslint:disable-next-line:no-unused-expression
    opts && Object.assign(this, opts);
    this.more = this.more || {};
    this.more.options = this.more.options || [];
    this.type = 'select';
  }
  setOptions(options: any[]) {
    const newOpts = [];
    if (options && options.length > 0) {
      options.forEach(o => {
        if (typeof o === 'object') {
          newOpts.push(o);
        } else if (typeof o === 'string' || typeof o === 'number') {
          newOpts.push({ property: o, value: o });
        }
      });
    }
    // tslint:disable-next-line:no-unused-expression
    newOpts.length > 0 && (this.more.options = newOpts);
  }
}

export class AutoCompleteSet implements InputSet {
  type: InputTypes = 'autoComplete';
  editable?: boolean;
  placeHolder?: string;
  default?: string | boolean | number;
  more?: {
    options?: { property: string; value: string | number }[];
    lazyAPI?: string;
    lazyParams?: string[];
    lazyAPIUserMes?: any;
    isSelection?: boolean; // 是否只能限定选项内容
  };
  constructor(opts?: InputSet) {
    // tslint:disable-next-line:no-unused-expression
    opts && Object.assign(this, opts);
    this.more = this.more || {};
    this.more.options = this.more.options || [];
    this.type = 'autoComplete';
  }
  setOptions(options: any[]) {
    const newOpts = [];
    if (options && options.length > 0) {
      options.forEach(o => {
        if (typeof o === 'object') {
          newOpts.push(o);
        } else if (typeof o === 'string' || typeof o === 'number') {
          newOpts.push({ property: o, value: o });
        }
      });
    }
    // tslint:disable-next-line:no-unused-expression
    newOpts.length > 0 && (this.more.options = newOpts);
  }
}

export class InputSetFactory extends InputSetDefault {
  hasInit;
  constructor(opts: InputSet = {}) {
    super();
    if (opts.hasInit) {
      return Object.assign(this, opts);
    }
    Object.assign(this, this.get(opts.type, opts));
    this.hasInit = true;
  }

  private get(type: InputTypes = 'text', opts?: InputSet) {
    switch (type) {
      case 'number':
        return new NumberInputSet(opts);
      case 'select':
        return new SelectInputSet(opts);
      case 'checkbox':
        return new CheckboxInputSet(opts);
      case 'datePicker':
        return new DatePicker(opts);
      case 'timePicker':
        return new TimePicker(opts);
      case 'cascader':
        return new Cascader(opts);
      case 'switch':
        return new Switch(opts);
      case 'colleagueSearcher':
        return new ColleagueSearcher(opts);
      case 'photoUpload':
        return new PhotoUpload(opts);
      case 'textarea':
        return new TextareaInputSet(opts);
      case 'primary':
        return new PrimaryInputSet(opts);
      case 'fileUpload':
        return new FileUpload(opts);
      case 'autoComplete':
        return new AutoCompleteSet(opts);
      case 'inputGroup':
        opts.more = opts.more || {};
        opts = deepClone(opts);
        const mainInputSet = opts.more.mainInputSet;
        // tslint:disable-next-line:no-unused-expression
        mainInputSet &&
          (opts.more.mainInputSet = new InputSetFactory(mainInputSet));
        const afterInputSet = opts.more.afterInputSet;
        // tslint:disable-next-line:no-unused-expression
        afterInputSet &&
          (opts.more.afterInputSet = new InputSetFactory(afterInputSet));
        return opts;
      case 'text':
      default:
        return new TextInputSet(opts);
    }
  }
}

export type InputTypes =
  | 'text'
  | 'number'
  | 'rate'
  | 'select'
  | 'datePicker'
  | 'timePicker'
  | 'cascader'
  | 'switch'
  | 'colleagueSearcher'
  | 'photoUpload'
  | 'textarea'
  | 'primary'
  | 'checkbox'
  | 'fileUpload'
  | 'autoComplete'
  | 'inputGroup';

export class TextInputSet implements InputSet {
  type: InputTypes;
  placeHolder?: string;
  default?: string | boolean | number;
  match?: {
    fns: { name: string; parmas: any[] }[];
    err: string;
  };
  constructor(opts?: InputSet) {
    if (opts) {
      Object.assign(this, opts);
    }
    this.type = 'text';
  }
}
export class TextareaInputSet implements InputSet {
  type: InputTypes;
  editable?: boolean;
  placeHolder?: string;
  default?: string | boolean | number;
  match?: {
    fns: { name: string; parmas: any[] }[];
    err: string;
  };
  constructor(opts?: InputSet) {
    if (opts) {
      Object.assign(this, opts);
    }
    this.type = 'textarea';
  }
}

export class NumberInputSet extends TextInputSet {
  type: InputTypes;
  default?: number;
  more?: {
    min?: number;
    max?: number;
    step?: number;
  };
  constructor(opts: InputSet) {
    super(opts);
    this.more = this.more || {};
    this.more.step = this.more.step || 1;
    this.more.max = isNumber(this.more.max) ? this.more.max : Infinity;
    this.more.min = isNumber(this.more.min) ? this.more.min : -Infinity;
    this.type = 'number';
    this.default = Number(this.default);
  }
}

export class PrimaryInputSet implements InputSet {
  type: InputTypes;
  default?: number;
  constructor(opts?: InputSet) {
    if (opts) {
      Object.assign(this, opts);
    }
    this.default = this.default || 0;
    this.type = 'primary';
  }
}
