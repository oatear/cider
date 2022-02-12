import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardToHtmlPipe } from './pipes/template-to-html.pipe';

@NgModule({
  declarations: [
    CardToHtmlPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CardToHtmlPipe
  ]
})
export class SharedModule { }
