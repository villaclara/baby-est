import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { map, Subscription, takeWhile, timer } from 'rxjs';


@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [NgIf],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.css'
})
export class ErrorPageComponent implements OnInit, OnDestroy {

  constructor(private router: Router) {  }
  
  
  ngOnDestroy(): void {
    this.timerSubscription.unsubscribe();
  }
    
  ngOnInit(): void {


    // double check if the timer is not running
    if(this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    this.timerStarted = true;
    this.timerSubscription = timer(1, 1000).pipe(
      map((tick) => 10 - tick),
      takeWhile((value) => value >= 0)
    ).subscribe({
      next: (value) => { 
        this.timeToReload = value;
      },
      complete: () => {
        this.timerStarted = false;
        this.reloadPage();
      }
    });

  }

  @Input() errorMessage: string = "";

  timeToReload: number = 10;

  @Input() pageLinkToReload: string = "/";

  timerStarted: boolean = false;
  private timerSubscription!: Subscription; // to unsubsrcibe from timer to properly dispose it

  reloadPage() : void {
    this.router.navigateByUrl("/", {skipLocationChange : true}).then(
      () => this.router.navigateByUrl(this.pageLinkToReload)
    );
  }
}
