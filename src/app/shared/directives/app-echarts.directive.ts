import {
  Directive,
  ElementRef,
  HostListener,
  OnInit,
  AfterViewInit,
  Renderer2,
  Input,
  OnDestroy,
} from '@angular/core';
import * as echarts from 'echarts';
import { Subscription, fromEvent } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { UtilService } from '../../core/services/util.service';

@Directive({
  selector: '[appEcharts]',
})
export class AppEchartDirective implements OnInit, AfterViewInit, OnDestroy {
  _chartOption;
  @Input()
  set chartOption(o) {
    if (typeof o === 'object' && o) {
      o = JSON.parse(this.util.chineseConv(JSON.stringify(o)));
      if (this.charts) {
        this.charts.clear();
        this.charts.setOption(o);
      }
      this._chartOption = o;
    } else {
      // tslint:disable-next-line:no-unused-expression
      this.charts && this.charts.clear();
    }
  }

  @Input() chartHeight = '350px';

  sub1: Subscription;

  charts: echarts.ECharts;
  constructor(
    private el: ElementRef,
    private render: Renderer2,
    private util: UtilService,
  ) {}
  ngOnInit() {
    this.render.setStyle(this.el.nativeElement, 'height', this.chartHeight);
  }
  ngAfterViewInit() {
    const chart = (this.charts = echarts.init(this.el.nativeElement));
    if (this._chartOption) {
      chart.setOption(this._chartOption);
    }
    this.sub1 = fromEvent(window, 'resize')
      .pipe(throttleTime(100))
      .subscribe(() => chart.resize());
  }
  ngOnDestroy() {
    this.sub1.unsubscribe();
  }

  @HostListener('mouseleave')
  onMouseLeave() {}

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}
