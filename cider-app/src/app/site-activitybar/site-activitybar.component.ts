import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-site-activitybar',
  templateUrl: './site-activitybar.component.html',
  styleUrl: './site-activitybar.component.scss'
})
export class SiteActivitybarComponent {
  menuItems: MenuItem[] = [
    {
      label: 'Explorer',
      icon: 'pi pi-fw pi-folder',
    },
    {
      label: 'AI Tools',
      icon: 'pi pi-fw pi-sparkles',
    },
    {
      label: 'Add Test',
      icon: 'pi pi-fw pi-plus',
    },
    {
      label: 'Settings',
      icon: 'pi pi-fw pi-cog',
    },
  ];
  isSaving: boolean = false;


  public logoClicked() {
    this.isSaving = true;
    setTimeout (() => {
      this.isSaving = false;
    }, 1800);
  }
}
