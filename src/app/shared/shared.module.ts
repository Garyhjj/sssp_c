import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// delon
import { AlainThemeModule } from '@delon/theme';
import { DelonABCModule } from '@delon/abc';
import { DelonChartModule } from '@delon/chart';
import { DelonACLModule } from '@delon/acl';
import { DelonFormModule } from '@delon/form';
// i18n
import { TranslateModule } from '@ngx-translate/core';

// #region third libs
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { CountdownModule } from 'ngx-countdown';
import { UEditorModule } from 'ngx-ueditor';
import { NgxTinymceModule } from 'ngx-tinymce';

import { MyFlexPipe } from './components/data-drive/shared/pipes/my-flex.pipe';
import { FileListComponent } from './components/file-list/file-list.component';
import { InputGroupComponent } from './components/inputs/input-group/input-group.component';
import { MxAutoCompleteComponent } from './components/inputs/mx-auto-complete/mx-auto-complete.component';
import { DynamicInputComponent } from './components/inputs/dynamic-input/dynamic-input.component';
import { FileUploadComponent } from './components/inputs/file-upload/file-upload.component';
import { PhotoUploadComponent } from './components/inputs/photo-upload/photo-upload.component';
import { ColleagueSearcherComponent } from './components/inputs/colleague-searcher/colleague-searcher.component';
import { MySwitchComponent } from './components/inputs/my-switch/my-switch.component';
import { MyCascaderComponent } from './components/inputs/my-cascader/my-cascader.component';
import { MyTimePickerComponent } from './components/inputs/my-time-picker/my-time-picker.component';
import { MyDatePickerComponent } from './components/inputs/my-date-picker/my-date-picker.component';
import { MxCheckboxComponent } from './components/inputs/mx-checkbox/mx-checkbox.component';
import { MySelectComponent } from './components/inputs/my-select/my-select.component';
import { MxSelectComponent } from './components/inputs/mx-select/mx-select.component';
import { PhotoViewerComponent } from './components/photo-viewer/photo-viewer.component';
import { DirectivesModule } from './directives/directives.module';
import { PipesModule } from './pipes/pipes.module';

const THIRDMODULES = [
  NgZorroAntdModule,
  CountdownModule,
  UEditorModule,
  NgxTinymceModule,
];
// #endregion

// #region your componets & directives
const COMPONENTS = [PhotoViewerComponent,
  MxSelectComponent,
  MySelectComponent,
  MxCheckboxComponent,
  MyDatePickerComponent,
  MyTimePickerComponent,
  MyCascaderComponent,
  MySwitchComponent,
  ColleagueSearcherComponent,
  PhotoUploadComponent,
  FileUploadComponent,
  DynamicInputComponent,
  MxAutoCompleteComponent,
  InputGroupComponent,
  FileListComponent];
const DIRECTIVES = [];
const PIPES = [MyFlexPipe];
// #endregion

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    AlainThemeModule.forChild(),
    DelonABCModule,
    DelonChartModule,
    DelonACLModule,
    DelonFormModule,
    // third libs
    ...THIRDMODULES,

    PipesModule,
    DirectivesModule
  ],
  declarations: [
    // your components
    ...COMPONENTS,
    ...DIRECTIVES,
    ...PIPES,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AlainThemeModule,
    DelonABCModule,
    DelonChartModule,
    DelonACLModule,
    DelonFormModule,
    // i18n
    TranslateModule,
    // third libs
    ...THIRDMODULES,
    // your components
    ...COMPONENTS,
    ...DIRECTIVES,
    ...PIPES,
    PipesModule,
    DirectivesModule
  ],
})
export class SharedModule {}
