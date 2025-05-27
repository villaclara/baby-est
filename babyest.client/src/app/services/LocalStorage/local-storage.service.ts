import { Injectable } from '@angular/core';
import { Kid } from '../../models/kid';
import { KidActivity } from '../../models/kid-activity';
import { KidService } from '../KidService/kid.service';
import { CurrentKidService } from '../CurrentKid/current-kid.service';
import { Subject } from 'rxjs';
import { SyncStatus } from '../../models/sync-status';
import { SyncStatusPendingActsComponent } from '../../home/sync-status-pending-acts/sync-status-pending-acts.component';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {


  private _pendingActs: KidActivity[] = [];
  private _canDeletePendingActs: boolean = false;

  failedSyncActs: KidActivity[] = [];

  pendingActsChanged$: Subject<number> = new Subject<number>();

  syncStatusChanged$: Subject<SyncStatus> = new Subject<SyncStatus>();

  syncCompletedWithResult$: Subject<boolean> = new Subject<boolean>();

  private _currentState: SyncStatus = SyncStatus.Nothing;
  set currentSyncState(value: SyncStatus) {
    this._currentState = value;
    console.log("set new value to current state in localstorage - " + value);
    this.syncStatusChanged$.next(this._currentState);
  }

  get currentSyncState(): SyncStatus {
    console.log("get curernt state in local - " + this._currentState);
    return this._currentState;
  }

  constructor(private actService: KidService,
    private currentKidService: CurrentKidService) { }

  addKidHeaderInfoToLocalStorage(kid: Kid): void {
    localStorage.setItem("kidinfo", JSON.stringify(kid));
  }

  getKidHeaderInfoFromLocalStorage(): Kid {
    return JSON.parse(localStorage.getItem("kidinfo")!);
  }

  addLastEatingToLocalStorage(act: KidActivity): void {
    localStorage.setItem("lasteating", JSON.stringify(act));
  }

  getLastEatingFromLocalStorage(): KidActivity {
    return JSON.parse(localStorage.getItem("lasteating")!);
  }

  addLastSleepingToLocalStorage(act: KidActivity): void {
    localStorage.setItem("lastsleeping", JSON.stringify(act));
  }

  getLastSleepingFromLocalStorage(): KidActivity {
    return JSON.parse(localStorage.getItem("lastsleeping")!);
  }

  addLastActivitiesToLocalStorage(acts: KidActivity[]): void {
    localStorage.setItem("lastacts", JSON.stringify(acts));
  }

  getLastActivitiesFromLocalStorage(): KidActivity[] {
    return JSON.parse(localStorage.getItem("lastacts")!);
  }

  addCurrentActivityToLocalStorage(act: KidActivity) {
    localStorage.setItem("currentact", JSON.stringify(act));

  }

  // Probably no need as we get Current ACTIVE activity from Last acts
  // getCurrentActivityFromLocalStorage(): KidActivity {

  // }


  addActToPendingActs(act: KidActivity): void {

    // IN case of stopping the activity (updating it)
    // remove ACTIVE actitivy from list of pending with isActive = true 
    const index = this._pendingActs.findIndex(act => act.IsActiveNow === true);
    if (index != -1) {
      this._pendingActs.splice(index, 1);
    }

    // add activity to list
    this._pendingActs.push(act);

    localStorage.setItem("pendingacts", JSON.stringify(this._pendingActs));

    this.pendingActsChanged$.next(this._pendingActs.length);

    this.currentSyncState = SyncStatus.Pending;
  }

  getPendingActsFromLocalStorage(): KidActivity[] {
    const localacts = localStorage.getItem("pendingacts");
    if (localacts != null) {
      this._pendingActs = JSON.parse(localacts);
    }
    else {
      this._pendingActs = [];
    }
    return this._pendingActs;
  }


  private clearPendingActs(): void {
    console.log("call clear pending acts - value - " + this._canDeletePendingActs);

    // If nothing to delete or any other reason we return
    if (!this._canDeletePendingActs) {
      return;
    }
    localStorage.removeItem("pendingacts");
    this._pendingActs = [];
    this._canDeletePendingActs = false;
    this.pendingActsChanged$.next(this._pendingActs.length);

    this.currentSyncState = SyncStatus.Nothing;

  }

  synchronizePendingActs(): void {

    // nothing to sync, no pending acts
    if (this._pendingActs.length === 0) {
      console.log("nothing to sync. return");
      this._canDeletePendingActs = false;
      return;
    }

    this.currentSyncState = SyncStatus.Synchronizing;

    let completedCount = 0;
    const totalRequests = this._pendingActs.length;

    const checkAllDone = () => {
      completedCount++;
      if (completedCount === totalRequests) {
        console.log('All requests completed');

        // after synchronizing we set to true
        console.log("end of foreach loop in synch changes - value - " + this._canDeletePendingActs);
        this._canDeletePendingActs = true;

        // change current Sync State to Success/Fail after a bit delay if the requests were done very quickly 
        setTimeout(() => {
          this.currentSyncState = this.failedSyncActs.length != 0 ? SyncStatus.SyncError : SyncStatus.SyncSuccess;

          // here we emit bool value if reqeust success to FailedSyncActivities PAGE to be displayed also with delay
          setTimeout(() => {
            this.syncCompletedWithResult$.next(this.currentSyncState == SyncStatus.SyncSuccess ? true : false);

            // clearing acts anyway
            this.clearPendingActs();
          }, 500);
        }, 500);
      }
    };

    console.log("start of foreach loop in synch changes - value - " + this._canDeletePendingActs);
    // this.canDeletePendingActs = true;
    this._pendingActs.forEach(element => {

      // If Id == -1 it means that the activity was started OFFLINE so we need to Add to API
      if (element.Id != -1) {
        this.actService.updateActivity(this.currentKidService.getCurrentKid(), element)
          .subscribe({
            next: () => {
              console.log(`act updated - ${element.Id}`);
            },
            error: () => {
              this.failedSyncActs.push(element);
            },
            complete: checkAllDone
          });
      }
      else {
        this.actService.addActivityToKid(this.currentKidService.getCurrentKid(), element)
          .subscribe({
            next: () => {
              console.log(`act added - ${element.Id}, ${element.ActivityType}`);
            },
            error: () => {
              this.failedSyncActs.push(element);
            },
            complete: checkAllDone
          });
      }
      console.log("called action for element id in array - ");
    });
  }

}
