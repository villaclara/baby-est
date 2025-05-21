import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private onlineStatus = new BehaviorSubject<boolean>(navigator.onLine);
  public onlineStatus$ = this.onlineStatus.asObservable();

  public currentNetworkStatus: boolean = false;

  constructor(private zone: NgZone) {
    window.addEventListener('online', () => {
      this.zone.run(() => this.updateOnlineStatus(true));
    });

    window.addEventListener('offline', () => {
      this.zone.run(() => this.updateOnlineStatus(false));
    });
  }


  public checkOnlineStatusManually(): boolean {
    console.log("check network manually once");
    this.currentNetworkStatus = navigator.onLine;
    return navigator.onLine;
  } 
    

  private updateOnlineStatus(isOnline: boolean) {
    console.log("updateonlinestatus - " + isOnline);
    this.currentNetworkStatus = isOnline;
    this.onlineStatus.next(isOnline);
  }
}