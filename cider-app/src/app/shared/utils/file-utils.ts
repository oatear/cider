import * as FileSaver from "file-saver";

export default class FileUtils {

    /**
     * Save file with the given name
     * 
     * @param data 
     * @param name 
     */
    static saveAs(data: Blob, name: string): void {
        if (navigator.userAgent.match(/CriOS/i)) {
            // Chrome iOS download procedure
            const reader = new FileReader();
            reader.onload = function() {
                //window.location.href = <string>reader.result;
                FileUtils.anchorUrlDownload(<string>reader.result);
            }
            reader.readAsDataURL(data);
        } else {
            FileSaver.saveAs(data, name);
        }
    }

    /**
     * Download file using a temporary anchor tag
     * placed onto the dom
     * 
     * @param url 
     */
    private static anchorUrlDownload(url: string) {
        const a = document.createElement("a");
      document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = url;
      a.download = "download";
      a.click();
      //window.URL.revokeObjectURL(url);
      a.remove();
    }

    /**
     * Converts a raw SVG string into a Blob object.
     *
     * @param svgString The raw SVG content (e.g., '<svg>...</svg>').
     * @returns A Blob object with the MIME type 'image/svg+xml'.
     */
    public static svgStringToBlob(svgString: string): Blob {
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        return blob;
    }

    /**
     * Get image dimensions from the given file URL
     * 
     * @param fileUrl 
     * @returns 
     */
    public static getImageDimensions(fileUrl: string): Promise<{ width: number, height: number }> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve({ width: img.width, height: img.height });
            };
            img.onerror = (err) => {
                reject(err);
            };
            img.src = fileUrl;
        });
    }
    
    /**
     * Format file size in bytes into human readable string
     * 
     * @param bytes 
     * @returns 
     */
    public static formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}