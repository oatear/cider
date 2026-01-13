import { Component, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { CardsService } from '../data-services/services/cards.service';
import { CardAttributesService } from '../data-services/services/card-attributes.service';
import { ThemeService } from '../data-services/theme/theme.service';
import { SpreadsheetComponent, Cell, ColumnConfig, SpreadsheetTheme, longLight, longDark, cosmicDark } from 'oatear-longtable';
import { Card } from '../data-services/types/card.type';
import { CardAttribute } from '../data-services/types/card-attribute.type';
import { Subscription, Subject, debounceTime } from 'rxjs';
import StringUtils from '../shared/utils/string-utils';
import { FieldType } from '../data-services/types/field-type.type';
import { ProgressBarModule } from 'primeng/progressbar';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-entity-spreadsheet',
    templateUrl: './entity-spreadsheet.component.html',
    styleUrls: ['./entity-spreadsheet.component.scss'],
    standalone: true,
    imports: [SpreadsheetComponent, ProgressBarModule, TranslateModule, CommonModule]
})
export class EntitySpreadsheetComponent implements OnInit, OnDestroy {
    data: WritableSignal<Cell[][]> = signal([]);
    columnConfig: WritableSignal<ColumnConfig[]> = signal([]);
    theme: WritableSignal<SpreadsheetTheme> = signal(longLight);
    isLoading: WritableSignal<boolean> = signal(false);

    private lookups: Map<string, Map<string, number>> = new Map(); // Name -> ID
    private reverseLookups: Map<string, Map<number, string>> = new Map(); // ID -> Name


    private cards: Card[] = [];
    private attributes: CardAttribute[] = [];
    private subscriptions: Subscription = new Subscription();

    private dataChangeSubject = new Subject<Cell[][]>();
    private columnChangeSubject = new Subject<ColumnConfig[]>();

    constructor(
        private cardsService: CardsService,
        private attributesService: CardAttributesService,
        private themeService: ThemeService
    ) {
        this.subscriptions.add(
            this.dataChangeSubject.pipe(debounceTime(1000)).subscribe(data => this.processDataChange(data))
        );
        this.subscriptions.add(
            this.columnChangeSubject.pipe(debounceTime(1000)).subscribe(config => this.processColumnChange(config))
        );
    }

