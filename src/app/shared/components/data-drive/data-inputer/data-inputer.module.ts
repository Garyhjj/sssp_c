import { FilterColumnFlexComponent } from './../filter-column-flex/filter-column-flex.component';
import { DataSearchbarComponent } from './data-searchbar/data-searchbar.component';
import { SharedModule } from './../../../shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataInputerComponent } from './data-inputer.component';
import { DataSearchComponent } from './data-search/data-search.component';
import { DataUpdateComponent } from './data-update/data-update.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [CommonModule, SharedModule, TranslateModule],
  declarations: [
    DataInputerComponent,
    DataSearchComponent,
    DataUpdateComponent,
    DataSearchbarComponent,
    FilterColumnFlexComponent,
  ],
  exports: [
    DataInputerComponent,
    DataSearchbarComponent,
    FilterColumnFlexComponent,
  ],
  entryComponents: [DataUpdateComponent],
})
export class DataInputerModule {}
