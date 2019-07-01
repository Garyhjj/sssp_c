import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileListComponent implements OnInit {
  _fileList: { url: string; name: string }[];
  @Input()
  set fileList(fs) {
    if (Array.isArray(fs)) {
      this._fileList = fs.filter(f => f).map(f => {
        if (typeof f === 'string') {
          return {
            name: this.getName(f),
            url: f,
          };
        }
        return f;
      });
    } else if (typeof fs === 'string') {
      this._fileList = [
        {
          name: this.getName(fs),
          url: fs,
        },
      ];
    }
  }
  constructor() {}

  getName(raw: string) {
    const rawName = raw.split('/').pop();
    if (rawName) {
      const year = new Date().getFullYear();
      const parts = rawName.split('.');
      const lgParts = parts.length;
      if (lgParts === 1) {
        const str = parts[0];
        const lg = str.length;
        return str.slice(0, lg - 17);
      } else {
        const lastTwo = parts[lgParts - 2];
        const lg = lastTwo.length;
        parts[lgParts - 2] = lastTwo.slice(0, lg - 17);
        return parts.join('.');
      }
    }
    return '';
  }

  ngOnInit() {}
}