    ngOnInit(): void {
        this.loadData();
        this.setupTheme();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    private async loadData(): Promise<void> {
        const [cards, attributes] = await Promise.all([
            this.cardsService.getAll(),
            this.attributesService.getAll()
        ]);

        this.cards = cards;
        this.attributes = attributes;

        await this.setupColumns();
        this.setupRows();
    }

    private async setupColumns(): Promise<void> {
        const fields = await this.cardsService.getFields();
        const visibleFields = fields.filter(f => !f.hidden);

        const configs: ColumnConfig[] = await Promise.all(visibleFields.map(async f => {
            const editor = this.mapEditor(f.type);
            let options: string[] = f.options ? f.options.map(o => o.value) : [];

            if (f.service) {
                const entities = await f.service.getAll();
                const nameToId = new Map<string, number>();
                const idToName = new Map<number, string>();

                options = [];
                entities.forEach((e: any) => {
                    const name = e.name;
                    const id = e.id;
                    options.push(name);
                    nameToId.set(name, id);
                    idToName.set(id, name);
                });

                this.lookups.set(f.field as string, nameToId);
                this.reverseLookups.set(f.field as string, idToName);
            }

            const relatedAttribute = this.attributes.find(a => a.name === f.header);

            return {
                name: f.header,
                field: f.field as string,
                width: ((f.width as any) === 'auto' || !f.width) ? 135 : f.width,
                readOnly: f.field === 'id',
                editor: editor,
                options: options,
                description: f.description,
                lockSettings: relatedAttribute?.isSystem,
            };
        }));

        this.columnConfig.set(configs);
    }

    private mapEditor(type: FieldType): 'text' | 'dropdown' | 'checkbox' | 'numeric' {
        switch (type) {
            case FieldType.numeric: return 'numeric';
            case FieldType.dropdown: return 'dropdown';
            case FieldType.checkbox: return 'checkbox';
            default: return 'text';
        }
    }

    private setupRows(): void {
        const rows: Cell[][] = this.cards.map(card => {
            const row: Cell[] = [];
            this.columnConfig().forEach(col => {
                let val = (card as any)[col.field];

                if (this.reverseLookups.has(col.field) && val !== undefined && val !== null) {
                    val = this.reverseLookups.get(col.field)?.get(val) || val;
                }

                row.push({ value: val !== undefined && val !== null ? val : '' });
            });
            // Stash ID for safe retrieval even if rows are reordered
            (row as any).recordId = card.id;
            return row;
        });

        this.data.set(rows);
    }

    private setupTheme(): void {
        this.updateTheme();
        this.subscriptions.add(
            this.themeService.currentTheme$.subscribe(() => this.updateTheme())
        );
    }

    private updateTheme(): void {
        const current = this.themeService.getCurrentTheme();
        if (current.id === 'cosmic-dark') {
            this.theme.set(cosmicDark);
        } else {
            this.theme.set(current.id.includes('dark') ? longDark : longLight);
        }
    }

    onDataChanged(newData: Cell[][]): void {
        this.dataChangeSubject.next(newData);
    }

    private async processDataChange(newData: Cell[][]): Promise<void> {
        this.isLoading.set(true);
        try {
            const currentConfig = this.columnConfig();

            for (let rowIndex = 0; rowIndex < newData.length; rowIndex++) {
                const row = newData[rowIndex];
                // Try to find by stashed ID first, fall back to index if missing
                const recordId = (row as any).recordId;
                let originalCard: Card | undefined;

                if (recordId !== undefined) {
                    originalCard = this.cards.find(c => c.id === recordId);
                } else {
                    if (rowIndex < this.cards.length) {
                        originalCard = this.cards[rowIndex];
                    }
                }

                if (originalCard) {
                    const updatedCard: any = { ...originalCard };

                    row.forEach((cell, cellIndex) => {
                        const colConfig = currentConfig[cellIndex];
                        if (colConfig) {
                            let val = cell.value;
                            if (this.lookups.has(colConfig.field)) {
                                const mapped = this.lookups.get(colConfig.field)?.get(val as string);
                                if (mapped !== undefined) {
                                    val = mapped;
                                }
                            }
                            updatedCard[colConfig.field] = val;
                        }
                    });

                    if (this.hasChanged(originalCard, updatedCard)) {
                        await this.cardsService.update(originalCard.id, updatedCard);
                        // Update local copy
                        const cardIndex = this.cards.findIndex(c => c.id === originalCard?.id);
                        if (cardIndex !== -1) {
                            this.cards[cardIndex] = updatedCard;
                        }
                    }
                } else {
                    // New card creation
                    // Create a basic card object.
                    const newCard: any = { count: 1 }; // Default count
                    let hasData = false;

                    row.forEach((cell, cellIndex) => {
                        const colConfig = currentConfig[cellIndex];
                        if (colConfig) {
                            let val = cell.value;
                            if (this.lookups.has(colConfig.field)) {
                                const mapped = this.lookups.get(colConfig.field)?.get(val as string);
                                if (mapped !== undefined) {
                                    val = mapped;
                                }
                            }
                            newCard[colConfig.field] = val;
                            if (cell.value !== '' && cell.value !== null && cell.value !== undefined) {
                                hasData = true;
                            }
                        }
                    });

                    if (hasData) {
                        try {
                            const createdCard = await this.cardsService.create(newCard);

                            // Attach the new ID to the row so subsequent edits update this card
                            (row as any).recordId = createdCard.id;

                            // Add to local cache at the correct position if possible, 
                            // or just ensure lookup finds it next time.
                            if (rowIndex >= this.cards.length) {
                                this.cards.push(createdCard);
                            } else {
                                this.cards[rowIndex] = createdCard;
                            }
                        } catch (error) {
                            console.error('Error creating card:', error);
                        }
                    }
                }
            }
        } finally {
            this.isLoading.set(false);
        }
    }

    private hasChanged(oldCard: Card, newCard: any): boolean {
        return JSON.stringify(oldCard) !== JSON.stringify(newCard);
    }

    onColumnChanged(newConfig: ColumnConfig[]): void {
        this.columnChangeSubject.next(newConfig);
        this.columnConfig.set(newConfig);
    }

    private mapToFieldType(editor: string | undefined): FieldType {
        switch (editor) {
            case 'numeric': return FieldType.numeric;
            case 'dropdown': return FieldType.dropdown;
            case 'checkbox': return FieldType.checkbox;
            default: return FieldType.text;
        }
    }

    private async processColumnChange(newConfig: ColumnConfig[]): Promise<void> {
        this.isLoading.set(true);
        try {
            // Updated logic to handle description, types, options and ORDERING

            for (let index = 0; index < newConfig.length; index++) {
                const config = newConfig[index];
                let attr = this.attributes.find(a => StringUtils.toKebabCase(a.name) === config.field);
                // Fallback for newly created columns where field ID might not match toKebabCase(name) yet
                if (!attr) {
                    attr = this.attributes.find(a => a.name === config.name);
                }

                if (attr) {
                    let changed = false;

                    // 1. Update basic properties
                    if (attr.width !== config.width) {
                        attr.width = config.width as number;
                        changed = true;
                    }
                    // System attributes cannot have name changed
                    if (!attr.isSystem && attr.name !== config.name) {
                        attr.name = config.name;
                        changed = true;
                    }

                    // 2. Update Description (if present in config)
                    if (!attr.isSystem && (config as any).description !== undefined && attr.description !== (config as any).description) {
                        attr.description = (config as any).description;
                        changed = true;
                    }

                    // 3. Update Type
                    const newType = this.mapToFieldType(config.editor);
                    if (!attr.isSystem && attr.type !== newType) {
                        attr.type = newType;
                        changed = true;
                    }

                    // 4. Update Options
                    if (config.options && Array.isArray(config.options)) {
                        const newOptionsStr = config.options;
                        let currentOptions: any[] = [];
                        if (Array.isArray(attr.options)) {
                            currentOptions = attr.options;
                        } else if (typeof attr.options === 'string') {
                            const parts = attr.options.split(',');
                            currentOptions = parts.map(v => ({ value: v.trim(), color: '#FFFFFF' }));
                        }

                        const currentValues = currentOptions.map(o => o.value);
                        const valuesChanged = JSON.stringify(currentValues) !== JSON.stringify(newOptionsStr);

                        if (!attr.isSystem && valuesChanged) {
                            const mergedOptions = newOptionsStr.map(val => {
                                const existing = currentOptions.find(o => o.value === val);
                                if (existing) return existing;
                                return { value: val, color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0') };
                            });
                            attr.options = mergedOptions;
                            changed = true;
                        }
                    }

                    // 5. Update Order
                    if (attr.order !== index) {
                        attr.order = index;
                        changed = true;
                    }

                    if (changed) {
                        await this.attributesService.update(attr.id, attr);
                    }
                } else {
                    const newAttr: Partial<CardAttribute> = {
                        deckId: this.attributes[0]?.deckId || this.cards[0]?.deckId || 1,
                        name: config.name,
                        type: this.mapToFieldType(config.editor),
                        description: (config as any).description || '',
                        options: '',
                        width: config.width as number,
                        order: index
                    };
                    if (newAttr.deckId) {
                        const createdAttr = await this.attributesService.create(newAttr as CardAttribute);
                        // Refresh attributes list
                        this.attributes = await this.attributesService.getAll();
                    }
                }
            }

            // Detect removals
            for (const attr of this.attributes) {
                const field = StringUtils.toKebabCase(attr.name);
                const inConfig = newConfig.find(c => c.field === field || c.name === attr.name);

                if (!inConfig && !attr.isSystem) {
                    await this.attributesService.delete(attr.id);
                }
            }
        } finally {
            this.isLoading.set(false);
        }
    }
}
