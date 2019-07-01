import { NzModalService } from 'ng-zorro-antd';
import { FormGroup } from '@angular/forms';
import { isArray } from './../../../../utils/index';
import { DataDrive } from './../../shared/models/index';
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-exam-paper',
  templateUrl: './exam-paper.component.html',
  styleUrls: ['./exam-paper.component.css'],
})
export class ExamPaperComponent implements OnInit, OnDestroy {
  @Input() opts: DataDrive;

  @Input() content: any[];

  @Input() isModal;

  _header: { title: string; name: string; time: number; passScore: number };
  @Input()
  set header(f) {
    if (typeof f === 'object') {
      this._header = f;
      this.examTime = f.time || 30;
    }
  }
  _status: number; // 1 配置中，2 考試前，3 考試中，4.考試后

  @Input()
  set status(s) {
    this._status = s;
    if (s === 3) {
      this.checkLeftTime();
    } else if (s === 4) {
      this.showResult();
      clearTimeout(this.timeEvent);
    }
  }
  get status() {
    return this._status;
  }
  beginTime: Date;
  examTime: number;
  leftTime: string;
  TFList = [];
  radioList = [];
  checkboxList = [];
  prefixMain: any = {};
  subTitlePrefixs = ['一', '二', '三', '四'];
  markSets: any = {};
  timeEvent;
  timeEvent2;
  myForm: FormGroup;

  @Output() getResult = new EventEmitter();
  lastMark;
  constructor(
    private fb: FormBuilder,
    private confirmServ: NzModalService,
    private auth: AuthService,
  ) {}

  ngOnInit() {
    this.keepLogin();
    if (this.opts) {
      this.status = 1;
      this.opts.afterDataInit(() => {
        transform();
      });
      const transform = () => {
        const data = this.opts.tableData.data;
        this.alterContent(data);
      };
      transform();
    } else {
      this.status = 2;
      if (isArray(this.content)) {
        this.alterContent(this.content);
        setTimeout(() => {
          this.beginTime = new Date();
          this.status = 3;
        }, 2000);
      }
    }
    this.subTitlePrefixs = ['一', '二', '三', '四'];
  }

  ngOnDestroy() {
    clearTimeout(this.timeEvent);
    clearTimeout(this.timeEvent2);
  }

  initForm(q: { ID: number }[]) {
    const form: any = {};
    q.forEach(c => {
      form[c.ID] = [''];
    });
    this.myForm = this.fb.group(form);
  }

  alterContent(data) {
    if (data && data.length > 0) {
      const allQ = data.map(d => {
        if (isArray(d)) {
          const out: any = {};
          d.forEach(c => {
            out[c.property] = c.value;
          });
          return out;
        }
        return d;
      });
      this.bindView(allQ);
      this.initForm(allQ);
    }
  }

  bindView(allQ) {
    const alter = name => {
      if (this[name + 'List'].length > 0) {
        this.prefixMain[name] = this.subTitlePrefixs.shift();
        this.markSets[name] = { total: 0, average: 0 };
        this[name + 'List'].forEach(c => {
          this.markSets[name]['total'] += c.SCORE || 0;
        });
        this.markSets[name]['average'] = Math.round(
          this.markSets[name]['total'] / this[name + 'List'].length,
        );
      }
    };
    this.TFList = allQ.filter(a => a.TYPE === 'TF');
    alter('TF');
    this.radioList = allQ.filter(a => a.TYPE === 'RADIO').map(c => {
      if (c) {
        c.optionList = [];
        const pre = 'OPTION_';
        ['A', 'B', 'C', 'D', 'E'].forEach(b => {
          const val = c[pre + b];
          // tslint:disable-next-line:no-unused-expression
          val && c.optionList.push([b, b + '、 ' + val]);
        });
      }
      return c;
    });
    alter('radio');
    this.checkboxList = allQ.filter(a => a.TYPE === 'CHECKBOX').map(c => {
      if (c) {
        c.optionList = [];
        const pre = 'OPTION_';
        ['A', 'B', 'C', 'D', 'E'].forEach(b => {
          const val = c[pre + b];
          // tslint:disable-next-line:no-unused-expression
          val &&
            c.optionList.push({
              label: b + '、 ' + val,
              value: b,
              checked: false,
            });
        });
      }
      return c;
    });
    alter('checkbox');
  }

  keepLogin() {
    if (this.status === 3) {
      this.auth.updateToken();
    }
    this.timeEvent2 = setTimeout(() => this.keepLogin(), 60 * 1000);
  }

  checkLeftTime() {
    const past = new Date().getTime() - this.beginTime.getTime();
    const left = this.examTime * 60 * 1000 - past;
    if (left >= 0) {
      // tslint:disable-next-line:no-bitwise
      const minute = ~~(left / (1000 * 60));
      const minuteString = minute < 10 ? '0' + minute : minute;
      // tslint:disable-next-line:no-bitwise
      const second = ~~((left - minute * 1000 * 60) / 1000);
      const secondString = second < 10 ? '0' + second : second;
      this.leftTime = `${minuteString}:${secondString}`;
      this.timeEvent = setTimeout(() => this.checkLeftTime(), 1000);
    } else {
      this.finish();
      this.confirmServ.info({
        nzTitle: '考試時間結束',
        nzContent: '已自動提交試卷',
      });
    }
  }

  finish() {
    const val = this.myForm.value;
    this.lastMark = 0;
    const answerList = this.content.map(c => {
      if (c.TYPE === 'CHECKBOX') {
        const yourAnswer = val[c.ID] || '';
        const trueAnswer = c.RIGHT_ANSWER || '';
        const list1 = yourAnswer.split(',') || [];
        const list2 = trueAnswer.split(',') || [];
        if (list1.length === list2.length) {
          if (new Set([...list1, ...list2]).size === list2.length) {
            this.lastMark += +c.SCORE || 0;
          }
        }
      } else if (c.RIGHT_ANSWER === val[c.ID]) {
        this.lastMark += +c.SCORE || 0;
      }
      return {
        EXAM_ID: c.EXAM_ID,
        QUESTION_ID: c.QUESTION_ID,
        ANSWERS: val[c.ID],
      };
    });
    this.getResult.emit({
      answerList,
      lastMark: this.lastMark,
    });
  }

  showResult() {
    if (this.myForm && this.content) {
      const val = this.myForm.value;
      this.content = this.content.map(c => {
        c.result = {
          trueAnswer: c.RIGHT_ANSWER,
          yourAnswer: val[c.ID],
        };
        return c;
      });
      this.alterContent(this.content);
      setTimeout(() => {
        if (this.lastMark < this._header.passScore) {
          this.confirmServ.error({
            nzTitle: `最後得分:  ${this.lastMark}`,
            nzContent: '考試不及格',
          });
        } else {
          this.confirmServ.success({
            nzTitle: `最後得分:  ${this.lastMark}`,
            nzContent: '考試通過',
          });
        }
      }, 100);
    }
  }
}
