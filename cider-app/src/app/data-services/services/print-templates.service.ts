import { Injectable } from '@angular/core';
import { PrintTemplate } from '../types/print-template.type';
import { InMemoryService } from './in-memory.service';

@Injectable({
  providedIn: 'root'
})
export class PrintTemplatesService extends InMemoryService<PrintTemplate, number>{

  constructor() {
    super();
  }
}
