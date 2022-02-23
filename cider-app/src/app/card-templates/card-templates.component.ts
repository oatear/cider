import { Component, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import { CardsService } from '../data-services/services/cards.service';
import { CardTemplate } from '../data-services/types/card-template.type';
import { Card } from '../data-services/types/card.type';

@Component({
  selector: 'app-card-templates',
  templateUrl: './card-templates.component.html',
  styleUrls: ['./card-templates.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class CardTemplatesComponent implements OnInit {
  static readonly DEFAULT_HTML: string = '<div>\n\t<h2>Poison Apple</h2>\n\t<p>Activate this card now.</p>\n</div>';
  static readonly DEFAULT_CSS: string = 'div {\n\twidth: 300px;\n\theight: 400px;\n\t'
    + 'background-color: rgb(37, 37, 37);\n\tborder: 1px solid black;\n\tpadding: 25px;\n}\n'
    + 'h2 {\n\tcolor: rgb(129, 156, 89);\n}';

  htmlEditorOptions: any = {theme: 'vs-dark', language: 'handlebars', automaticLayout: true};
  cssEditorOptions: any = {theme: 'vs-dark', language: 'css', automaticLayout: true};
  templates: CardTemplate[] = [];
  cards: Card[] = [];
  selectedCard: Card = {} as Card;
  selectedTemplate: CardTemplate = {} as CardTemplate;
  editTemplate: CardTemplate = {} as CardTemplate;
  dialogVisible: boolean = false;
  infoVisible: boolean = false;
  infoText: string = '';
  zoom: number = 0.3;

  constructor(private domSanitizer: DomSanitizer, 
    public service: CardTemplatesService,
    private cardsService: CardsService,
    private messageService: MessageService, 
    private confirmationService: ConfirmationService) { }

  ngOnInit(): void {
    this.service.getAll().then(templates => this.templates = templates);
    this.cardsService.getAll().then(cards => this.cards = cards);
  }

  public changeZoom(change: number) {
    this.zoom += change;
    if (this.zoom < 0.1) {
      this.zoom = 0.1;
    }
  }
  
  public save(entity : CardTemplate) {
    const id = (<any>this.selectedTemplate)[this.service?.getIdField()];
    if (id) {
      this.updateExisting(id, this.selectedTemplate);
    }
  }

  public updateExisting(id: number, entity: CardTemplate) {
    this.service?.update(id, entity).then(result => {
      this.messageService.add({severity:'success', summary: 'Successful', detail: 'Entity Updated', life: 3000});
    }).catch(error => {
    });
  }

  public openCreateNew() {
    this.editTemplate = {
      name: '',
      description: '',
      css: CardTemplatesComponent.DEFAULT_CSS,
      html: CardTemplatesComponent.DEFAULT_HTML
    } as CardTemplate;
    this.dialogVisible = true;
  }

  public openCssInfo() {
    this.infoVisible = true;
    this.infoText = "CSS Guide";
  }

  public openHtmlInfo() {
    this.infoVisible = true;
    this.infoText = "HTML/Handlebars Guide"
      + "\n\ncard attributes: {{card.name}}"
      + "\ntimes helper: {{#times card.strength}}o{{/times}}";
  }

  public openEditDialog(entity : CardTemplate) {
    this.editTemplate = entity;
    this.dialogVisible = true;
  }

  public openDeleteDialog(entity : CardTemplate) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.service?.delete((<any>entity)[this.service?.getIdField()]).then(deleted => {
          this.messageService.add({severity:'success', summary: 'Successful', detail: 'Entity Deleted', life: 3000});
        });
      }
    });
  }

}
