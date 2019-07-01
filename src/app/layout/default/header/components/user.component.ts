import { UserState } from '@core/store';
import {
  Component,
  Inject,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService } from '@delon/theme';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { environment } from '@env/environment';
@Component({
  selector: 'header-user',
  template: `
    <nz-dropdown nzPlacement="bottomRight">
      <div
        class="alain-default__nav-item d-flex align-items-center px-sm"
        nz-dropdown
      >
        <nz-avatar
          [nzSrc]="
            user.AVATAR_URL
              ? oaUrl + user.AVATAR_URL
              : './assets/tmp/img/avatar.jpg'
          "
          nzSize="small"
          class="mr-sm"
        ></nz-avatar>
        {{ user.USER_NAME }}
      </div>
      <div nz-menu class="width-sm">
        <div nz-menu-item (click)="logout()">
          <i nz-icon type="logout" class="mr-sm"></i>
          {{ 'menu.account.logout' | translate }}
        </div>
      </div>
    </nz-dropdown>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderUserComponent implements OnInit {
  user: UserState;
  oaUrl = environment.EMPI_URL;
  constructor(
    public settings: SettingsService,
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
  ) {}
  ngOnInit(): void {
    this.tokenService.change().subscribe((res: any) => {
      this.settings.setUser(res);
      this.user = {...res};
      if(this.user.AVATAR_URL === 'assets/avatar/default.png') {
        this.user.AVATAR_URL = '';
      }
    });
    const token = this.tokenService.get();
    this.tokenService.set(token);
  }
  logout() {
    this.tokenService.clear();
    this.router.navigateByUrl(this.tokenService.login_url);
  }
}
