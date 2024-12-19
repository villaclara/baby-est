import { Component, Input, OnInit } from '@angular/core';
import { Kid } from '../../models/kid';
import { CurrentKidService } from '../../services/CurrentKid/current-kid.service';
import { timer } from 'rxjs';
import { TimerCounterPipe } from '../../pipes/timer-counter-pipe.pipe';
import { ShortTimerCounterPipe } from '../../pipes/short-timer-counter.pipe';

@Component({
  selector: 'app-kid-header-info',
  standalone: true,
  imports: [ShortTimerCounterPipe],
  templateUrl: './kid-header-info.component.html',
  styleUrl: './kid-header-info.component.css'
})
export class KidHeaderInfoComponent implements OnInit{
  
  constructor() {
  }
  
  @Input() kid : Kid = { Name: "KidTest", BirthDate: "2024-09-10", Parents : [], Activities : []};
  @Input() kidAge : number = 0;
  @Input() timeSinceLastSleep : number = 0;
  @Input() timeSinceLastEat : number = 0;
  ngOnInit(): void {
    timer(1, 1000).subscribe(() => {this.timeSinceLastEat +=1; this.timeSinceLastSleep +=1; })

  }

  
}
