import { Component, OnInit } from '@angular/core';
import { SingleActivityComponent } from '../../single-activity/single-activity.component';
import { KidService } from '../../services/KidService/kid.service';
import { KidActivity } from '../../models/kid-activity';
import { CurrentKidService } from '../../services/CurrentKid/current-kid.service';
import { NgFor, NgIf } from '@angular/common';
import { LoadingSpinnerComponent } from "../../loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [SingleActivityComponent, NgFor, NgIf, LoadingSpinnerComponent],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  
  constructor(private kidService : KidService,
    private currentKidService : CurrentKidService
  ) { }

  activities : KidActivity[] = [];

  isLoading: boolean = true;

  ngOnInit(): void {
    const currentKidId = this.currentKidService.getCurrentKid();
    this.kidService.getKidActivitiesById(currentKidId).subscribe({
      next: (data : KidActivity[]) => {
        this.activities = data;
        this.isLoading = false;
      },
      error: (err) => console.log(err.message)
    })
  }

  
}
