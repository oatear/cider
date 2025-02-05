import { Component, OnInit, Input } from '@angular/core';
import { CdkDragDrop, transferArrayItem, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-horizontal-block',
  templateUrl: './horizontal-block.component.html',
  styleUrls: ['./horizontal-block.component.scss']
})
export class HorizontalBlockComponent {
  @Input() block!: { type: string; [key: string]: any };
  dropListId: string = "";
  
  ngOnInit(): void {
    this.dropListId = this.generateDropListId()
  }

  generateDropListId(): string {
    return `block-${this.block.type}-${Math.random().toString(36).substring(2, 15)}`;
  }

  // drop(event: CdkDragDrop<any[]>) {
  //   moveItemInArray(this.block['children'], event.previousIndex, event.currentIndex);
  // }
  
  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      // Reorder within the same container
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Transfer between containers
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  getConnectedDropLists(): string[] {
    // Generate a list of all `cdkDropList` IDs to connect
    return this.getAllDropListIds(this.block['children']);
  }

  private getAllDropListIds(blocks: any[]): string[] {
    const ids: string[] = [];
    blocks.forEach((block) => {
      ids.push(`block-${block.type}`);
      if (block['children']) {
        ids.push(...this.getAllDropListIds(block['children']));
      }
    });
    return ids;
  }
}
