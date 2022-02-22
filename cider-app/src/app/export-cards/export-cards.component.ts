import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-export-cards',
  templateUrl: './export-cards.component.html',
  styleUrls: ['./export-cards.component.scss']
})
export class ExportCardsComponent implements OnInit {
  private static readonly SINGULAR_EXPORT = 'singular-export';
  private static readonly SHEET_EXPORT = 'sheet-export';

  public exportType: string = ExportCardsComponent.SHEET_EXPORT;
  public exportOptions: RadioOption[] = [
    { name: 'Card Sheet', value: ExportCardsComponent.SHEET_EXPORT},
    { name: 'Individual Images', value: ExportCardsComponent.SINGULAR_EXPORT}
  ];
  public paperOptions: PaperType[] = [
    { name: 'Letter', width: 215.9, height: 279.4}, 
    { name: 'A4', width: 210, height: 297}, 
    { name: 'Custom', width: 215.9, height: 279.4}
  ];
  public selectedPaper: PaperType = this.paperOptions[0];
  public paperWidth: number = this.paperOptions[0].width;
  public paperHeight: number = this.paperOptions[0].height;
  public paperMargins: number = 12.7;
  public cardMargins: number = 5;
  

  constructor() { }

  ngOnInit(): void {
  }

  public changePaperType() {
    this.paperWidth = this.selectedPaper.width;
    this.paperHeight = this.selectedPaper.height;
  }

  public export() {

  }

}

interface RadioOption {
  name: string,
  value: string
}

interface PaperType {
  name: string,
  width: number,
  height: number
}
