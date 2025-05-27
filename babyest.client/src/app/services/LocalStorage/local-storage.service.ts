import { Injectable } from '@angular/core';
import { Kid } from '../../models/kid';
import { KidActivity } from '../../models/kid-activity';
import { KidService } from '../KidService/kid.service';
import { CurrentKidService } from '../CurrentKid/current-kid.service';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {


  private pendingActs: KidActivity[] = [];
  private canDeletePendingActs: boolean = false;

  constructor(private actService: KidService, 
    private currentKidService: CurrentKidService
  ) { }

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
      const index = this.pendingActs.findIndex(act => act.IsActiveNow === true);
      if(index != -1)
      {
        this.pendingActs.splice(index, 1);
      }

    // add activity to list
    this.pendingActs.push(act);

    localStorage.setItem("pendingacts", JSON.stringify(this.pendingActs));
  }

  getPendingActsFromLocalStorage(): KidActivity[] {
    const localacts = localStorage.getItem("pendingacts");
    if(localacts != null) {
      this.pendingActs = JSON.parse(localacts);
    }
    else {
      this.pendingActs = [];
    }
    return this.pendingActs;
  }


  private clearPendingActs(): void {
    console.log("call clear pending acts - value - " + this.canDeletePendingActs);

    // If nothing to delete or any other reason we return
    if(!this.canDeletePendingActs)
    {
      return;
    }
    localStorage.removeItem("pendingacts");
    this.pendingActs = [];
    this.canDeletePendingActs = false;
  }

  synchronizePendingActs(): void {

    // nothing to sync, no pending acts
    if(this.pendingActs.length === 0)
    {
      console.log("nothing to sync. return");
      this.canDeletePendingActs = false;
      return;
    }

    console.log("start of foreach loop in synch changes - value - " + this.canDeletePendingActs);
    // this.canDeletePendingActs = true;
    this.pendingActs.forEach(element => {
      if(element.IsActiveNow)
      {
        // it is not working because the isACtiveNow will be always false
        this.actService.updateActivity(this.currentKidService.getCurrentKid(), element)
        .subscribe({
          next: () => {
            console.log(`act updated - ${element.Id}`);
          },
          error: () => {}
        });
      }
      else
      {
        this.actService.addActivityToKid(this.currentKidService.getCurrentKid(), element)
        .subscribe({
          next: () => {
            console.log(`act added - ${element.Id}, ${element.ActivityType}`);
          },
          error: () => {}
        });
      }
      console.log("called action for element id in array - ");
    });


    // after synchronizing we set to true
    this.canDeletePendingActs = true;
    console.log("end of foreach loop in synch changes - value - " + this.canDeletePendingActs);
    
    // clearing acts
    this.clearPendingActs();
    setTimeout(() => {
      
    }, 100);
  }

}


// TODO
// 1. in pending acts when synchronize some should be UPDATE some POST (check if id != -1 then we update, else we post)
