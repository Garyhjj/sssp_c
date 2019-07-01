import { NgModule, Optional, SkipSelf } from '@angular/core';
import { throwIfAlreadyLoaded } from './module-import-guard';

import { FormatService } from './services/format.service';
import { CacheService } from './services/cache.service';
import { AppService } from './services/app.service';
import { AuthService } from './services/auth.service';
import { NgxValidatorExtendService } from './services/ngx-validator-extend.service';
import { UtilService } from './services/util.service';

@NgModule({
  providers: [AuthService,
    AppService,
    CacheService,
    FormatService,
    NgxValidatorExtendService,
    UtilService,],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
