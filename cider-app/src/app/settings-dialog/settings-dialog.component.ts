import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LocalStorageService } from '../data-services/local-storage/local-storage.service';

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrl: './settings-dialog.component.scss'
})
export class SettingsDialogComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  darkMode: boolean = true;

  constructor(private localStorageService: LocalStorageService) {
    this.darkMode = this.localStorageService.getDarkMode();
  }

  public setDarkMode(event: any) {
    this.localStorageService.setDarkMode(this.darkMode);
    document.querySelector('html')?.classList.toggle(LocalStorageService.DARK_MODE, this.darkMode);
  }

  public hideDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

}
