import { Injectable } from '@angular/core';
import { Kid } from '../../models/kid';
import { KidActivity } from '../../models/kid-activity';
import { KidService } from '../KidService/kid.service';
import { CurrentKidService } from '../CurrentKid/current-kid.service';
import { BehaviorSubject, finalize, Subject } from 'rxjs';
import { SyncStatus } from '../../models/sync-status';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {


  private _pendingActs: KidActivity[] = [];
  private _canDeletePendingActs: boolean = false;

  failedSyncActs: KidActivity[] = [];

  pendingActsChanged$: Subject<number> = new Subject<number>();

  syncStatusChanged$: Subject<SyncStatus> = new Subject<SyncStatus>();

  // behavior subject allows the last value to be received by subscribers if the subscribe after .next is called
  syncCompletedWithResult$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  private _currentState: SyncStatus = SyncStatus.Nothing;
  set currentSyncState(value: SyncStatus) {
    this._currentState = value;
    this.syncStatusChanged$.next(this._currentState);
  }

  get currentSyncState(): SyncStatus {
    return this._currentState;
  }

  constructor(private actService: KidService,
    private currentKidService: CurrentKidService) { }

  addKidHeaderInfoToLocalStorage(kid: Kid): void {
    localStorage.setItem("kidinfo", JSON.stringify(kid));
  }

  getKidHeaderInfoFromLocalStorage(): Kid {
    const value = localStorage.getItem("kidinfo");
    if(value != null)
    {
      return JSON.parse(value);
    }
    return { Name: "KidTest", BirthDate: "2024-09-09", Parents: [], Activities: [] }
  }

  addLastEatingToLocalStorage(act: KidActivity): void {
    localStorage.setItem("lasteating", JSON.stringify(act));
  }

  getLastEatingFromLocalStorage(): KidActivity {
    const value = localStorage.getItem("lasteating");
    if(value != null)
    {
      return JSON.parse(value);
    }
    return { ActivityType: "eating", Id: 0, KidName: "", StartDate: undefined, EndDate: undefined, IsActiveNow: false };
  }

  addLastSleepingToLocalStorage(act: KidActivity): void {
    localStorage.setItem("lastsleeping", JSON.stringify(act));
  }

  getLastSleepingFromLocalStorage(): KidActivity {
    const value = localStorage.getItem("lastsleeping");
    if(value != null)
    {
      return JSON.parse(value);
    }
    return { ActivityType: "sleeping", Id: 0, KidName: "", StartDate: undefined, EndDate: undefined, IsActiveNow: false };
  }

  addLastActivitiesToLocalStorage(acts: KidActivity[]): void {
    localStorage.setItem("lastacts", JSON.stringify(acts));
  }

  getLastActivitiesFromLocalStorage(): KidActivity[] {
    const value = localStorage.getItem("lastacts");
    if(value != null)
    {
      return JSON.parse(value);
    }
    return [];
  }

  addCurrentActivityToLocalStorage(act: KidActivity) {
    localStorage.setItem("currentact", JSON.stringify(act));
  }

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
      this._canDeletePendingActs = false;
      this.syncCompletedWithResult$.next(true);
      this.currentSyncState = SyncStatus.Nothing;
      return;
    }

    this.currentSyncState = SyncStatus.Synchronizing;

    let completedCount = 0;
    const totalRequests = this._pendingActs.length;

    const checkAllDone = () => {
      completedCount++;
      if (completedCount === totalRequests) {

        // after synchronizing we set to true
        this._canDeletePendingActs = true;

        // change current Sync State to Success/Fail after a bit delay if the requests were done very quickly 
        setTimeout(() => {
          this.currentSyncState = this.failedSyncActs.length != 0 ? SyncStatus.SyncError : SyncStatus.SyncSuccess;

          // here we emit bool value if reqeust success to FailedSyncActivities PAGE to be displayed also with delay
          setTimeout(() => {
            this.syncCompletedWithResult$.next(this.currentSyncState == SyncStatus.SyncSuccess ? true : false);

            // clearing acts anyway
            this.clearPendingActs();
          }, 1000);
        }, 1000);
      }
    };

    // sending requests for all pending activities in loop
    this._pendingActs.forEach(element => {

      // If Id == -1 it means that the activity was started OFFLINE so we need to Add to API
      if (element.Id != -1) {
        this.actService.updateActivity(this.currentKidService.getCurrentKid(), element)
          // finalize is called when success/error has been thrown
          .pipe(finalize(() => checkAllDone()))
          .subscribe({
            next: () => { },
            error: () => this.failedSyncActs.push(element)
          });
      }
      else {
        this.actService.addActivityToKid(this.currentKidService.getCurrentKid(), element)
          // finalize is called when success/error has been thrown
          .pipe(finalize(() => checkAllDone()))
          .subscribe({
            next: () => { },
            error: () => this.failedSyncActs.push(element)
          });
      }
    });
  }

}
