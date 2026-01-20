import { Injectable } from '@angular/core';
import { Asset } from '../types/asset.type';
import { AppDB } from '../indexed-db/db';
import { FieldType } from '../types/field-type.type';
import { AsyncSubject, BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SearchParameters } from '../types/search-parameters.type';
import { IndexedDbService } from '../indexed-db/indexed-db.service';
import StringUtils from 'src/app/shared/utils/string-utils';
import { ElectronService } from '../electron/electron.service';
import { PersistentPath } from '../types/persistent-path.type';

@Injectable({
  providedIn: 'root'
})
export class AssetsService extends IndexedDbService<Asset, number> {
  assetUrls: BehaviorSubject<any>;
  private isLoadingSubject: BehaviorSubject<boolean>;

  private currentHomeUrl: PersistentPath | undefined;

  constructor(db: AppDB, private electronService: ElectronService) {
    super(db, AppDB.ASSETS_TABLE, [
      { field: 'id', header: 'ID', type: FieldType.numeric, hidden: true },
      { field: 'name', header: 'Name', type: FieldType.text },
      { field: 'path', header: 'Path', type: FieldType.text },
      { field: 'file', header: 'File', type: FieldType.file }
    ]);
    this.assetUrls = new BehaviorSubject<any>({});
    this.isLoadingSubject = new BehaviorSubject<boolean>(true);
    this.updateAssetUrls();

    // update asset URLs whenever the database reloads
    db.onLoad().subscribe(() => {
      this.updateAssetUrls();
    });

    this.electronService.getProjectHomeUrl().subscribe(url => this.currentHomeUrl = url);

    // Handle File Watcher Events
    this.electronService.getFileAdded().subscribe(path => this.handleFileAdded(path));
    this.electronService.getFileRemoved().subscribe(path => this.handleFileRemoved(path));
  }

  private async handleFileAdded(absPath: string) {
    if (!this.currentHomeUrl) return;
    const homeUrl = this.currentHomeUrl;

    const assetsPath = homeUrl.path + '/assets';
    if (absPath.startsWith(assetsPath)) {
      console.log('New asset detected:', absPath);
      const relativePathWithFile = absPath.substring(assetsPath.length + 1); // e.g. "icons/fire.png" or "fire.png"
      const pathParts = relativePathWithFile.split((/\/|\\/)); // split by / or \

      const fileName = pathParts.pop() || '';
      const relativePath = pathParts.join('/'); // e.g. "icons" or ""

      const nameSplit = StringUtils.splitNameAndExtension(fileName);
      const assetName = nameSplit.name;

      if (!assetName) return;

      // Check if exists
      const existing = await this.getByPath(assetName, relativePath);
      if (existing && existing.id) {
        console.log('Asset already exists in DB');
        return;
      }

      // Import
      const persistentPath: any = { path: absPath, bookmark: homeUrl.bookmark };
      const buffer = await this.electronService.readFile(persistentPath);
      if (buffer) {
        const fileType = StringUtils.extensionToMime(nameSplit.extension);
        const blob = new Blob([new Uint8Array(buffer)], { type: fileType });
        const file = new File([blob], fileName, { type: fileType });
        await this.create({
          file: file,
          name: assetName,
          path: relativePath
        } as any, true);
        this.updateAssetUrls();
      }
    }
  }

  private async handleFileRemoved(absPath: string) {
    if (!this.currentHomeUrl) return;
    const homeUrl = this.currentHomeUrl;
    const assetsPath = homeUrl.path + '/assets';

    if (absPath.startsWith(assetsPath)) {
      const relativePathWithFile = absPath.substring(assetsPath.length + 1);
      const pathParts = relativePathWithFile.split((/\/|\\/));
      const fileName = pathParts.pop() || '';
      const relativePath = pathParts.join('/');

      const nameSplit = StringUtils.splitNameAndExtension(fileName);
      const assetName = nameSplit.name;

      const existing = await this.getByPath(assetName, relativePath);
      if (existing && existing.id) {
        await this.delete(existing.id);
        this.updateAssetUrls();
      }
    }
  }

