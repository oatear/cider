import { Component, OnInit } from '@angular/core';
import { MenuItem, TreeNode } from 'primeng/api';
import { DecksService } from '../data-services/services/decks.service';
import { AssetsService } from '../data-services/services/assets.service';
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import { ElectronService } from '../data-services/electron/electron.service';
import { debounceTime, firstValueFrom } from 'rxjs';
import StringUtils from '../shared/utils/string-utils';
import { TreeNodeSelectEvent } from 'primeng/tree';
import { Router } from '@angular/router';

@Component({
  selector: 'app-site-sidebar',
  templateUrl: './site-sidebar.component.html',
  styleUrls: ['./site-sidebar.component.scss']
})
export class SiteSidebarComponent implements OnInit {
  files: TreeNode[] = [];
  selectedFile: TreeNode | null = null;
  menuItems: MenuItem[] = [];
  updatingFiles: boolean = false;

  constructor(private decksService: DecksService,
    private assetsService: AssetsService,
    private templatesService: CardTemplatesService,
    private electronService: ElectronService,
    private router: Router) {
    // Initialize or fetch any necessary data here
    // observe the decks and templates
    // for every deck, fetch every template and create a tree node
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
    // this.electronService.getProjectHomeUrl()
    // get project home URL from Electron service
    const updatedFiles: TreeNode[] = [];
    // this.files = []; // Reset files array
    // this.files.push({
    //   label: 'Project Home',
    //   data: this.electronService.getProjectHomeUrl(),
    //   icon: 'pi pi-home',
    //   url: this.electronService.getProjectHomeUrl()
    // });
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
          url: '/readme',
        },
        icon: 'pi pi-file',
        styleClass: 'readme-file'
      });
    });
    await this.decksService.getAll().then(decks => {
      let deckFolderChildren: TreeNode[] = [];
      decks.forEach(deck => {
        let deckChildren: TreeNode[] = [];

        deckChildren.push({
          label: 'Cards',
          data: {
            url: '/decks/' + deck.id + '/cards/listing',
          },
          icon: 'pi pi-list',
          styleClass: 'card-listing',
        });

        deckChildren.push({
          label: 'Thumbnails',
          data: {
            url: '/decks/' + deck.id + '/cards/thumbnails',
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

        this.templatesService.getAllUnfiltered({deckId: (deck || {}).id}).then(templates => 
          templates.forEach(template => {
            deckChildren.push({
              label: template.name,
              data: {
                url: '/decks/' + deck.id + '/card-templates',
                removeAction: () => {},
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
            addAction: () => {},
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
          addAction: () => {},
        },
        icon: 'pi pi-folder',
        expanded: true,
        children: deckFolderChildren
      };
      updatedFiles.push(decksFolder);

    });

    await this.assetsService.getAll().then(assets => {
      updatedFiles.push({
        label: 'Assets',
        data: {
          url: '/assets',
          addAction: () => {},
        },
        icon: 'pi pi-folder',
        expanded: true,
        children: assets.map(asset => ({
          label: asset.name,
          data: {
            url: '/assets/' + asset.id,
          },
          icon: 'pi pi-image',
          styleClass: 'asset-file',
        }))
      });
    });

    this.files = updatedFiles;
    this.updatingFiles = false;
  }

  onNodeSelect(event: TreeNodeSelectEvent) {
    const selectedNode = event.node;
    if (selectedNode.data && typeof selectedNode.data === 'object' && 'url' in selectedNode.data) {
      // If the node has a URL, open it
      this.router.navigateByUrl(selectedNode.data.url, { skipLocationChange: false });
    }
  }

}
