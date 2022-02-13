import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardToHtmlPipe } from './pipes/template-to-html.pipe';
import { FileUrlPipe } from './pipes/file-url.pipe';

@NgModule({
  declarations: [
    CardToHtmlPipe,
    FileUrlPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CardToHtmlPipe,
    FileUrlPipe
  ]
})
export class SharedModule { }
