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
        'Poker (Landsccape)': { width: 1125, height: 825, padding: 45 },
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
            }`
        },
        'card-back': {
            html: '<div class="card"><div class="card-back"></div></div>',
            css: `.card {
                width: {{cardSize.width}}px;
                height: {{cardSize.height}}px;
                padding: {{cardSize.padding}}px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .card-back {
                width: 100%;
                height: 100%;
                background-color: #000;
            }`
        },
        'tcg': {
            html: `<div class="card"><div class="tcg-card">
                <div class="tcg-header">{{card.name}}</div>
                <div class="tcg-art"></div>
                <div class="tcg-text">Card description</div>
                <div class="tcg-footer">A{{#padZeros card.id 3}}{{/padZeros}}</div>
            </div></div>`,
            css: `.card {
                width: {{cardSize.width}}px;
                height: {{cardSize.height}}px;
                padding: {{cardSize.padding}}px;
            }
            .tcg-card {
                display: flex;
                flex-direction: column;
                height: 100%;
            
            }
            .tcg-header {
                font-size: 20px;
                padding: 5px;
                text-align: center;
            }
            .tcg-art {
                flex: 1;
                background-color: grey;
                margin: 5px;
            }
            .tcg-text {
                padding: 5px;
                font-size: 14px;
            }
            .tcg-footer {
                padding: 5px;
                text-align: right;
                font-size: 12px;
            }`
        },
        'trick-taking': {
            html: `<div class="card"><div class="trick-taking-card">
                <div class="trick-taking-header">{{card.name}}</div>
                <div class="trick-taking-suit">Suit</div>
                <div class="trick-taking-value">Value</div>
            </div></div>`,
            css: `.card {
                width: {{cardSize.width}}px;
                height: {{cardSize.height}}px;
                padding: {{cardSize.padding}}px;
            }
            .trick-taking-card {
                display: flex;
                flex-direction: column;
                height: 100%;
                justify-content: space-around;
                align-items: center;
            }
            .trick-taking-header {
                font-size: 24px;
            }
            .trick-taking-suit {
                font-size: 40px;
            }
            .trick-taking-value {
                font-size: 60px;
            }`
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

    public static getSizeCards(): Card[] {
        return Object.keys(TemplateDefaults.CARD_SIZES).map((key) => {
            const size = TemplateDefaults.CARD_SIZES[key];
            return {
            } as Card;
        });
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

    // public static createCard(cardSize: CardSize, layoutName: string): Card {
    //     const cardTemplate = TemplateDefaults.generateCardTemplate(cardSize, layoutName);
    //     return {
    //         id: 0,
    //         deckId: 0,
    //         name: layoutName,
    //         description: "Description of the card",
    //         frontCardTemplate: cardTemplate,
    //     } as Card;
    // }
}
