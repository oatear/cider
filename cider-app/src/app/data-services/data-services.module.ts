import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntityNamePipe } from './pipes/entity-name.pipe';

@NgModule({
  declarations: [
    EntityNamePipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    EntityNamePipe
  ]
})
export class DataServicesModule { }