  public updateAssetUrls() {
    console.log('update asset urls');
    this.isLoadingSubject.next(false);
    this.getAll().then(assets => {
      // release the old URLs - simple cleanup might be insufficient if we have nested structure, 
      // but revokeObjectURL works on the string url, so we just need to collect all strings.
      // For now, let's just revoke everything we tracked.
      const revokeRecursive = (obj: any) => {
        if (!obj) return;
        Object.keys(obj).forEach(key => {
          if (typeof obj[key] === 'string') {
            URL.revokeObjectURL(obj[key]);
          } else if (typeof obj[key] === 'object') {
            revokeRecursive(obj[key]);
          }
        });
      };
      revokeRecursive(this.assetUrls.getValue());

      // generate the new URLs
      let assetUrls = {} as any;
      assets.forEach(asset => {
        let currentLevel = assetUrls;
        if (asset.path) {
          const parts = asset.path.split('/');
          parts.forEach(part => {
            const key = StringUtils.toKebabCase(part);
            if (!currentLevel[key]) {
              currentLevel[key] = {};
            }
            currentLevel = currentLevel[key];
          });
        }
        currentLevel[StringUtils.toKebabCase(asset.name)] = URL.createObjectURL(asset.file);
      });
      return assetUrls;
    }).then(assetUrls => this.assetUrls.next(assetUrls)).then(() => this.isLoadingSubject.next(false));
  }

  public isLoading() {
    return this.isLoadingSubject.asObservable();
  }

  override getEntityName(entity: Asset) {
    return entity.name;
  }

  getAssetUrls(): Observable<any> {
    return this.assetUrls.asObservable();
  }

  getByName(name: string): Promise<Asset> {
    return this.getAll().then(assets => {
      let filteredAssets = assets.filter(asset => asset.name && asset.name.replace(/ /g, '').toLowerCase() === name);
      return filteredAssets && filteredAssets.length > 0 ? filteredAssets[0] : {} as Asset;
    });
  }

  getByPath(name: string, path: string): Promise<Asset> {
    return this.getAll().then(assets => {
      let filteredAssets = assets.filter(asset =>
        asset.name && asset.name.replace(/ /g, '').toLowerCase() === name.toLowerCase() &&
        (asset.path || '') === path
      );
      return filteredAssets && filteredAssets.length > 0 ? filteredAssets[0] : {} as Asset;
    });
  }

  private static arrayBufferToBlob(buffer: ArrayBuffer, type: string): Blob {
    return new Blob([buffer], { type: type });
  }

  /**
   * Insert an array buffer and type into the asset
   * @param entity 
   */
  private static insertArrayBuffer(entity: Asset): Promise<Asset> {
    return entity.file.arrayBuffer().then(buffer => {
      (<any>entity).buffer = buffer;
      (<any>entity).type = entity.file.type;
      (<any>entity).file = undefined;
      return entity;
    });
  }

  /**
   * Insert a file/blob into the asset
   * @param entity 
   */
  private static insertFile(entity: Asset): Asset {
    if (!(<any>entity).buffer || !(<any>entity).type) {
      return entity;
    }
    const blob: Blob = AssetsService.arrayBufferToBlob((<any>entity).buffer, (<any>entity).type);
    entity.file = new File([blob], entity.name, { type: (<any>entity).type });
    (<any>entity).buffer = undefined;
    (<any>entity).type = undefined;
    return entity;
  }

  override search(searchParameters: SearchParameters) {
    return super.search(searchParameters).then(result => {
      result.records = result.records.map(AssetsService.insertFile);
      return result;
    });
  }

  override get(id: number) {
    return super.get(id).then(AssetsService.insertFile);
  }

  override getAll() {
    return super.getAll().then(entities => entities.map(AssetsService.insertFile));
  }

  public onChange() {
    return this.db.onChange().pipe(filter((change: any) =>
      change.tableName === AppDB.ASSETS_TABLE || change.tableName === AppDB.ASSET_FOLDERS_TABLE
    ));
  }

  override create(entity: Asset, suppressUrlUpdates?: boolean) {
    return AssetsService.insertArrayBuffer(entity).then(entity => super.create(entity)).then(entity => {
      if (!suppressUrlUpdates) {
        this.updateAssetUrls();
      }
      return entity;
    });
  }

  override update(id: number, entity: Asset) {
    return AssetsService.insertArrayBuffer(entity).then(entity => super.update(id, entity)).then(entity => {
      this.updateAssetUrls();
      return entity;
    });
  }

  override delete(id: number) {
    return super.delete(id).then(response => {
      this.updateAssetUrls();
      return response;
    });
  }

