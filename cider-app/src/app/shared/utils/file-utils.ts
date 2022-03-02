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
}