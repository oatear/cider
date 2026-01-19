import { Injectable } from '@angular/core';
import { Asset } from '../types/asset.type';
import { AppDB } from '../indexed-db/db';
import { FieldType } from '../types/field-type.type';
import { AsyncSubject, BehaviorSubject, Observable } from 'rxjs';
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

    const assetsPath = homeUrl.path + '/assets'; // Hardcoded structure from ElectronService
    if (absPath.startsWith(assetsPath)) {
      console.log('New asset detected:', absPath);
      const fileName = StringUtils.lastDirectoryFromUrl(absPath);
      const nameSplit = StringUtils.splitNameAndExtension(fileName);
      const assetName = nameSplit.name;

      // Check if exists
      const existing = await this.getByName(assetName);
      if (existing && existing.id) {
        console.log('Asset already exists in DB');
        return;
      }

      // Import
      const persistentPath: any = { path: absPath, bookmark: homeUrl.bookmark }; // assuming bookmark works for subpath or we request access
      const buffer = await this.electronService.readFile(persistentPath);
      if (buffer) {
        const fileType = StringUtils.extensionToMime(nameSplit.extension);
        const blob = new Blob([new Uint8Array(buffer)], { type: fileType });
        const file = new File([blob], fileName, { type: fileType });
        await this.create({
          file: file,
          name: assetName,
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
      const fileName = StringUtils.lastDirectoryFromUrl(absPath);
      const nameSplit = StringUtils.splitNameAndExtension(fileName);
      const assetName = nameSplit.name;

      const existing = await this.getByName(assetName);
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
      // release the old URLs
      Object.keys(this.assetUrls.getValue()).forEach(key => URL.revokeObjectURL(this.assetUrls.getValue()[key]));
      // generate the new URLs
      let assetUrls = {} as any;
      assets.forEach(asset => assetUrls[StringUtils.toKebabCase(asset.name)] = URL.createObjectURL(asset.file));
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
}
