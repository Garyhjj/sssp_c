import { ChineseConv } from './chinese-conv.pipe';
import { NgModule } from '@angular/core';
import { MydatePipe } from './mydate.pipe';
import { MessageTimePipe } from './message-time.pipe';

@NgModule({
  imports: [],
  declarations: [MydatePipe, ChineseConv, MessageTimePipe],
  exports: [MydatePipe, ChineseConv, MessageTimePipe],
})
export class PipesModule {}
