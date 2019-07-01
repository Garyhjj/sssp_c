// tslint:disable
import { Subject } from 'rxjs';
import { Component, OnInit, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { AppService } from '../../../../core/services/app.service';
import { NzModalService } from 'ng-zorro-antd';
import { environment } from '../../../../../environments/environment';
import api from '../../../api';

const maxsize = 500 * 1024;

@Component({
  selector: 'app-photo-upload',
  templateUrl: './photo-upload.component.html',
  styleUrls: ['./photo-upload.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhotoUploadComponent),
      multi: true,
    },
  ],
})
export class PhotoUploadComponent implements OnInit {
  private propagateChange = (_: any) => {};
  _myPickerFormat: string = 'string';
  @Input()
  set pickerFormat(_: string) {
    if (_ !== void 0 && _ !== null) {
      this._myPickerFormat = _;
    }
  }
  _maxCount = 9;
  @Input()
  set maxCount(_: number) {
    if (_ !== void 0 && _ !== null) {
      this._maxCount = _;
    }
  }
  _removable = true;
  @Input()
  set removable(_: boolean) {
    if (_ !== void 0 && _ !== null) {
      this._removable = _;
    }
  }
  _addable = true;
  @Input()
  set addable(_: boolean) {
    if (_ !== void 0 && _ !== null) {
      this._addable = _;
    }
  }
  _scanable = true;
  @Input()
  set scanable(_: boolean) {
    if (_ !== void 0 && _ !== null) {
      this._scanable = _;
    }
  }
  uploadUrl = api.uploadPicture;
  _fileList: any[] = [];
  get fileList() {
    return this._fileList;
  }
  set fileList(ls) {
    this.emitOut(ls);
    this._fileList = ls;
  }
  previewImage = '';
  previewImageIdx: number;
  previewVisible = false;
  removeSubject = new Subject<any>();
  showInformer = new Subject<any>();
  constructor(
    private appService: AppService,
    private modalService: NzModalService,
  ) {}

  /**
   * 给外部formControl写入数据
   *
   * @param {*} value
   */
  writeValue(value: any) {
    if (!value) return;
    let arr;
    if (Object.prototype.toString.call(value) !== '[object Array]') {
      arr = value.split(',');
    }
    arr = arr || value;
    while (arr.length > this._maxCount) {
      arr.pop();
    }
    this._fileList = arr.map(a => ({
      name: a,
      status: 'done',
      url: environment.END_URL + a,
      storeUrl: a,
    }));
  }

  /**
   * 把外面登记的监测change的函数赋值给this.propagateChange
   * 当内部数据改变时,可使用this.propagateChange(this.imgs)去触发传递出去
   * @param {*} fn
   */
  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  /**
   * 也是一样注册,当 touched 然后调用
   * @param {*} fn
   */
  registerOnTouched(fn: any) {}

  emitOut(ls: any[]) {
    const urlList = ls.map(l => l.storeUrl).filter(url => url);
    if (this._myPickerFormat === 'string') {
      const res = urlList.join(',');
      this.propagateChange(res);
    } else {
      this.propagateChange(urlList);
    }
  }
  handlePreview = (file: any) => {
    this.previewImage = file.url || file.thumbUrl;
    this.previewImageIdx = this.fileList.findIndex(f => f === file);
    this.previewVisible = true;
    this.showInformer.next(1);
  };

  remove = file => {
    const that = this;
    this.modalService.confirm({
      nzTitle: '您是否要舍弃此图片？',
      nzOnOk() {
        that.removeSubject.next(file);
      },
      nzOnCancel() {},
    });
    return false;
  };

  observeRemoveAction() {
    this.removeSubject.subscribe(
      file => (this.fileList = this.fileList.filter(f => f !== file)),
    );
  }

  beforeUpload = (img: File) => {
    const reader = new FileReader();
    const upload = base64 => {
      this.appService.uploadPicture(base64).subscribe(url => {
        this.fileList = this.fileList.concat([
          {
            name: img.name,
            status: 'done',
            url: environment.END_URL + url,
            storeUrl: url,
          },
        ]);
      });
    };
    const that = this;
    reader.onload = function() {
      var result: any = this.result;
      var img = new Image();
      img.src = result;
      //如果图片大小小于100kb，则直接上传
      if (result.length <= maxsize) {
        img = null;
        upload(result);
        return;
      }
      //      图片加载完毕之后进行压缩，然后上传
      if (img.complete) {
        callback();
      } else {
        // 浏览器显示原图后触发callback进行压缩上传
        img.onload = callback;
      }
      function callback() {
        var data = that.compress(img);
        upload(data);
        img = null;
      }
    };
    // 去读取选择的文件到内存
    reader.readAsDataURL(img);
    // 取消默认上传行为
    return false;
  };

  compress(img) {
    const canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    const tCanvas = document.createElement('canvas');
    var tctx = tCanvas.getContext('2d');
    var initSize = img.src.length;
    var width = img.width;
    var height = img.height;
    //如果图片大于四百万像素，计算压缩比并将大小压至400万以下
    var ratio;
    if ((ratio = (width * height) / 4000000) > 1) {
      ratio = Math.sqrt(ratio);
      width /= ratio;
      height /= ratio;
    } else {
      ratio = 1;
    }
    canvas.width = width;
    canvas.height = height;
    //        铺底色
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //如果图片像素大于100万则使用瓦片绘制
    var count;
    if ((count = (width * height) / 1000000) > 1) {
      // ~~ 的作用类似于Math.floor(),性能会好一点
      count = ~~(Math.sqrt(count) + 1); //计算要分成多少块瓦片
      //            计算每块瓦片的宽和高
      var nw = ~~(width / count);
      var nh = ~~(height / count);
      tCanvas.width = nw;
      tCanvas.height = nh;
      // 先画一个小的tctx，然后将小的从左到右，从上到下画到大的ctx画布上
      for (var i = 0; i < count; i++) {
        for (var j = 0; j < count; j++) {
          tctx.drawImage(
            img,
            i * nw * ratio,
            j * nh * ratio,
            nw * ratio,
            nh * ratio,
            0,
            0,
            nw,
            nh,
          );
          ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
        }
      }
    } else {
      ctx.drawImage(img, 0, 0, width, height);
    }
    //进行最小压缩（真正压缩的api）
    var ndata = canvas.toDataURL('image/jpeg', 0.3);
    // console.log('压缩前：' + initSize);
    // console.log('压缩后：' + ndata.length);
    // console.log('压缩率：' + ~~(100 * (initSize - ndata.length) / initSize) + "%");
    tCanvas.width = tCanvas.height = canvas.width = canvas.height = 0;
    return ndata;
  }
  ngOnInit() {
    this.observeRemoveAction();
  }
}
