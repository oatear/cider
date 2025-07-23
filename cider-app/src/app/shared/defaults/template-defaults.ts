import { CardTemplate } from "src/app/data-services/types/card-template.type";
import { Card } from "src/app/data-services/types/card.type";
import { TCG_TEMPLATE } from "./templates/tcg-template";
import { TRICK_TAKING_TEMPLATE } from "./templates/trick-taking-template";
import { CARD_BACK_TEMPLATE } from "./templates/card-back-template";
import { RESOURCE_TEMPLATE } from "./templates/resource-template";
import { Asset } from "src/app/data-services/types/asset.type";
import { ColorGenerator, ColorPalette } from "../generators/color-generator";
import { generateRandomArt, generateRandomBadge } from "../generators/card-symbol-generator";
import { generateRandomBanner, generateRandomTextbox } from "../generators/card-textbox-generator";
import MathUtils from "../utils/math-utils";
import FileUtils from "../utils/file-utils";
interface CardSize {
    width: number;
    height: number;
    padding: number;
}

interface CardLayout {
    html: string;
    css: string;
}

interface CardTheme {
    background: string;
    border: string;
    color: string;
    art: string;
    banner: string;
    bannerB: string;
    badge: string;
    textbox: string;
    palette: ColorPalette;
    paletteB: ColorPalette;
    assets: GeneratedSvg[];
}

interface GeneratedSvg {
//   safeHtml: SafeHtml;
  type: 'symbol' | 'badge' | 'art' | 'background' | 'banner' | 'textbox';
  svg: string;
  uri: string;
}

export interface TemplateDesign {
    size: CardSize;
    layout: CardLayout;
    theme: CardTheme;
    // preview: CardTemplate;
}

interface TemplateExport {
    template: CardTemplate;
    assets: Asset[];
}

export default class TemplateDefaults {
    private static readonly BLANK_TEMPLATE: CardTemplate = {
        html: '<div class="card"></div>',
        css: `.card {
            width: {{size.width}}px;
            height: {{size.height}}px;
            padding: {{size.padding}}px;
            background: {{theme.art}};
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
        }`
    } as CardTemplate;

