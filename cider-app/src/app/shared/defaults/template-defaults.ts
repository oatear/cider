import { CardTemplate } from "src/app/data-services/types/card-template.type";
import { Card } from "src/app/data-services/types/card.type";
import { CORE_TEMPLATE } from "./templates/core-template";
import { TRICK_TEMPLATE } from "./templates/trick-template";
import { CARD_BACK_TEMPLATE } from "./templates/card-back-template";
import { Asset } from "src/app/data-services/types/asset.type";
import { ColorGenerator, ColorPalette } from "../generators/color-generator";
import { generateRandomArt, generateRandomBadge, generateRandomCardSymbol, generateRandomSymbol } from "../generators/card-symbol-generator";
import { generateRandomBanner, generateRandomTextbox } from "../generators/card-textbox-generator";
import MathUtils from "../utils/math-utils";
import FileUtils from "../utils/file-utils";
import { MIRE_TEMPLATE } from "./templates/mire-template";
import { ARCANE_TEMPLATE } from "./templates/arcane-template";
import { MYSTIC_TEMPLATE } from "./templates/mystic-template";
import { KEEP_TEMPLATE } from "./templates/keep-template";
interface CardSize {
    width: number;
    height: number;
    padding: number;
}

interface CardLayout {
    html: string;
    css: string;
}

export interface CardTheme {
    background: string;
    outline: string;
    front: string;
    back: string;
    color: string;
    art: string;
    banner: string;
    smallBanner: string;
    badge: string;
    textbox: string;
    symbol: string;
    palette: ColorPalette;
    secondaryPalette: ColorPalette;
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
            background: {{theme.front}};
        }
        .inner {
            width: 100%;
            height: 100%;
            background: {{theme.background}};
            // border: 4px solid {{theme.outline}};
            border-radius: 30px;
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
        'back': CARD_BACK_TEMPLATE,
        // 'size-card-layout': this.SIZE_CARD_TEMPLATE,
        'core': CORE_TEMPLATE,
        'mire': MIRE_TEMPLATE,
        'mystic': MYSTIC_TEMPLATE,
        'arcane': ARCANE_TEMPLATE,
        'keep': KEEP_TEMPLATE,
        'trick': TRICK_TEMPLATE,
    };

    public static readonly DEFAULT_THEME: CardTheme = this.generatePlainTheme();

    public static generateCardTemplate(design: TemplateDesign): CardTemplate {
        const html = design.layout.html;
        const attributeMap = new Map<string, string>([
            ['size.width', design.size.width.toString()],
            ['size.height', design.size.height.toString()],
            ['size.padding', design.size.padding.toString()],
            ['theme.background', design.theme.background],
            ['theme.outline', design.theme.outline],
            ['theme.color', design.theme.color],
            ['theme.front', design.theme.front],
            ['theme.back', design.theme.back],
            ['theme.art', design.theme.art],
            ['theme.banner', design.theme.banner],
            ['theme.smallBanner', design.theme.smallBanner],
            ['theme.badge', design.theme.badge],
            ['theme.textbox', design.theme.textbox],
            ['theme.symbol', design.theme.symbol],
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

    public static getSizeCards(theme?: CardTheme): Card[] {
        return Object.keys(TemplateDefaults.CARD_SIZES).map((key) => {
            const design: TemplateDesign = {
                size: TemplateDefaults.CARD_SIZES[key],
                layout: this.SIZE_CARD_TEMPLATE,
                theme: theme ?? this.DEFAULT_THEME
            };
            return this.createCard(design, key);
        });
    }

    public static getLayoutCards(size: string, theme?: CardTheme): Card[] {
        const cardSize = TemplateDefaults.CARD_SIZES[size];
        return Object.keys(TemplateDefaults.CARD_LAYOUTS).map((key) => {
            const design: TemplateDesign = {
                size: TemplateDefaults.CARD_SIZES[size],
                layout: TemplateDefaults.CARD_LAYOUTS[key],
                theme: theme ?? this.DEFAULT_THEME
            };
            return this.createCard(design, key);
        });
    }

    public static getThemeCards(size: string, layout: string, theme?: CardTheme): Card[] {
        return MathUtils.range(0, 5).map((index) => {
            const design: TemplateDesign = {
                size: TemplateDefaults.CARD_SIZES[size],
                layout: TemplateDefaults.CARD_LAYOUTS[layout],
                theme: index == 0 ? (theme ?? this.DEFAULT_THEME) : this.generateCardTheme(),
            };
            return this.createCard(design, '' + index);
        });
    }

    public static generatePlainTheme(): CardTheme {
        const palette: ColorPalette = {
            hue: 33,
            saturation: 23,
            isLightOnDark: false,
            front: '#ccbdab',
            back: '#a69179',
            outline: '#000000',
            background: '#ae997e',
            color: '#000000',
        };
        const secondaryPalette: ColorPalette = {
            hue: 33,
            saturation: 23,
            isLightOnDark: false,
            front: '#ccbdab',
            back: '#baa791',
            outline: '#000000',
            background: '#ae997e',
            color: '#000000',
        };
        return this.generateCardTheme(palette, secondaryPalette);
    }

    public static generateCardTheme(paletteIn?: ColorPalette, 
            secondaryPaletteIn?: ColorPalette): CardTheme {
        const palette = paletteIn ?? ColorGenerator.generateHarmoniousPalette();
        const hueB = (360 + palette.hue + Math.random() * 20)  % 360;
        const secondaryPalette = secondaryPaletteIn ?? ColorGenerator.generateHarmoniousPalette({ hue: hueB });
        const art = generateRandomArt(palette);
        // const banner = generateRandomBanner(paletteB);
        const banner = generateRandomBanner({ palette: secondaryPalette });
        const smallBanner = generateRandomBanner({ palette: secondaryPalette, width: 100, height: 100 });
        const badge = generateRandomBadge(palette);
        const textbox = generateRandomTextbox({ palette: palette });
        const symbol = generateRandomSymbol(palette);
        const artUri = URL.createObjectURL(FileUtils.svgStringToBlob(art));
        const bannerUri = URL.createObjectURL(FileUtils.svgStringToBlob(banner));
        const smallBannerUri = URL.createObjectURL(FileUtils.svgStringToBlob(smallBanner));
        const badgeUri = URL.createObjectURL(FileUtils.svgStringToBlob(badge));
        const textboxUri = URL.createObjectURL(FileUtils.svgStringToBlob(textbox));
        const symbolUri = URL.createObjectURL(FileUtils.svgStringToBlob(symbol));

        return {
            background: palette.background,
            outline: palette.outline,
            color: palette.color,
            front: palette.front,
            back: palette.back,
            art: `url(${artUri})`,
            banner: `url(${bannerUri})`,
            smallBanner: `url(${smallBannerUri})`,
            badge: `url(${badgeUri})`,
            textbox: `url(${textboxUri})`,
            symbol: `url(${symbolUri})`,
            palette: palette,
            secondaryPalette: secondaryPalette,
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
