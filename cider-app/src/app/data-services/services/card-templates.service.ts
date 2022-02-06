import { Injectable } from '@angular/core';
import { CardTemplate } from '../types/card-template.type';
import { InMemoryService } from './in-memory.service';

@Injectable({
  providedIn: 'root'
})
export class CardTemplatesService extends InMemoryService<CardTemplate, number> {

  constructor() {
    super();
  }
}
