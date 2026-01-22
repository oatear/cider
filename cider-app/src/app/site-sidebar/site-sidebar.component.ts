import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService, TreeDragDropService, TreeNode } from 'primeng/api';
import { DecksService } from '../data-services/services/decks.service';
import { AssetsService } from '../data-services/services/assets.service';
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import { Action } from 'rxjs/internal/scheduler/Action';
import { CardAttributesService } from '../data-services/services/card-attributes.service';
import { ElectronService } from '../data-services/electron/electron.service';
import { combineLatest, debounceTime, firstValueFrom, lastValueFrom, merge, timeout } from 'rxjs';
import StringUtils from '../shared/utils/string-utils';
import { TreeNodeContextMenuSelectEvent, TreeNodeSelectEvent, TreeNodeDropEvent } from 'primeng/tree';
import { Router } from '@angular/router';
import { EntityService } from '../data-services/types/entity-service.type';
import { DocumentsService } from '../data-services/services/documents.service';
import { HttpClient } from '@angular/common/http';
import { AppDB } from '../data-services/indexed-db/db';
import { TranslateService } from '@ngx-translate/core';
import { ProjectStateService } from '../data-services/services/project-state.service';
import { PersistentPath } from '../data-services/types/persistent-path.type';
import { Asset } from '../data-services/types/asset.type';

