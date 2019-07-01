import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'sgMydate' })
export class MydatePipe implements PipeTransform {
  transform(value: string, format: string): string {
    let date = moment(+value > 0 ? +value : value);
    if (date.isValid()) {
      return date.format(format);
    } else {
      return value;
    }
  }
}
