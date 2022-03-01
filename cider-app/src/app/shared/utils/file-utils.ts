import * as FileSaver from "file-saver";

export default class FileUtils {

    static saveAs(data: Blob, name: string): void {
        if (navigator.userAgent.match(/CriOS/i)) {
            // Chrome iOS download procedure
            const blob = new Blob([data], {type: 'octet/stream'});
            const reader = new FileReader();
            reader.onload = function() {
                window.location.href = <string>reader.result;
            }
            reader.readAsDataURL(blob);
        } else {
            FileSaver.saveAs(data, name);
        }
    }
}