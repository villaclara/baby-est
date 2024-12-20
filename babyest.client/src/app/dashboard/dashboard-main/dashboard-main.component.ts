import { Component, OnInit } from '@angular/core';
import { KidHeaderInfoComponent } from "../kid-header-info/kid-header-info.component";
import { MainTimerComponent } from "../main-timer/main-timer.component";
import { LastActivitiesComponent } from "../last-activities/last-activities.component";
import { KidService } from '../../services/KidService/kid.service';
import { CurrentKidService } from '../../services/CurrentKid/current-kid.service';
import { Kid } from '../../models/kid';
import { Router } from '@angular/router';
import { KidActivity } from '../../models/kid-activity';

@Component({
  selector: 'app-dashboard-main',
  standalone: true,
  imports: [KidHeaderInfoComponent, MainTimerComponent, LastActivitiesComponent],
  templateUrl: './dashboard-main.component.html',
  styleUrl: './dashboard-main.component.css'
})
export class DashboardMainComponent implements OnInit {

  kid: Kid = { Name: "KidTest", BirthDate: "2024-09-09", Parents: [], Activities: [] };
  lastSleepActivity: KidActivity = { ActivityType: "sleeping", Id: 0, KidName: "", StartDate: new Date(), EndDate: new Date() };
  lastEatActivity: KidActivity = { ActivityType: "eating", Id: 0, KidName: "", StartDate: new Date(), EndDate: new Date() };
  timeSinceLastSleep: number = 0;
  timeSinceLastEat: number = 0;
  kidAge: number = 0;
  kidId: number = 0;

  constructor(private kidService: KidService,
    private currentKidService: CurrentKidService,
    private router: Router
  ) {
    this.kidId = this.currentKidService.getCurrentKid();
  }


  ngOnInit(): void {

    // Get general info about Kid. Used in KidHeaderInfo Component
    this.kidService.getKidById(this.currentKidService.getCurrentKid())
      .subscribe((data: any) => {
        // bypass the redirectUrl by CookieAuthenticaiton of WebApi
        if (data == "403") {
          this.router.navigateByUrl('signin');
        }
        else {

          this.kid = {
            Name: data.name,
            BirthDate: data.birthDate,
            Activities: [],
            Parents: []
          };

          const birth = Date.parse(this.kid.BirthDate);
          const timeinmilliseconds = new Date().getTime() - birth;
          const millisecondsInDay: number = 1000 * 60 * 60 * 24;

          this.kidAge = Math.floor(timeinmilliseconds / millisecondsInDay);
        }
      });


    // Get Last Eating of Kid. Used in KidHeaderInfo Component.
    this.kidService.getLastEatingById(this.kidId)
      .subscribe((data: any) => {

        this.lastEatActivity = {
          StartDate: new Date(data.startDate),
          EndDate: new Date(data.endDate),
          KidName: data.kidName,
          ActivityType: data.activityType,
          Id: data.Id
        };
        this.timeSinceLastEat = Math.floor((new Date().getTime() - this.lastEatActivity.EndDate.getTime()) / 1000);
      });

    // Get Last Sleep Kid. Used in KidHeaderInfo Component.
    this.kidService.getLastSleepById(this.kidId)
      .subscribe((data: any) => {

        this.lastSleepActivity = {
          StartDate: new Date(data.startDate),
          EndDate: new Date(data.endDate),
          KidName: data.kidName,
          ActivityType: data.activityType,
          Id: data.Id
        };
        this.timeSinceLastSleep = Math.floor((new Date().getTime() - this.lastSleepActivity.EndDate.getTime()) / 1000);
      });
  }


}
