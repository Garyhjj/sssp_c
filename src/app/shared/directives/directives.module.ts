import { ShieldLayerDirective } from './shield-layer.directive';
import { AppEchartDirective } from './app-echarts.directive';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [],
  declarations: [AppEchartDirective, ShieldLayerDirective],
  exports: [AppEchartDirective, ShieldLayerDirective],
})
export class DirectivesModule {}
