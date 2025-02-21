import { Component, input, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SingleActivityComponent } from '../../single-activity/single-activity.component';
import { KidActivity } from '../../models/kid-activity';
import { NgFor, NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-last-activities',
  standalone: true,
  imports: [SingleActivityComponent, NgFor, NgIf, NgClass],
  templateUrl: './last-activities.component.html',
  styleUrl: './last-activities.component.css'
})
export class LastActivitiesComponent{
  @Input() activities : KidActivity[] = [];
  @Input() showPlaceholder: boolean = true;

  constructor() { }
  
}
