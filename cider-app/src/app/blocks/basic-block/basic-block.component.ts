import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-basic-block',
  templateUrl: './basic-block.component.html',
  styleUrls: ['./basic-block.component.scss']
})
export class BasicBlockComponent {
  @Input() block: { type: string; text?: string; backgroundImage?: string } = { type: "basic" };

  get styles() {
    return {
      backgroundImage: this.block.backgroundImage ? `url(${this.block.backgroundImage})` : 'none',
    };
  }
}
