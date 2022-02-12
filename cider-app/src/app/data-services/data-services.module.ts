import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntityNamePipe } from './pipes/entity-name.pipe';
import { EntityListPipe } from './pipes/entity-list.pipe';
import { EntityPipe } from './pipes/entity.pipe';

@NgModule({
  declarations: [
    EntityNamePipe,
    EntityListPipe,
    EntityPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    EntityNamePipe,
    EntityListPipe,
    EntityPipe
  ]
})
export class DataServicesModule { }
