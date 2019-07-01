import { DataViewSet, DataViewType } from '../index';

export class ExamViewSet implements DataViewSet {
  type: DataViewType;
  title?: string;
  hasInited?: boolean;
  constructor(opts: any) {
    if (opts) {
      Object.assign(this, opts);
    }
    this.type = 'exam';
    this.hasInited = true;
  }
}
