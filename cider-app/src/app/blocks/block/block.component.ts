import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-block',
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.scss']
})
export class BlockComponent {
  @Input() block!: { type: string; [key: string]: any };
  @Input() parentDropListId!: string;
}
