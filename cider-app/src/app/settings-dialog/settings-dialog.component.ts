import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LocalStorageService } from '../data-services/local-storage/local-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { ElectronService } from '../data-services/electron/electron.service';

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrl: './settings-dialog.component.scss'
})
export class SettingsDialogComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  darkMode: boolean = true;
  /* Make sure to also update app.component.ts addLangs() */
  languages: {label: string, value: string}[] = [
    {label: 'English (EN)', value: 'en'},
    {label: 'Français (FR)', value: 'fr'},
    {label: 'Español (ES)', value: 'es'},
    {label: 'Български (BG)', value: 'bg'},
    {label: 'Deutsch (DE)', value: 'de'},
    {label: 'Italiano (IT)', value: 'it'},
    {label: 'Português (PT)', value: 'pt'},
    {label: 'Русский (RU)', value: 'ru'},
    {label: 'Polski (PL)', value: 'pl'},
    {label: 'Ukrainian (UK)', value: 'uk'},
    {label: '한국어 (KO)', value: 'ko'},
    {label: '日本語 (JA)', value: 'ja'},
    {label: '简体中文 (ZH)', value: 'zh-Hans'},
    {label: '繁體中文 (ZH)', value: 'zh-Hant'},
    {label: 'Türkçe (TR)', value: 'tr'},
    {label: 'Nederlands (NL)', value: 'nl'},
  ];
  language: string;
  isElectron: boolean;

  constructor(private localStorageService: LocalStorageService,
    private translate: TranslateService,
    private electronService: ElectronService
  ) {
    this.isElectron = electronService.isElectron();
    this.darkMode = this.localStorageService.getDarkMode();
    this.language = this.localStorageService.getLanguage() || translate.getBrowserLang() || 'en';
    // translate.onLangChange.subscribe(() => {
    //   this.languages = translate.getLangs().map(lang => ({label: lang.toUpperCase(), value: lang}));
    // });
  }

  public setLanguage(lang: string) {
    this.localStorageService.setLanguage(lang);
    this.translate.use(lang);
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
