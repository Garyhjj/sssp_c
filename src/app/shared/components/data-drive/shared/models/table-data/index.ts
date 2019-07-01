import { Subject } from 'rxjs';
export interface TableDataColumn {
  property: string;
  value: string;
  more?: {
    type?: {
      name: string;
      params?: any;
    };
    pipe?: {
      name: string;
      params: any[];
    };
    sortBy?: {
      name: string;
      params: any[];
    };
  };
}
export interface TableInsideData {
  property: string;
  value: string;
  hide?: boolean;
  checked?: boolean;
  disableCheck?: boolean;
}
export interface TableData {
  editable?: boolean;
  addable?: boolean;
  deletable?: boolean;
  visible?: boolean;
  searchable?: boolean;
  stopFirstInit?: boolean;
  isCompanyLimited?: boolean | string;
  defaultSearchParams?: any;
  refreshDataInterval?: number;
  columns: TableDataColumn[];
  data?: TableInsideData[][];
  endPagination?: {
    enable?: boolean;
    pageSize?: number;
  };
}

export class TableDataModel implements TableData {
  editable: boolean;
  addable: boolean;
  deletable: boolean;
  searchable?: boolean;
  visible: boolean;
  stopFirstInit?: boolean;
  isCompanyLimited?: boolean | string;
  defaultSearchParams?: any;
  refreshDataInterval?: number;
  columns: TableDataColumn[];
  data?: TableInsideData[][];
  endPagination?: {
    enable?: boolean;
    pageSize?: number;
  };
  private inputSetFactory;
  constructor(opts: TableData) {
    this.editable = false;
    this.deletable = false;
    this.addable = false;
    this.visible = true;
    Object.assign(this, opts);
  }
}

export class TableInsideDataModel implements TableInsideData {
  property: string;
  value: string;
  hide: boolean;
  private _checked: boolean;
  private _checkedChangeSubject: Subject<any>;
  constructor(opts: TableInsideData, sub?: Subject<any>) {
    Object.assign(this, opts);
    this._checkedChangeSubject = sub;
  }
  get checked() {
    return this._checked;
  }
  set checked(c) {
    this._checked = !!c;
    if (this._checkedChangeSubject) {
      this._checkedChangeSubject.next(1);
    }
  }
}
