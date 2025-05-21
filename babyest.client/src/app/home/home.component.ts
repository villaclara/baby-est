import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CurrentKidService } from '../services/CurrentKid/current-kid.service';
import { Subject } from 'rxjs';
import { NgStyle, NgClass } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { ThemeCheckerService } from '../services/ThemeChecker/theme-checker.service';
import { NetworkService } from '../services/NetworkService/network-service.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterLinkActive, NgStyle, NgClass],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  mainLink : string;
  activeKidNumber : number = 0;

  themeClassStr: string = 'lightTheme';
  themeClassStr1: string = 'lightTheme';

  wifiIcon: string = '';

  constructor(
    private currentKidService: CurrentKidService, 
    private router : Router,
    private meta: Meta,
    private themeChecker : ThemeCheckerService,
    private networkService: NetworkService) {

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
    this.currentKidService.themeChanged$.subscribe((newTheme) => { 
      this.themeClassStr = newTheme;
      document.body.classList.remove(this.themeClassStr1);
      this.themeClassStr1 = newTheme == 'darkTheme' ? 'darkTheme1' : 'lightTheme1';
      document.body.classList.add(this.themeClassStr1); 
      this.meta.updateTag({name: 'theme-color', content: newTheme == 'darkTheme' ? '#38424d' : '#ffffff'})});

    this.themeClassStr = this.currentKidService.getTheme();
    this.themeClassStr1 = this.currentKidService.getTheme() == 'darkTheme' ? 'darkTheme1' : 'lightTheme1';
    this.meta.updateTag({name: 'theme-color', content: this.themeClassStr == 'darkTheme' ? '#38424d' : '#ffffff'});

    this.themeChecker.startDoingAction();

    // this.wifiIcon = this.networkService.checkOnlineStatusManually() ? 'bi-wifi text-white' : 'bi-wifi-off text-secondary';
    this.networkService.onlineStatus$.subscribe(isOnline => 
    {
      console.log("online changed. call home component - " + isOnline);
      this.wifiIcon = isOnline ? 'bi-wifi text-success' : 'bi-wifi-off text-secondary';
    }
    )

  }


   
}
