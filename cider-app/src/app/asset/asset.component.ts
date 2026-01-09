import { Component } from '@angular/core';
import { AssetsService } from '../data-services/services/assets.service';
import { ActivatedRoute } from '@angular/router';
import { Asset } from '../data-services/types/asset.type';
import { ConfirmationService, MessageService } from 'primeng/api';
import StringUtils from '../shared/utils/string-utils';
import FileUtils from '../shared/utils/file-utils';
import { combineLatest, forkJoin, take } from 'rxjs';

@Component({
    selector: 'app-asset',
    templateUrl: './asset.component.html',
    styleUrl: './asset.component.scss',
    providers: [MessageService, ConfirmationService],
    standalone: false
})
export class AssetComponent {
  public asset: Asset = {} as Asset;
  public zoom: number = 1.0;
  public zoomStep: number = 0.1;
  dialogVisible: boolean = false;
  public imageDimensions: { width: number, height: number } = { width: 0, height: 0 };
  public fileSize: string = '';
  public fileExtension: string = '';
  public fileMime: string = '';
  public fileType: string = '';
  assetUrls: any;

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public assetsService: AssetsService) {

    combineLatest({
      assetUrls: this.assetsService.getAssetUrls(),
      routeParams: this.route.paramMap
    }).subscribe(({ assetUrls, routeParams }) => {
      const assetIdString = routeParams.get('assetId') || '';
      const assetId = parseInt(assetIdString, 10);
      this.assetUrls = assetUrls;
      
      if (!isNaN(assetId)) {
        this.assetsService.get(assetId).then((asset) => {
          this.asset = asset;
          this.updateFileDetails();
        }).catch(error => {
          console.error(`Error fetching asset with ID ${assetId}:`, error);
        });
      }

    });
  }

  private updateFileDetails() {
    if (this.asset && this.asset.name && this.assetUrls) {
      const fileUrl = this.assetUrls[StringUtils.toKebabCase(this.asset.name)];
      if (fileUrl) {
        this.fileSize = FileUtils.formatFileSize(this.asset.file.size);
        this.fileExtension = StringUtils.mimeToExtension(this.asset.file.type);
        this.fileMime = this.asset.file.type;
        this.fileType = StringUtils.mimeToTypeCategory(this.asset.file.type);

        // get image dimensions if the file is an image
        if (this.fileType === 'image') {
          FileUtils.getImageDimensions(fileUrl).then(dimensions => {
            this.imageDimensions = dimensions;
          }).catch(error => {
            console.error('Error getting image dimensions:', error);
          });
        }
      }
    }
  }

  public changeZoom(change: number) {
    this.zoom += change;
    if (this.zoom < 0.1) {
      this.zoom = 0.1;
    }
  }

  public openEditDialog(asset : Asset) {
    this.asset = asset;
    this.dialogVisible = true;
  }

  public save(asset: Asset) {
    const id = (<any>asset)[this.assetsService?.getIdField()];
    this.updateExisting(id, asset);
  }
  
  public updateExisting(id: number, asset: Asset) {
    this.assetsService?.update(id, asset).then(result => {
    }).catch(error => {
      console.log('error saving entity', error);
    });
  }

  public openDeleteDialog(entity : Asset) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this entity?',
      header: 'Delete Entity',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.assetsService?.delete((<any>entity)[this.assetsService?.getIdField()]).then(deleted => {
          // this.messageService.add({severity:'success', summary: 'Successful', detail: 'Entity Deleted', life: 3000});
        });
      }
    });
  }

}
