import { EmpiService } from './empi/shared/services/empi.service';
import { StepForm2Component } from './empi/step-form2/step-form2.component';
import { StepForm1Component } from './empi/step-form1/step-form1.component';
import { FilesUploadComponent } from './empi/files-upload/files-upload.component';
import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { RouteRoutingModule } from './routes-routing.module';
// dashboard pages
import { DashboardV1Component } from './dashboard/v1/v1.component';
import { DashboardAnalysisComponent } from './dashboard/analysis/analysis.component';
import { DashboardMonitorComponent } from './dashboard/monitor/monitor.component';
import { DashboardWorkplaceComponent } from './dashboard/workplace/workplace.component';
// passport pages
import { UserLoginComponent } from './passport/login/login.component';
import { UserRegisterComponent } from './passport/register/register.component';
import { UserRegisterResultComponent } from './passport/register-result/register-result.component';
// single pages
import { UserLockComponent } from './passport/lock/lock.component';
import { CallbackComponent } from './callback/callback.component';

import { DocListsComponent } from './empi/doc-lists/doc-lists.component';
// tslint:disable-next-line:use-path-mapping
import { DataDriveModule } from '@shared/components/data-drive/data-drive.module';
import { SignFilesComponent } from './empi/sign-files/sign-files.component';
import { ScanComponent } from './empi/scan/scan.component';
import { StepForm3Component } from './empi/step-form3/step-form3.component';
import { RelationFormComponent } from './empi/relation-form/relation-form.component';
import { RelationTableComponent } from './empi/relation-table/relation-table.component';
import { SetBossComponent } from './empi/set-boss/set-boss.component';


const COMPONENTS = [
  DashboardV1Component,
  DashboardAnalysisComponent,
  DashboardMonitorComponent,
  DashboardWorkplaceComponent,
  // passport pages
  UserLoginComponent,
  UserRegisterComponent,
  UserRegisterResultComponent,
  // single pages
  UserLockComponent,
  CallbackComponent
];
const COMPONENTS_NOROUNT = [ScanComponent, StepForm1Component, StepForm3Component, RelationFormComponent, RelationTableComponent];
const EMPI_COMPONENTS = [DocListsComponent, 
  FilesUploadComponent, 
  SignFilesComponent, 
  StepForm1Component,
  StepForm2Component,
  ScanComponent,
  StepForm3Component,
  RelationFormComponent,
  RelationTableComponent,
  SetBossComponent
]
const EMPI_PROVIDERS = [EmpiService]
  
@NgModule({
  imports: [SharedModule, RouteRoutingModule, DataDriveModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT, ...EMPI_COMPONENTS],
  entryComponents: COMPONENTS_NOROUNT,
  providers: [...EMPI_PROVIDERS]
})
export class RoutesModule {}