@Component({
  selector: 'app-site-sidebar',
  templateUrl: './site-sidebar.component.html',
  styleUrls: ['./site-sidebar.component.scss'],
  providers: [MessageService, ConfirmationService, TreeDragDropService],
  standalone: false
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
    private cardAttributesService: CardAttributesService,
    private assetsService: AssetsService,
    private templatesService: CardTemplatesService,
    private documentsService: DocumentsService,
    private electronService: ElectronService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private translate: TranslateService,
    private httpClient: HttpClient,
    private router: Router,
    private projectStateService: ProjectStateService,
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

    combineLatest([this.db.onChange(), this.projectStateService.getDirtyEntities()])
      .pipe(debounceTime(500)).subscribe(() => {
        const isProjectOpen: boolean = this.electronService.getIsProjectOpen().getValue();
        if (!this.electronService.isElectron() || isProjectOpen) {
          console.log('change detected, project is open, sidebar update');
          this.updateFiles().then(() => {
            this.updateDirtyIndicators();
          });
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
        draggable: false,
        droppable: false
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
            id: document.id,
            type: 'document'
          },
          icon: 'pi pi-receipt',
          styleClass: 'document-file',
          draggable: false,
          droppable: false
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
            id: document.id,
            type: 'document',
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
          draggable: false,
          droppable: false
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
          draggable: false,
          droppable: false
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
          draggable: false,
          droppable: false
        })

        deckChildren.push({
          label: this.translate.instant('sidebar.attributes'),
          data: {
            url: '/decks/' + deck.id + '/cards/attributes',
          },
          icon: 'pi pi-tags',
          styleClass: 'card-attributes',
          draggable: false,
          droppable: false
        });

        deckChildren.push({
          label: this.translate.instant('sidebar.export-cards'),
          data: {
            url: '/decks/' + deck.id + '/export-cards',
          },
          icon: 'pi pi-file-pdf',
          styleClass: 'card-export',
          draggable: false,
          droppable: false
        });

        // -----------------------------------------------
        // Fetch deck templates
        // -----------------------------------------------
        this.templatesService.getAllUnfiltered({ deckId: (deck || {}).id }).then(templates =>
          templates.forEach(template => {
            deckChildren.push({
              label: template.name,
              data: {
                url: '/decks/' + deck.id + '/templates/' + template.id,
                id: template.id,
                type: 'template',
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
              draggable: true,
              droppable: false
            })
          }
          ));

        let deckFile = {
          label: deck.name,
          data: {
            url: '/decks/' + deck.id + '/cards',
            id: deck.id,
            type: 'deck',
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
          draggable: false,
          droppable: true,
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
        draggable: false,
        droppable: false,
        children: deckFolderChildren
      };
      updatedFiles.push(decksFolder);

    });


    // -----------------------------------------------
    // Fetch assets
    // -----------------------------------------------
    // -----------------------------------------------
    // Fetch assets and build the tree (folders + files)
    // -----------------------------------------------
    const assets = await this.assetsService.getAll();
    const folders = await this.assetsService.getFolders();

    const assetsRoot: TreeNode = {
      label: this.translate.instant('sidebar.assets'),
      data: {
        url: '/assets',
        type: 'asset-root',
        path: '',
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
            label: this.translate.instant('sidebar.create-new-folder'),
            icon: 'pi pi-folder',
            command: () => {
              this.openCreateFolderDialog('');
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
      children: [],
      droppable: true,
      draggable: false,
      selectable: true
    };

    // Helper to find or create folder nodes
    const folderNodes = new Map<string, TreeNode>();

    // 1. Create nodes for all folders
    // Sort folders by length so we create parents first? 
    // Actually getFolders returns recursive traversal, so parents come first usually? 
    // But better be safe: sort by path segments length.
    folders.sort((a, b) => a.split('/').length - b.split('/').length);

    folders.forEach(folderPath => {
      const parts = folderPath.split('/');
      const folderName = parts[parts.length - 1];
      const parentPath = parts.slice(0, -1).join('/');

      const folderNode: TreeNode = {
        label: folderName,
        data: {
          type: 'asset-folder',
          path: folderPath,
          contextMenu: [
            {
              label: this.translate.instant('sidebar.add-new-asset'),
              icon: 'pi pi-plus',
              command: () => {
                this.openCreateDialog(this.assetsService,
                  this.translate.instant('sidebar.create-new-asset'), {
                  name: `asset-${Math.random().toString(36).substr(2, 9)}`,
                  path: folderPath
                });
              }
            },
            {
              label: this.translate.instant('sidebar.create-new-folder'),
              icon: 'pi pi-folder',
              command: () => {
                this.openCreateFolderDialog(folderPath);
              }
            },
            {
              label: this.translate.instant('sidebar.edit-rename-folder'),
              icon: 'pi pi-pencil',
              command: () => {
                this.openRenameFolderDialog(folderPath);
              }
            },
            {
              label: this.translate.instant('sidebar.delete-folder'),
              icon: 'pi pi-trash',
              command: () => {
                this.openDeleteFolderDialog(folderPath);
              }
            }
          ]
        },
        icon: 'pi pi-folder',
        expanded: true,
        children: [],
        droppable: true,
        draggable: true
      };

      folderNodes.set(folderPath, folderNode);

      if (parentPath === '') {
        assetsRoot.children?.push(folderNode);
      } else {
        const parentNode = folderNodes.get(parentPath);
        if (parentNode) {
          parentNode.children?.push(folderNode);
        } else {
          // Should not happen if sorted correctly and getFolders is consistent
          console.warn('Parent folder not found for', folderPath);
          assetsRoot.children?.push(folderNode); // Fallback
        }
      }
    });

    // 2. Add assets to their folders
    assets.forEach(asset => {
      const assetNode: TreeNode = {
        label: asset.name,
        data: {
          url: '/assets/' + asset.id,
          id: asset.id,
          type: 'asset',
          path: asset.path,
          contextMenu: [
            // ... same context menu as before but maybe 'Move'? 
            // Drag and drop covers move. 
            {
              label: this.translate.instant('sidebar.edit-rename-asset'),
              icon: 'pi pi-pencil',
              command: () => {
                this.openEditDialog(this.assetsService, asset.id,
                  this.translate.instant('sidebar.edit-rename-asset'));
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
              label: this.translate.instant('sidebar.delete-asset'),
              icon: 'pi pi-trash',
              command: () => {
                this.openDeleteDialog(asset.id, this.assetsService);
              }
            }
          ],
        },
        icon: this.getAssetIcon(asset),
        styleClass: 'asset-file',
        draggable: true,
        droppable: false,
      };

      if (asset.path && folderNodes.has(asset.path)) {
        folderNodes.get(asset.path)?.children?.push(assetNode);
      } else {
        assetsRoot.children?.push(assetNode);
      }
    });

    // Sort children: Folders first, then Files. Alphabetical.
    const sortNodes = (nodes: TreeNode[] | undefined) => {
      if (!nodes) return;
      nodes.sort((a, b) => {
        const typeA = a.data.type === 'asset-folder' ? 0 : 1;
        const typeB = b.data.type === 'asset-folder' ? 0 : 1;
        if (typeA !== typeB) return typeA - typeB;
        return (a.label || '').localeCompare(b.label || '');
      });
      nodes.forEach(n => sortNodes(n.children));
    };
    sortNodes(assetsRoot.children);

    updatedFiles.push(assetsRoot);

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

  public openDeleteDialog(entityId: any, service: EntityService<any, any>) {
    this.confirmationService.confirm({
      message: this.translate.instant('sidebar.confirm-entity-delete-message'),
      header: this.translate.instant('sidebar.delete-entity'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        service?.delete(entityId).then(deleted => {
          this.messageService.add({
            severity: 'success', summary: 'Successful',
            detail: this.translate.instant('sidebar.entity-deleted'), life: 3000
          });
        });
      }
    });
  }

  public async openCreateDocumentDialog(service: EntityService<any, any>, dialogTitle: string) {
    // Create a random name for the new document
    const randomName = `README-${Math.random().toString(36).substr(2, 9)}`;
    const blob = await firstValueFrom(this.httpClient.get('assets/README-TEMPLATE.md', { responseType: 'blob' }));
    const defaultContent = await blob.text();
    this.entity = {
      name: randomName,
      mime: 'text/markdown',
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

  public onEntityCreated(entity: any) {
    if (this.service === this.decksService) {
      console.log('Deck created, creating system attributes for deck ' + entity.id);
      this.cardAttributesService.createSystemAttributes(entity.id);
    }
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
      this.entity = { ...entity };
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

  private updateDirtyIndicators() {
    if (!this.electronService.isElectron()) {
      return;
    }
    const traverse = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        if (node.data && node.data.type && node.data.id) {
          const isDirty = this.projectStateService.isEntityDirty(node.data.type, node.data.id);
          if (isDirty) {
            if (!node.label?.endsWith('*')) {
              node.label = node.label + ' *';
              node.styleClass = (node.styleClass || '') + ' dirty-node';
            }
          } else {
            if (node.label?.endsWith(' *')) {
              node.label = node.label?.substring(0, node.label.length - 2);
              node.styleClass = node.styleClass?.replace('dirty-node', '').trim();
            }
          }
        }
        if (node.children) {
          traverse(node.children);
        }
      });
    };
    traverse(this.files);
  }

  validateDrop(dragNode: TreeNode, dropNode: TreeNode): boolean {
    if (!dragNode.data || !dropNode.data) return false;

    if (dragNode.data.type === 'asset') {
      // Assets can go to folders, root, or other assets (sibling drop)
      return ['asset-folder', 'asset-root', 'asset'].includes(dropNode.data.type);
    }
    if (dragNode.data.type === 'template') {
      // Templates can only go to decks
      return dropNode.data.type === 'deck';
    }
    if (dragNode.data.type === 'asset-folder') {
      // Folders can go to other folders, root, or sibling assets
      return ['asset-folder', 'asset-root', 'asset'].includes(dropNode.data.type);
    }
    return false;
  }

  async onNodeDrop(event: TreeNodeDropEvent) {
    console.log('onNodeDrop', event);
    const dragNode = event.dragNode;
    const dropNode = event.dropNode;

    if (!dragNode || !dropNode) return;

    if (!this.validateDrop(dragNode, dropNode)) {
      console.warn('Invalid drop, reverting');
      this.updateFiles(); // Revert UI
      return;
    }

    // 1. Handle Asset Move
    if (dragNode.data.type === 'asset') {
      const asset = await this.assetsService.get(dragNode.data.id);
      let targetPath = '';

      if (dropNode.data.type === 'asset-root') {
        targetPath = '';
      } else if (dropNode.data.type === 'asset-folder') {
        targetPath = dropNode.data.path;
      } else if (dropNode.data.type === 'asset') {
        // Dropped on sibling asset -> same folder
        targetPath = dropNode.data.path || '';
      }

      if (asset) {
        // Prevent moving to same location (reordering)
        if ((asset.path || '') === targetPath) {
          console.log('Dropped in same location, ignoring (reorder prevention)');
          this.updateFiles(); // Revert any UI reordering
          return;
        }

        const success = await this.assetsService.moveAsset(asset, targetPath);
        if (success) {
          this.messageService.add({ severity: 'success', summary: 'Moved', detail: `Moved ${asset.name} to ${targetPath || 'root'}` });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to move asset' });
          this.updateFiles();
        }
      }
    }

    // 2. Handle Card Template Move
    if (dragNode.data.type === 'template') {
      // Target must be a deck (validated above)
      if (dropNode.data.type === 'deck') {
        const templateId = dragNode.data.id;
        const targetDeckId = dropNode.data.id;

        // Current deck id? We can fetch the template
        const template = await this.templatesService.get(templateId);
        if (template && template.deckId !== targetDeckId) {
          template.deckId = targetDeckId;
          await this.templatesService.update(template.id, template);
          this.messageService.add({ severity: 'success', summary: 'Moved', detail: `Moved template to new deck` });
        } else {
          console.log('Dropped on same deck, ignoring (reorder prevention)');
          this.updateFiles();
        }
      }
    }
    // 3. Handle Asset Folder Move
    if (dragNode.data.type === 'asset-folder') {
      console.log('onNodeDrop: Handling Asset Folder Move');
      const folderPath = dragNode.data.path;
      const folderName = folderPath.split('/').pop();
      let targetParentPath = '';

      if (dropNode.data.type === 'asset-root') {
        targetParentPath = '';
      } else if (dropNode.data.type === 'asset-folder') {
        targetParentPath = dropNode.data.path;
      } else if (dropNode.data.type === 'asset') {
        // Dropped on sibling asset -> same parent folder
        targetParentPath = dropNode.data.path || '';
      }

      const newPath = targetParentPath ? targetParentPath + '/' + folderName : folderName;
      console.log(`onNodeDrop: Moving folder from ${folderPath} to ${newPath}`);

      // Prevent moving into itself or its own subfolder
      if (newPath === folderPath || newPath.startsWith(folderPath + '/')) {
        console.warn('Cannot move folder into itself or child');
        this.updateFiles();
        return;
      }

      this.assetsService.renameFolder(folderPath, newPath).then(success => {
        if (success) {
          this.messageService.add({ severity: 'success', summary: 'Moved', detail: `Moved folder to ${newPath}` });
          // UI should update via DB watcher
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to move folder' });
          this.updateFiles();
        }
      });
    }
  }

  public openCreateFolderDialog(parentPath: string) {
    // We repurpose the entity dialog but we need to supply a "Service" that has a create method.
    // Or we create a dummy service / override the behavior.
    // Simplified: Just use prompt() for now? No, better UX.
    // Use openCreateDialog with a proxy object having a create method.
    const folderService = {
      create: (entity: any) => {
        const folderName = entity.name;
        const fullPath = parentPath ? parentPath + '/' + folderName : folderName;
        return this.assetsService.createFolder(fullPath);
      },
      getFields: () => Promise.resolve([
        { field: 'name', header: 'Name', type: 'text' }
      ]),
      getLookups: () => Promise.resolve([]),
      getIdField: () => 'id',
    } as any;

    this.openCreateDialog(folderService, this.translate.instant('sidebar.create-new-folder'), { name: 'New Folder' });
  }

  public openRenameFolderDialog(currentPath: string) {
    const currentName = currentPath.split('/').pop() || '';
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));

    // Proxy service for rename
    const renameService = {
      create: (entity: any) => { // we hijack create to mean "save rename"
        const newName = entity.name;
        // If generic rename (just name change), new path is parent + newName
        let newPath = newName;
        if (parentPath) {
          newPath = parentPath + '/' + newName;
        }
        return this.assetsService.renameFolder(currentPath, newPath);
      },
      getFields: () => Promise.resolve([
        { field: 'name', header: 'Name', type: 'text' }
      ]),
      getLookups: () => Promise.resolve([]),
      getIdField: () => 'id'
    } as any;

    this.openCreateDialog(renameService, this.translate.instant('sidebar.edit-rename-folder'), { name: currentName });
  }

  public openDeleteFolderDialog(folderPath: string) {
    this.confirmationService.confirm({
      message: this.translate.instant('sidebar.confirm-folder-delete-message', { folderPath }),
      header: this.translate.instant('sidebar.delete-folder'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.assetsService.deleteFolder(folderPath).then(success => {
          if (success) {
            this.messageService.add({
              severity: 'success', summary: 'Successful',
              detail: this.translate.instant('sidebar.folder-deleted'), life: 3000
            });
            // Update files is automatic via DB sub? Or manual?
            // DB change triggers updateFiles, so we should be good.
          } else {
            this.messageService.add({
              severity: 'error', summary: 'Error',
              detail: 'Failed to delete folder', life: 3000
            });
          }
        });
      }
    });
  }

}
