import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-site-activitybar',
  templateUrl: './site-activitybar.component.html',
  styleUrl: './site-activitybar.component.scss'
})
export class SiteActivitybarComponent {
  @Input() selectedActivity: string = 'explorer';
  @Output() selectedActivityChange: EventEmitter<string> = new EventEmitter<string>();

  public settingsDialogVisible: boolean = false;
  public menuItems: MenuItem[] = [
    {
      label: 'Explorer',
      icon: 'pi pi-fw pi-folder',
      tooltip: 'Explorer',
      tooltipPosition: 'right',
      command: () => {
        if (this.selectedActivity == 'explorer') {
          this.selectedActivity = '';
        } else {
          this.selectedActivity = 'explorer';
        }
        this.selectedActivityChange.emit(this.selectedActivity);
        console.log('Explorer activity selected:', this.selectedActivity);
      }
    },
    {
      label: 'AI Tools',
      icon: 'pi pi-fw pi-sparkles',
      tooltip: 'AI Tools',
      tooltipPosition: 'right',
      command: () => {
        if (this.selectedActivity == 'ai-tools') {
          this.selectedActivity = '';
        } else {
          this.selectedActivity = 'ai-tools';
        }
        this.selectedActivityChange.emit(this.selectedActivity);
      }
    },
    {
      label: 'Create New Project',
      icon: 'pi pi-fw pi-plus',
      tooltip: 'Create New Project',
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
