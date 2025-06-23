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
    public static readonly CARD_SIDES = {
        FRONT: 'front',
        BACK: 'back',
    } as const;

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


}