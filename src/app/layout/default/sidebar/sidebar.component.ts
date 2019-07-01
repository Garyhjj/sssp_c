import { DA_SERVICE_TOKEN, TokenService } from '@delon/auth';
import { UserState } from './../../../core/store';
import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { environment } from '@env/environment';

@Component({
  selector: 'layout-sidebar',
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  user: UserState;
  oaUrl = environment.EMPI_URL;
  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: TokenService) {
    this.user = {...this.tokenService.get()} as any;
    if(this.user.AVATAR_URL === 'assets/avatar/default.png') {
      this.user.AVATAR_URL = '';
    }
  }
}