  async createFolder(resultSet: string) {
    if (!this.electronService.isElectron()) {
      // Web mode: use Dexie assetFolders
      const alreadyExists = await this.db.table(AppDB.ASSET_FOLDERS_TABLE).where('path').equals(resultSet).count();
      if (alreadyExists === 0) {
        await this.db.table(AppDB.ASSET_FOLDERS_TABLE).add({ path: resultSet });
      }
      return true;
    }
    if (!this.currentHomeUrl) return false;
    const assetsPath = this.currentHomeUrl.path + '/assets/' + resultSet;
    const success = await this.electronService.createDirectory({
      path: assetsPath,
      bookmark: this.currentHomeUrl.bookmark
    });
    if (success) {
      // Also add to DB for consistency
      const alreadyExists = await this.db.table(AppDB.ASSET_FOLDERS_TABLE).where('path').equals(resultSet).count();
      if (alreadyExists === 0) {
        await this.db.table(AppDB.ASSET_FOLDERS_TABLE).add({ path: resultSet });
      }
    }
    return success;
  }

  async renameFolder(oldPath: string, newPath: string) {
    // Helper to update DB records
    const updateDbRecords = async () => {
      console.log('renameFolder: updateDbRecords started');
      try {
        // 1. Update all assets that start with oldPath
        const allAssets = await this.getAll();
        const assetsToUpdate = allAssets.filter(a => (a.path === oldPath) || (a.path && a.path.startsWith(oldPath + '/')));
        console.log(`renameFolder: Found ${assetsToUpdate.length} assets to update`);

        for (const asset of assetsToUpdate) {
          if (asset.path === oldPath) {
            asset.path = newPath;
          } else if (asset.path) {
            asset.path = newPath + asset.path.substring(oldPath.length);
          }
          await this.update(asset.id, asset);
        }

        // 2. Update parent folder entries in assetFolders table
        const allFolders = await this.db.table(AppDB.ASSET_FOLDERS_TABLE).toArray();
        const foldersToUpdate = allFolders.filter(f => f.path === oldPath || f.path.startsWith(oldPath + '/'));
        console.log(`renameFolder: Found ${foldersToUpdate.length} folders to update from`, oldPath, 'to', newPath);

        for (const folder of foldersToUpdate) {
          if (folder.path === oldPath) {
            folder.path = newPath;
          } else {
            folder.path = newPath + folder.path.substring(oldPath.length);
          }
          await this.db.table(AppDB.ASSET_FOLDERS_TABLE).put(folder);
        }
        console.log('renameFolder: updateDbRecords completed');
      } catch (e) {
        console.error('renameFolder: updateDbRecords failed', e);
      }
    };

    if (!this.electronService.isElectron()) {
      // Web Mode: Just update DB
      await updateDbRecords();
      return true;
    } else {
      // Electron Mode
      if (!this.currentHomeUrl) return false;
      const homeUrl = this.currentHomeUrl;
      const assetsDir = homeUrl.path + '/assets';
      const oldFullPath = assetsDir + (oldPath ? '/' + oldPath : '');
      const newFullPath = assetsDir + (newPath ? '/' + newPath : '');

      const success = await this.electronService.renameDirectory(
        { path: oldFullPath, bookmark: homeUrl.bookmark },
        { path: newFullPath, bookmark: homeUrl.bookmark }
      );

      if (success) {
        await updateDbRecords();
      }
      return success;
    }
  }

  async deleteFolder(path: string) {
    if (!this.electronService.isElectron()) {
      // Web Mode
      const allAssets = await this.getAll();
      const assetsToDelete = allAssets.filter(a => (a.path === path) || (a.path && a.path.startsWith(path + '/')));

      for (const asset of assetsToDelete) {
        await this.delete(asset.id);
      }

      const allFolders = await this.db.table(AppDB.ASSET_FOLDERS_TABLE).toArray();
      const foldersToDelete = allFolders.filter(f => f.path === path || f.path.startsWith(path + '/'));

      for (const folder of foldersToDelete) {
        await this.db.table(AppDB.ASSET_FOLDERS_TABLE).where('path').equals(folder.path).delete();
      }
      return true;
    } else {
      // Electron Mode
      if (!this.currentHomeUrl) return false;
      const homeUrl = this.currentHomeUrl;
      const assetsDir = homeUrl.path + '/assets';
      const fullPath = assetsDir + (path ? '/' + path : '');

      const success = await this.electronService.removeDirectory({ path: fullPath, bookmark: homeUrl.bookmark });
      if (success) {
        const allAssets = await this.getAll();
        const assetsToDelete = allAssets.filter(a => (a.path === path) || (a.path && a.path.startsWith(path + '/')));

        for (const asset of assetsToDelete) {
          await this.delete(asset.id);
        }

        const allFolders = await this.db.table(AppDB.ASSET_FOLDERS_TABLE).toArray();
        const foldersToDelete = allFolders.filter(f => f.path === path || f.path.startsWith(path + '/'));

        for (const folder of foldersToDelete) {
          await this.db.table(AppDB.ASSET_FOLDERS_TABLE).where('path').equals(folder.path).delete();
        }
      }
      return success;
    }
  }

