import { Component, OnInit } from '@angular/core';
import { SingleActivityComponent } from '../../single-activity/single-activity.component';
import { KidService } from '../../services/KidService/kid.service';
import { KidActivity } from '../../models/kid-activity';
import { CurrentKidService } from '../../services/CurrentKid/current-kid.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [SingleActivityComponent, NgFor],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  
  constructor(private kidService : KidService,
    private currentKidService : CurrentKidService
  ) { }

  activities : KidActivity[] = [];

  ngOnInit(): void {
    const currentKidId = this.currentKidService.getCurrentKid();
    this.kidService.getKidActivitiesById(currentKidId).subscribe({
      next: (data : KidActivity[]) => {
        this.activities = data;
      },
      error: (err) => console.log(err.message)
    })
  }

  
}
