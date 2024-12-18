import { Component, Input, OnInit } from '@angular/core';
import { Kid } from '../../models/kid';
import { CurrentKidService } from '../../services/CurrentKid/current-kid.service';

@Component({
  selector: 'app-kid-header-info',
  standalone: true,
  imports: [],
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


  }

  
}
