import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CardPreviewComponent } from '../card-preview/card-preview.component';
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import { CardsService } from '../data-services/services/cards.service';
import { Card } from '../data-services/types/card.type';
import * as htmlToImage from 'html-to-image';
import * as FileSaver from 'file-saver';
import * as JSZip from 'jszip'
import * as pdfMake from 'pdfmake/build/pdfmake';
import pLimit from 'p-limit';
import FileUtils from '../shared/utils/file-utils';

@Component({
  selector: 'app-export-cards',
  templateUrl: './export-cards.component.html',
  styleUrls: ['./export-cards.component.scss']
})
export class ExportCardsComponent implements OnInit {
  private static readonly SINGULAR_EXPORT = 'singular-export';
  private static readonly SHEET_EXPORT = 'sheet-export';
  private static readonly PDF_DPI = 72;
  @ViewChildren('cardSheets') cardSheets: QueryList<any> = {} as QueryList<any>;
  @ViewChildren('cardSheetCards') cardSheetCards: QueryList<CardPreviewComponent> = {} as QueryList<CardPreviewComponent>;
  @ViewChildren('frontCards') frontCards: QueryList<CardPreviewComponent> = {} as QueryList<CardPreviewComponent>;
  @ViewChildren('backCards') backCards: QueryList<CardPreviewComponent> = {} as QueryList<CardPreviewComponent>;

  public exportType: string = ExportCardsComponent.SHEET_EXPORT;
  public exportOptions: RadioOption[] = [
    { name: 'Card Sheet', value: ExportCardsComponent.SHEET_EXPORT},
    { name: 'Individual Images', value: ExportCardsComponent.SINGULAR_EXPORT}
  ];
  public paperOptions: PaperType[] = [
    { name: 'US Letter (Landscape)', width: 8.5, height: 11, orientation: 'landscape', mirrorBacksX: false, mirrorBacksY: true}, 
    { name: 'US Letter (Portrait)', width: 8.5, height: 11, orientation: 'portrait', mirrorBacksX: true, mirrorBacksY: false}, 
    { name: 'A4 (Landscape)', width: 8, height: 10, orientation: 'landscape', mirrorBacksX: false, mirrorBacksY: true}, 
    { name: 'A4 (Portrait)', width: 8, height: 10, orientation: 'portrait', mirrorBacksX: true, mirrorBacksY: false}, 
    { name: 'Custom (Landscape)', width: 8.5, height: 11, orientation: 'landscape', mirrorBacksX: false, mirrorBacksY: true}, 
    { name: 'Custom (Portrait)', width: 8.5, height: 11, orientation: 'portrait', mirrorBacksX: true, mirrorBacksY: false}, 
    { name: 'Tabletop Simulator', width: 8.5, height: 11, orientation: 'portrait', mirrorBacksX: false, mirrorBacksY: false}
  ];
  public selectedPaper: PaperType = this.paperOptions[0];
  public paperWidth: number = this.paperOptions[0].width;
  public paperHeight: number = this.paperOptions[0].height;
  public paperMargins: number = 0.4;
  public paperDpi: number = 300;
  public cardMargins: number = 0.05;
  public cardsPerPage: number = 6;
  public cards: Card[] = [];
  public expandedCards: Card[] = [];
  public slicedCards: Card[][] = [];
  public displayLoading: boolean = false;
  public loadingPercent: number = 0;
  public loadingInfo: string = '';
  public lowInk: boolean = false;
  public mirrorBacksX: boolean = this.paperOptions[0].mirrorBacksX;
  public mirrorBacksY: boolean = this.paperOptions[0].mirrorBacksY;
  public pixelRatio: number = 1;
  public maxTtsPixels: number = 4096;



  constructor(cardsService: CardsService, 
    public templatesService: CardTemplatesService) {
      cardsService.getAll().then(cards => {
        const expandedList: Card[] = [];
        cards.forEach(card => {
          for (let i = 0; i < (typeof card.count === 'undefined' ? 1 : card.count); i++) {
            expandedList.push(card);
          }
        });
        this.expandedCards = expandedList;
        this.cards = cards;
        this.updateSlices();
      });
  }

