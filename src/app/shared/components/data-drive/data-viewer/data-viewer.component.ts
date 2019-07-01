import {
  isSelfComponent,
  isSelfTemplateRef,
} from './../shared/models/viewer/index';
import { Subscription } from 'rxjs';
import { DataDrive, DataViewSet } from '../../data-drive/shared/models/index';
import {
  Component,
  OnInit,
  Input,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ComponentFactoryResolver,
  ComponentFactory,
  ComponentRef,
  OnDestroy,
  EmbeddedViewRef,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'app-data-viewer',
  templateUrl: './data-viewer.component.html',
  styleUrls: ['./data-viewer.component.css'],
})
export class DataViewerComponent implements OnInit, OnDestroy {
  _dataDrive: DataDrive;
  _viewSet: DataViewSet;
  @ViewChild('selfContainer', { read: ViewContainerRef })
  container: ViewContainerRef;
  componentRef: ComponentRef<any>;
  EmbeddedViewRef: EmbeddedViewRef<{}>;
  sub: Subscription;
  componentSubs: Subscription[] = [];
  viewerMinWidth: string;
  @Input()
  set opts(opts: DataDrive) {
    this._dataDrive = opts;
    this._viewSet = opts.dataViewSet;
  }

  @Input() isModal: boolean;

  @Input()
  set more(m: any) {
    if (m.actionRef) {
      this.actionRef = m.actionRef;
    }
    if (m.tableCellRef) {
      this.tableCellRef = m.tableCellRef;
    }
    if (m.headerCellRef) {
      this.headerCellRef = m.headerCellRef;
    }
    if (m.headerCellStyle) {
      this.headerCellStyle = m.headerCellStyle;
    }
    if (m.bodyCellStyle) {
      this.bodyCellStyle = m.bodyCellStyle;
    }
    if (m.viewerMinWidth) {
      this.viewerMinWidth = m.viewerMinWidth;
    }
  }
  tableCellRef: TemplateRef<void>;
  actionRef: TemplateRef<void>;
  headerCellRef: TemplateRef<void>;
  headerCellStyle: (TableDataColumn) => any;
  bodyCellStyle: (data: any, property: string) => any;
  constructor(private resolver: ComponentFactoryResolver) {}

  ngOnInit() {
    this.sub = this._dataDrive.viewerChange.subscribe((t: DataViewSet) => {
      this.initSelfViewer(t);
    });
    this.initSelfViewer(this._viewSet);
  }

  initSelfViewer(t: DataViewSet) {
    const { type, params, container } = t;
    if (typeof type === 'string') {
      if (isSelfComponent(type)) {
        this.createComponent(container, params);
      } else if (isSelfTemplateRef(type)) {
        this.createEmbeddedView(container, params);
      } else {
        this.container.clear();
      }
    }
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
    this.destroyComponent();
    this.destroyViewRef();
  }

  createComponent(component, params) {
    this.destroyComponent();
    this.container.clear();
    const factory: ComponentFactory<
      any
    > = this.resolver.resolveComponentFactory(component);
    this.componentRef = this.container.createComponent(factory);
    if (typeof params === 'object') {
      const instance = this.componentRef.instance;
      for (let prop in instance) {
        if (instance.hasOwnProperty(prop)) {
          if (instance[prop] instanceof EventEmitter) {
            const { [prop]: obFn, ...rest } = params;
            if (typeof obFn === 'function') {
              const emitter = instance[prop] as EventEmitter<any>;
              const sub = emitter.subscribe((...ps) => obFn(...ps));
              this.componentSubs.push(sub);
            }
            params = rest;
          }
        }
      }
      Object.assign(this.componentRef.instance, params);
    }
  }

  destroyComponent() {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
    this.componentSubs.forEach(s => s.unsubscribe());
  }

  destroyViewRef() {
    if (this.EmbeddedViewRef) {
      this.EmbeddedViewRef.destroy();
    }
  }

  createEmbeddedView(templateRef, context = {}) {
    this.destroyViewRef();
    this.container.clear();
    this.EmbeddedViewRef = this.container.createEmbeddedView(
      templateRef,
      context,
    );
  }
}
