import { Injectable } from '@angular/core';
import * as htmlToImage from 'html-to-image';
// @ts-ignore
// @ts-ignore
import domToImageMore from 'dom-to-image-more';
import { LocalStorageService } from '../local-storage/local-storage.service';

export interface ImageRendererOptions {
    pixelRatio?: number;
    filter?: (node: HTMLElement) => boolean;
    onImageErrorHandler?: (error: any) => void;
}

@Injectable({
    providedIn: 'root'
})
export class ImageRendererService {

    constructor(private localStorageService: LocalStorageService) { }

    public toPng(node: HTMLElement, options?: ImageRendererOptions): Promise<string> {
        const renderer = this.localStorageService.getRenderer();
        console.log('Rendering with:', renderer);

        if (renderer === 'dom-to-image-more') {
            // dom-to-image-more doesn't support pixelRatio as a direct option in the same way,
            // but it handles scaling differently.
            // Often strict pixelRatio support is limited or requires scaling the node manually.
            // Passing options through for now, might need adaptation.
            return domToImageMore.toPng(node, {
                filter: options?.filter,
                scale: options?.pixelRatio || 1
            });
        } else {
            // Default to html-to-image
            return htmlToImage.toPng(node, options);
        }
    }
}
