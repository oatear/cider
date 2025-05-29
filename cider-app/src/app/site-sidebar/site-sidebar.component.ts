import { Component, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { DecksService } from '../data-services/services/decks.service';
import { AssetsService } from '../data-services/services/assets.service';
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import { ElectronService } from '../data-services/electron/electron.service';
import { firstValueFrom } from 'rxjs';
import StringUtils from '../shared/utils/string-utils';

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
    private electronService: ElectronService) {
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
        data: projectName,
        icon: 'pi pi-home'
      });
    });
    this.decksService.getAll().then(decks => {
      decks.forEach(deck => {
        let deckChildren: TreeNode[] = [];

        deckChildren.push({
          label: 'Cards',
          data: deck.id,
          icon: 'pi pi-list',
        });

        deckChildren.push({
          label: 'Thumbnails',
          data: deck.id,
          icon: 'pi pi-th-large',
        })

        deckChildren.push({
          label: 'Attributes',
          data: deck.id,
          icon: 'pi pi-cog',
        });

        this.templatesService.getAllUnfiltered({deckId: (deck || {}).id}).then(templates => 
          templates.forEach(template => {
            deckChildren.push({
              label: template.name,
              data: template.id,
              icon: 'pi pi-file',
            })
          }
        ));

        let file = {
          label: deck.name,
          data: deck.id,
          icon: 'pi pi-file',
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
        data: 'Assets',
        icon: 'pi pi-folder',
        children: assets.map(asset => ({
          label: asset.name,
          data: asset.id,
          icon: 'pi pi-image'
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

  onNodeSelect(event: any) {
    const selectedNode = event.node;
    if (selectedNode.data === 'Decks') {
      this.decksService.selectDeck(undefined);
    } else if (selectedNode.data === 'Assets') {
      // Handle asset selection
    } else if (selectedNode.data === 'Templates') {
      // Handle template selection
    } else {
      // Handle specific deck, asset, or template selection
      // const id = selectedNode.data;
      // if (this.decksService.getSelectedDeck()?.id !== id) {
      //   this.decksService.selectDeck(this.decksService.getAll().then(decks => decks.find(deck => deck.id === id)));
      // }
    }
  }


}
