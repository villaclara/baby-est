import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CurrentKidService } from '../services/CurrentKid/current-kid.service';
import { Subject } from 'rxjs';
import { NgStyle, NgClass, NgIf } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { ThemeCheckerService } from '../services/ThemeChecker/theme-checker.service';
import { NetworkService } from '../services/NetworkService/network-service.service';
import { LocalStorageService } from '../services/LocalStorage/local-storage.service';
import { SyncStatus } from '../models/sync-status';
import { SyncStatusPendingActsComponent } from "./sync-status-pending-acts/sync-status-pending-acts.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterLinkActive, NgStyle, NgClass, NgIf, SyncStatusPendingActsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  mainLink : string;
  activeKidNumber : number = 0;

  themeClassStr: string = 'lightTheme';
  themeClassStr1: string = 'lightTheme';

  wifiIcon: string = '';
  syncIconCurrent: string = '';

  pendingActsCount: number = 0;
  syncStatus: SyncStatus = SyncStatus.Nothing;

  displayFailSyncActs: boolean = false;

  constructor(
    private currentKidService: CurrentKidService, 
    private router : Router,
    private meta: Meta,
    private themeChecker : ThemeCheckerService,
    private networkService: NetworkService,
    private localStorageService: LocalStorageService) {

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
    console.log("Home comp oninit");
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

    // subscribe to changes in local storage service of pending acts count
    // to display the number of pending acts to sync in the header
    this.localStorageService.pendingActsChanged$.subscribe(value => this.pendingActsCount = value);

    console.log("syncstatus home - " + this.syncStatus);
    this.localStorageService.syncStatusChanged$.subscribe(value => {
      console.log("received value from local storage in home - " + value);
        this.syncStatus = value;
        switch(this.syncStatus) {
          case SyncStatus.Nothing: {
              this.syncIconCurrent = '';
              break;
            }
          case SyncStatus.Pending: {
              this.syncIconCurrent = 'bi bi-arrow-up';
              break;
          } 
          case SyncStatus.Synchronizing: {
            this.syncIconCurrent = 'bi bi-arrow-repeat';
            break;
          }
          case SyncStatus.SynchSuccess: {
            this.syncIconCurrent = 'bi bi-check-all';
            break;
          }
          case SyncStatus.SyncError: {
            this.syncIconCurrent = 'bi bi-x';
            break;
          }
          default: this.syncIconCurrent = '';
        } 
      });

    console.log("syncstatus home after switch - " + this.syncStatus);


    this.localStorageService.syncCompletedWithResult$.subscribe(value => { if(!value) { this.displayFailSyncActs = true; } });
  }


   
}
