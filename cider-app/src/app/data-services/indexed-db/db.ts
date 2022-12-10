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
import { firstValueFrom } from "rxjs";
import { Injectable } from "@angular/core";

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
    private static readonly ALL_TABLES = [
        AppDB.GAMES_TABLE, AppDB.DECKS_TABLE, AppDB.CARDS_TABLE, AppDB.ASSETS_TABLE, 
        AppDB.CARD_TEMPLATES_TABLE, AppDB.CARD_ATTRIBUTES_TABLE];

    games!: Table<Deck, number>;
    cards!: Table<Card, number>;
    assets!: Table<Asset, number>;
    cardTemplates!: Table<CardTemplate, number>;
    private httpClient;

    constructor(httpClient: HttpClient) {
        super(AppDB.DB_NAME);
        this.httpClient = httpClient;
        this.version(1).stores({
            games: '++id, name',
            cards: '++id, gameId, count, frontCardTemplateId, backCardTemplateId',
            assets: '++id, gameId, name',
            cardTemplates: '++id, gameId, name, description, html, css',
            printTemplates: '++id, gameId, name, description, html, css',
            cardAttributes: '++id, gameId, name, type, options, description'
        });
        this.version(2).stores({
            decks: '++id, name',
            assets: '++id, name',
            cards: '++id, deckId, count, frontCardTemplateId, backCardTemplateId',
            cardTemplates: '++id, deckId, name, description, html, css',
            printTemplates: null,
            cardAttributes: '++id, deckId, name, type, options, description'
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
        // this.on('populate', () => this.populateFromFile());
        this.on('populate', () => this.populate());
    }

    async populateFromFile() {
        const blob = await firstValueFrom(this.httpClient.get(AppDB.SAMPLE_DB_FILE, {responseType: 'blob'}));
        console.log('blob', blob);
        const file = new File([blob], 'database.json', {type: 'application/json', lastModified: Date.now()});
        await this.importDatabase(file, undefined, true);
    }

    async populate() {
        const deckId : IndexableType = await this.table(AppDB.DECKS_TABLE).add({
            name: 'Apple Cider Deck'
        });

        const frontCardTemplateId : IndexableType = await this.table(AppDB.CARD_TEMPLATES_TABLE).add({
            name: 'Apple Front',
            deckId: deckId,
            description: '',
            css: templateCssFront,
            html: templateHtmlFront
        });

        const backCardTemplateId : IndexableType = await this.table(AppDB.CARD_TEMPLATES_TABLE).add({
            name: 'Apple Back',
            deckId: deckId,
            description: '',
            css: templateCssBack,
            html: templateHtmlBack
        });

        await this.table(AppDB.CARD_ATTRIBUTES_TABLE).bulkAdd([
            {
                deckId: deckId,
                name: 'Description',
                description: 'Description of the card',
                type: FieldType.text
            }, {
                deckId: deckId,
                name: 'Hue',
                description: 'Hue of the card',
                type: FieldType.text
            }
        ]);

        await this.table(AppDB.CARDS_TABLE).bulkAdd([
            {
                deckId: deckId,
                frontCardTemplateId: frontCardTemplateId,
                backCardTemplateId: backCardTemplateId,
                name: 'Poison Apple',
                count: 3,
                description: "Take one card from an opponent's hand.",
                hue: '110'
            }, {
                deckId: deckId,
                frontCardTemplateId: frontCardTemplateId,
                backCardTemplateId: backCardTemplateId,
                name: 'Healthy Apple',
                count: 1,
                description: "Take a card from the discard pile.",
                hue: '0'
            }, {
                deckId: deckId,
                frontCardTemplateId: frontCardTemplateId,
                backCardTemplateId: backCardTemplateId,
                name: 'Mystic Apple',
                count: 1,
                description: "Draw two cards from the deck, choose one, discard the other.",
                hue: '250'
            }, {
                deckId: deckId,
                frontCardTemplateId: frontCardTemplateId,
                backCardTemplateId: backCardTemplateId,
                name: 'Crystal Apple',
                count: 1,
                description: "Every player draws a card and hands you one card from their hand.",
                hue: '175'
            }
        ]);
    }

    /**
     * Import database from file
     * Warning: Overrides the existing database
     * 
     * @param file 
     */
    public async importDatabase(file: File, progressCallback?: (progress: ImportProgress) => boolean, 
        skipDelete?: boolean): Promise<boolean> {
        // unsolved dexie with typescript issue: https://github.com/dexie/Dexie.js/issues/1262
        // @ts-ignore
        if (!skipDelete) {
            await this.delete();
        }
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
        return this.delete().then (() => this.open()).then(() => {
            if (keepEmpty) {
                return Promise.all(AppDB.ALL_TABLES.map(table => this.table(table).clear()))
                .then(() => true);
            }
            return true;
        });
    }
}


const templateCssFront  = 
`.card {
    width: 825px;
    height: 1125px;
    border-radius: 25px;
    text-align: center;
    display: flex;
    flex-direction: column;
    background-color: hsl({{card.hue}}, 23%, 40%);
    border: 45px solid hsl({{card.hue}}, 23%, 30%);
    color: hsl({{card.hue}}, 23%, 90%);
    font-weight: 600;
    font-size: 50px;
}
.card .header {
    height: 300px;
    font-size: 80px;
    font-weight: 600;
    padding: 10px;
    padding-top: 60px;
}
.card .apple {
    height: 250px;
    font-size: 150px;
}
.card .content {
    flex: 1;
    padding: 50px;
    padding-top: 60px;
}
.card .footer {
    height: 200px;
    text-align: right;
    padding: 100px;
    padding-right: 50px;
}`;

const templateHtmlFront = 
`<div class="card">
    <div class="header">{{card.name}}</div>
    <div class="apple">◯</div>
    <div class="content">{{card.description}}</div>
    <div class="footer">A{{#padZeros card.id 3}}{{/padZeros}}</div>
</div>`;

const templateCssBack =
`.card {
    width: 825px;
    height: 1125px;
    border-radius: 25px;
    text-align: center;
    display: flex;
    flex-direction: column;
    background-color: hsl(220, 24%, 30%);
    border: 45px solid hsl(220, 23%, 10%);
    color: hsl(220, 23%, 70%);
    font-weight: 600;
    font-size: 100px;
}
.card .content {
    flex: 1;
    padding: 50px;
    padding-top: 350px;
}`

const templateHtmlBack =
`<div class="card">
    <div class="content">Apple Cider Game</div>
</div>`

