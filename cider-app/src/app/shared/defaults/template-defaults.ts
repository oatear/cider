import { CardTemplate } from "src/app/data-services/types/card-template.type";
import { Card } from "src/app/data-services/types/card.type";
import { TCG_TEMPLATE } from "./templates/tcg-template";
import { TRICK_TAKING_TEMPLATE } from "./templates/trick-taking-template";
import { CARD_BACK_TEMPLATE } from "./templates/card-back-template";
import { RESOURCE_TEMPLATE } from "./templates/resource-template";
interface CardSize {
    width: number;
    height: number;
    padding: number;
}

export default class TemplateDefaults {
    private static readonly BLANK_TEMPLATE: CardTemplate = {
        html: '<div class="card"></div>',
        css: `.card {
            width: {{cardSize.width}}px;
            height: {{cardSize.height}}px;
            padding: {{cardSize.padding}}px;
            background-color: hsl(0, 0%, 50%);
        }`
    } as CardTemplate;

    private static readonly SIZE_CARD_TEMPLATE: CardTemplate = {
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
        'blank': this.BLANK_TEMPLATE,
        'card-back': CARD_BACK_TEMPLATE,
        // 'size-card-layout': this.SIZE_CARD_TEMPLATE,
        'tcg': TCG_TEMPLATE,
        'trick-taking': TRICK_TAKING_TEMPLATE,
        'resource': RESOURCE_TEMPLATE,
    };

    public static generateCardTemplate(cardSize: CardSize, layout: { html: string, css: string }): CardTemplate {
        const html = layout.html;
        const css = layout.css.replace(/\{\{cardSize\.width\}\}/g, cardSize.width.toString())
            .replace(/\{\{cardSize\.height\}\}/g, cardSize.height.toString())
            .replace(/\{\{cardSize\.padding\}\}/g, cardSize.padding.toString());

        return {
            name: `Template Name`,
            description: `Description.`,
            html: html,
            css: css,
        } as CardTemplate;
    }

    public static createCard(cardSize: CardSize, layout: { html: string, css: string }, key: string): Card {
        const cardTemplate = TemplateDefaults.generateCardTemplate(cardSize, layout);
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
            return this.createCard(size, this.SIZE_CARD_TEMPLATE, key);
        });
    }

    public static getLayoutCards(size: string): Card[] {
        const cardSize = TemplateDefaults.CARD_SIZES[size];
        return Object.keys(TemplateDefaults.CARD_LAYOUTS).map((key) => {
            const layout = TemplateDefaults.CARD_LAYOUTS[key];
            return this.createCard(cardSize, layout, key);
        });
    }
}
