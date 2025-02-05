import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spacer-block',
  templateUrl: './spacer-block.component.html',
  styleUrls: ['./spacer-block.component.scss']
})
export class SpacerBlockComponent {
  @Input() block: { type: string; text?: string; backgroundImage?: string } = { type: "basic" };
}
