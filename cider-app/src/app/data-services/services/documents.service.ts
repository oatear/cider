import { Injectable } from '@angular/core';
import { IndexedDbService } from '../indexed-db/indexed-db.service';
import { AppDB } from '../indexed-db/db';
import { Document } from '../types/document.type';
import { FieldType } from '../types/field-type.type';
import { ElectronService } from '../electron/electron.service';
import { PersistentPath } from '../types/persistent-path.type';
import StringUtils from 'src/app/shared/utils/string-utils';

@Injectable({
  providedIn: 'root'
})
export class DocumentsService extends IndexedDbService<Document, number> {

  private currentHomeUrl: PersistentPath | undefined;

  constructor(db: AppDB, private electronService: ElectronService) {
    super(db, AppDB.DOCUMENTS_TABLE, [
      { field: 'id', header: 'ID', type: FieldType.numeric, hidden: true },
      { field: 'name', header: 'Name', type: FieldType.text },
      { field: 'mime', header: 'Mime', type: FieldType.text, hidden: true },
      { field: 'content', header: 'Content', type: FieldType.text, hidden: true }
    ]);

    this.electronService.getProjectHomeUrl().subscribe(url => this.currentHomeUrl = url);

    // Handle File Watcher Events
    this.electronService.getFileAdded().subscribe(path => this.handleFileAdded(path));
    this.electronService.getFileRemoved().subscribe(path => this.handleFileRemoved(path));
  }

  private async handleFileAdded(absPath: string) {
    if (!this.currentHomeUrl) return;
    const homeUrl = this.currentHomeUrl;
    const parentDir = StringUtils.getDirectoryFromUrl(absPath);

    // Ensure it is in the root directory (approximate check)
    // We assume homeUrl.path is normalized without trailing slash usually
    // absPath usually has separator
    // StringUtils.getDirectoryFromUrl might keep trailing slash or not. 
    // Safer to check if absPath starts with homeUrl and has no other separators after homeUrl length + 1
    if (parentDir !== homeUrl.path) {
      // It might be in a subdir, which we ignore for documents (documents are root only currently?)
      // The current openProject logic lists root directory for .md/.css
      return;
    }

    const fileName = StringUtils.lastDirectoryFromUrl(absPath);
    const nameSplit = StringUtils.splitNameAndExtension(fileName);

    const supportedExtensions = ['md', 'markdown', 'css'];
    if (!supportedExtensions.includes(nameSplit.extension.toLowerCase())) {
      return;
    }

    const documentName = nameSplit.name;

    // Check if exists
    const existing = await this.getAll({ name: documentName }); // DocumentsService helper might need refinement or use db directly
    // getAll accepts equalityCriterias? 
    // IndexedDbService.getAll signature: getAll(equalityCriterias?: {[key: string]: any;}): Promise<Entity[]>
    // yes.
    if (existing && existing.length > 0) {
      return;
    }

    // Read and Import
    const persistentPath: any = { path: absPath, bookmark: homeUrl.bookmark };
    const content = await this.electronService.readTextFile(persistentPath);
    if (content !== null) {
      const mime = StringUtils.extensionToMime(nameSplit.extension);
      await this.create({
        name: documentName,
        mime: mime,
        content: content
      } as any, true);
    }
  }

  private async handleFileRemoved(absPath: string) {
    if (!this.currentHomeUrl) return;
    // Similar checks
    const homeUrl = this.currentHomeUrl;
    const parentDir = StringUtils.getDirectoryFromUrl(absPath);
    if (parentDir !== homeUrl.path) return;

    const fileName = StringUtils.lastDirectoryFromUrl(absPath);
    const nameSplit = StringUtils.splitNameAndExtension(fileName);
    const supportedExtensions = ['md', 'markdown', 'css'];
    if (!supportedExtensions.includes(nameSplit.extension.toLowerCase())) return;

    const items = await this.getAll({ name: nameSplit.name });
    if (items.length > 0) {
      await this.delete(items[0].id);
    }
  }
}
