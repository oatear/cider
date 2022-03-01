import * as FileSaver from "file-saver";

export default class FileUtils {

    static saveAs(data: Blob, name: string): void {
        if (navigator.userAgent.match(/CriOS/i)) {
            // Chrome iOS download procedure
            const reader = new FileReader();
            reader.onload = function() {
                window.location.href = <string>reader.result;
            }
            reader.readAsDataURL(data);
        } else {
            FileSaver.saveAs(data, name);
        }
    }
}