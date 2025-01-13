import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntityNamePipe } from './pipes/entity-name.pipe';
import { EntityListPipe } from './pipes/entity-list.pipe';
import { EntityPipe } from './pipes/entity.pipe';
import { EntityListCachedPipe } from './pipes/entity-list-cached.pipe';
import { ToStringPipe } from './pipes/to-string.pipe';

@NgModule({
  declarations: [
    EntityNamePipe,
    EntityListPipe,
    EntityListCachedPipe,
    EntityPipe,
    ToStringPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    EntityNamePipe,
    EntityListPipe,
    EntityListCachedPipe,
    EntityPipe,
    ToStringPipe
  ]
})
export class DataServicesModule { }
