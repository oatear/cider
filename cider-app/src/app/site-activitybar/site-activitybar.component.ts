import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-site-activitybar',
  templateUrl: './site-activitybar.component.html',
  styleUrl: './site-activitybar.component.scss'
})
export class SiteActivitybarComponent {
  public settingsDialogVisible: boolean = false;
  public menuItems: MenuItem[] = [
    {
      label: 'Explorer',
      icon: 'pi pi-fw pi-folder',
      tooltip: 'Explorer',
      tooltipPosition: 'right',
    },
    {
      label: 'AI Tools',
      icon: 'pi pi-fw pi-sparkles',
      tooltip: 'AI Tools',
      tooltipPosition: 'right',
    },
    {
      label: 'Add Test',
      icon: 'pi pi-fw pi-plus',
      tooltip: 'Add Test',
      tooltipPosition: 'right',
    },
    {
      label: 'Settings',
      icon: 'pi pi-fw pi-cog',
      tooltip: 'Settings',
      tooltipPosition: 'right',
      styleClass: 'menu-item-bottom',
      command: () => {
        this.settingsDialogVisible = true;
      }
    },
  ];
  public isSaving: boolean = false;


  public logoClicked() {
    this.isSaving = true;
    setTimeout (() => {
      this.isSaving = false;
    }, 1800);
  }
}