  ngOnInit(): void {
  }

  public updateSlices() {
    this.slicedCards = this.sliceIntoChunks(this.expandedCards, this.cardsPerPage);
  }

  public changePaperType() {
    if (this.selectedPaper.name === 'Tabletop Simulator') {
      this.cardMargins = 0;
      this.paperMargins = 0;
      console.log('front cards: ', this.cardSheetCards.first);
      this.paperWidth = this.cardSheetCards.first.initialWidth * 10 / this.paperDpi;
      this.paperHeight = this.cardSheetCards.first.initialHeight * 7 / this.paperDpi;
      this.mirrorBacksX = this.selectedPaper.mirrorBacksX;
      this.mirrorBacksY = this.selectedPaper.mirrorBacksY;
      this.cardsPerPage = 69;
      this.calculatePixelRatio();
      this.updateSlices();
    } else {
      this.paperWidth = this.selectedPaper.width;
      this.paperHeight = this.selectedPaper.height;
      this.mirrorBacksX = this.selectedPaper.mirrorBacksX;
      this.mirrorBacksY = this.selectedPaper.mirrorBacksY;
      this.paperMargins = 0.4;
      this.cardMargins = 0.05;
      this.cardsPerPage = 6;
      this.pixelRatio = 1;
      this.updateSlices();
    }
  }

  /**
   * Calculate the pixel ratio for the TTS export
   */
  public calculatePixelRatio() {
    const largestDimension = (this.paperWidth > this.paperHeight ? this.paperWidth : this.paperHeight) * this.paperDpi;
    this.pixelRatio = this.maxTtsPixels > largestDimension ? 1 : this.maxTtsPixels / largestDimension;
  }

  public export() {
    if (this.exportType === ExportCardsComponent.SHEET_EXPORT 
      && this.selectedPaper.name === 'Tabletop Simulator') {
      this.exportCardSheetsAsImages();
    } else if (this.exportType === ExportCardsComponent.SHEET_EXPORT) {
      this.exportCardSheets();
    } else {
      this.exportIndividualImages();
    }
  }

  private exportCardSheetsAsImages() {
    this.displayLoading = true;
    this.loadingPercent = 0;
    this.loadingInfo = 'Generating sheet images...';
    let sheetIndex = 0;
    const limit = pLimit(3);
    const promisedSheets$ = this.cardSheets.map(async cardSheet => {
      const imgUri = await limit(() => htmlToImage.toPng((<any>cardSheet).nativeElement, {pixelRatio: this.pixelRatio}));
      const imgName = 'sheet-' 
        + (sheetIndex % 2 == 0 ? 'front-' : 'back-')
        + Math.floor(sheetIndex/2) + '.png';
      sheetIndex++;
      return this.dataUrlToFile(imgUri, imgName);
    });
    const promisedProgress$ = this.promisesProgress(promisedSheets$, () => this.loadingPercent += 100.0/(promisedSheets$.length + 1));
    Promise.all(promisedProgress$).then(promisedImages => {
      this.loadingInfo = 'Zipping up files...';
      return this.zipFiles(promisedImages);
    })
    .then(blob => {
      this.loadingInfo = 'Saving file...';
      return FileUtils.saveAs(blob, 'cards.zip');
    })
    .then(() => {
      this.loadingPercent = 100;
      this.displayLoading = false
    });
  }

