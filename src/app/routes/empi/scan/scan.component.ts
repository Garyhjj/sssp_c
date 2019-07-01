import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

const viewerUrl = `/assets/pdf/web/viewer.html?file=`;
@Component({
  selector: 'app-scan',
  templateUrl: './scan.component.html',
  styleUrls: ['./scan.component.css'],
})
export class ScanComponent implements OnInit, AfterViewInit, OnDestroy {
  testFileUri =
    'http://webapi.mic.com.cn:80/Files/All/201903/Web前端与移动开发面试宝典V2.0版20190326032626587.pdf';

  @Input() pdfUrl;

  @Input() onKeyDown;
  @ViewChild('reader') reader: ElementRef;

  frameSrc: SafeUrl;

  viewer;

  constructor(private domSanitizer: DomSanitizer) {}

  ngOnInit() {
    this.updateFrameSrc(viewerUrl + this.pdfUrl);
  }

  updateFrameSrc(src: string) {
    this.frameSrc = this.domSanitizer.bypassSecurityTrustResourceUrl(src);
  }

  keyDown = e => {
    if (typeof this.onKeyDown === 'function') {
      console.log(e)
      this.onKeyDown(e);
    }
  };

  bindEvent(iframe: HTMLFrameElement) {
    if(iframe && iframe.contentWindow) {
      const viewers = iframe.contentWindow.document.getElementsByTagName(
        'html',
      ),
      viewer = viewers[0]; 
      if (viewer && this.viewer !== viewer) {
        viewer.addEventListener('keydown', this.keyDown);
        this.viewer = viewer;
        console.log([viewer])
      }
      setTimeout(() => this.bindEvent(iframe), 300);
    }
  }

  ngAfterViewInit() {
    const iframe = this.reader.nativeElement as HTMLFrameElement;
    this.bindEvent(iframe);
  }

  ngOnDestroy() {
    if (this.viewer) {
      this.viewer.removeEventListener('keydown', this.keyDown);
    }
  }
}
