import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CiderThemeConfig, getThemeById, getAllThemes, THEMES } from '../../shared/theme-registry';

const THEME_STORAGE_KEY = 'cider-theme';

/**
 * Theme Service
 * 
 * Manages theme state and provides methods for switching themes at runtime.
 * Themes are applied by:
 * 1. Setting CSS custom properties on the document root
 * 2. Toggling theme-specific CSS classes on <html>
 * 3. Emitting the current theme for subscribers (e.g., Monaco editor)
 */
@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    /** Observable for the current theme - subscribe to react to theme changes */
    public currentTheme$: BehaviorSubject<CiderThemeConfig>;

    constructor() {
        const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
        const initialTheme = savedThemeId ? getThemeById(savedThemeId) : THEMES[1]; // Default to cider-dark
        this.currentTheme$ = new BehaviorSubject<CiderThemeConfig>(initialTheme);

        // Apply the initial theme
        this.applyTheme(initialTheme.id);
    }

    /**
     * Get all available themes for the dropdown selector.
     */
    public getAvailableThemes(): CiderThemeConfig[] {
        return getAllThemes();
    }

    /**
     * Apply a theme by its ID.
     * This updates CSS variables, toggles CSS classes, and persists the selection.
     */
    public applyTheme(themeId: string): void {
        const theme = getThemeById(themeId);

        // Update the observable
        this.currentTheme$.next(theme);

        // Persist to local storage
        localStorage.setItem(THEME_STORAGE_KEY, theme.id);

        // Apply CSS custom properties
        this.applyCssVariables(theme);

        // Toggle CSS classes on <html>
        this.applyCssClasses(theme);
    }

    /**
     * Apply CSS custom properties to the document root.
     */
    private applyCssVariables(theme: CiderThemeConfig): void {
        const root = document.documentElement;

        root.style.setProperty('--cider-app-background', theme.colors.appBackground);
        root.style.setProperty('--cider-content-background', theme.colors.contentBackground);
        root.style.setProperty('--cider-input-background', theme.colors.inputBackground);
        root.style.setProperty('--cider-overlay-background', theme.colors.overlayBackground);
        root.style.setProperty('--cider-surface-border', theme.colors.surfaceBorder);
        root.style.setProperty('--cider-text-color', theme.colors.textColor);
        root.style.setProperty('--cider-text-muted-color', theme.colors.textMutedColor);
        root.style.setProperty('--cider-primary-color', theme.colors.primaryColor);
        root.style.setProperty('--cider-hover-background', theme.colors.hoverBackground);
        root.style.setProperty('--cider-scrollbar-thumb-color', theme.colors.scrollbarThumbColor);
        root.style.setProperty('--cider-scrollbar-thumb-hover-color', theme.colors.scrollbarThumbHoverColor);
    }

    /**
     * Apply/remove CSS classes on the <html> element.
     */
    private applyCssClasses(theme: CiderThemeConfig): void {
        const html = document.querySelector('html');
        if (!html) return;

        // Remove all theme classes
        THEMES.forEach(t => {
            html.classList.remove(t.cssClass);
        });

        // Remove legacy dark-mode class
        html.classList.remove('dark-mode');

        // Add the current theme class
        html.classList.add(theme.cssClass);

        // Add dark-mode class if this is a dark theme (for PrimeNG compatibility)
        if (theme.colorScheme === 'dark') {
            html.classList.add('dark-mode');
        }
    }

    /**
     * Get the current theme synchronously.
     */
    public getCurrentTheme(): CiderThemeConfig {
        return this.currentTheme$.getValue();
    }

    /**
     * Check if the current theme is dark.
     */
    public isDarkMode(): boolean {
        return this.currentTheme$.getValue().colorScheme === 'dark';
    }
}
