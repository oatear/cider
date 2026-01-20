import Dexie, { Table } from "dexie";
import { Card } from "primeng/card";
import { Asset } from "../types/asset.type";
import { CardTemplate } from "../types/card-template.type";
import { FieldType } from "../types/field-type.type";
import { Deck } from "../types/deck.type";
import { exportDB, importDB } from "dexie-export-import";
import FileUtils from "src/app/shared/utils/file-utils";
import { ExportProgress } from "dexie-export-import/dist/export";
import { ImportProgress } from "dexie-export-import/dist/import";
import { HttpClient } from "@angular/common/http";
import { Subject, firstValueFrom } from "rxjs";
import { Injectable } from "@angular/core";
import { ElectronService } from "../electron/electron.service";

@Injectable({
    providedIn: 'root'
})
export class AppDB extends Dexie {
    private static readonly SAMPLE_DB_FILE: string = 'assets/cosmic-apple.json'
    private static readonly DB_NAME: string = 'cider-db';
    public static readonly GAMES_TABLE: string = 'games';
    public static readonly DECKS_TABLE: string = 'decks';
    public static readonly CARDS_TABLE: string = 'cards';
    public static readonly ASSETS_TABLE: string = 'assets';
    public static readonly CARD_TEMPLATES_TABLE: string = 'cardTemplates'
    public static readonly PRINT_TEMPLATES_TABLE: string = 'printTemplates';
    public static readonly CARD_ATTRIBUTES_TABLE: string = 'cardAttributes';
    public static readonly DOCUMENTS_TABLE: string = 'documents';
    public static readonly ASSET_FOLDERS_TABLE: string = 'assetFolders';
    private static readonly ALL_TABLES = [
        AppDB.GAMES_TABLE, AppDB.DECKS_TABLE, AppDB.CARDS_TABLE, AppDB.ASSETS_TABLE,
        AppDB.CARD_TEMPLATES_TABLE, AppDB.CARD_ATTRIBUTES_TABLE, AppDB.DOCUMENTS_TABLE, AppDB.ASSET_FOLDERS_TABLE];

    games!: Table<Deck, number>;
    cards!: Table<Card, number>;
    assets!: Table<Asset, number>;
    cardTemplates!: Table<CardTemplate, number>;
    private httpClient;
    private changeSubject: Subject<any>;
    private loadSubject: Subject<null>;

