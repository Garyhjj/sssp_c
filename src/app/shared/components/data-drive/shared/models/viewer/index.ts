import { ExamViewSet } from './exam';
import { TabelViewSet } from './table';
export type DataViewType =
  | 'table'
  | 'chart'
  | 'exam'
  | 'selfComponent'
  | 'selfTemplateRef'
  | string;
export * from './table';

export const selfComponentPrefix = 'selfComponent';
export const selfTemplateRefPrefix = 'selfTemplateRef';
export const isSelfComponent = (t: string) => t.startsWith(selfComponentPrefix);
export const isSelfTemplateRef = (t: string) =>
  t.startsWith(selfTemplateRefPrefix);
export interface DataViewSet {
  type?: DataViewType;
  subType?: string;
  title?: string;
  hideLists?: string[];
  tempAddition?: any;
  more?: any;
  changeHeaderFontSize?: Function;
  changeBodyFontSize?: Function;
  hasInited?: boolean;
  container?: any;
  params?: any;
}

export class DataViewSetFactory {
  constructor(opts: DataViewSet = { type: 'table' }) {
    if (opts && opts.hasInited) {
      return opts;
    }
    switch (opts.type) {
      case 'exam':
        return new ExamViewSet(opts);
      case 'table':
      default:
        return new TabelViewSet(opts);
    }
  }
}
