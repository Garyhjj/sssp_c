import { FormatService } from './../../../../../core/services/format.service';
import { isObservable, of } from 'rxjs';
import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'myFlex',
})
export class MyFlexPipe implements PipeTransform {
  constructor(private formatService: FormatService) {}

  transform(value: any, args?: { name: string; params: any[] }): any {
    const fs = this.formatService;
    if (args && fs[args.name]) {
      args.params = args.params || [];
      const res = fs[args.name](value, ...args.params);
      return isObservable(res) || res instanceof Promise ? res : of(res);
    } else {
      return of(value);
    }
  }
}
