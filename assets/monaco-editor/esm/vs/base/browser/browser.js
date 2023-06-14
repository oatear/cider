/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from '../common/event.js';
import { Disposable } from '../common/lifecycle.js';
class WindowManager {
    constructor() {
        // --- Zoom Factor
        this._zoomFactor = 1;
    }
    getZoomFactor() {
        return this._zoomFactor;
    }
}
WindowManager.INSTANCE = new WindowManager();
class PixelRatioImpl extends Disposable {
    constructor() {
        super();
        this._onDidChange = this._register(new Emitter());
        this.onDidChange = this._onDidChange.event;
        this._value = this._getPixelRatio();
        this._removeListener = this._installResolutionListener();
    }
    get value() {
        return this._value;
    }
    dispose() {
        this._removeListener();
        super.dispose();
    }
    _installResolutionListener() {
        // See https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio#monitoring_screen_resolution_or_zoom_level_changes
        const mediaQueryList = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
        const listener = () => this._updateValue();
        mediaQueryList.addEventListener('change', listener);
        return () => {
            mediaQueryList.removeEventListener('change', listener);
        };
    }
    _updateValue() {
        this._value = this._getPixelRatio();
        this._onDidChange.fire(this._value);
        this._removeListener = this._installResolutionListener();
    }
    _getPixelRatio() {
        const ctx = document.createElement('canvas').getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const bsr = ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio ||
            ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio || 1;
        return dpr / bsr;
    }
}
class PixelRatioFacade {
    constructor() {
        this._pixelRatioMonitor = null;
    }
    _getOrCreatePixelRatioMonitor() {
        if (!this._pixelRatioMonitor) {
            this._pixelRatioMonitor = new PixelRatioImpl();
        }
        return this._pixelRatioMonitor;
    }
    /**
     * Get the current value.
     */
    get value() {
        return this._getOrCreatePixelRatioMonitor().value;
    }
    /**
     * Listen for changes.
     */
    get onDidChange() {
        return this._getOrCreatePixelRatioMonitor().onDidChange;
    }
}
/**
 * Returns the pixel ratio.
 *
 * This is useful for rendering <canvas> elements at native screen resolution or for being used as
 * a cache key when storing font measurements. Fonts might render differently depending on resolution
 * and any measurements need to be discarded for example when a window is moved from a monitor to another.
 */
export const PixelRatio = new PixelRatioFacade();
/** The zoom scale for an index, e.g. 1, 1.2, 1.4 */
export function getZoomFactor() {
    return WindowManager.INSTANCE.getZoomFactor();
}
const userAgent = navigator.userAgent;
export const isFirefox = (userAgent.indexOf('Firefox') >= 0);
export const isWebKit = (userAgent.indexOf('AppleWebKit') >= 0);
export const isChrome = (userAgent.indexOf('Chrome') >= 0);
export const isSafari = (!isChrome && (userAgent.indexOf('Safari') >= 0));
export const isWebkitWebView = (!isChrome && !isSafari && isWebKit);
export const isEdgeLegacyWebView = (userAgent.indexOf('Edge/') >= 0) && (userAgent.indexOf('WebView/') >= 0);
export const isElectron = (userAgent.indexOf('Electron/') >= 0);
export const isAndroid = (userAgent.indexOf('Android') >= 0);
export const isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
