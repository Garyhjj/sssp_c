import { MenuService } from '@delon/theme';
import { EMPI_DC } from './../../routes/empi/shared/empi-constants';
import { ACLService } from '@delon/acl';
import { Inject } from '@angular/core';
import { DA_SERVICE_TOKEN, TokenService, JWTTokenModel } from '@delon/auth';
import { reqObserve } from './../net/default.interceptor';
import { UserState, Privilege } from './../store';
import { AesEncrypt } from '../../shared/utils/encrypt';
import loginAPI from './../../routes/passport/login/shared/api';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, timer, Subscription, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { replaceQuery, isArray } from '../../shared/utils/index';
import wholeAPI from '../../shared/api';
import {
  EMPI_ADMIN,
  EMPI_COMMON,
  EMPI_NARMAL_UPLOAD,
} from 'app/routes/empi/shared/empi-constants';

@Injectable()
export class AuthService {
  auth = false;
  authSubject = new BehaviorSubject<boolean>(false);
  tokenStoreName = 'tokenMes';
  user: UserState = { token: '' };
  tokenEffectTime: number = 1000 * 60 * 20;
  sub: Subscription;
  constructor(
    private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) private tokenService: TokenService,
    private aclService: ACLService,
    private menuService: MenuService,
  ) {
    reqObserve.subscribe(a => this.updateToken());
    // const user:UserState = this.tokenService.get();
    // if(user) {
    //   this.setEmpiRole(user.privilege);
    //   this.menuService.resume();
    // }
    // this.authSubject.subscribe(a => {
    //   if (a) {
    //     this.getSelfPrivilege().subscribe(() => 1);
    //   }
    // });
    this.tokenService.change().subscribe(u => {
      this.user = u;
    });
    this.autoUpdateToken();
  }

  login(data: any) {
    return of({ User: { USER_NAME: data.userName, privilege: [{ ROLE_NAME: 'EMPI_ADMIN' }] }, Token: 'dfd',Expires: 1000*60*60*24}).pipe(
      map((d: any) => {
        const user: UserState = { token: '' };
        Object.assign(user, d.User);
        user.modules = d.Modules;
        user.password = data.password;
        user.rememberPWD = data.remember;
        const expires = d.Expires;
        this.tokenEffectTime = expires - new Date().getTime();
        this.updateTokenMes(expires, d.Token);
        this.auth = true;
        this.updateAuth(true);
        // this.store$.dispatch(new UserLogin(user));
        this.autoUpdateToken();
        user.token = d.Token;
        return user;
      }),
    );
    return this.http
      .post(
        loginAPI.login + '?_allow_anonymous=true',
        this.getNewToken(data.userName, data.password),
      )
      .pipe(
        map((d: any) => {
          const user: UserState = { token: '' };
          Object.assign(user, d.User);
          user.modules = d.Modules;
          user.password = data.password;
          user.rememberPWD = data.remember;
          const expires = d.Expires;
          this.tokenEffectTime = expires - new Date().getTime();
          this.updateTokenMes(expires, d.Token);
          this.auth = true;
          this.updateAuth(true);
          // this.store$.dispatch(new UserLogin(user));
          this.autoUpdateToken();
          user.token = d.Token;
          return user;
        }),
      );
  }

  autoUpdateToken() {
    // tslint:disable-next-line:no-unused-expression
    this.sub && this.sub.unsubscribe();
    this.sub = null;
    let user = this.tokenService.get();
    if (!user) {
      return;
    }
    const tokenMes = this.getTokenMes();
    const now = Date.now();
    if (tokenMes && now < tokenMes.expires) {
      this.sub = timer(tokenMes.expires - now - 60 * 1000).subscribe(() => {
        user = this.tokenService.get();
        if (!user) {
          return;
        }
        this.login({
          userName: user.USER_NAME,
          password: user.password,
          remember: user.rememberPWD,
        }).subscribe();
      });
    }
  }

  setEmpiRole(ps: Privilege[]) {
    const acl = this.aclService;
    acl.setRole([EMPI_COMMON]);
    if (!Array.isArray(ps)) {
      return;
    }
    ps.forEach(p => {
      const r = p.ROLE_NAME;
      switch (r) {
        case 'EMPI_ADMIN':
          acl.attachRole([EMPI_ADMIN]);
          break;
        case 'EMPI_COMMON':
          acl.attachRole([EMPI_NARMAL_UPLOAD]);
          break;
        case 'EMPI_DC':
          acl.attachRole([EMPI_DC]);
          break;
        case 'EMPI_READER':
          acl.attachRole([EMPI_COMMON]);
          break;
      }
    });
  }

  updateToken() {
    const tokenMes = this.getTokenMes();
    if (tokenMes) {
      const expires = tokenMes.expires;
      const time = new Date().getTime();
      if (expires > time && expires < time + this.tokenEffectTime * 0.5) {
        const user = this.tokenService.get();
        this.login({
          userName: user.USER_NAME,
          password: user.password,
          remember: user.rememberPWD,
        }).subscribe();
      }
    }
  }

  getSelfPrivilege() {
    return of([{ ROLE_NAME: 'EMPI_ADMIN' }]).pipe(
      map((p: Privilege[]) => {
        // this.store$.dispatch(new UserUpdatePrivilege(p));
        this.setEmpiRole(p);
        this.menuService.resume();
        const user1 = Object.assign({}, this.user, { privilege: p });
        this.tokenService.set(user1);
      }),
    );;
    const send = { moduleID: '' };
    return this.http.get(replaceQuery(wholeAPI.getSelfPrivilege, send)).pipe(
      map((p: Privilege[]) => {
        // this.store$.dispatch(new UserUpdatePrivilege(p));
        this.setEmpiRole(p);
        this.menuService.resume();
        const user1 = Object.assign({}, this.user, { privilege: p });
        this.tokenService.set(user1);
      }),
    );
  }

  hasPrivilege(routeUrl: string) {
    const privilege = this.user.privilege;
    routeUrl = routeUrl.split(';')[0];
    if (isArray(privilege)) {
      return !!privilege.find(p => p.FUNCTION_URL === routeUrl);
    }
    return false;
  }

  checkAuth() {
    // const tokenMes = this.getTokenMes();
    // return tokenMes && tokenMes.expires > new Date().getTime();
    return true;
  }
  updateTokenMes(expires: number, token: string) {
    const tokenMes: TokenMes = { expires, token };
    localStorage.setItem(this.tokenStoreName, JSON.stringify(tokenMes));
  }

  getTokenMes() {
    const tokenStr = localStorage.getItem(this.tokenStoreName);
    if (tokenStr) {
      const tokenMes: TokenMes = JSON.parse(tokenStr);
      if (typeof tokenMes === 'object') {
        return tokenMes;
      }
    }
    return null;
  }

  clearTokenMes() {
    localStorage.removeItem(this.tokenStoreName);
  }

  getNewToken(userName: string, password: string) {
    const enUsername = AesEncrypt(userName);
    const enPassword = AesEncrypt(password);
    return { userName: enUsername, password: enPassword };
  }

  updateAuth(auth: boolean) {
    this.authSubject.next(auth);
  }
}

export interface TokenMes {
  expires: number;
  token: string;
}
