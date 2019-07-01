// tslint:disable
import { tify } from '../../shared/utils/chinese-conv';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { replaceQuery } from '../../shared/utils/index';
import api from '../../shared/api';
import { map } from 'rxjs/operators';
@Injectable()
export class AppService {
  constructor(
    private http: HttpClient,
  ) {}

  getColleague(name: string): Observable<any> {
    if (!(typeof name === 'string') || !name) return of([]);
    let emp_name = name.toUpperCase();
    emp_name = tify(emp_name)
      .replace(/^\"/g, '')
      .replace(/\"$/g, '');
    return this.http.get(
      replaceQuery(api.getAgentUrl, { emp_name }),
    );
  }

  uploadPicture(img: string) {
    if (!img) return;
    img = img.replace(/data\:image\/\w+\;base64\,/, '');
    return this.http.post(api.uploadPicture, { PICTURE: img }).pipe(
      map(res => {
        let url = res['PICTURE_URL'];
        return url;
      }),
    );
  }
}
