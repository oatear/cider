import { Component, OnInit, HostListener, SecurityContext, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import { CardsService } from '../data-services/services/cards.service';
import { CardTemplate } from '../data-services/types/card-template.type';
import { Card } from '../data-services/types/card.type';
import { Subject, debounceTime } from 'rxjs';
import { Splitter } from 'primeng/splitter';

const templateCssFront  = 
`.card {
    width: 825px;
    height: 1125px;
    border-radius: 25px;
    text-align: center;
    display: flex;
    flex-direction: column;
    background-color: hsl(0, 0%, 40%);
    border: 45px solid hsl(0, 0%, 10%);
    color: hsl(0, 0%, 90%);
    font-weight: 600;
    font-size: 50px;
}
.card .header {
    height: 300px;
    font-size: 80px;
    font-weight: 600;
    padding: 10px;
    padding-top: 60px;
}
.card .content {
    flex: 1;
    padding: 50px;
    padding-top: 60px;
}
.card .footer {
    height: 200px;
    text-align: right;
    padding: 100px;
    padding-right: 50px;
}`;

const templateHtmlFront = 
`<div class="card">
    <div class="header">{{card.name}}</div>
    <div class="content">Card description</div>
    <div class="footer">A{{#padZeros card.id 3}}{{/padZeros}}</div>
</div>`;

@Component({
  selector: 'app-card-templates',
  templateUrl: './card-templates.component.html',
  styleUrls: ['./card-templates.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class CardTemplatesComponent implements OnInit {
  static readonly DEFAULT_HTML: string = templateHtmlFront;
  static readonly DEFAULT_CSS: string = templateCssFront;

  htmlEditorOptions: any = {theme: 'vs-dark', language: 'handlebars', automaticLayout: true};
  cssEditorOptions: any = {theme: 'vs-dark-extended', language: 'css-handlebars', automaticLayout: true};
  templates: CardTemplate[] = [];
  cards: Card[] = [];
  selectedCard: Card = {} as Card;
  selectedTemplate: CardTemplate = {} as CardTemplate;
  editTemplate: CardTemplate = {} as CardTemplate;
  dialogVisible: boolean = false;
  infoVisible: boolean = false;
  infoText: string = '';
  zoom: number = 0.3;
  previewPanelWidth = 40;
  disablePanels: boolean = false;
  templateChanges: Subject<boolean>;
  disableSplitter = false;
  windowResizing$: Subject<boolean>;

  constructor(private domSanitizer: DomSanitizer, 
    public service: CardTemplatesService,
    private cardsService: CardsService,
    private messageService: MessageService, 
    private confirmationService: ConfirmationService) {
      this.templateChanges = new Subject();
      this.windowResizing$ = new Subject();
      this.windowResizing$.pipe(debounceTime(200)).subscribe(() => {
        this.disablePanels = false;
      });
    }

  ngOnInit(): void {
    this.service.getAll().then(templates => {
      this.templates = templates;
      if (this.templates.length > 0) {
        this.selectedTemplate = this.templates[0];
      }
    });
    this.cardsService.getAll().then(cards => {
      this.cards = cards;
      if (this.cards.length > 0) {
        this.selectedCard = this.cards[0];
      }
    });
    this.templateChanges.asObservable().pipe(debounceTime(1000))
      .subscribe(() => this.save(this.selectedTemplate));
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.disablePanels = true;
    this.windowResizing$.next(true);
  }

  public updateTemplatesList() {
    this.service.getAll().then(templates => this.templates = templates);
  }

  public changeZoom(change: number) {
    this.zoom += change;
    if (this.zoom < 0.1) {
      this.zoom = 0.1;
    }
  }

  public debounceSave() {
    this.templateChanges.next(true);
  }
  
  public save(entity : CardTemplate) {
    const id = (<any>this.selectedTemplate)[this.service?.getIdField()];
    if (id) {
      this.updateExisting(id, this.selectedTemplate);
    }
  }

  public updateExisting(id: number, entity: CardTemplate) {
    this.service?.update(id, entity).then(result => {}).catch(error => {});
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
          this.updateTemplatesList();
          this.messageService.add({severity:'success', summary: 'Successful', detail: 'Entity Deleted', life: 3000});
        });
      }
    });
  }

  public onResizeStart(event: any) {
    this.disablePanels = true;
  }

  public onResizeEnd(event: any) {
    this.disablePanels = false;
    this.previewPanelWidth = event.sizes[0];
  }

}
