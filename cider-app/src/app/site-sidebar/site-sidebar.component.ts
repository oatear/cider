import { Component, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { DecksService } from '../data-services/services/decks.service';
import { AssetsService } from '../data-services/services/assets.service';
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import { ElectronService } from '../data-services/electron/electron.service';
import { firstValueFrom } from 'rxjs';
import StringUtils from '../shared/utils/string-utils';
import { TreeNodeSelectEvent } from 'primeng/tree';
import { Router } from '@angular/router';
import { style } from '@angular/animations';

@Component({
  selector: 'app-site-sidebar',
  templateUrl: './site-sidebar.component.html',
  styleUrls: ['./site-sidebar.component.scss']
})
export class SiteSidebarComponent implements OnInit {
  files: TreeNode[] = [];
  selectedFile: TreeNode | null = null;

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
    // this.decksService.getAll().then(decks => {
    //   this.files = [
    //     { label: 'Decks', data: 'Decks', expandedIcon: 'pi pi-folder-open', collapsedIcon: 'pi pi-folder', children: [] },
    //     { label: 'Assets', data: 'Assets', expandedIcon: 'pi pi-folder-open', collapsedIcon: 'pi pi-folder', children: [] },
    //     { label: 'Templates', data: 'Templates', expandedIcon: 'pi pi-folder-open', collapsedIcon: 'pi pi-folder', children: [] }
    //   ];
    //   decks.forEach(deck => {
    //     this.files[0].children!.push({ label: deck.name, data: deck.id, icon: 'pi pi-file' });
    //   });
    // });
  }

  updateFiles() {
    // this.electronService.getProjectHomeUrl()
    // get project home URL from Electron service
    this.files = []; // Reset files array
    // this.files.push({
    //   label: 'Project Home',
    //   data: this.electronService.getProjectHomeUrl(),
    //   icon: 'pi pi-home',
    //   url: this.electronService.getProjectHomeUrl()
    // });
    firstValueFrom(this.electronService.getProjectHomeUrl()).then(homeUrl => {
      let projectName = StringUtils.lastDirectoryFromUrl(homeUrl || 'Project');
      this.files.push({
        label: projectName,
        data: {
          url: '/decks',
        },
        icon: 'pi pi-home',
        styleClass: 'project-home',
      });
      this.files.push({
        label: 'README',
        data: {
          url: '/readme',
        },
        icon: 'pi pi-file',
        styleClass: 'readme-file'
      });
    });
    this.decksService.getAll().then(decks => {
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

        this.templatesService.getAllUnfiltered({deckId: (deck || {}).id}).then(templates => 
          templates.forEach(template => {
            deckChildren.push({
              label: template.name,
              data: {
                url: '/decks/' + deck.id + '/card-templates',
              },
              icon: 'pi pi-id-card',
              styleClass: 'card-template',
            })
          }
        ));

        let file = {
          label: deck.name,
          data: deck.id,
          icon: 'pi pi-file',
          styleClass: 'deck-file',
          expanded: true,
          // styleClass: 'selected-deck',
          children: deckChildren
        };
        this.files.push(file);
      });
    });

    this.assetsService.getAll().then(assets => {
      this.files.push({
        label: 'Assets',
        data: {
          url: '/assets',
        },
        icon: 'pi pi-folder',
        children: assets.map(asset => ({
          label: asset.name,
          data: asset.id,
          icon: 'pi pi-image',
          styleClass: 'asset-file',
        }))
      });
    });

    // this.templatesService.getAll().then(templates => {
    //   console.log('Templates:', templates);
    //   this.files.push({
    //     label: 'Templates',
    //     data: 'Templates',
    //     children: templates.map(template => ({
    //       label: template.name,
    //       data: template.id,
    //       icon: 'pi pi-file'
    //     }))
    //   });
    // });
  }

  onNodeSelect(event: TreeNodeSelectEvent) {
    const selectedNode = event.node;
    if (selectedNode.data && typeof selectedNode.data === 'object' && 'url' in selectedNode.data) {
      // If the node has a URL, open it
      this.router.navigateByUrl(selectedNode.data.url, { skipLocationChange: false });
    }
  }


}
