import Dexie, { IndexableType, Table } from "dexie";
import { Card } from "primeng/card";
import { Asset } from "../types/asset.type";
import { CardTemplate } from "../types/card-template.type";
import { Game } from "../types/game.type";
import { PrintTemplate } from "../types/print-template.type";
import { importInto, exportDB } from "dexie-export-import";
import * as FileSaver from "file-saver";


export class AppDB extends Dexie {
    private static readonly DB_NAME: string = 'cider-db';
    public static readonly GAMES_TABLE: string = 'games';
    public static readonly CARDS_TABLE: string = 'cards';
    public static readonly ASSETS_TABLE: string = 'assets';
    public static readonly CARD_TEMPLATES_TABLE: string = 'cardTemplates'
    public static readonly PRINT_TEMPLATES_TABLE: string = 'printTemplates';
    public static readonly CARD_ATTRIBUTES_TABLE: string = 'cardAttributes';

    games!: Table<Game, number>;
    cards!: Table<Card, number>;
    assets!: Table<Asset, number>;
    cardTemplates!: Table<CardTemplate, number>;
    printTemplates!: Table<PrintTemplate, number>;

    constructor() {
        super(AppDB.DB_NAME);
        this.version(1).stores({
            games: '++id, name',
            cards: '++id, gameId, frontCardTemplateId, backCardTemplateId',
            assets: '++id, gameId, name',
            cardTemplates: '++id, gameId, name, description, html, css',
            printTemplates: '++id, gameId, name, description, html, css',
            cardAttributes: '++id, gameId, name, type'
        });
        this.on('populate', () => this.populate());
    }

    async populate() {
        const gameId : IndexableType = await db.table(AppDB.GAMES_TABLE).add({
            name: 'Apple Cider Game'
        });

        const frontCardTemplateId : IndexableType = await db.table(AppDB.CARD_TEMPLATES_TABLE).add({
            name: 'Apple Front',
            gameId: gameId,
            description: '',
            css: templateCssFront,
            html: templateHtmlFront
        });

        const backCardTemplateId : IndexableType = await db.table(AppDB.CARD_TEMPLATES_TABLE).add({
            name: 'Apple Back',
            gameId: gameId,
            description: '',
            css: templateCssBack,
            html: templateHtmlBack
        });

        await db.table(AppDB.CARD_ATTRIBUTES_TABLE).bulkAdd([
            {
                gameId: gameId,
                name: 'Description'
            }, {
                gameId: gameId,
                name: 'Hue'
            }
        ]);

        await db.table(AppDB.CARDS_TABLE).bulkAdd([
            {
                gameId: gameId,
                frontCardTemplateId: frontCardTemplateId,
                backCardTemplateId: backCardTemplateId,
                name: 'Poison Apple',
                description: "Take one card from an opponent's hand.",
                hue: '110'
            }, {
                gameId: gameId,
                frontCardTemplateId: frontCardTemplateId,
                backCardTemplateId: backCardTemplateId,
                name: 'Healthy Apple',
                description: "Take a card from the discard pile.",
                hue: '0'
            }, {
                gameId: gameId,
                frontCardTemplateId: frontCardTemplateId,
                backCardTemplateId: backCardTemplateId,
                name: 'Mystic Apple',
                description: "Draw two cards from the deck, choose one, discard the other.",
                hue: '250'
            }, {
                gameId: gameId,
                frontCardTemplateId: frontCardTemplateId,
                backCardTemplateId: backCardTemplateId,
                name: 'Crystal Apple',
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
    public importDatabase(file: File) {
        // unsolved dexie with typescript issue: https://github.com/dexie/Dexie.js/issues/1262
        // @ts-ignore
        importInto(db, file, {
            overwriteValues: true,
            noTransaction: true
        });
    }

    /**
     * Export database to file
     * 
     */
    public exportDatabase() {
        // unsolved dexie with typescript issue: https://github.com/dexie/Dexie.js/issues/1262
        // @ts-ignore
        const promisedBlob: Promise<Blob> = exportDB(this);
        promisedBlob.then(blob => FileSaver.saveAs(blob, 'database.json'));
    }

    /**
     * Delete all data in database and return to default data.
     */
    public resetDatabase() {
        return db.delete().then (()=>db.open());
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
    background-color: hsl({{card.hue}}, 23%, 20%);
    border: 45px solid hsl({{card.hue}}, 23%, 10%);
    color: hsl({{card.hue}}, 23%, 70%);
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
    background-color: hsl(220, 24%, 20%);
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

export const db = new AppDB();
