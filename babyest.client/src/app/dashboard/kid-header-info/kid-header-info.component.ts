import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Kid } from '../../models/kid';
import { CurrentKidService } from '../../services/CurrentKid/current-kid.service';
import { interval, Subject, Subscription, timer } from 'rxjs';
import { TimerCounterPipe } from '../../pipes/timer-counter.pipe';
import { ShortTimerCounterPipe } from '../../pipes/short-timer-counter.pipe';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-kid-header-info',
  standalone: true,
  imports: [ShortTimerCounterPipe, NgIf],
  templateUrl: './kid-header-info.component.html',
  styleUrl: './kid-header-info.component.css'
})
export class KidHeaderInfoComponent implements OnInit, OnDestroy{
  
  
  @Input() kid! : Kid;
  @Input() kidAge! : number;
  @Input() timeSinceLastSleep : number = -1;
  @Input() timeSinceLastEat : number = -1;
  @Input() showPlaceholder: boolean = true;

  timerSubscription : Subscription = new Subscription();

  ngOnInit(): void {


    this.timerSubscription = timer(1, 1000).subscribe(() => { 

      if (this.timeSinceLastEat >= 0) {
        this.timeSinceLastEat +=1; }
        
      if (this.timeSinceLastSleep >=0) {
        this.timeSinceLastSleep +=1; }
      } 
    );
        
    console.log("oninit kid-header-info-comp called.");
  }


  ngOnDestroy(): void {
    this.timerSubscription.unsubscribe();
    this.timeSinceLastEat = -1;
    this.timeSinceLastSleep = -1;
    console.log("ondestroy kid-header-info-component called.");
  }
  
}
