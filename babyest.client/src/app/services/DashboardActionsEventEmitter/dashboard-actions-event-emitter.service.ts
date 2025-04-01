import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardActionsEventEmitterService {

  constructor() { }

  private actionSubject = new Subject<number>();

  // Observable to listen for the event
  action$ = this.actionSubject.asObservable();

  // Method to trigger the event
  triggerAction(value: number): void {
    this.actionSubject.next(value);
  }
}
