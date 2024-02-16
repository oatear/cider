import { Component, OnInit } from '@angular/core';
import { VariablesService } from '../data-services/services/variables.service';

@Component({
  selector: 'app-variables',
  templateUrl: './variables.component.html',
  styleUrls: ['./variables.component.scss']
})
export class VariablesComponent {

  constructor(public variablesService: VariablesService) { }

}
