import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardToHtmlPipe } from './pipes/template-to-html.pipe';
import { FileUrlPipe } from './pipes/file-url.pipe';
import { SafeUrlPipe } from './pipes/safe-url.pipe';
import { HandlebarsPipe } from './pipes/handlebars.pipe';
import { SafeCssPipe } from './pipes/safe-css.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';

@NgModule({
  declarations: [
    CardToHtmlPipe,
    FileUrlPipe,
    SafeUrlPipe,
    HandlebarsPipe,
    SafeCssPipe,
    SafeHtmlPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CardToHtmlPipe,
    FileUrlPipe,
    SafeUrlPipe,
    HandlebarsPipe,
    SafeCssPipe,
    SafeHtmlPipe
  ]
})
export class SharedModule { }
