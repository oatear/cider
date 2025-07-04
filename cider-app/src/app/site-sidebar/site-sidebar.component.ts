import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService, TreeNode } from 'primeng/api';
import { DecksService } from '../data-services/services/decks.service';
import { AssetsService } from '../data-services/services/assets.service';
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import { ElectronService } from '../data-services/electron/electron.service';
import { debounceTime, firstValueFrom } from 'rxjs';
import StringUtils from '../shared/utils/string-utils';
import { TreeNodeContextMenuSelectEvent, TreeNodeSelectEvent } from 'primeng/tree';
import { Router } from '@angular/router';
import { EntityService } from '../data-services/types/entity-service.type';

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
  templateDialogVisible: boolean = false;
  dialogTitle: string = '';
  service: EntityService<any, any>;
  entity: any = {};

  constructor(private decksService: DecksService,
    private assetsService: AssetsService,
    private templatesService: CardTemplatesService,
    private electronService: ElectronService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService, 
    private router: Router) {
    // Initialize or fetch any necessary data here
    // observe the decks and templates
    // for every deck, fetch every template and create a tree node
    this.service = {} as EntityService<any, any>;
  }

  ngOnInit() {
    this.updateFiles();
    this.electronService.getProjectUnsaved().pipe(debounceTime(500)).subscribe(unsaved => {
      console.log('Project unsaved status changed:', unsaved);
      this.updateFiles();
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
    // Fetch the readme file
    // -----------------------------------------------
    await firstValueFrom(this.electronService.getProjectHomeUrl()).then(homeUrl => {
      let projectName = StringUtils.lastDirectoryFromUrl(homeUrl || 'Project');
      // this.files.push({
      //   label: projectName,
      //   data: {
      //     url: '/decks',
      //   },
      //   icon: 'pi pi-home',
      //   styleClass: 'project-home',
      // });
      updatedFiles.push({
        label: 'README',
        data: {
          url: '/documents/0',
        },
        icon: 'pi pi-file',
        styleClass: 'readme-file'
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
          label: 'Cards',
          data: {
            url: '/decks/' + deck.id + '/cards/listing',
            contextMenu: [
              {
                label: 'Export Cards',
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
          label: 'Thumbnails',
          data: {
            url: '/decks/' + deck.id + '/cards/thumbnails',
            contextMenu: [
              {
                label: 'Export Cards',
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
          label: 'Attributes',
          data: {
            url: '/decks/' + deck.id + '/cards/attributes',
          },
          icon: 'pi pi-cog',
          styleClass: 'card-attributes',
        });

        deckChildren.push({
          label: 'Export Cards',
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
                    label: 'Add New Card Template',
                    icon: 'pi pi-plus',
                    command: () => {
                      // this.openCreateDialog(this.templatesService, 'Create New Card Template');
                      this.openTemplateDialog(deck.id);
                    }
                  },
                  {
                    label: 'Edit/Rename Template',
                    icon: 'pi pi-pencil',
                    command: () => {
                      this.openEditDialog(this.templatesService, template.id, 'Edit/Rename Template');
                    }
                  },
                  {
                    label: 'Delete Template',
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
                label: 'Add New Card Template',
                icon: 'pi pi-plus',
                command: () => {
                  // this.openCreateDialog(this.templatesService, 'Create New Card Template');
                  this.openTemplateDialog(deck.id);
                }
              },
              {
                label: 'Export Cards',
                icon: 'pi pi-file-pdf',
                command: () => {
                  this.router.navigateByUrl(`/decks/${deck.id}/export-cards`);
                }
              },
              {
                label: 'Edit/Rename Deck',
                icon: 'pi pi-pencil',
                command: () => {
                  this.openEditDialog(this.decksService, deck.id, 'Edit/Rename Deck');
                }
              },
              {
                label: 'Delete Deck',
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
        label: 'Decks',
        data: {
          url: '/decks',
          contextMenu: [
            {
              label: 'Add New Deck',
              icon: 'pi pi-plus',
              command: () => {
                this.openCreateDialog(this.decksService, 'Create New Deck');
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
        label: 'Assets',
        data: {
          url: '/assets',
          contextMenu: [
            {
              label: 'Add New Asset',
              icon: 'pi pi-plus',
              command: () => {
                this.openCreateDialog(this.assetsService, 'Create New Asset');
              }
            },
            {
              label: 'Generate New Asset',
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
                label: 'Add New Asset',
                icon: 'pi pi-plus',
                command: () => {
                  this.openCreateDialog(this.assetsService, 'Create New Asset');
                }
              },
              {
                label: 'Generate New Asset',
                icon: 'pi pi-sparkles',
                command: () => {
                    this.router.navigateByUrl(`/assets/generator`);
                }
              },
              {
                label: 'Edit/Rename Asset',
                icon: 'pi pi-pencil',
                command: () => {
                  this.openEditDialog(this.assetsService, asset.id, 'Edit/Rename Asset');
                }
              },
              {
                label: 'Delete Asset',
                icon: 'pi pi-trash',
                command: () => {
                  this.openDeleteDialog(asset.id, this.assetsService);
                }
              }
            ],
          },
          icon: 'pi pi-image',
          styleClass: 'asset-file',
        }))
      });
    });

    this.files = updatedFiles;
    this.updatingFiles = false;
  }

  onNodeContextMenuSelect(event: TreeNodeContextMenuSelectEvent) {
    const selectedNode = event.node;
    const newMenuItems: MenuItem[] = [];
    if (selectedNode.data && selectedNode.data?.contextMenu) {
      // If the node has a context menu, use it
      newMenuItems.push(...selectedNode.data.contextMenu);
    } else {
      newMenuItems.push({
        label: 'No Actions Available',
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
      message: 'Are you sure you want to delete this entity?',
      header: 'Delete Entity',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        service?.delete(entityId).then(deleted => {
          this.messageService.add({severity:'success', summary: 'Successful', detail: 'Entity Deleted', life: 3000});
        });
      }
    });
  }

  public openCreateDialog(service: EntityService<any, any>, dialogTitle: string) {
    this.service = service;
    this.dialogTitle = dialogTitle || 'Create New Entity';
    this.entity = {} as any;
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

  public openTemplateDialog(deckId: number) {
    this.deckId = deckId;
    this.templateDialogVisible = true;
  }

}
