import * as FileSaver from "file-saver";

export default class FileUtils {

    static saveAs(data: Blob, name: string): void {
        if (navigator.userAgent.match(/iPad|iPhone/i)) {
            // iOS download procedure
            const url: string = URL.createObjectURL(data);
            // window.location.href = url;
            const a: any = document.createElement('a');
            document.body.appendChild(a);
            a.setAttribute('style', 'display: none;');
            a.href = url;
            a.download = name;
            a.click();
            URL.revokeObjectURL(url);
            a.remove();
        } else {
            FileSaver.saveAs(data, name);
        }
    }
}