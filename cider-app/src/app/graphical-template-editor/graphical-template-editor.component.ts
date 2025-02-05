import { Component } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-graphical-template-editor',
  templateUrl: './graphical-template-editor.component.html',
  styleUrls: ['./graphical-template-editor.component.scss'],
})
export class GraphicalTemplateEditorComponent {

  outerItems = [
    { name: 'Item 1', children: [{ name: 'Child 1' }, { name: 'Child 2' }] },
    { name: 'Item 2', children: [{ name: 'Child 3' }, { name: 'Child 4' }] }
  ];

  // drop(event: CdkDragDrop<any[]>) {
  //   if (event.previousContainer === event.container) {
  //     moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  //   } else {
  //     transferArrayItem(
  //       event.previousContainer.data,
  //       event.container.data,
  //       event.previousIndex,
  //       event.currentIndex
  //     );
  //   }
  // }

  movies = [
    'Episode I - The Phantom Menace',
    'Episode II - Attack of the Clones',
    'Episode III - Revenge of the Sith',
    'Episode IV - A New Hope',
    'Episode V - The Empire Strikes Back',
    'Episode VI - Return of the Jedi',
    'Episode VII - The Force Awakens',
    'Episode VIII - The Last Jedi',
    'Episode IX - The Rise of Skywalker',
  ];

  block = {
    type: 'default', 
    children: [
      { type: 'basic', text: 'Title', backgroundImage: null, style: { 'background-color': 'red' }},
      // { type: 'horizontal', children: [
      //   { type: 'basic', text: 'Left', style: { 'background-color': 'brown' }}, 
      //   { type: 'spacer', style: {'flex-grow': 1, 'background-color': 'teal' }}, 
      //   { type: 'basic', text: 'Right', style: { 'background-color': 'orange' }}
      // ], style: { 'background-color': 'blue' }},
      { type: 'spacer', style: {'flex-grow': 1, 'background-color': 'purple' }}, 
      { type: 'basic', text: 'Body', backgroundImage: null, style: { 'background-color': 'blue' }},
      { type: 'basic', text: 'Footer', backgroundImage: null, style: { 'background-color': 'green' }},
    ]
  };

  // drop(event: CdkDragDrop<string[]>) {
  //   moveItemInArray(this.movies, event.previousIndex, event.currentIndex);
  // }
}