    constructor(httpClient: HttpClient,
        electronService: ElectronService,
    ) {
        super(AppDB.DB_NAME);
        this.httpClient = httpClient;
        this.changeSubject = new Subject<any>();
        this.loadSubject = new Subject<null>();
        /**
         * Dexie Versioning Documentation:
         * 
         * https://dexie.org/docs/Tutorial/Design#database-versioning
         */
        this.version(1).stores({
            games: '++id, name',
            cards: '++id, gameId, count, frontCardTemplateId, backCardTemplateId',
            assets: '++id, gameId, name',
            cardTemplates: '++id, gameId, name, description, html, css',
            printTemplates: '++id, gameId, name, description, html, css',
            cardAttributes: '++id, gameId, name, type, options, description',
        });
        this.version(2).stores({
            games: null,
            decks: '++id, name',
            assets: '++id, name',
            cards: '++id, deckId, count, frontCardTemplateId, backCardTemplateId',
            cardTemplates: '++id, deckId, name, description, html, css',
            printTemplates: null,
            cardAttributes: '++id, deckId, name, type, options, description',
        }).upgrade(transaction => {
            // upgrade to version 2
            return transaction.table(AppDB.GAMES_TABLE).toArray().then(games => {
                transaction.table(AppDB.DECKS_TABLE).bulkAdd(games);
            }).then(result => {
                return transaction.table(AppDB.CARDS_TABLE).toCollection().modify(card => {
                    card.deckId = card.gameId;
                    delete card.gameId;
                });
            }).then(result => {
                return transaction.table(AppDB.CARD_TEMPLATES_TABLE).toCollection().modify(template => {
                    template.deckId = template.gameId;
                    delete template.gameId;
                });
            }).then(result => {
                return transaction.table(AppDB.CARD_ATTRIBUTES_TABLE).toCollection().modify(attribute => {
                    attribute.deckId = attribute.gameId;
                    delete attribute.gameId;
                });
            }).then(result => {
                return transaction.table(AppDB.ASSETS_TABLE).toCollection().modify(asset => {
                    delete asset.gameId;
                });
            });
        });
        this.version(3).stores({
            // other tables are inherited from previous versions
            documents: '++id, name, content',
        });
        this.version(4).stores({
            // other tables are inherited from previous versions
            // add mime field to documents
            documents: '++id, name, mime, content',
        }).upgrade(transaction => {
            return transaction.table(AppDB.DOCUMENTS_TABLE).toCollection().modify(document => {
                document.mime = 'text/markdown'; // only markdown documents exist at this point
            });
        });
        this.version(5).stores({
            cardAttributes: '++id, deckId, name, type, options, description, width',
        }).upgrade(transaction => {
            return transaction.table(AppDB.CARD_ATTRIBUTES_TABLE).toCollection().modify(attribute => {
                attribute.width = 'auto';
            });
        });
        this.version(6).stores({
            cardAttributes: '++id, deckId, name, type, options, description, width',
        }).upgrade(transaction => {
            return transaction.table(AppDB.CARD_ATTRIBUTES_TABLE).toCollection().modify(attribute => {
                // Map old types to new types
                if ((attribute.type as any) === 'number') attribute.type = 'numeric';
                if ((attribute.type as any) === 'option') attribute.type = 'dropdown';
                if ((attribute.type as any) === 'text-area') attribute.type = 'text';
            });
        });
        this.version(7).stores({
            cardAttributes: '++id, deckId, name, type, options, description, width, order',
        }).upgrade(transaction => {
            return transaction.table(AppDB.CARD_ATTRIBUTES_TABLE).toCollection().modify(attribute => {
                attribute.order = attribute.id; // Default order to ID
            });
        });
        this.version(8).stores({
            cardAttributes: '++id, deckId, name, [deckId+name], type, options, description, width, order',
        });
        this.version(9).stores({
            assets: '++id, name, path',
        }).upgrade(transaction => {
            return transaction.table(AppDB.ASSETS_TABLE).toCollection().modify(asset => {
                if (!asset.path) {
                    asset.path = '';
                }
            });
        });
        this.version(10).stores({
            assetFolders: '++id, path',
        });

        // populate in a non-traditional way since the 'on populate' will not allow ajax calls
        this.on('ready', () => this.table(AppDB.DECKS_TABLE).count()
            .then(count => {
                if (!electronService.isElectron() && count > 0) {
                    console.log('db already populated');
                } else {
                    console.log('populate from file');
                    this.populateFromFile().then(() => {
                        // cause asset urls to update
                        this.loadSubject.next(null);
                    });
                }
            }).then(() => {
                // initialize mandatory data;
                return this.initializeData();
            }));

        // trigger changeSubject when change emitted to db
        Dexie.on('storagemutated', (event) => {
            // We still use this for general "unsaved" flag if needed, 
            // but rely on hooks for granular updates.
            // this.changeSubject.next(event); 
        });

        this.on('populate', () => {
            // populate
        });

        // Add hooks for granular dirty tracking
        const trackChange = (tableName: string, type: string, key: any) => {
            this.changeSubject.next({ tableName, type, key });
        };

        // We need to wait for tables to be initialized or just access them via this.table()
        // But hook must be on the specific table instance.
        // It's safer to loop strictly over known tables.

        const tablesToWatch = [
            { name: AppDB.DECKS_TABLE },
            { name: AppDB.CARDS_TABLE },
            { name: AppDB.ASSETS_TABLE },
            { name: AppDB.CARD_TEMPLATES_TABLE },
            { name: AppDB.CARD_ATTRIBUTES_TABLE },
            { name: AppDB.DOCUMENTS_TABLE },
            { name: AppDB.ASSET_FOLDERS_TABLE }
        ];

        tablesToWatch.forEach(t => {
            this.table(t.name).hook('creating', function (primKey, obj, trans) {
                // For auto-incremented keys, primKey is undefined here.
                // We must assign onsuccess to capture the generated key.
                this.onsuccess = function (id) {
                    trackChange(t.name, 'create', id);
                };
            });
            this.table(t.name).hook('updating', (mods, primKey, obj, trans) => {
                trackChange(t.name, 'update', primKey);
            });
            this.table(t.name).hook('deleting', (primKey, obj, trans) => {
                trackChange(t.name, 'delete', primKey);
            });
        });

    }

    async populateFromFile() {
        const blob = await firstValueFrom(this.httpClient.get(AppDB.SAMPLE_DB_FILE, { responseType: 'blob' }));
        const file = new File([blob], 'database.json', { type: 'application/json', lastModified: Date.now() });
        return importDB(file, {
            //noTransaction: true
        }).then((db) => {
            this.initializeData();
            return db;
        });
    }

    /**
     * Import database from file
     * Warning: Overrides the existing database
     * 
     * @param file 
     */
    public async importDatabase(file: File,
        progressCallback?: (progress: ImportProgress) => boolean): Promise<boolean> {
        // unsolved dexie with typescript issue: https://github.com/dexie/Dexie.js/issues/1262
        // @ts-ignore
        await this.delete();
        return importDB(file, {
            noTransaction: true,
            progressCallback: progressCallback
        }).then(tempDb => tempDb.close())
            .then(result => this.open())
            .then(() => true);
    }

