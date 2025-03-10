import { Component, OnInit } from '@angular/core';
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
export class HomeComponent implements OnInit {
  mainLink : string;
  activeKidNumber : number = 0;

  themeClassStr: string = 'lightTheme';

  constructor(
    private currentKidService: CurrentKidService, 
    private router : Router) {

    this.mainLink = "/main/" + currentKidService.getCurrentKid();
    currentKidService.kidChanged$.subscribe(data => this.mainLink = ("/main/" + data));
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



  ngOnInit(): void {
    this.currentKidService.kidChanged$.subscribe((newNumber) => { this.activeKidNumber = newNumber; });
    this.currentKidService.themeChanged$.subscribe((newTheme) => { this.themeClassStr = newTheme });

    this.themeClassStr = this.currentKidService.getTheme();
  }


   
}
