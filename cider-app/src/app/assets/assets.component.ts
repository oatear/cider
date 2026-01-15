import { Component, OnInit } from '@angular/core';
import { AssetsService } from '../data-services/services/assets.service';

@Component({
    selector: 'app-assets',
    templateUrl: './assets.component.html',
    styleUrls: ['./assets.component.scss'],
    standalone: false
})
export class AssetsComponent implements OnInit {

  constructor(public assetsService: AssetsService) { }

  ngOnInit(): void {
  }

}
