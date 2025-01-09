import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CurrentKidService } from '../services/CurrentKid/current-kid.service';
import { Subject } from 'rxjs';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterLinkActive, NgStyle],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  mainLink : string;
  activeKidNumber : number = 0;

  numb : Subject<number> = new Subject<number>();
  constructor(private currentKidService: CurrentKidService, private router : Router) {
    // this.mainLink = "/main/" + currentKidService.getCurrentKid();


    this.mainLink = "/main/" + currentKidService.getCurrentKid();
    currentKidService.changeEmitted$.subscribe(data => this.mainLink = ("/main/" + data));
    this.activeKidNumber = currentKidService.getCurrentKid();

    // If the route is 'parent' then we do not wanna redirect to main. We try to redirect to parent.
    if(this.router.url != "/parent")
    {

      // On first launch navigate to the dashboard of the active Kid set on previous session
      if(currentKidService.getCurrentKid() == 0)
        {
          this.router.navigateByUrl('/parent');
        }
        else 
        this.router.navigateByUrl('/main/' + this.currentKidService.getCurrentKid());
    }
   
   }

   
}