  async moveAsset(asset: Asset, targetFolder: string) {
    if (!this.electronService.isElectron()) {
      // Web mode: just update the asset path
      asset.path = targetFolder;
      await this.update(asset.id, asset);
      // also ensure the folder exists in assetFolders? 
      if (targetFolder) {
        await this.createFolder(targetFolder);
      }
      return true;
    }

    if (!this.currentHomeUrl) return false;
    const homeUrl = this.currentHomeUrl;
    const assetsDir = homeUrl.path + '/assets';

    const sourceDir = assetsDir + (asset.path ? '/' + asset.path : '');
    const targetDir = assetsDir + (targetFolder ? '/' + targetFolder : '');

    // Resolve the actual filename (extension) from disk
    const entries = await this.electronService.listDirectory({ path: sourceDir, bookmark: homeUrl.bookmark });
    const assetFile = entries.find(e => e.isFile && StringUtils.splitNameAndExtension(e.name).name === asset.name);

    if (!assetFile) {
      console.error('Source file not found for asset:', asset.name, 'in', sourceDir);
      return false;
    }

    const fileNameWithExt = assetFile.name;
    const sourcePath = sourceDir + '/' + fileNameWithExt;
    const targetPath = targetDir + '/' + fileNameWithExt;

    // Ensure target directory exists
    if (targetFolder) {
      await this.createFolder(targetFolder);
    }

    const success = await this.electronService.renameDirectory(
      { path: sourcePath, bookmark: homeUrl.bookmark },
      { path: targetPath, bookmark: homeUrl.bookmark }
    );

    if (success) {
      asset.path = targetFolder;
      await this.update(asset.id, asset);
    }
    return success;
  }

  /**
   * Recursive function to get all subfolders in the assets directory
   */
  async getFolders(): Promise<string[]> {
    if (!this.electronService.isElectron()) {
      // Web mode: get from assetFolders table AND derived from current assets
      const explicitFolders = await this.db.table(AppDB.ASSET_FOLDERS_TABLE).toArray().then(rows => rows.map(r => r.path));
      const assets = await this.getAll();
      const derivedFolders = new Set<string>();
      assets.forEach(a => {
        if (a.path) derivedFolders.add(a.path);
      });
      // We might want to support nested derived folders too? 
      // e.g. if I have "icons/fire", I should have "icons" folder?
      // Currently sidebar handles flattening? No, sidebar assumes full paths.
      // Let's ensure we have parent paths for derived folders.
      const allFolders = new Set([...explicitFolders, ...derivedFolders]);
      // Maybe expand parents? 
      // If "a/b/c", ensure "a/b" and "a" exist.
      const expandedFolders = new Set<string>();
      allFolders.forEach(f => {
        const parts = f.split('/');
        let current = '';
        parts.forEach((p: string, i: number) => {
          current += (i > 0 ? '/' : '') + p;
          expandedFolders.add(current);
        });
      });

      return Array.from(expandedFolders);
    }
    if (!this.currentHomeUrl) return [];
    const assetsDir = this.currentHomeUrl.path + '/assets';
    const folders: string[] = [];

    const traverse = async (currentPath: string, relativePath: string) => {
      const entries = await this.electronService.listDirectory({ path: currentPath, bookmark: this.currentHomeUrl?.bookmark });
      for (const entry of entries) {
        if (entry.isDirectory) {
          const newRelative = relativePath ? relativePath + '/' + entry.name : entry.name;
          folders.push(newRelative);
          await traverse(currentPath + '/' + entry.name, newRelative);

        }
      }
    };

    await traverse(assetsDir, '');
    return folders;
  }
}
