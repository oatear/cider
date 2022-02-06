import { Injectable } from '@angular/core';
import { Asset } from '../types/asset.type';
import { InMemoryService } from './in-memory.service';

@Injectable({
  providedIn: 'root'
})
export class AssetsService extends InMemoryService<Asset, number> {

  constructor() {
    super();
  }
}
