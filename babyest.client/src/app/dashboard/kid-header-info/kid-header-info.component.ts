import { Component, Input, OnInit } from '@angular/core';
import { Kid } from '../../models/kid';
import { CurrentKidService } from '../../services/CurrentKid/current-kid.service';
import { timer } from 'rxjs';
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
export class KidHeaderInfoComponent implements OnInit{
  
  @Input() kid : Kid = { Name: "KidTest", BirthDate: "2024-09-10", Parents : [], Activities : []};
  @Input() kidAge : number = 0;
  @Input() timeSinceLastSleep : number = 0;
  @Input() timeSinceLastEat : number = 0;

  ngOnInit(): void {
    timer(1, 1000).subscribe(() => { 
      if (this.timeSinceLastEat >= 0) {
        this.timeSinceLastEat +=1; }
        
      if (this.timeSinceLastSleep >=0) {
        this.timeSinceLastSleep +=1; }
      } 
    );
        
  }

  
}
