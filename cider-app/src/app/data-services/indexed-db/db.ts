import Dexie, { IndexableType, Table } from "dexie";
import { Card } from "primeng/card";
import { Asset } from "../types/asset.type";
import { CardTemplate } from "../types/card-template.type";
import { Game } from "../types/game.type";
import { PrintTemplate } from "../types/print-template.type";


export class AppDB extends Dexie {
    private static readonly DB_NAME : string = 'cider-db';
    public static readonly GAMES_TABLE : string = 'games';
    public static readonly CARDS_TABLE : string = 'cards';
    public static readonly ASSETS_TABLE : string = 'assets';
    public static readonly CARD_TEMPLATES_TABLE : string = 'cardTemplates'
    public static readonly PRINT_TEMPLATES_TABLE : string = 'printTemplates';

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
            assets: '++id, filename',
            cardTemplates: '++id, gameId, name, description, html, css',
            printTemplates: '++id, gameId, name, description, html, css'
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
            css: 'div {\n\tpadding: 25px;\n}\nh2 {\n\tcolor: rgb(129, 156, 89);\n}',
            html: '<div>\n\t<h2>Poison Apple</h2>\n\t<p>Activate this card now.</p>\n</div>'
        });

        const backCardTemplateId : IndexableType = await db.table(AppDB.CARD_TEMPLATES_TABLE).add({
            name: 'Apple Back',
            gameId: gameId,
            description: '',
            css: '',
            html: ''
        });

        await db.table(AppDB.CARDS_TABLE).bulkAdd([
            {
                gameId: gameId,
                frontCardTemplateId: frontCardTemplateId,
                backCardTemplateId: backCardTemplateId,
                name: 'Poison Apple'
            }, {
                gameId: gameId,
                frontCardTemplateId: frontCardTemplateId,
                backCardTemplateId: backCardTemplateId,
                name: 'Healthy Apple'
            }
        ]);
    }
}

export const db = new AppDB();