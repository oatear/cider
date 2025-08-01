import { Component } from '@angular/core';
import { AssetsService } from '../data-services/services/assets.service';
import { ActivatedRoute } from '@angular/router';
import { Asset } from '../data-services/types/asset.type';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrl: './asset.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class AssetComponent {
  public asset: Asset = {} as Asset;
  public zoom: number = 1.0;
  public zoomStep: number = 0.1;
  dialogVisible: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public assetsService: AssetsService) {
      this.route.paramMap.subscribe(params => {
        const assetIdString = params.get('assetId') || '';
        const assetId = parseInt(assetIdString, 10);
        if (!isNaN(assetId)) {
          this.assetsService.get(assetId).then((asset) => {
            this.asset = asset;
          }).catch(error => {
            console.error(`Error fetching asset with ID ${assetId}:`, error);
          });
        }
      });
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
