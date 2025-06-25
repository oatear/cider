import { CardTemplate } from "src/app/data-services/types/card-template.type";
import { Card } from "src/app/data-services/types/card.type";

const templateCssFront  = 
`.card {
    width: 825px;
    height: 1125px;
    border-radius: 25px;
    text-align: center;
    display: flex;
    flex-direction: column;
    background-color: hsl(0, 0%, 40%);
    border: 45px solid hsl(0, 0%, 10%);
    color: hsl(0, 0%, 90%);
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
    <div class="content">Card description</div>
    <div class="footer">A{{#padZeros card.id 3}}{{/padZeros}}</div>
</div>`;


interface CardSize {
    width: number;
    height: number;
    padding: number;
}

export default class TemplateDefaults {
    public static readonly DEFAULT_HTML: string = templateHtmlFront;
    public static readonly DEFAULT_CSS: string = templateCssFront;
    public static readonly DEFAULT_TEMPLATE: CardTemplate = {
        name: 'Default Template',
        description: 'Default card template.',
        html: TemplateDefaults.DEFAULT_HTML,
        css: TemplateDefaults.DEFAULT_CSS,
    } as CardTemplate;
    public static readonly CARD_SIZES: Record<string, CardSize> = {
        'Poker': { width: 825, height: 1125, padding: 45 },
        'Poker (Landscape)': { width: 1125, height: 825, padding: 45 },
        'Bridge': { width: 750, height: 1125, padding: 45 },
        'Bridge (Landscape)': { width: 1125, height: 750, padding: 45 },
        'Tarot': { width: 900, height: 1500, padding: 50 },
        'Tarot (Landscape)': { width: 1500, height: 900, padding: 50 },
        'Square': { width: 1125, height: 1125, padding: 50 },
    };

    public static readonly CARD_LAYOUTS: Record<string, { html: string, css: string }> = {
        'blank': {
            html: '<div class="card"></div>',
            css: `.card {
                width: {{cardSize.width}}px;
                height: {{cardSize.height}}px;
                padding: {{cardSize.padding}}px;
                background-color: hsl(0, 0%, 50%);
            }`
        },
        'card-back': {
            html: 
            `<div class="card">
                <div class="inner"></div>
            </div>`,
            css: 
            `.card {
                width: {{cardSize.width}}px;
                height: {{cardSize.height}}px;
                padding: {{cardSize.padding}}px;
                background-color: hsl(0, 0%, 70%);
            }
            .inner {
                width: 100%;
                height: 100%;
                background-color: hsl(0, 0%, 50%);
            }`
        },
        'size-card-layout': {
            html: 
            `<div class="card">
                <div class="inner"></div>
            </div>`,
            css: 
            `.card {
                width: {{cardSize.width}}px;
                height: {{cardSize.height}}px;
                padding: {{cardSize.padding}}px;
                border-radius: 45px;
                background-color: hsl(0, 0%, 70%);
            }
            .inner {
                width: 100%;
                height: 100%;
                border-radius: 25px;
                background-color: hsl(0, 0%, 50%);
            }`
        },
        'tcg': {
            html: 
            `<div class="card">
                <div class="inner">
                    <div class="tcg-header">{{card.name}}</div>
                    <div class="tcg-art"></div>
                    <div class="tcg-type">Ancient Brewer</div>
                    <div class="tcg-description">
                        The brewer is a very important card in the game. 
                        It allows you to brew potions and create powerful effects.
                    </div>
                    <div class="tcg-footer">
                        <span>Ciderians</span>
                        <span>{{#padZeros card.id 3}}{{/padZeros}}</span>
                    </div>
                </div>
            </div>`,
            css: 
            `.card {
                width: {{cardSize.width}}px;
                height: {{cardSize.height}}px;
                padding: {{cardSize.padding}}px;
                background-color: hsl(0, 0%, 10%);
                color: hsl(0, 0%, 10%);
                font-size: 40px;
            }
            .inner {
                width: 100%;
                height: 100%;
                background-color: hsl(0, 0%, 60%);
                display: flex;
                flex-direction: column;
            }
            .tcg-header {
                font-size: 55px;
                padding: 5px;
                text-align: center;
            }
            .tcg-art {
                background-color: hsl(0, 0%, 30%);
                flex-basis: 50%;
            }
            .tcg-type {
                background-color: hsl(0, 0%, 50%);
                text-align: center;
                padding: 10px;
            }
            .tcg-description {
                flex: 1;
                padding-left: 25px;
                padding-right: 25px;
                padding-bottom: 10px;
            }
            .tcg-footer {
                padding: 15px 25px;
                display: flex;
                justify-content: space-between;
                font-size: 35px;
            }`
        },
        'trick-taking': {
            html: 
            `<div class="card">
                <div class="inner">
                    <div class="trick-taking-header">
                        <span class="trick-taking-rank">3</span>
                        <span class="trick-taking-suit">♣</span>
                    </div>
                    <div class="trick-taking-name">{{card.name}}</div>
                    <div class="trick-taking-art">♣</div>
                    <div class="trick-taking-description">{{card.description}}</div>
                    <div class="trick-taking-footer">
                        <span class="trick-taking-rank">3</span>
                        <span class="trick-taking-suit">♣</span>
                    </div>
                </div>
            </div>`,
            css: 
            `.card {
                width: {{cardSize.width}}px;
                height: {{cardSize.height}}px;
                padding: {{cardSize.padding}}px;
                background-color: hsl(0, 0%, 80%);
                color: hsl(0, 0%, 10%);
                font-size: 40px;
            }
            .inner {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
            }
            .trick-taking-header {
                display: flex;
                flex-direction: column;
                padding: 35px;
                font-size: 80px;
            }
            .trick-taking-footer {
                display: flex;
                flex-direction: column;
                padding: 35px;
                font-size: 80px;
                transform: scale(-1);
            }
            .trick-taking-art {
                flex: 1;
                font-size: 200px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .trick-taking-name {
                font-size: 60px;
                padding: 5px;
                text-align: center;
            }
            .trick-taking-description {
                padding: 35px;
            }
            `
        },
        'resource': {
            html: `<div class="card"><div class="resource-card">
                <div class="resource-name">{{card.name}}</div>
                <div class="resource-amount">Amount</div>
            </div></div>`,
            css: `.card {
                width: {{cardSize.width}}px;
                height: {{cardSize.height}}px;
                padding: {{cardSize.padding}}px;
            }
            .resource-card {
                display: flex;
                flex-direction: column;
                height: 100%;
                justify-content: center;
                align-items: center;
            }
            .resource-name {
                font-size: 24px;
            }
            .resource-amount {
                font-size: 40px;
            }`
        },
    };
    // Define a set of layouts for the cards (ex. blank, card-back, tcg, 
    // trick-taking, resource, etc.)

