/**
 * Theme Registry
 * 
 * Defines the interface for Cider themes and provides the built-in themes.
 * To add a new theme, simply add a new entry to the THEMES array below.
 */

export interface CiderThemeConfig {
    /** Unique identifier (e.g., 'cider-dark') */
    id: string;
    /** Display name (e.g., 'Cider Dark') */
    name: string;
    /** Base color scheme - used for Monaco editor and PrimeNG mode */
    colorScheme: 'light' | 'dark';
    /** CSS class applied to <html> element */
    cssClass: string;
    /** Theme color definitions */
    colors: CiderThemeColors;
}

export interface CiderThemeColors {
    /** Main app background - e.g., sidebar, menubar backgrounds (supports gradients) */
    appBackground: string;
    /** Content panel backgrounds - e.g., cards, tables */
    contentBackground: string;
    /** Form field/input backgrounds */
    inputBackground: string;
    /** Background for overlays like dialogs, popups, and menus (supports gradients) */
    overlayBackground: string;
    /** Border colors for panels and inputs */
    surfaceBorder: string;
    /** Primary text color */
    textColor: string;
    /** Muted/secondary text color */
    textMutedColor: string;
    /** Primary/accent color for buttons, highlights */
    primaryColor: string;
    /** Hover background for content areas */
    hoverBackground: string;
    /** Scrollbar thumb color */
    scrollbarThumbColor: string;
    /** Scrollbar thumb hover color */
    scrollbarThumbHoverColor: string;
}

/**
 * Built-in themes.
 * Add new themes here - they will automatically appear in the theme dropdown.
 */
export const THEMES: CiderThemeConfig[] = [
    {
        id: 'cider-light',
        name: 'Light Cider',
        colorScheme: 'light',
        cssClass: 'theme-cider-light',
        colors: {
            appBackground: '#d9dce2',
            contentBackground: '#f7f9fc',
            inputBackground: '#ffffff',
            overlayBackground: '#ffffff',
            surfaceBorder: '#b8c8e1',
            textColor: '#324666',
            textMutedColor: '#5b7fb9',
            primaryColor: '#4f6d8c',
            hoverBackground: '#d8e0ee',
            scrollbarThumbColor: 'rgba(0, 0, 0, 0.08)',
            scrollbarThumbHoverColor: 'rgba(0, 0, 0, 0.15)',
        }
    },
    {
        id: 'cider-dark',
        name: 'Dark Cider',
        colorScheme: 'dark',
        cssClass: 'theme-cider-dark',
        colors: {
            appBackground: '#181c21',
            contentBackground: '#262c35',
            inputBackground: '#353d49',
            overlayBackground: '#262c35',
            surfaceBorder: '#434d5d',
            textColor: '#bbc1cb',
            textMutedColor: '#7e8a9c',
            primaryColor: '#7089a2',
            hoverBackground: '#353d49',
            scrollbarThumbColor: 'rgba(255, 255, 255, 0.05)',
            scrollbarThumbHoverColor: 'rgba(255, 255, 255, 0.12)',
        }
    },
    {
        id: 'cosmic-dark',
        name: 'Cosmic Dark',
        colorScheme: 'dark',
        cssClass: 'theme-cosmic-dark',
        colors: {
            appBackground: 'radial-gradient(circle at 15% 25%, rgb(199 63 187 / 15%) 0%, rgba(34, 211, 238, 0) 25%), radial-gradient(circle at 85% 75%, rgba(167, 139, 250, 0.12) 0%, rgba(167, 139, 250, 0) 25%), linear-gradient(170deg, #201f28 0%, #282634 100%)',
            contentBackground: '#2c2a38',
            inputBackground: '#383645',
            overlayBackground: 'radial-gradient(circle at 15% 75%, rgb(199 63 187 / 15%) 0%, rgba(34, 211, 238, 0) 25%), radial-gradient(circle at 80% 20%, rgba(167, 139, 250, 0.1) 0%, rgba(167, 139, 250, 0) 20%), linear-gradient(160deg, #2a2836 0%, #2e2c3b 100%)',
            surfaceBorder: '#413e4f',
            textColor: '#c7c4d0',
            textMutedColor: '#7a768d',
            primaryColor: '#a78bfa',
            hoverBackground: '#383645',
            scrollbarThumbColor: 'rgba(167, 139, 250, 0.08)',
            scrollbarThumbHoverColor: 'rgba(167, 139, 250, 0.2)',
        }
    }
];

/**
 * Get a theme by ID, or return the default theme if not found.
 */
export function getThemeById(id: string): CiderThemeConfig {
    return THEMES.find(t => t.id === id) || THEMES[1]; // Default to cider-dark
}

/**
 * Get all available themes for the dropdown.
 */
export function getAllThemes(): CiderThemeConfig[] {
    return THEMES;
}
