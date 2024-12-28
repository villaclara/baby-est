import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SingleActivityComponent } from '../../single-activity/single-activity.component';
import { KidActivity } from '../../models/kid-activity';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-last-activities',
  standalone: true,
  imports: [SingleActivityComponent, NgFor],
  templateUrl: './last-activities.component.html',
  styleUrl: './last-activities.component.css'
})
export class LastActivitiesComponent{
  @Input() activities : KidActivity[] = [];

  constructor() { }
  
}