    public static getCardTemplate(): CardTemplate {
        return {
            name: TemplateDefaults.DEFAULT_TEMPLATE.name,
            description: TemplateDefaults.DEFAULT_TEMPLATE.description,
            html: TemplateDefaults.DEFAULT_TEMPLATE.html,
            css: TemplateDefaults.DEFAULT_TEMPLATE.css,
        } as CardTemplate;
    }

    public static generateCardTemplate(cardSize: CardSize, layoutName: string): CardTemplate {
        const layout = TemplateDefaults.CARD_LAYOUTS[layoutName];
        const html = layout.html;
        const css = layout.css.replace(/\{\{cardSize\.width\}\}/g, cardSize.width.toString())
            .replace(/\{\{cardSize\.height\}\}/g, cardSize.height.toString())
            .replace(/\{\{cardSize\.padding\}\}/g, cardSize.padding.toString());

        return {
            name: `${layoutName} Template`,
            description: `Card template using ${layoutName} layout.`,
            html: html,
            css: css,
        } as CardTemplate;
    }

    public static createCard(cardSize: CardSize, layoutName: string, key: string): Card {
        const cardTemplate = TemplateDefaults.generateCardTemplate(cardSize, layoutName);
        return {
            id: 34,
            deckId: 0,
            key: key,
            name: 'Keeper of the Core',
            description: `The brewer is a very important card in the game. 
            It allows you to brew potions and create powerful effects.`,
            frontCardTemplate: cardTemplate,
        } as any as Card;
    }

    public static getSizeCards(): Card[] {
        return Object.keys(TemplateDefaults.CARD_SIZES).map((key) => {
            const size = TemplateDefaults.CARD_SIZES[key];
            return this.createCard(size, 'size-card-layout', key);
        });
    }

    public static getLayoutCards(size: string): Card[] {
        const cardSize = TemplateDefaults.CARD_SIZES[size];
        return Object.keys(TemplateDefaults.CARD_LAYOUTS).map((key) => {
            return this.createCard(cardSize, key, key);
        });
    }
}
