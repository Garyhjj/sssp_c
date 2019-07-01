import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnChanges,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-photo-viewer',
  templateUrl: './photo-viewer.component.html',
  styleUrls: ['./photo-viewer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoViewerComponent implements OnInit, OnDestroy, OnChanges {
  _imgList: any[] = [];
  @Input()
  set imgList(l) {
    this._imgList = l;
    this.ref.markForCheck();
  }
  get imgList() {
    return this._imgList;
  }
  _previewImageIdx = 0;
  @Input()
  set previewImageIdx(idx: number) {
    if (Number.isInteger(idx) && idx > -1) {
      this._previewImageIdx = idx;
    } else {
      this._previewImageIdx = 0;
    }
    this.ref.markForCheck();
  }
  @Input() myShowInformer: Observable<boolean>;
  mySub: Subscription;
  previewVisible = false;

  constructor(private ref: ChangeDetectorRef) {}

  dismiss() {
    this.previewVisible = false;
  }

  ngOnChanges(d) {
    if (!d.hasOwnProperty('previewImageIdx')) {
      this._previewImageIdx = 0;
    }
  }
  stopPropagation(e: Event) {
    e.stopPropagation();
    return false;
  }
  prev(e: Event) {
    if (this._previewImageIdx === 0) {
      this._previewImageIdx = this.imgList.length - 1;
    } else {
      --this._previewImageIdx;
    }
    this.ref.markForCheck();
    return this.stopPropagation(e);
  }
  next(e: Event) {
    if (this._previewImageIdx === this.imgList.length - 1) {
      this._previewImageIdx = 0;
    } else {
      ++this._previewImageIdx;
    }
    this.ref.markForCheck();
    return this.stopPropagation(e);
  }

  ngOnInit() {
    if (this.myShowInformer instanceof Observable) {
      this.mySub = this.myShowInformer.subscribe(_ => {
        this.previewVisible = true;
      });
    }
  }

  ngOnDestroy() {
    if (this.mySub instanceof Subscription) {
      this.mySub.unsubscribe();
    }
  }
}
