import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CdkDrag, DragDropModule } from '@angular/cdk/drag-drop';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DecksComponent } from './decks/decks.component';
import { CardTemplatesComponent } from './card-templates/card-templates.component';
import { CardsComponent } from './cards/cards.component';

import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenubarModule } from 'primeng/menubar';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SplitterModule } from 'primeng/splitter';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageModule } from 'primeng/message';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ProgressBarModule } from 'primeng/progressbar';
import { CheckboxModule } from 'primeng/checkbox';
// TabMenu is deprecated in favor of Tabs
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { MultiSelectModule } from 'primeng/multiselect';
// select imported above
import { DataViewModule } from 'primeng/dataview';
import { TreeModule } from 'primeng/tree';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { InputGroup } from 'primeng/inputgroup';
import { ButtonGroup } from 'primeng/buttongroup';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ContextMenuModule } from 'primeng/contextmenu';
import { StepperModule } from 'primeng/stepper';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ColorPickerModule } from 'primeng/colorpicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { PopoverModule } from 'primeng/popover';
import { MeterGroupModule } from 'primeng/metergroup';
import { AutoCompleteModule } from 'primeng/autocomplete';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { provideTranslateService, TranslatePipe, TranslateDirective, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

import { SiteHeaderComponent } from './site-header/site-header.component';
import { SiteFooterComponent } from './site-footer/site-footer.component';
import { SiteContentComponent } from './site-content/site-content.component';
import { SiteTemplateComponent } from './site-template/site-template.component';
import { AssetsComponent } from './assets/assets.component';
import { EntityTableComponent } from './entity-table/entity-table.component';
import { EntityDialogComponent } from './entity-dialog/entity-dialog.component';
import { DataServicesModule } from './data-services/data-services.module';
import { CardPreviewComponent } from './card-preview/card-preview.component';
import { SharedModule } from './shared/shared.module';
import { ExportCardsComponent } from './export-cards/export-cards.component';
import { CardsTabMenuComponent } from './cards-tab-menu/cards-tab-menu.component';
import { CardAttributesComponent } from './card-attributes/card-attributes.component';
import { CardThumbnailsComponent } from './card-thumbnails/card-thumbnails.component';
import { PageHeaderComponent } from './page-header/page-header.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { ExportSelectionDialogComponent } from './export-selection-dialog/export-selection-dialog.component';
import { CardToHtmlPipe } from './shared/pipes/template-to-html.pipe';
import MonacoExtension from './shared/extensions/monaco-extension';
import { SiteMenuComponent } from './site-menu/site-menu.component';
import { SiteSidebarComponent } from './site-sidebar/site-sidebar.component';
import { providePrimeNG } from 'primeng/config';
import { CiderTheme } from './cider-theme';
import { SiteActivitybarComponent } from './site-activitybar/site-activitybar.component';
import { LocalStorageService } from './data-services/local-storage/local-storage.service';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';
import { AssetComponent } from './asset/asset.component';
import { TemplateGeneratorComponent } from './template-generator/template-generator.component';
import { AssetGeneratorComponent } from './asset-generator/asset-generator.component';
import { DocumentComponent } from './document/document.component';
import { MarkdownModule } from 'ngx-markdown';
import { DocumentsComponent } from './documents/documents.component';
import { ProjectComponent } from './project/project.component';
import { GameSimulatorComponent } from './game-simulator/game-simulator.component';
import { HandlebarsPipe } from './shared/pipes/handlebars.pipe';
import { EntitySpreadsheetComponent } from './entity-spreadsheet/entity-spreadsheet.component';

import { DropdownOptionEditorComponent } from './shared/components/dropdown-option-editor/dropdown-option-editor.component';

@NgModule({
    declarations: [
        AppComponent,
        DecksComponent,
        CardTemplatesComponent,
        CardsComponent,
        SiteHeaderComponent,
        SiteFooterComponent,
        SiteContentComponent,
        SiteTemplateComponent,
        AssetsComponent,
        AssetComponent,
        EntityTableComponent,
        EntityDialogComponent,
        CardPreviewComponent,
        ExportCardsComponent,
        CardsTabMenuComponent,
        CardAttributesComponent,
        CardThumbnailsComponent,
        PageHeaderComponent,
        WelcomeComponent,
        ExportSelectionDialogComponent,
        SiteMenuComponent,
        SiteSidebarComponent,
        SiteActivitybarComponent,
        SettingsDialogComponent,
        TemplateGeneratorComponent,
        AssetGeneratorComponent,
        DocumentComponent,
        DocumentsComponent,
        ProjectComponent,
        GameSimulatorComponent,
    ],
    bootstrap: [AppComponent],
    imports: [BrowserModule,
        DropdownOptionEditorComponent,
        BrowserAnimationsModule,
        AppRoutingModule,
        MonacoEditorModule.forRoot(MonacoExtension.monacoConfig),
        MarkdownModule.forRoot(),
        ButtonModule,
        ButtonGroup,
        RippleModule,
        CardModule,
        TableModule,
        PanelModule,
        PanelMenuModule,
        MenubarModule,
        ToolbarModule,
        DialogModule,
        FormsModule,
        InputTextModule,
        InputGroup,
        TextareaModule,
        SplitterModule,
        ConfirmDialogModule,
        ToastModule,
        SelectModule,
        TabsModule,
        DataServicesModule,
        SharedModule,
        EntitySpreadsheetComponent,
        ScrollPanelModule,
        FileUploadModule,
        MessageModule,
        SelectButtonModule,
        ProgressBarModule,
        CheckboxModule,
        ChipModule,
        DividerModule,
        MultiSelectModule,
        // Select imported above
        DataViewModule,
        TreeModule,
        TooltipModule,
        IconFieldModule,
        InputIconModule,
        TagModule,
        ToggleSwitchModule,
        ContextMenuModule,
        StepperModule,
        BreadcrumbModule,
        ColorPickerModule,
        InputNumberModule,
        PopoverModule,
        MeterGroupModule,
        CdkDrag,
        DragDropModule,
        AutoCompleteModule,
        TranslatePipe,
        TranslateDirective
    ],
    providers: [
        CardToHtmlPipe,
        HandlebarsPipe,
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimationsAsync(),
        providePrimeNG({
            ripple: true,
            theme: {
                preset: CiderTheme,
                options: {
                    darkModeSelector: "." + LocalStorageService.DARK_MODE,
                }
            }
        }),
        provideHttpClient(),
        provideTranslateService({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            },
            defaultLanguage: 'en',
        })
    ]
})
export class AppModule { }

