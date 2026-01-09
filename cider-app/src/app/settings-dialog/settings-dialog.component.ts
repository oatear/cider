import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LocalStorageService } from '../data-services/local-storage/local-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { ElectronService } from '../data-services/electron/electron.service';
import { ThemeService } from '../data-services/theme/theme.service';
import { CiderThemeConfig } from '../shared/theme-registry';

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrl: './settings-dialog.component.scss',
  standalone: false
})
export class SettingsDialogComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  /** Available themes for the dropdown */
  themes: CiderThemeConfig[];
  /** Currently selected theme ID */
  selectedTheme: string;

  /* Make sure to also update app.component.ts addLangs() */
  languages: { label: string, value: string }[] = [
    { label: 'English (EN)', value: 'en' },
    { label: 'Français (FR)', value: 'fr' },
    { label: 'Español (ES)', value: 'es' },
    { label: 'Български (BG)', value: 'bg' },
    { label: 'Deutsch (DE)', value: 'de' },
    { label: 'Italiano (IT)', value: 'it' },
    { label: 'Português (PT)', value: 'pt' },
    { label: 'Русский (RU)', value: 'ru' },
    { label: 'Polski (PL)', value: 'pl' },
    { label: 'Ukrainian (UK)', value: 'uk' },
    { label: '한국어 (KO)', value: 'ko' },
    { label: '日本語 (JA)', value: 'ja' },
    { label: '简体中文 (ZH)', value: 'zh' },
    { label: 'Türkçe (TR)', value: 'tr' },
    { label: 'Nederlands (NL)', value: 'nl' },
  ];
  language: string;
  isElectron: boolean;

  constructor(
    private localStorageService: LocalStorageService,
    private translate: TranslateService,
    private electronService: ElectronService,
    private themeService: ThemeService
  ) {
    this.isElectron = electronService.isElectron();
    this.language = this.localStorageService.getLanguage() || translate.getBrowserLang() || 'en';

    // Initialize theme dropdown
    this.themes = this.themeService.getAvailableThemes();
    this.selectedTheme = this.themeService.getCurrentTheme().id;
  }

  public setLanguage(lang: string) {
    this.localStorageService.setLanguage(lang);
    this.translate.use(lang);
  }

  public setTheme(themeId: string) {
    this.themeService.applyTheme(themeId);
  }

  public hideDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

}