    private static readonly SIZE_CARD_TEMPLATE: CardTemplate = {
        html: 
        `<div class="card">
            <div class="inner"></div>
        </div>`,
        css: 
        `.card {
            width: {{size.width}}px;
            height: {{size.height}}px;
            padding: {{size.padding}}px;
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

    public static readonly CARD_LAYOUTS: Record<string, CardLayout> = {
        'blank': this.BLANK_TEMPLATE,
        'card-back': CARD_BACK_TEMPLATE,
        // 'size-card-layout': this.SIZE_CARD_TEMPLATE,
        'tcg': TCG_TEMPLATE,
        'trick-taking': TRICK_TAKING_TEMPLATE,
        'resource': RESOURCE_TEMPLATE,
    };

    public static readonly DEFAULT_THEME: CardTheme = {
        background: 'hsl(0, 0%, 60%)',
        border: 'hsl(0, 0%, 10%)',
        color: 'hsl(0, 0%, 10%)',
        art: 'hsl(0, 0%, 30%)',
        banner: 'hsl(0, 0%, 50%)',
        bannerB: 'hsl(0, 0%, 50%)',
        badge: 'hsl(0, 0%, 50%)',
        textbox: 'hsl(0, 0%, 50%)',
        palette: {
            hue: 0,
            dark: 'hsl(0, 0%, 10%)',
            medium: 'hsl(0, 0%, 30%)',
            light: 'hsl(0, 0%, 60%)'
        },
        paletteB: {
            hue: 0,
            dark: 'hsl(0, 0%, 20%)',
            medium: 'hsl(0, 0%, 40%)',
            light: 'hsl(0, 0%, 70%)'
        },
        assets: []
    }

    public static generateCardTemplate(design: TemplateDesign): CardTemplate {
        const html = design.layout.html;
        const attributeMap = new Map<string, string>([
            ['size.width', design.size.width.toString()],
            ['size.height', design.size.height.toString()],
            ['size.padding', design.size.padding.toString()],
            ['theme.background', design.theme.background],
            ['theme.border', design.theme.border],
            ['theme.color', design.theme.color],
            ['theme.art', design.theme.art],
            ['theme.banner', design.theme.banner],
            ['theme.bannerB', design.theme.bannerB],
            ['theme.badge', design.theme.badge],
            ['theme.textbox', design.theme.textbox],
        ]);
        const css = Array.from(attributeMap.entries())
        .reduce((currentCss, [key, value]) => {
            return currentCss.replaceAll('{{' + key + '}}', value);
        }, design.layout.css);

        return {
            name: `Template Name`,
            description: `Description.`,
            html: html,
            css: css,
        } as CardTemplate;
    }

    public static createCard(design: TemplateDesign, key: string): Card {
        const cardTemplate = TemplateDefaults.generateCardTemplate(design);
        return {
            id: 34,
            deckId: 0,
            key: key, // injected
            design: design, // injected
            name: 'Keeper of the Core',
            description: `The brewer is a very important card in the game. 
            It allows you to brew potions and create powerful effects.`,
            frontCardTemplate: cardTemplate,
        } as any as Card;
    }

    public static getSizeCards(): Card[] {
        return Object.keys(TemplateDefaults.CARD_SIZES).map((key) => {
            const design: TemplateDesign = {
                size: TemplateDefaults.CARD_SIZES[key],
                layout: this.SIZE_CARD_TEMPLATE,
                theme: this.DEFAULT_THEME
            };
            return this.createCard(design, key);
        });
    }

    public static getLayoutCards(size: string): Card[] {
        const cardSize = TemplateDefaults.CARD_SIZES[size];
        return Object.keys(TemplateDefaults.CARD_LAYOUTS).map((key) => {
            const design: TemplateDesign = {
                size: TemplateDefaults.CARD_SIZES[size],
                layout: TemplateDefaults.CARD_LAYOUTS[key],
                theme: this.DEFAULT_THEME
            };
            return this.createCard(design, key);
        });
    }

    public static getThemeCards(size: string, layout: string): Card[] {
        return MathUtils.range(0, 5).map((index) => {
            const design: TemplateDesign = {
                size: TemplateDefaults.CARD_SIZES[size],
                layout: TemplateDefaults.CARD_LAYOUTS[layout],
                theme: index == 0 ? this.DEFAULT_THEME : this.generateCardTheme(),
            };
            return this.createCard(design, '' + index);
        });
    }

    public static generateCardTheme(): CardTheme {
        const palette = ColorGenerator.generateHarmoniousPalette();
        const hueB = (360 + palette.hue + Math.random() * 30)  % 360;
        const paletteB = ColorGenerator.generateHarmoniousPalette(hueB);
        const art = generateRandomArt(palette);
        const banner = generateRandomBanner(paletteB);
        const bannerB = generateRandomBanner(paletteB);
        const badge = generateRandomBadge(palette);
        const textbox = generateRandomTextbox(palette);
        const artUri = URL.createObjectURL(FileUtils.svgStringToBlob(art));
        const bannerUri = URL.createObjectURL(FileUtils.svgStringToBlob(banner));
        const bannerBUri = URL.createObjectURL(FileUtils.svgStringToBlob(bannerB));
        const badgeUri = URL.createObjectURL(FileUtils.svgStringToBlob(badge));
        const textboxUri = URL.createObjectURL(FileUtils.svgStringToBlob(textbox));

        return {
            background: palette.medium,
            border: palette.dark,
            color: '#000000',
            art: `url(${artUri})`,
            banner: `url(${bannerUri})`,
            bannerB: `url(${bannerBUri})`,
            badge: `url(${badgeUri})`,
            textbox: `url(${textboxUri})`,
            palette: palette,
            paletteB: paletteB,
            assets: [
                { type: 'art', svg: art, uri: artUri },
                { type: 'banner', svg: banner, uri: bannerUri },
                { type: 'badge', svg: badge, uri: badgeUri },
                { type: 'textbox', svg: textbox, uri: textboxUri },
            ],
        };
    }

    public static cleanUp(theme: CardTheme) {
        theme.assets.forEach(asset => URL.revokeObjectURL(asset.uri))
    }
}
