import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Card } from '../data-services/types/card.type';
import { CardTemplatesService } from '../data-services/services/card-templates.service';

@Component({
  selector: 'app-template-dialog',
  templateUrl: './template-dialog.component.html',
  styleUrl: './template-dialog.component.scss'
})
export class TemplateDialogComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  zoomLevel: number = 0.1;
  cards: Card[] = [];

  constructor(public templatesService: CardTemplatesService) {

  }

  public hideDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

}