  private exportCardSheets() {
    this.displayLoading = true;
    this.loadingPercent = 0;
    this.loadingInfo = 'Generating sheet images...';
    const limit = pLimit(3);
    // var startTime = new Date().getTime();
    const promisedSheets$ = this.cardSheets.map(cardSheet => limit(() => {
      // console.log('loaded Sheet: ', cardSheet, (new Date().getTime() - startTime) / 1000);
      return htmlToImage.toPng((<any>cardSheet).nativeElement);
    }));
    const promisedProgress$ = this.promisesProgress(promisedSheets$, () => {
      // console.log('loaded Image: ', this.loadingPercent, (new Date().getTime() - startTime) / 1000);
      return this.loadingPercent += 100.0/(promisedSheets$.length + 1);
    });
    Promise.all(promisedProgress$)
      .then(images => images.map(image => {
        return { 
          image: image, 
          width: this.selectedPaper.orientation == 'portrait' 
            ? (this.paperWidth - this.paperMargins * 2) * ExportCardsComponent.PDF_DPI
            : (this.paperHeight - this.paperMargins * 2) * ExportCardsComponent.PDF_DPI, 
          height: this.selectedPaper.orientation == 'portrait' 
            ? (this.paperHeight - this.paperMargins * 2) * ExportCardsComponent.PDF_DPI
            : (this.paperWidth - this.paperMargins * 2) * ExportCardsComponent.PDF_DPI
        };
      })).then(docImages => {
        const docDefinition = {
          content: docImages,
          pageSize: {
            width: this.paperWidth * ExportCardsComponent.PDF_DPI, 
            height: this.paperHeight * ExportCardsComponent.PDF_DPI
          },
          pageOrientation: this.selectedPaper.orientation,
          pageMargins: this.paperMargins * ExportCardsComponent.PDF_DPI
        };
        this.loadingInfo = 'Generating PDF file...';
        pdfMake.createPdf(docDefinition).getBlob((blob) => {
          FileUtils.saveAs(blob, 'card-sheets.pdf');
          this.loadingPercent = 100;
          this.displayLoading = false
        });
      });
  }

  private exportIndividualImages() {
    this.displayLoading = true;
    this.loadingPercent = 0;
    this.loadingInfo = 'Generating card images...';
    const limit = pLimit(3);
    const frontCards$ = this.frontCards.map(async cardPreview => {
      const imgUri = await limit(() => htmlToImage.toPng((<any>cardPreview).element.nativeElement));
      const imgName = 'front-' + cardPreview.card?.id + '.png';
      return this.dataUrlToFile(imgUri, imgName);
    });
    const backCards$ = this.backCards.map(async cardPreview => {
      const imgUri = await limit(() => htmlToImage.toPng((<any>cardPreview).element.nativeElement));
      const imgName = 'back-' + cardPreview.card?.id + '.png';
      return this.dataUrlToFile(imgUri, imgName);
    });
    const allCards$ = frontCards$.concat(backCards$);
    Promise.all(this.promisesProgress(allCards$, () => this.loadingPercent += 100.0/(allCards$.length + 1)))
      .then(promisedImages => {
        this.loadingInfo = 'Zipping up files...';
        return this.zipFiles(promisedImages);
      })
      .then(blob => {
        this.loadingInfo = 'Saving file...';
        return FileUtils.saveAs(blob, 'cards.zip');
      })
      .then(() => {
        this.loadingPercent = 100;
        this.displayLoading = false
      });
  }

  /**
   * Slice an array into equal chunks
   * 
   * @param array 
   * @param chunkSize 
   * @returns 
   */
  public sliceIntoChunks(array: any[], chunkSize: number) {
    if (!array || chunkSize <= 0) {
      return array;
    }
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
}

  /**
   * Convert promises to promises with progress
   * 
   * @param promises 
   * @param onProgress 
   */
  private promisesProgress(promises: Promise<any>[], onProgress: () => void): Promise<any>[] {
    return promises.map(promise => promise.then(result => {
      onProgress();
      return result;
    }));
  }

  /**
   * Zip up files
   * 
   * @param files 
   * @returns 
   */
  private zipFiles(files: File[]) {
    const zip = new JSZip();
    files.forEach(file => zip.file(file.name, file));
    return zip.generateAsync({ type: 'blob' });
  }

  /**
   * Convert dataUrl to File
   * 
   * @param dataUrl 
   * @param fileName 
   * @returns 
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
  orientation: 'landscape' | 'portrait',
  mirrorBacksX: boolean,
  mirrorBacksY: boolean
}
