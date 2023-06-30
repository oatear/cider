import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardToHtmlPipe } from './pipes/template-to-html.pipe';
import { FileUrlPipe } from './pipes/file-url.pipe';
import { SafeUrlPipe } from './pipes/safe-url.pipe';

@NgModule({
  declarations: [
    CardToHtmlPipe,
    FileUrlPipe,
    SafeUrlPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CardToHtmlPipe,
    FileUrlPipe,
    SafeUrlPipe
  ]
})
export class SharedModule { }