    /**
     * Export database to file
     * 
     */
    public exportDatabase(progressCallback?: (progress: ExportProgress) => boolean): Promise<boolean> {
        // unsolved dexie with typescript issue: https://github.com/dexie/Dexie.js/issues/1262
        // @ts-ignore
        const promisedBlob: Promise<Blob> = exportDB(this, {
            progressCallback: progressCallback,
            prettyJson: true
        });
        return promisedBlob.then(blob => {
            FileUtils.saveAs(blob, 'database.json');
            return true;
        });
    }

    /**
     * Delete all data in database and return to default data.
     */
    public async resetDatabase(keepEmpty?: boolean) {
        this.close();
        await this.delete();
        if (!keepEmpty) {
            const tempDb = await this.populateFromFile();
            tempDb.close();
        }
        await this.open().then(() => this.initializeData());
        this.changeSubject.next(null);
        return true;
    }

    public onChange() {
        return this.changeSubject.asObservable();
    }

    public onLoad() {
        return this.loadSubject.asObservable();
    }

    /**
     * Initialize data in the database if there are missing
     * mandatory entries. This is run on project open.
     */
    public async initializeData(): Promise<void> {
        // make sure the global-styles css document exists
        const documentsTable = this.table(AppDB.DOCUMENTS_TABLE);
        const count = await documentsTable.where('name').equals('global-styles').count();
        if (count === 0) {
            await documentsTable.add({
                name: 'global-styles',
                mime: 'text/css',
                content: `/* Global Styles and Font Declarations */\n`
            });
        }

        // Upgrade legacy dropdown options to DropdownOption json structure
        const attributesTable = this.table(AppDB.CARD_ATTRIBUTES_TABLE);
        await attributesTable.toCollection().modify(attribute => {
            // Map old types to new types
            if ((attribute.type as any) === 'number') attribute.type = FieldType.numeric;
            if ((attribute.type as any) === 'option') attribute.type = FieldType.dropdown;
            if ((attribute.type as any) === 'text-area') attribute.type = FieldType.text;

            // Set default width
            if (!attribute.width) {
                attribute.width = 135;
            }

            // Set default order
            if (attribute.order === undefined) {
                attribute.order = attribute.id;
            }

            if (attribute.type === 'dropdown' && attribute.options) {
                let options: any[] = [];
                let changed = false;
                const usedColors = new Set<string>();

                const getRandomColor = () => {
                    let color = '';
                    let attempts = 0;
                    do {
                        color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
                        attempts++;
                    } while (usedColors.has(color) && attempts < 100);
                    usedColors.add(color);
                    return color;
                };

                if (Array.isArray(attribute.options)) {
                    // Check if it's string[] (Legacy format)
                    if (attribute.options.length > 0 && typeof attribute.options[0] === 'string') {
                        options = attribute.options.map((o: string) => ({ value: o, color: getRandomColor() }));
                        changed = true;
                    }
                } else if (typeof attribute.options === 'string') {
                    // Check if it's a JSON string or comma separated
                    const optsStr = attribute.options.trim();
                    if (optsStr.startsWith('[')) {
                        try {
                            const parsed = JSON.parse(optsStr);
                            // If parsed is string[], migrate it.
                            if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
                                options = parsed.map((o: string) => ({ value: o, color: getRandomColor() }));
                                changed = true;
                            }
                        } catch (e) {
                            // ignore
                        }
                    } else {
                        // Comma separated string
                        const parts = optsStr.split(',');
                        if (parts.length > 0) {
                            options = parts.map((o: string) => ({ value: o.trim(), color: getRandomColor() }));
                            changed = true;
                        }
                    }
                }

                if (changed) {
                    attribute.options = options;
                }
            }
        });

        // add other mandatory entries here as needed
        const decks = await this.table(AppDB.DECKS_TABLE).toArray();
        for (const deck of decks) {
            const inherent = [
                { name: 'Name', type: 'text', description: 'The name of the card', isSystem: true, order: -4 },
                { name: 'Count', type: 'numeric', description: 'How many of this card appear in the deck', isSystem: true, order: -3 },
                { name: 'Front Template', type: 'dropdown', description: "The card's front template", isSystem: true, order: -2 },
                { name: 'Back Template', type: 'dropdown', description: "The card's back template", isSystem: true, order: -1 }
            ];

            for (const attr of inherent) {
                const count = await attributesTable.where({ deckId: deck.id, name: attr.name }).count();
                if (count === 0) {
                    await attributesTable.add({
                        deckId: deck.id,
                        name: attr.name,
                        type: attr.type as any,
                        description: attr.description,
                        options: [],
                        width: 135,
                        order: attr.order,
                        isSystem: true
                    });
                } else {
                    await attributesTable.where({ deckId: deck.id, name: attr.name }).modify({ isSystem: true });
                }
            }
        }

        return;
    }
}
