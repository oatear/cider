import Dexie, { IndexableType, Table } from "dexie";
import { Card } from "primeng/card";
import { Asset } from "../types/asset.type";
import { CardTemplate } from "../types/card-template.type";
import { Deck } from "../types/deck.type";
import { exportDB, importDB } from "dexie-export-import";
import FileUtils from "src/app/shared/utils/file-utils";
import { ExportProgress } from "dexie-export-import/dist/export";
import { ImportProgress } from "dexie-export-import/dist/import";
import { FieldType } from "../types/field-type.type";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Subject, firstValueFrom } from "rxjs";
import { Injectable } from "@angular/core";
import { Variable } from "../types/variable.type";

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
    public static readonly VARIABLES_TABLE: string = 'variables';
    private static readonly ALL_TABLES = [
        AppDB.GAMES_TABLE, AppDB.DECKS_TABLE, AppDB.CARDS_TABLE, AppDB.ASSETS_TABLE, 
        AppDB.CARD_TEMPLATES_TABLE, AppDB.CARD_ATTRIBUTES_TABLE, AppDB.VARIABLES_TABLE];

    games!: Table<Deck, number>;
    cards!: Table<Card, number>;
    assets!: Table<Asset, number>;
    cardTemplates!: Table<CardTemplate, number>;
    variables!: Table<Variable, number>;
    private httpClient;
    private changeSubject: Subject<null>;

    constructor(httpClient: HttpClient) {
        super(AppDB.DB_NAME);
        this.httpClient = httpClient;
        this.changeSubject = new Subject<null>();
        this.version(1).stores({
            games: '++id, name',
            cards: '++id, gameId, count, frontCardTemplateId, backCardTemplateId',
            assets: '++id, gameId, name',
            cardTemplates: '++id, gameId, name, description, html, css',
            printTemplates: '++id, gameId, name, description, html, css',
            cardAttributes: '++id, gameId, name, type, options, description'
        });
        const v2 = {
            decks: '++id, name',
            assets: '++id, name',
            cards: '++id, deckId, count, frontCardTemplateId, backCardTemplateId',
            cardTemplates: '++id, deckId, name, description, html, css',
            printTemplates: null,
            cardAttributes: '++id, deckId, name, type, options, description'
        };
        this.version(2).stores(v2).upgrade(transaction => {
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
        const v3 = { ...v2, variables:'++id, name, value' };
        this.version(3).stores(v3)
        
        // populate in a non-traditional way since the 'on populate' will not allow ajax calls
        this.on('ready', () => this.table(AppDB.DECKS_TABLE).count()
        .then(count => {
            if (count > 0) {
                console.log('db already populated');
                return true;
            }
            console.log('populate from file');
            return this.populateFromFile().then(() => true);
        }));

        // trigger changeSubject when change emitted to db
        Dexie.on('storagemutated', (event) => {
            this.changeSubject.next(null);
        });
    }

    async populateFromFile() {
        const blob = await firstValueFrom(this.httpClient.get(AppDB.SAMPLE_DB_FILE, {responseType: 'blob'}));
        const file = new File([blob], 'database.json', {type: 'application/json', lastModified: Date.now()});
        await importDB(file, {
            //noTransaction: true
        });
        return true;
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
        .then(result => true);
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
    public resetDatabase(keepEmpty?: boolean) {
        this.close();
        return this.delete().then(() => this.open()).then(() => {
            if (!keepEmpty) {
                return this.populateFromFile();
            }
            return true;
        });
    }

    public onChange() {
        return this.changeSubject.asObservable();
    }
}
