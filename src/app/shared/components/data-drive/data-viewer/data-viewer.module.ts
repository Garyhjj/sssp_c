import { MyFlexPipe } from './../shared/pipes/my-flex.pipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataViewerComponent } from './data-viewer.component';
import { TableComponent } from './table/table.component';
import { SharedModule } from '../../../shared.module';
import { FilterColumnComponent } from '../filter-column/filter-column.component';
import { ExamPaperModule } from './exam-paper/exam-paper.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [CommonModule, SharedModule, ExamPaperModule, TranslateModule],
  declarations: [
    DataViewerComponent,
    TableComponent,
    FilterColumnComponent,
  ],
  exports: [DataViewerComponent, TableComponent, FilterColumnComponent],
  entryComponents: [DataViewerComponent],
})
export class DataViewerModule {}
