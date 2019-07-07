import { Component, OnInit } from '@angular/core';
// tslint:disable-next-line:use-path-mapping
import { DataDrive } from '../../../shared/components/data-drive/shared/models';

@Component({
  selector: 'app-set-boss',
  templateUrl: './set-boss.component.html',
  styleUrls: ['./set-boss.component.css'],
})
export class SetBossComponent implements OnInit {

  constructor() {}

  ngOnInit() {}

  getDataDrive(d: DataDrive) {
    d.beforeUpdateSubmit((fg,sub) => {
      const v = fg.value;
      if(v.CODE === v.VALUE) {
        sub.next('两个栏位的内容不能相同')
        return false
      }
      return true;
    })
  }


}
