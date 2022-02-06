import { Injectable } from '@angular/core';
import { Card } from 'primeng/card';
import { InMemoryService } from './in-memory.service';

@Injectable({
  providedIn: 'root'
})
export class CardsService extends InMemoryService<Card, number> {

  constructor() {
    super();
  }
}
