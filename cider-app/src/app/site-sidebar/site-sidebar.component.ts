import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService, TreeNode } from 'primeng/api';
import { DecksService } from '../data-services/services/decks.service';
import { AssetsService } from '../data-services/services/assets.service';
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import { ElectronService } from '../data-services/electron/electron.service';
import { combineLatest, debounceTime, firstValueFrom, lastValueFrom, merge, timeout } from 'rxjs';
import StringUtils from '../shared/utils/string-utils';
import { TreeNodeContextMenuSelectEvent, TreeNodeSelectEvent } from 'primeng/tree';
import { Router } from '@angular/router';
import { EntityService } from '../data-services/types/entity-service.type';
import { DocumentsService } from '../data-services/services/documents.service';
import { HttpClient } from '@angular/common/http';
import { AppDB } from '../data-services/indexed-db/db';
import { TranslateService } from '@ngx-translate/core';
import { Asset } from '../data-services/types/asset.type';

@Component({
  selector: 'app-site-sidebar',
  templateUrl: './site-sidebar.component.html',
  styleUrls: ['./site-sidebar.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class SiteSidebarComponent implements OnInit {
  deckId: number = 0;
  files: TreeNode[] = [];
  selectedFile: TreeNode | null = null;
  menuItems: MenuItem[] = [];
  updatingFiles: boolean = false;
  dialogVisible: boolean = false;
  dialogTitle: string = '';
  service: EntityService<any, any>;
  entity: any = {};

  constructor(private decksService: DecksService,
    private assetsService: AssetsService,
    private templatesService: CardTemplatesService,
    private documentsService: DocumentsService,
    private electronService: ElectronService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService, 
    private translate: TranslateService,
    private httpClient: HttpClient,
    private router: Router,
    private db: AppDB) {
    // Initialize or fetch any necessary data here
    // observe the decks and templates
    // for every deck, fetch every template and create a tree node
    this.service = {} as EntityService<any, any>;
  }

  ngOnInit() {
    console.log('init sidebar');
    // if (!this.electronService.isElectron()) {
    //   firstValueFrom(this.translate.onLangChange.pipe(timeout(1000))).then(() => {
    //     this.updateFiles();
    //   });
    // }

    // update menu on language change
    this.translate.stream('welcome.title').subscribe(() => {
      this.updateFiles();
    });

    // update menu on project open
    this.electronService.getIsProjectOpen().asObservable().pipe(debounceTime(500)).subscribe(isProjectOpen => {
      if (isProjectOpen) {
        console.log('project just opened, sidebar update');
        this.updateFiles();
      }
    });
    
    // update menu on db change, but only if project is open
    combineLatest([this.db.onChange()])
    .pipe(debounceTime(500)).subscribe(() => {
      const isProjectOpen: boolean = this.electronService.getIsProjectOpen().getValue();
      if (!this.electronService.isElectron() || isProjectOpen) {
        console.log('change detected, project is open, sidebar update');
        this.updateFiles();
      } else {
        console.log('change detected, project is not open, skipping sidebar update');
      }
    });
  }

  async updateFiles() {
    if (this.updatingFiles) {
      console.warn('Files are already being updated. Skipping this update.');
      return;
    }
    this.updatingFiles = true;
    const updatedFiles: TreeNode[] = [];
    // -----------------------------------------------
    // Setup project home node
    // -----------------------------------------------
    await firstValueFrom(this.electronService.getProjectHomeUrl()).then(homeUrl => {
      let projectName = StringUtils.lastDirectoryFromUrl(homeUrl?.path 
        ?? this.translate.instant('sidebar.unknown-project'));
      updatedFiles.push({
        label: projectName,
        data: {
          url: '/project',
          contextMenu: [
            {
              label: this.translate.instant('sidebar.add-new-deck'),
              icon: 'pi pi-plus',
              command: () => {
                this.openCreateDialog(this.decksService, 
                  this.translate.instant('sidebar.create-new-deck'), {
                  name: `${this.translate.instant('sidebar.deck')}-${Math.random().toString(36).substr(2, 9)}`
                });
              }
            },
            {
              label: this.translate.instant('sidebar.add-new-document'),
              icon: 'pi pi-file',
              command: () => {
                this.openCreateDocumentDialog(this.documentsService, 
                  this.translate.instant('sidebar.create-new-document'));
              }
            },
          ],
        },
        icon: 'pi pi-home',
        styleClass: 'project-home',
      });
    });

    // -----------------------------------------------
    // Fetch style documents
    // -----------------------------------------------
    await this.documentsService.getAll({ mime: 'text/css' }).then(documents => {
      return documents.forEach(document => {
        updatedFiles.push({
          label: document.name,
          data: {
            url: '/documents/' + document.id,
            contextMenu: [],
          },
          icon: 'pi pi-receipt',
          styleClass: 'document-file',
        });
      });
    });

    // -----------------------------------------------
    // Fetch markdown documents
    // -----------------------------------------------
    await this.documentsService.getAll({ mime: 'text/markdown' }).then(documents => {
      return documents.forEach(document => {
        updatedFiles.push({
          label: document.name,
          data: {
            url: '/documents/' + document.id,
            contextMenu: [
              {
                label: this.translate.instant('sidebar.add-new-document'),
                icon: 'pi pi-file',
                command: () => {
                  this.openCreateDocumentDialog(this.documentsService, 
                    this.translate.instant('sidebar.create-new-document'));
                }
              },
              {
                label: this.translate.instant('sidebar.edit-rename-document'),
                icon: 'pi pi-pencil',
                command: () => {
                  this.openEditDialog(this.documentsService, document.id, 
                    this.translate.instant('sidebar.edit-rename-document'));
                }
              },
              {
                label: this.translate.instant('sidebar.delete-document'),
                icon: 'pi pi-trash',
                command: () => {
                  this.openDeleteDialog(document.id, this.documentsService);
                }
              }
            ],
          },
          icon: 'pi pi-file',
          styleClass: 'document-file',
        });
      });
    });

    // -----------------------------------------------
    // Fetch decks and their templates
    // -----------------------------------------------
    await this.decksService.getAll().then(decks => {
      let deckFolderChildren: TreeNode[] = [];
      decks.forEach(deck => {
        let deckChildren: TreeNode[] = [];

        deckChildren.push({
          label: this.translate.instant('sidebar.cards'),
          data: {
            url: '/decks/' + deck.id + '/cards/listing',
            contextMenu: [
              {
                label: this.translate.instant('sidebar.export-cards'),
                icon: 'pi pi-file-pdf',
                command: () => {
                  this.router.navigateByUrl(`/decks/${deck.id}/export-cards`);
                }
              }
            ],
          },
          icon: 'pi pi-list',
          styleClass: 'card-listing',
        });

        deckChildren.push({
          label: this.translate.instant('sidebar.thumbnails'),
          data: {
            url: '/decks/' + deck.id + '/cards/thumbnails',
            contextMenu: [
              {
                label: this.translate.instant('sidebar.export-cards'),
                icon: 'pi pi-file-pdf',
                command: () => {
                  this.router.navigateByUrl(`/decks/${deck.id}/export-cards`);
                }
              }
            ],
          },
          icon: 'pi pi-th-large',
          styleClass: 'card-thumbnails',
        })

        deckChildren.push({
          label: this.translate.instant('sidebar.attributes'),
          data: {
            url: '/decks/' + deck.id + '/cards/attributes',
          },
          icon: 'pi pi-tags',
          styleClass: 'card-attributes',
        });

        deckChildren.push({
          label: this.translate.instant('sidebar.export-cards') ,
          data: {
            url: '/decks/' + deck.id + '/export-cards',
          },
          icon: 'pi pi-file-pdf',
          styleClass: 'card-export',
        });

        // -----------------------------------------------
        // Fetch deck templates
        // -----------------------------------------------
        this.templatesService.getAllUnfiltered({deckId: (deck || {}).id}).then(templates => 
          templates.forEach(template => {
            deckChildren.push({
              label: template.name,
              data: {
                url: '/decks/' + deck.id + '/templates/' + template.id,
                contextMenu: [
                  {
                    label: this.translate.instant('sidebar.add-new-card-template'),
                    icon: 'pi pi-plus',
                    command: () => {
                      this.router.navigateByUrl(`/decks/${deck.id}/templates/generator`);
                    }
                  },
                  {
                    label: this.translate.instant('sidebar.edit-rename-card-template'),
                    icon: 'pi pi-pencil',
                    command: () => {
                      this.openEditDialog(this.templatesService, template.id, 
                        this.translate.instant('sidebar.edit-rename-card-template'));
                    }
                  },
                  {
                    label: this.translate.instant('sidebar.duplicate-card-template'),
                    icon: 'pi pi-copy',
                    command: () => {
                      this.openDuplicateDialog(this.templatesService, template.id, 
                        this.translate.instant('sidebar.duplicate-card-template'));
                    }
                  },
                  {
                    label: this.translate.instant('sidebar.delete-card-template'),
                    icon: 'pi pi-trash',
                    command: () => {
                      this.openDeleteDialog(template.id, this.templatesService);
                    }
                  }
                ],
              },
              icon: 'pi pi-id-card',
              styleClass: 'card-template',
            })
          }
        ));

        let deckFile = {
          label: deck.name,
          data: {
            url: '/decks/' + deck.id + '/cards',
            contextMenu: [
              {
                label: this.translate.instant('sidebar.add-new-card-template'),
                icon: 'pi pi-plus',
                command: () => {
                  this.router.navigateByUrl(`/decks/${deck.id}/templates/generator`);
                }
              },
              {
                label: this.translate.instant('sidebar.export-cards'),
                icon: 'pi pi-file-pdf',
                command: () => {
                  this.router.navigateByUrl(`/decks/${deck.id}/export-cards`);
                }
              },
              {
                label: this.translate.instant('sidebar.edit-rename-deck'),
                icon: 'pi pi-pencil',
                command: () => {
                  this.openEditDialog(this.decksService, deck.id, 
                    this.translate.instant('sidebar.edit-rename-deck'));
                }
              },
              {
                label: this.translate.instant('sidebar.delete-deck'),
                icon: 'pi pi-trash',
                command: () => {
                  this.openDeleteDialog(deck.id, this.decksService);
                }
              },
            ],
          },
          icon: 'pi pi-folder',
          styleClass: 'deck-folder',
          expanded: true,
          // styleClass: 'selected-deck',
          children: deckChildren
        };
        deckFolderChildren.push(deckFile);
      });

      let decksFolder: TreeNode = {
        label: this.translate.instant('sidebar.decks'),
        data: {
          url: '/decks',
          contextMenu: [
            {
              label: this.translate.instant('sidebar.add-new-deck'),
              icon: 'pi pi-plus',
              command: () => {
                this.openCreateDialog(this.decksService, 
                  this.translate.instant('sidebar.create-new-deck'), {
                  name: `Deck-${Math.random().toString(36).substr(2, 9)}`
                });
              }
            }
          ],
        },
        icon: 'pi pi-folder',
        expanded: true,
        children: deckFolderChildren
      };
      updatedFiles.push(decksFolder);

    });


    // -----------------------------------------------
    // Fetch assets
    // -----------------------------------------------
    await this.assetsService.getAll().then(assets => {
      updatedFiles.push({
        label: this.translate.instant('sidebar.assets'),
        data: {
          url: '/assets',
          contextMenu: [
            {
              label: this.translate.instant('sidebar.add-new-asset'),
              icon: 'pi pi-plus',
              command: () => {
                this.openCreateDialog(this.assetsService, 
                  this.translate.instant('sidebar.create-new-asset'), {
                  name: `asset-${Math.random().toString(36).substr(2, 9)}`
                });
              }
            },
            {
              label: this.translate.instant('sidebar.generate-new-asset'),
              icon: 'pi pi-sparkles',
              command: () => {
                  this.router.navigateByUrl(`/assets/generator`);
              }
            }
          ],
        },
        icon: 'pi pi-folder',
        expanded: true,
        children: assets.map(asset => ({
          label: asset.name,
          data: {
            url: '/assets/' + asset.id,
            contextMenu: [
              {
                label: this.translate.instant('sidebar.add-new-asset'),
                icon: 'pi pi-plus',
                command: () => {
                  this.openCreateDialog(this.assetsService, 
                    this.translate.instant('sidebar.create-new-asset'), {
                    name: `asset-${Math.random().toString(36).substr(2, 9)}`
                  });
                }
              },
              {
                label: this.translate.instant('sidebar.generate-new-asset'),
                icon: 'pi pi-sparkles',
                command: () => {
                    this.router.navigateByUrl(`/assets/generator`);
                }
              },
              {
                label: this.translate.instant('sidebar.edit-rename-asset'),
                icon: 'pi pi-pencil',
                command: () => {
                  this.openEditDialog(this.assetsService, asset.id, 
                    this.translate.instant('sidebar.edit-rename-asset'));
                }
              },
              {
                label: this.translate.instant('sidebar.delete-asset'),
                icon: 'pi pi-trash',
                command: () => {
                  this.openDeleteDialog(asset.id, this.assetsService);
                }
              }
            ],
          },
          icon:  this.getAssetIcon(asset),
          styleClass: 'asset-file',
        }))
      });
    });

    this.files = updatedFiles;
    this.updatingFiles = false;
  }

  getAssetIcon(asset: Asset): string {
    const fileType = StringUtils.mimeToTypeCategory(asset.file.type);
    switch (fileType) {
      case 'image':
        return 'pi pi-image';
      case 'font':
        return 'pi pi-language';
      case 'audio':
        return 'pi pi-volume-up';
      case 'video':
        return 'pi pi-video';
      case 'document':
        return 'pi pi-file';
      case 'archive':
        return 'pi pi-folder';
      default:
        return 'pi pi-file';
    }
  }

  onNodeContextMenuSelect(event: TreeNodeContextMenuSelectEvent) {
    const selectedNode = event.node;
    const newMenuItems: MenuItem[] = [];
    if (selectedNode.data && selectedNode.data?.contextMenu) {
      // If the node has a context menu, use it
      newMenuItems.push(...selectedNode.data.contextMenu);
    } else {
      newMenuItems.push({
        label: this.translate.instant('sidebar.no-actions-available'),
        icon: 'pi pi-info-circle',
        disabled: true
      });
    }
    this.menuItems = newMenuItems;
  }

  onNodeSelect(event: TreeNodeSelectEvent) {
    const selectedNode = event.node;
    if (selectedNode.data && typeof selectedNode.data === 'object' && 'url' in selectedNode.data) {
      // If the node has a URL, open it
      this.router.navigateByUrl(selectedNode.data.url, { skipLocationChange: false });
    }
  }
  
  public openDeleteDialog(entityId : any, service: EntityService<any, any>) {
    this.confirmationService.confirm({
      message: this.translate.instant('sidebar.confirm-entity-delete-message'),
      header: this.translate.instant('sidebar.delete-entity'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        service?.delete(entityId).then(deleted => {
          this.messageService.add({severity:'success', summary: 'Successful', 
            detail: this.translate.instant('sidebar.entity-deleted'), life: 3000});
        });
      }
    });
  }

  public async openCreateDocumentDialog(service: EntityService<any, any>, dialogTitle: string) {
    // Create a random name for the new document
    const randomName = `README-${Math.random().toString(36).substr(2, 9)}`;
    const blob = await firstValueFrom(this.httpClient.get('assets/README-TEMPLATE.md', {responseType: 'blob'}));
    const defaultContent = await blob.text();
    this.entity = {
      name: randomName,
      content: defaultContent,
    } as any;
    this.openCreateDialog(service, dialogTitle, this.entity);
  }

  public openCreateDialog(service: EntityService<any, any>, dialogTitle: string, entity?: any) {
    this.service = service;
    this.dialogTitle = dialogTitle || 'Create New Entity';
    if (entity) {
      this.entity = entity;
    } else {
      this.entity = {} as any;
    }
    this.dialogVisible = true;
  }

  public openEditDialog(service: EntityService<any, any>, entityId: any, dialogTitle: string) {
    this.service = service;
    this.dialogTitle = dialogTitle || 'Edit Entity';
    this.entity = {} as any;
    service.get(entityId).then(entity => {
      this.entity = entity;
    });
    this.dialogVisible = true;
  }

  public openDuplicateDialog(service: EntityService<any, any>, entityId: any, dialogTitle: string) {
    this.service = service;
    this.dialogTitle = dialogTitle || 'Duplicate Entity';
    this.entity = {} as any;
    service.get(entityId).then(entity => {
      // Create a new entity with the same properties but without the ID
      this.entity = {...entity};
      delete this.entity.id; // Remove the ID to create a new entity
      // Optionally, you can modify the name to indicate it's a duplicate
      if (this.entity.name) {
        this.entity.name = `Copy of ${this.entity.name}`;
      } else {
        this.entity.name = `Copy of Entity-${Math.random().toString(36).substr(2, 9)}`;
      }
    });
    this.dialogVisible = true;
  }

}
