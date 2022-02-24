import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CardPreviewComponent } from '../card-preview/card-preview.component';
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import { CardsService } from '../data-services/services/cards.service';
import { Card } from '../data-services/types/card.type';
import * as htmlToImage from 'html-to-image';
import * as FileSaver from 'file-saver';
import { downloadZip } from 'client-zip'
import * as pdfMake from 'pdfmake/build/pdfmake';

@Component({
  selector: 'app-export-cards',
  templateUrl: './export-cards.component.html',
  styleUrls: ['./export-cards.component.scss']
})
export class ExportCardsComponent implements OnInit {
  private static readonly SINGULAR_EXPORT = 'singular-export';
  private static readonly SHEET_EXPORT = 'sheet-export';
  @ViewChildren('cardPreviews') cardPreviews: QueryList<CardPreviewComponent> = {} as QueryList<CardPreviewComponent>;
  @ViewChildren('frontCards') frontCards: QueryList<CardPreviewComponent> = {} as QueryList<CardPreviewComponent>;
  @ViewChildren('backCards') backCards: QueryList<CardPreviewComponent> = {} as QueryList<CardPreviewComponent>;

  public exportType: string = ExportCardsComponent.SHEET_EXPORT;
  public exportOptions: RadioOption[] = [
    { name: 'Card Sheet', value: ExportCardsComponent.SHEET_EXPORT},
    { name: 'Individual Images', value: ExportCardsComponent.SINGULAR_EXPORT}
  ];
  public paperOptions: PaperType[] = [
    { name: 'US Letter (Landscape)', width: 8.5, height: 11, orientation: 'landscape'}, 
    { name: 'US Letter (Portrait)', width: 8.5, height: 11, orientation: 'portrait'}, 
    { name: 'A4 (Landscape)', width: 8, height: 10, orientation: 'landscape'}, 
    { name: 'A4 (Portrait)', width: 8, height: 10, orientation: 'portrait'}, 
    { name: 'Custom (Landscape)', width: 8.5, height: 11, orientation: 'landscape'}, 
    { name: 'Custom (Portrait)', width: 8.5, height: 11, orientation: 'portrait'}
  ];
  public selectedPaper: PaperType = this.paperOptions[0];
  public paperWidth: number = this.paperOptions[0].width;
  public paperHeight: number = this.paperOptions[0].height;
  public paperMargins: number = 0.5;
  public paperDpi: number = 300;
  public cardMargins: number = 0.05;
  public cardsPerPage: number = 6;
  public cards: Card[] = [];


  constructor(cardsService: CardsService, 
    public templatesService: CardTemplatesService) {
      cardsService.getAll().then(cards => this.cards = cards);
  }

  ngOnInit(): void {
  }

  public changePaperType() {
    this.paperWidth = this.selectedPaper.width;
    this.paperHeight = this.selectedPaper.height;
  }

  public export() {

    if (this.exportType === ExportCardsComponent.SHEET_EXPORT) {
      Promise.all(this.cardPreviews.map(cardPreview => 
        htmlToImage.toPng((<any>cardPreview).element.nativeElement))).then(images => images.map(image => {
          return { image: image, margin: this.cardMargins};
        })).then(docImages => {
          const docDefinition = {
            content: docImages,
            pageSize: {width: this.paperWidth * this.paperDpi, height: this.paperHeight * this.paperDpi},
            pageMargins: this.paperMargins * this.paperDpi
          };
          pdfMake.createPdf(docDefinition).download('card-sheets.pdf');
        });
    } else {
      const frontCards = this.frontCards.map(async cardPreview => {
        const imgUri = await htmlToImage.toPng((<any>cardPreview).element.nativeElement);
        const imgName = 'front-' + cardPreview.card?.id + '.png';
        return this.dataUrlToFile(imgUri, imgName);
      });
      const backCards = this.backCards.map(async cardPreview => {
        const imgUri = await htmlToImage.toPng((<any>cardPreview).element.nativeElement);
        const imgName = 'back-' + cardPreview.card?.id + '.png';
        return this.dataUrlToFile(imgUri, imgName);
      });
      Promise.all(frontCards.concat(backCards)).then(promisedImages => 
        downloadZip(promisedImages).blob().then(blob => FileSaver.saveAs(blob, 'cards.zip')));
    }
  }

  /**
  * Convert dataUrl to File
  */
  private dataUrlToFile(dataUrl: string, fileName: string) {
    let byteString;
    const mime = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    if (dataUrl.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataUrl.split(',')[1]);
    } else {
      byteString = unescape(dataUrl.split(',')[1]);
    }
    var blobArray = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      blobArray[i] = byteString.charCodeAt(i);
    }
    return new File([blobArray], fileName, {type: mime});
  }

}

interface RadioOption {
  name: string,
  value: string
}

interface PaperType {
  name: string,
  width: number,
  height: number,
  orientation: 'landscape' | 'portrait'
}
